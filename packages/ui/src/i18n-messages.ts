import { chatEn, chatEs } from "./i18n-chat-messages.ts";

export type UiLocale = "en" | "es";

// Each feature owns its bilingual display text; the composed keys stay type-safe.
const en = {
	...chatEn,
	settings: "Settings",
	closeSettings: "Close settings",
	interfaceLanguage: "Interface language",
} as const;

export type MessageKey = keyof typeof en;

export const messages: Record<UiLocale, Record<MessageKey, string>> = {
	en,
	es: {
		...chatEs,
		settings: "Ajustes",
		closeSettings: "Cerrar ajustes",
		interfaceLanguage: "Idioma de la interfaz",
	},
};
