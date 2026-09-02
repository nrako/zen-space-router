# Feasibility result

Validated on 2026-09-02 with Zen Browser 1.21.16b on macOS, using the
isolated `zen-space-router-lab` profile.

## Injection boundary

The first attempt tried to replace `openURI` on each exposed
`window.browserDOMWindow`. Zen rejected this at runtime:

```text
"openURI" is read-only
```

The exposed object is an XPCOM facade whose own `openURI` property is neither
writable nor configurable. The underlying `BrowserDOMWindow` implementation is
a JavaScript class, however, and `BrowserDOMWindow.prototype.openURI` is
writable. Wrapping the class prototype succeeds and affects existing and future
browser windows in the profile process.

## End-to-end privileged probe

The laboratory contained:

- one window displaying `Main Lab`;
- one window displaying `Videos Lab`;
- one native Space Routing rule matching `zen-router-probe` and targeting
  `Videos Lab`.

The probe called the same browser boundary used by Firefox external URL
handling:

```js
sourceWindow.browserDOMWindow.openURI(
  Services.io.newURI("https://example.com/zen-router-probe"),
  null,
  Ci.nsIBrowserDOMWindow.OPEN_DEFAULTWINDOW,
  Ci.nsIBrowserDOMWindow.OPEN_EXTERNAL,
  Services.scriptSecurityManager.getSystemPrincipal()
);
```

Observed result after the call:

```json
{
  "reroutedCount": 1,
  "source": {
    "activeWorkspace": "Main Lab",
    "matchingTabs": 0
  },
  "target": {
    "activeWorkspace": "Videos Lab",
    "matchingTabs": 1
  }
}
```

The source window did not change Space. The destination window remained on the
target Space and received the newly-created tab. No post-creation tab move was
used.

## What this proves

- Zen's native `routeUri()` can resolve the destination before tab creation.
- Firefox's MRU window list can be filtered by each window's active Zen Space.
- The external open can be delegated to the matching window without changing
  either window's active Space.
- A Zen-side correction is technically possible before the tab exists.

## Remaining validation

- The first manual use through macOS's external URL/application path succeeded
  in a three-display setup with two external displays. Repeat the matrix
  systematically before treating it as regression coverage.
- Test the remaining browser integration cases manually: multiple matching
  windows, minimized windows, background external opens, window closure during
  route resolution, and confirmation that private windows preserve native
  behavior.
