import { cp, mkdir, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const buildRoot = path.join(projectRoot, "dist", "extension");
const xpiPath = path.join(projectRoot, "dist", "zen-space-router.xpi");

await rm(path.join(projectRoot, "dist"), { recursive: true, force: true });
await mkdir(buildRoot, { recursive: true });
await cp(path.join(projectRoot, "src"), buildRoot, { recursive: true });

const result = spawnSync("zip", ["-q", "-r", xpiPath, "."], {
  cwd: buildRoot,
  stdio: "inherit",
});
if (result.error) {
  throw result.error;
}
if (result.status !== 0) {
  throw new Error(`zip failed with status ${result.status}`);
}

console.log(xpiPath);
