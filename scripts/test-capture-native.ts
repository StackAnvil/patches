import { Effect } from "effect";
import { root } from "../src/model.ts";
import { command } from "../src/process.ts";
import { waylandToolEnvironment } from "../src/lab/wayland.ts";
import { print } from "../src/output.ts";

print(
  await Effect.runPromise(
    command(
      "cargo",
      [
        "test",
        "--locked",
        "--manifest-path",
        "native/capture-wayland/Cargo.toml",
        "--target-dir",
        ".stackanvil/tools/capture-wayland-build",
        "--",
        "--include-ignored",
      ],
      root,
      waylandToolEnvironment(process.env),
    ),
  ),
);
