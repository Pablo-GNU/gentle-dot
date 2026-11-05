export type UiLocale = "en" | "es";

// Only the first Settings slice is translated; other UI labels follow separately.
const en = {
	settings: "Settings",
	closeSettings: "Close settings",
	interfaceLanguage: "Interface language",
} as const;

export type MessageKey = keyof typeof en;

export const messages: Record<UiLocale, Record<MessageKey, string>> = {
	en,
	es: {
		settings: "Ajustes",
		closeSettings: "Cerrar ajustes",
		interfaceLanguage: "Idioma de la interfaz",
	},
};
