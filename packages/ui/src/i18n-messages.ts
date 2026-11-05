import { accountEn, accountEs } from "./i18n-account-messages.ts";
import { chatEn, chatEs } from "./i18n-chat-messages.ts";
import { messageListEn, messageListEs } from "./i18n-message-list-messages.ts";

export type UiLocale = "en" | "es";

// Each feature owns its bilingual display text; the composed keys stay type-safe.
const en = {
	...chatEn,
	...accountEn,
	...messageListEn,
	settings: "Settings",
	closeSettings: "Close settings",
	interfaceLanguage: "Interface language",
} as const;

export type MessageKey = keyof typeof en;

export const messages: Record<UiLocale, Record<MessageKey, string>> = {
	en,
	es: {
		...chatEs,
		...accountEs,
		...messageListEs,
		settings: "Ajustes",
		closeSettings: "Cerrar ajustes",
		interfaceLanguage: "Idioma de la interfaz",
	},
};
