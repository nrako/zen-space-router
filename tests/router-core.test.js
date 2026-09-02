import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const source = await readFile(
  new URL("../src/experiment/router-core.js", import.meta.url),
  "utf8"
);
const sandbox = { module: { exports: {} } };
vm.runInNewContext(source, sandbox);
const { selectTargetWindow } = sandbox.module.exports;

function fakeWindow(activeWorkspace, overrides = {}) {
  return {
    closed: false,
    browserDOMWindow: {},
    gZenWorkspaces: { activeWorkspace, workspaceEnabled: true },
    ...overrides,
  };
}

test("keeps the source window for the most-recent route", () => {
  const sourceWindow = fakeWindow("main");
  const videosWindow = fakeWindow("videos");

  assert.equal(
    selectTargetWindow(
      [videosWindow, sourceWindow],
      sourceWindow,
      "most-recent-space"
    ),
    sourceWindow
  );
});

test("selects the most recent usable window displaying the target Space", () => {
  const sourceWindow = fakeWindow("main");
  const recentVideosWindow = fakeWindow("videos");
  const olderVideosWindow = fakeWindow("videos");

  assert.equal(
    selectTargetWindow(
      [recentVideosWindow, olderVideosWindow, sourceWindow],
      sourceWindow,
      "videos"
    ),
    recentVideosWindow
  );
});

test("keeps the source window when no window displays the target Space", () => {
  const sourceWindow = fakeWindow("main");

  assert.equal(
    selectTargetWindow([sourceWindow], sourceWindow, "videos"),
    sourceWindow
  );
});

test("ignores closed and non-browser matching windows", () => {
  const sourceWindow = fakeWindow("main");
  const closedWindow = fakeWindow("videos", { closed: true });
  const popup = fakeWindow("videos", { browserDOMWindow: null });

  assert.equal(
    selectTargetWindow(
      [closedWindow, popup, sourceWindow],
      sourceWindow,
      "videos"
    ),
    sourceWindow
  );
});
