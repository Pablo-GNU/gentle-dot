import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadConfig } from "../src/config.ts";
import { tempDir } from "./helpers.ts";

describe("loadConfig", () => {
	it("uses local-only defaults and the bundled Gentle Shell with the assistant's own home", () => {
		const dataDir = tempDir();
		const config = loadConfig({ GENTLE_DOT_DATA_DIR: dataDir });
		expect(config).toMatchObject({
			port: 4317,
			host: "127.0.0.1",
			dataDir,
			agentCommand: process.execPath,
			agentHome: join(dataDir, "agent"),
			// Never the user's home: the engine reads project settings from its workspace.
			workspace: join(dataDir, "workspace"),
		});
		expect(config.preferredFolder).toBeUndefined();
		expect(config.agentArgs).toHaveLength(1);
		expect(config.agentArgs[0]?.endsWith(join("node_modules", "gentle-pi", "bin", "gentle-shell.mjs"))).toBe(
			true,
		);
		expect(existsSync(config.agentArgs[0] ?? "")).toBe(true);
	});

	it("keeps the assistant's own home for an explicit gentle-shell binary, and honors an override", () => {
		const dataDir = tempDir();
		expect(loadConfig({ GENTLE_DOT_DATA_DIR: dataDir, GENTLE_DOT_AGENT_BIN: "gentle-shell" })).toMatchObject({
			agentCommand: "gentle-shell",
			agentArgs: [],
			agentHome: join(dataDir, "agent"),
		});
		const customHome = join(dataDir, "custom-agent-home");
		expect(loadConfig({ GENTLE_DOT_DATA_DIR: dataDir, GENTLE_DOT_AGENT_HOME: customHome }).agentHome).toBe(
			customHome,
		);
	});

	it("runs a custom agent script without the Gentle Shell home", () => {
		const dataDir = tempDir();
		const config = loadConfig({
			GENTLE_DOT_DATA_DIR: dataDir,
			GENTLE_DOT_AGENT_BIN: "node",
			GENTLE_DOT_AGENT_ARGS: '["fake.ts"]',
		});
		expect(config).toMatchObject({ agentCommand: "node", agentArgs: ["fake.ts"] });
		expect(config.agentHome).toBeUndefined();
	});

	it.each([undefined, "node-fixture"])(
		"selects a Gentle Shell script while preserving its home (binary: %s)",
		(binary) => {
			const dataDir = tempDir();
			const script = String.raw`C:\Program Files\Gentle Dot\gentle-shell.mjs`;
			const home = binary ? join(dataDir, "custom-agent-home") : join(dataDir, "agent");
			expect(
				loadConfig({
					GENTLE_DOT_DATA_DIR: dataDir,
					GENTLE_DOT_AGENT_SCRIPT: script,
					GENTLE_DOT_AGENT_BIN: binary,
					GENTLE_DOT_AGENT_HOME: binary ? home : undefined,
				}),
			).toMatchObject({ agentCommand: binary ?? process.execPath, agentArgs: [script], agentHome: home });
		},
	);

	it("keeps custom argument precedence over a selected script and home", () => {
		const dataDir = tempDir();
		const env = {
			GENTLE_DOT_DATA_DIR: dataDir,
			GENTLE_DOT_AGENT_BIN: "node-fixture",
			GENTLE_DOT_AGENT_SCRIPT: "ignored-shell.mjs",
			GENTLE_DOT_AGENT_HOME: join(dataDir, "ignored-home"),
		};
		expect(loadConfig({ ...env, GENTLE_DOT_AGENT_ARGS: '["custom.ts"]' })).toMatchObject({
			agentCommand: "node-fixture",
			agentArgs: ["custom.ts"],
			agentHome: undefined,
		});
		expect(() => loadConfig({ ...env, GENTLE_DOT_AGENT_ARGS: '{"a":1}' })).toThrow(
			"GENTLE_DOT_AGENT_ARGS must be a JSON array of strings",
		);
	});

	it("treats an empty script as absent for both the bundled and explicit binary", () => {
		const dataDir = tempDir();
		for (const binary of [undefined, "gentle-shell"]) {
			const env = { GENTLE_DOT_DATA_DIR: dataDir, GENTLE_DOT_AGENT_BIN: binary };
			expect(loadConfig({ ...env, GENTLE_DOT_AGENT_SCRIPT: "" })).toEqual(loadConfig(env));
		}
	});

	it("reads config.json and lets environment variables win", () => {
		const dataDir = tempDir();
		const projects = join(dataDir, "projects");
		writeFileSync(join(dataDir, "config.json"), JSON.stringify({ port: 5000, workspace: projects }));
		expect(loadConfig({ GENTLE_DOT_DATA_DIR: dataDir })).toMatchObject({
			port: 5000,
			preferredFolder: projects,
		});
		expect(loadConfig({ GENTLE_DOT_DATA_DIR: dataDir, GENTLE_DOT_PORT: "6000" }).port).toBe(6000);
	});

	it("keeps the engine in its own workspace and treats a custom one as the user's preferred folder", () => {
		const dataDir = tempDir();
		const preferredFolder = join(dataDir, "work", "repo");
		const config = loadConfig({ GENTLE_DOT_DATA_DIR: dataDir, GENTLE_DOT_WORKSPACE: preferredFolder });
		// The workspace holds the memory project setting, so the engine always works there.
		expect(config).toMatchObject({ workspace: join(dataDir, "workspace"), preferredFolder });
		const same = loadConfig({
			GENTLE_DOT_DATA_DIR: dataDir,
			GENTLE_DOT_WORKSPACE: join(dataDir, "workspace"),
		});
		expect(same.preferredFolder).toBeUndefined();
	});

	it("rejects an invalid port and a malformed argument list", () => {
		const dataDir = tempDir();
		expect(() => loadConfig({ GENTLE_DOT_DATA_DIR: dataDir, GENTLE_DOT_PORT: "abc" })).toThrow(
			"Invalid port",
		);
		expect(() => loadConfig({ GENTLE_DOT_DATA_DIR: dataDir, GENTLE_DOT_AGENT_ARGS: '{"a":1}' })).toThrow(
			"GENTLE_DOT_AGENT_ARGS must be a JSON array of strings",
		);
	});
});
