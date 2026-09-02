/* globals ExtensionAPI, Services, Ci */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

"use strict";

const { BrowserWindowTracker } = ChromeUtils.importESModule(
  "resource:///modules/BrowserWindowTracker.sys.mjs"
);
const { BrowserDOMWindow } = ChromeUtils.importESModule(
  "resource:///modules/BrowserDOMWindow.sys.mjs"
);
const { PrivateBrowsingUtils } = ChromeUtils.importESModule(
  "resource://gre/modules/PrivateBrowsingUtils.sys.mjs"
);

this.zenSpaceRouter = class extends ExtensionAPI {
  getAPI(context) {
    const coreScope = {};
    Services.scriptloader.loadSubScript(
      context.extension.rootURI.resolve("experiment/router-core.js"),
      coreScope
    );
    const { selectTargetWindow } = coreScope.ZenSpaceRouterCore;

    let started = false;
    let originalOpenURI = null;
    let wrappedOpenURI = null;

    function routeExternalOpen(sourceWindow, receiver, args) {
      const [uri, , , flags] = args;
      const isExternal = Boolean(
        flags & Ci.nsIBrowserDOMWindow.OPEN_EXTERNAL
      );

      if (!isExternal || !uri?.spec) {
        return originalOpenURI.apply(receiver, args);
      }

      const routingManager = sourceWindow.gZenSpaceRoutingManager;
      if (!routingManager?.routeUri) {
        return originalOpenURI.apply(receiver, args);
      }

      const targetWorkspaceId = routingManager.routeUri(uri.spec, {
        fromExternal: true,
      });
      const isPrivate = PrivateBrowsingUtils.isWindowPrivate(sourceWindow);
      const orderedWindows = BrowserWindowTracker.getOrderedWindows({
        private: isPrivate,
      });
      const targetWindow = selectTargetWindow(
        orderedWindows,
        sourceWindow,
        targetWorkspaceId
      );

      if (targetWindow === sourceWindow) {
        return originalOpenURI.apply(receiver, args);
      }

      console.info(
        `[ZenSpaceRouter] routing external URL to active Space ${targetWorkspaceId}`
      );

      const result = targetWindow.browserDOMWindow.openURI(...args);
      targetWindow.focus();
      return result;
    }

    function start() {
      if (started) {
        return;
      }

      const descriptor = Object.getOwnPropertyDescriptor(
        BrowserDOMWindow.prototype,
        "openURI"
      );
      if (!descriptor?.writable) {
        throw new Error("BrowserDOMWindow.prototype.openURI is not writable");
      }

      originalOpenURI = BrowserDOMWindow.prototype.openURI;
      wrappedOpenURI = function (...args) {
        return routeExternalOpen(this.win, this, args);
      };
      BrowserDOMWindow.prototype.openURI = wrappedOpenURI;
      started = true;
    }

    function stop() {
      if (
        wrappedOpenURI &&
        BrowserDOMWindow.prototype.openURI === wrappedOpenURI
      ) {
        BrowserDOMWindow.prototype.openURI = originalOpenURI;
      }
      started = false;
      originalOpenURI = null;
      wrappedOpenURI = null;
    }

    context.callOnClose({ close: stop });

    return {
      zenSpaceRouter: {
        start: async () => start(),
      },
    };
  }
};
