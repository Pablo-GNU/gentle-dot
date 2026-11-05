import { vi } from "vitest";

// Admission is intentionally still unwired. Future startDaemon callers receive this same
// owned default without a production environment override or edits to every test caller.
vi.mock("../src/daemon-admission.ts", async (importOriginal) => {
	const actual = await importOriginal<typeof import("../src/daemon-admission.ts")>();
	const { tempDir } = await import("./helpers.ts");
	const account = tempDir();
	return {
		...actual,
		claimDaemonAdmission: (options: Parameters<typeof actual.claimDaemonAdmission>[0]) =>
			actual.claimDaemonAdmission({ ...options, accountHome: options.accountHome ?? (() => account) }),
	};
});
