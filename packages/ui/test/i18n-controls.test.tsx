import type { Ask } from "@gentle-dot/protocol";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AskCard } from "../src/components/AskCard.tsx";
import { LocaleProvider, UI_LANGUAGE_KEY } from "../src/i18n.tsx";

const ask: Ask = {
	requestId: "request-English",
	method: "confirm",
	title: "Approve English title?",
	message: "Backend detail: https://example.test/path?pin=unchanged",
};
beforeEach(() => {
	localStorage.clear();
	localStorage.setItem(UI_LANGUAGE_KEY, "es");
});
afterEach(() => localStorage.clear());

function card(overrides: Partial<Ask> = {}, pin?: { set: boolean; locked?: boolean }) {
	const send = vi.fn();
	render(
		<LocaleProvider>
			<AskCard ask={{ ...ask, ...overrides }} send={send} {...(pin ? { pin } : {})} />
		</LocaleProvider>,
	);
	return send;
}

describe("Spanish authored answer controls", () => {
	it("preserves supplied title/details and exact yes/no/skip responses", async () => {
		const send = card();
		expect(screen.getByLabelText("El asistente necesita su respuesta")).toBeInTheDocument();
		expect(screen.getByText(ask.title)).toBeInTheDocument();
		expect(screen.getByLabelText("Detalles")).toHaveTextContent(ask.message!);
		await userEvent.click(screen.getByRole("button", { name: "Sí" }));
		await userEvent.click(screen.getByRole("button", { name: "No" }));
		await userEvent.click(screen.getByRole("button", { name: "Omitir" }));
		expect(send.mock.calls).toEqual([
			[{ type: "ui_response", requestId: ask.requestId, confirmed: true }],
			[{ type: "ui_response", requestId: ask.requestId, confirmed: false }],
			[{ type: "ui_response", requestId: ask.requestId, cancelled: true }],
		]);
	});

	it.each(["input", "editor"] as const)(
		"preserves %s prefill, placeholder and submitted text",
		async (method) => {
			const send = card({ method, prefill: "English prefill", placeholder: "English placeholder" });
			const input = screen.getByRole("textbox", { name: ask.title });
			expect(input).toHaveValue("English prefill");
			if (method === "input") {
				expect(input).toHaveAttribute("placeholder", "English placeholder");
			}
			await userEvent.type(input, " / comando ñ");
			await userEvent.click(screen.getByRole("button", { name: "Enviar respuesta" }));
			expect(send.mock.calls).toEqual([
				[{ type: "ui_response", requestId: ask.requestId, value: "English prefill / comando ñ" }],
			]);
		},
	);

	it("keeps option display and protocol values verbatim", async () => {
		const send = card({ method: "select", options: ["Yes", "English option"] });
		await userEvent.click(screen.getByRole("button", { name: "Yes" }));
		expect(send.mock.calls).toEqual([[{ type: "ui_response", requestId: ask.requestId, value: "Yes" }]]);
	});

	it("waits for the app without adding actionable controls", () => {
		const send = card({ method: "app" });
		expect(screen.getByLabelText("Esperando su respuesta en la aplicación")).toHaveTextContent(
			"Necesita su respuesta",
		);
		expect(screen.queryByRole("button")).toBeNull();
		expect(send).not.toHaveBeenCalled();
	});
});

describe("Spanish PIN action labels with unchanged English fields", () => {
	it.each([false, true])("preserves approval and denial with PIN already set: %s", async (set) => {
		const send = card({ method: "pin" }, { set, locked: true });
		const stored = { ...localStorage };
		const value = screen.getByLabelText(set ? "PIN" : "New PIN");
		const allow = screen.getByRole("button", { name: "Permitir" });
		expect(value).toHaveAttribute("type", "password");
		expect(value).toHaveAttribute("inputmode", "numeric");
		expect(screen.getByText("Too many wrong PINs. Try again later.")).toBeInTheDocument();
		expect(allow).toBeEnabled();
		if (!set) {
			expect(screen.getByText(/The assistant never sees it/)).toBeInTheDocument();
		}
		await userEvent.click(screen.getByRole("button", { name: "Denegar" }));
		const denied = [{ type: "ui_response", requestId: ask.requestId, confirmed: false }];
		expect(send.mock.calls).toEqual([denied]);
		fireEvent.change(value, { target: { value: "12345" } });
		await userEvent.click(allow);
		expect(screen.getByRole("alert")).toHaveTextContent("Use 6 to 12 digits.");
		expect(send.mock.calls).toEqual([denied]);
		fireEvent.change(value, { target: { value: "731942" } });
		if (!set) {
			fireEvent.change(screen.getByLabelText("Repeat the PIN"), { target: { value: "000000" } });
			await userEvent.click(allow);
			expect(screen.getByRole("alert")).toHaveTextContent("The two PINs are different.");
			expect(send.mock.calls).toEqual([denied]);
			fireEvent.change(screen.getByLabelText("Repeat the PIN"), { target: { value: "731942" } });
		}
		await userEvent.click(allow);
		expect(send.mock.calls).toEqual([
			denied,
			...(!set ? [[{ type: "pin_set", pin: "731942" }]] : []),
			[{ type: "pin_approve", requestId: ask.requestId, pin: "731942" }],
		]);
		expect(value).toHaveValue("");
		expect({ ...localStorage }).toEqual(stored);
	});
});
