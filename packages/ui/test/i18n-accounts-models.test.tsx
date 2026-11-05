import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AccountsPanel, FlowEvent, FlowPrompt } from "../src/components/AccountsPanel.tsx";
import { LocaleProvider, UI_LANGUAGE_KEY } from "../src/i18n.tsx";
import type { AuthState } from "../src/store.ts";

const providers: AuthState["providers"] = [
	{
		id: "plan-id",
		name: "Provider Original",
		oauthName: "Plan Original",
		methods: ["oauth"],
		configured: true,
		source: "stored",
	},
	{
		id: "key-id",
		name: "Key Original",
		methods: ["api_key"],
		configured: true,
		source: "env",
	},
];

function panel(auth: AuthState = { open: true, providers }) {
	const send = vi.fn();
	const dispatch = vi.fn();
	const openUrl = vi.fn();
	const view = render(
		<LocaleProvider>
			<AccountsPanel auth={auth} send={send} dispatch={dispatch} openUrl={openUrl} />
		</LocaleProvider>,
	);
	return { ...view, send, dispatch, openUrl };
}

beforeEach(() => {
	localStorage.clear();
	localStorage.setItem(UI_LANGUAGE_KEY, "es");
});
afterEach(() => localStorage.clear());

describe("Spanish accounts chrome without translating account data", () => {
	it("labels the initial panel, connected accounts, close and sign-out actions", async () => {
		const { send, dispatch } = panel();
		expect(screen.getByRole("region", { name: "Cuentas" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Cuentas" })).toBeInTheDocument();
		expect(
			screen.getByText(
				"Conecta el servicio de IA que ya pagas o pega una clave de API. Tu sesión permanece en este equipo.",
			),
		).toBeInTheDocument();
		const connected = screen.getByRole("region", { name: "Conectadas" });
		expect(within(connected).getByText("Provider Original")).toBeInTheDocument();
		expect(within(connected).getByText("desde la configuración de tu equipo")).toBeInTheDocument();
		await userEvent.click(screen.getByRole("button", { name: "Cerrar sesión de Provider Original" }));
		expect(send.mock.calls).toEqual([[{ type: "auth_logout", providerId: "plan-id" }]]);
		await userEvent.click(screen.getByRole("button", { name: "Cerrar cuentas" }));
		expect(dispatch.mock.calls).toEqual([[{ type: "accounts", open: false }]]);
	});

	it("filters subscription data and preserves the exact OAuth login and logout fields", async () => {
		const { send, dispatch } = panel();
		expect(
			screen.getByText("Inicia sesión con un plan que ya pagas, como ChatGPT, GitHub Copilot o Grok."),
		).toBeInTheDocument();
		await userEvent.click(screen.getByRole("button", { name: /Usar una suscripción/ }));
		const list = screen.getByRole("region", { name: "Usar una suscripción" });
		expect(within(list).getByText("Inicia sesión con un plan que ya pagas.")).toBeInTheDocument();
		expect(within(list).getByText("Plan Original")).toBeInTheDocument();
		expect(within(list).getByText("Conectadas")).toBeInTheDocument();
		expect(within(list).queryByText("Key Original")).toBeNull();
		const search = screen.getByRole("searchbox", { name: "Buscar proveedores" });
		expect(search).toHaveAttribute("placeholder", "Buscar proveedores");
		await userEvent.type(search, "missing");
		expect(screen.queryByText("Provider Original")).toBeNull();
		await userEvent.clear(search);
		await userEvent.click(screen.getByRole("button", { name: "Iniciar sesión con Plan Original" }));
		await userEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }));
		expect(dispatch.mock.calls).toEqual([[{ type: "auth_started", providerId: "plan-id" }]]);
		expect(send.mock.calls).toEqual([
			[{ type: "auth_login", providerId: "plan-id", method: "oauth" }],
			[{ type: "auth_logout", providerId: "plan-id" }],
		]);
	});

	it("keeps API key selection and Back local, without changing provider IDs", async () => {
		const { send, dispatch } = panel();
		expect(
			screen.getByText("Pega una clave del sitio web del proveedor. Funciona con todos los servicios."),
		).toBeInTheDocument();
		await userEvent.click(screen.getByRole("button", { name: /Usar una clave de API/ }));
		expect(screen.getByText("Pega la clave del sitio web del proveedor.")).toBeInTheDocument();
		await userEvent.click(screen.getByRole("button", { name: "Usar una clave de API para Key Original" }));
		expect(send.mock.calls).toEqual([[{ type: "auth_login", providerId: "key-id", method: "api_key" }]]);
		expect(dispatch.mock.calls).toEqual([[{ type: "auth_started", providerId: "key-id" }]]);
		await userEvent.click(screen.getByRole("button", { name: "Volver" }));
		expect(screen.queryByRole("searchbox")).toBeNull();
		expect(screen.getByRole("button", { name: /Usar una suscripción/ })).toBeInTheDocument();
		expect(send).toHaveBeenCalledTimes(1);
	});

	it("translates starting, cancel, success, fallback failure and Back, not backend errors", async () => {
		const auth: AuthState = {
			open: true,
			providers,
			flow: { providerId: "plan-id", flowId: "flow-original", events: [] },
		};
		const { send, dispatch, rerender } = panel(auth);
		expect(screen.getByText("Iniciando sesión en Provider Original")).toBeInTheDocument();
		expect(screen.getByText("Iniciando…")).toBeInTheDocument();
		await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
		expect(send.mock.calls).toEqual([[{ type: "auth_reply", flowId: "flow-original", cancelled: true }]]);
		function done(ok: boolean, message?: string) {
			rerender(
				<LocaleProvider>
					<AccountsPanel
						auth={{ ...auth, flow: { providerId: "plan-id", events: [], done: { ok, message } } }}
						send={send}
						dispatch={dispatch}
						openUrl={vi.fn()}
					/>
				</LocaleProvider>,
			);
		}
		done(true);
		expect(screen.getByRole("status")).toHaveTextContent("Conectado a Provider Original.");
		expect(screen.queryByRole("button", { name: "Cancelar" })).toBeNull();
		await userEvent.click(screen.getByRole("button", { name: "Volver a cuentas" }));
		expect(dispatch.mock.calls).toEqual([[{ type: "accounts", open: true }]]);
		done(false);
		expect(screen.getByRole("status")).toHaveTextContent("El inicio de sesión no se completó.");
		done(false, "Backend failure Original");
		expect(screen.getByRole("status")).toHaveTextContent("Backend failure Original");
	});
});

