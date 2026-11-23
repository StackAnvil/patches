import { expect, test } from "bun:test";
import { requireSessionOptions } from "../src/replay/options.ts";

test("accepts the documented recording and replay options", () => {
  for (const args of [
    ["--target", "play.example.org:19132", "--client", "addon", "--seconds", "240"],
    ["--client", "native", "--native-ice-address", "192.168.1.20", "--account", "/a/bedrock.json"],
    ["--client", "proxy", "--transport-only", "--shaders", "--gui-scale", "2"],
    ["--allow-hive", "--allow-transfers", "--native-manual-connect", "--native-home", "/b"],
    ["--modpack", "--software-rendering"],
    [],
  ])
    expect(() => {
      requireSessionOptions(args);
    }).not.toThrow();
});

test("rejects a misspelled option instead of running a plain session", () => {
  expect(() => {
    requireSessionOptions(["--shader", "--seconds", "150"]);
  }).toThrow("Unknown server-replay option: --shader");
  expect(() => {
    requireSessionOptions(["--seconds=150"]);
  }).toThrow("Unknown server-replay option: --seconds=150");
  expect(() => {
    requireSessionOptions(["--seconds", "150", "extra"]);
  }).toThrow("Unknown server-replay option: extra");
});

test("rejects a missing value instead of consuming the next option or a default", () => {
  expect(() => {
    requireSessionOptions(["--seconds"]);
  }).toThrow("--seconds requires a value.");
  expect(() => {
    requireSessionOptions(["--client", "--shaders"]);
  }).toThrow("--client requires a value.");
});

test("rejects a repeated option whose later value would be ignored", () => {
  expect(() => {
    requireSessionOptions(["--seconds", "30", "--seconds", "200"]);
  }).toThrow("Repeated server-replay option: --seconds");
});
