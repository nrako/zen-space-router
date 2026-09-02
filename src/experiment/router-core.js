/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

(function exposeZenSpaceRouterCore(root) {
  "use strict";

  function isUsableBrowserWindow(win) {
    return Boolean(
      win &&
        !win.closed &&
        win.browserDOMWindow &&
        win.gZenWorkspaces?.workspaceEnabled
    );
  }

  function selectTargetWindow(windows, sourceWindow, targetWorkspaceId) {
    if (!targetWorkspaceId || targetWorkspaceId === "most-recent-space") {
      return sourceWindow;
    }

    const matchingWindow = windows.find(
      win =>
        isUsableBrowserWindow(win) &&
        win.gZenWorkspaces.activeWorkspace === targetWorkspaceId
    );

    return matchingWindow || sourceWindow;
  }

  const api = { isUsableBrowserWindow, selectTargetWindow };

  if (typeof module === "object" && module?.exports) {
    module.exports = api;
  } else {
    root.ZenSpaceRouterCore = api;
  }
})(this);