describe("Spanish shared flow helpers (also exported for connectors)", () => {
	it("does not replace explicitly empty backend placeholders or instructions", () => {
		const send = vi.fn();
		const { container } = render(
			<LocaleProvider>
				<FlowEvent
					event={{ kind: "auth_url", url: "https://example.test/empty", instructions: "" }}
					openUrl={vi.fn()}
				/>
				<FlowPrompt
					prompt={{ flowId: "empty-id", kind: "manual_code", message: "Empty Original", placeholder: "" }}
					send={send}
				/>
			</LocaleProvider>,
		);
		expect(container.querySelector("p")).toBeEmptyDOMElement();
		expect(screen.getByLabelText("Empty Original")).toHaveAttribute("placeholder", "");
		expect(send).not.toHaveBeenCalled();
	});

	it("translates fallback wrappers but preserves supplied instructions, progress, codes and URLs", async () => {
		const openUrl = vi.fn();
		render(
			<LocaleProvider>
				<FlowEvent
					event={{ kind: "auth_url", url: "https://example.test/default?challenge=Original" }}
					openUrl={openUrl}
				/>
				<FlowEvent
					event={{
						kind: "auth_url",
						url: "https://example.test/custom",
						instructions: "Instructions Original",
					}}
					openUrl={openUrl}
				/>
				<FlowEvent
					event={{
						kind: "device_code",
						userCode: "PIN-AbC-123",
						verificationUri: "https://example.test/device",
					}}
					openUrl={openUrl}
				/>
				<FlowEvent event={{ kind: "info", message: "Info Original" }} openUrl={openUrl} />
				<FlowEvent event={{ kind: "progress", message: "Progress Original 50%" }} openUrl={openUrl} />
			</LocaleProvider>,
		);
		for (const text of [
			"Termina de iniciar sesión en la página del proveedor.",
			"Instructions Original",
			"Abre la página de abajo e introduce este código:",
			"PIN-AbC-123",
			"Info Original",
			"Progress Original 50%",
		]) {
			expect(screen.getByText(text)).toBeInTheDocument();
		}
		for (const button of screen.getAllByRole("button", { name: "Abrir la página de inicio de sesión" })) {
			await userEvent.click(button);
		}
		await userEvent.click(screen.getByRole("button", { name: "Abrir la página" }));
		expect(openUrl.mock.calls).toEqual([
			["https://example.test/default?challenge=Original"],
			["https://example.test/custom"],
			["https://example.test/device"],
		]);
	});

	it("translates manual-code defaults and optional controls, preserving trimming and empty skip replies", async () => {
		const send = vi.fn();
		render(
			<LocaleProvider>
				<FlowPrompt
					prompt={{ flowId: "flow-id", kind: "manual_code", message: "Challenge Original", optional: true }}
					send={send}
				/>
			</LocaleProvider>,
		);
		const input = screen.getByLabelText("Challenge Original");
		expect(input).toHaveAttribute("placeholder", "Pega aquí el código o la dirección completa");
		expect(screen.getByRole("button", { name: "Continuar" })).toBeDisabled();
		await userEvent.type(input, "   ");
		expect(screen.getByRole("button", { name: "Continuar" })).toBeDisabled();
		expect(send).not.toHaveBeenCalled();
		await userEvent.type(input, "Code-Original  ");
		await userEvent.click(screen.getByRole("button", { name: "Continuar" }));
		await userEvent.click(screen.getByRole("button", { name: "Omitir" }));
		expect(send.mock.calls).toEqual([
			[{ type: "auth_reply", flowId: "flow-id", value: "Code-Original" }],
			[{ type: "auth_reply", flowId: "flow-id", value: "" }],
		]);
	});

	it("preserves supplied secret placeholders, masking and select option labels/descriptions/IDs", async () => {
		const send = vi.fn();
		const { rerender } = render(
			<LocaleProvider>
				<FlowPrompt
					prompt={{
						flowId: "secret-id",
						kind: "secret",
						message: "Secret Original",
						placeholder: "Placeholder Original",
					}}
					send={send}
				/>
			</LocaleProvider>,
		);
		const input = screen.getByLabelText("Secret Original");
		expect(input).toHaveAttribute("type", "password");
		expect(input).toHaveAttribute("placeholder", "Placeholder Original");
		expect(screen.queryByRole("button", { name: "Omitir" })).toBeNull();
		await userEvent.type(input, "synthetic-KEY");
		await userEvent.click(screen.getByRole("button", { name: "Continuar" }));
		rerender(
			<LocaleProvider>
				<FlowPrompt
					prompt={{
						flowId: "select-id",
						kind: "select",
						message: "Choose Original",
						options: [{ id: "option-id", label: "Option Original", description: "Description Original" }],
					}}
					send={send}
				/>
			</LocaleProvider>,
		);
		expect(screen.getByText("Choose Original")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Option Original" })).toHaveAttribute(
			"title",
			"Description Original",
		);
		await userEvent.click(screen.getByRole("button", { name: "Option Original" }));
		expect(send.mock.calls).toEqual([
			[{ type: "auth_reply", flowId: "secret-id", value: "synthetic-KEY" }],
			[{ type: "auth_reply", flowId: "select-id", value: "option-id" }],
		]);
	});
});
