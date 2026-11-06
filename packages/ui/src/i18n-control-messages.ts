// Authored answer controls; never prompts, codes or permission rules.
export const controlEn = {
	answerWaitingApp: "Waiting for your answer in the app",
	answerNeeded: "Needs your answer",
	answerRegion: "The assistant needs your answer",
	answerDetails: "Details",
	answerAllow: "Allow",
	answerDeny: "Deny",
	answerYes: "Yes",
	answerNo: "No",
	answerSend: "Send answer",
	answerSkip: "Skip",
} as const;

export const controlEs = {
	answerWaitingApp: "Esperando su respuesta en la aplicación",
	answerNeeded: "Necesita su respuesta",
	answerRegion: "El asistente necesita su respuesta",
	answerDetails: "Detalles",
	answerAllow: "Permitir",
	answerDeny: "Denegar",
	answerYes: "Sí",
	answerNo: "No",
	answerSend: "Enviar respuesta",
	answerSkip: "Omitir",
} satisfies Record<keyof typeof controlEn, string>;
