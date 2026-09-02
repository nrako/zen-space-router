# Space Routing should target the window already displaying the destination Space

## Problem

Space Routing resolves a URL to a destination Space, but with multiple Zen
windows it does not account for which window is already displaying that Space.

For example:

- Window A displays a main Space.
- Window B displays a `Videos` Space on another monitor.
- A routing rule sends YouTube URLs to `Videos`.

Opening an external YouTube link may make Window A switch to `Videos` even
though Window B already displays it. Conversely, a normal external link may
make Window B leave `Videos` instead of using Window A.

The selected window varies with activation, monitor placement, fullscreen
state, and macOS Spaces state.

## Expected behavior

When a specific Space Routing rule resolves to a destination Space:

1. Prefer an existing Zen window already displaying that Space.
2. If several windows match, use the most recently active matching window.
3. If no window matches, preserve the current behavior and switch the normal
   target window to the destination Space.
4. Preserve the existing behavior for `Most recent Space`.

This makes the destination `URL -> Space -> matching window`, rather than
`URL -> arbitrary Firefox-selected window -> change that window's Space`.

## Steps to reproduce

1. On macOS, enable `Displays have separate Spaces`.
2. Use three displays: the MacBook's built-in display and two external
   displays. In the observed setup these were an LG display and an iPad used
   through Sidecar in extended-display mode.
3. Open two Zen windows on the two external displays.
4. Show Space A in Window A and Space B in Window B.
5. Add a Space Routing rule sending `youtube.com` to Space B.
6. Focus Window A and open a YouTube link from another application.
7. Repeat after changing focus, fullscreen state, or display placement.

The issue was much less readily observable when the interaction involved only
the built-in display and one secondary display. The inconsistent selection was
most apparent with two external displays active, so reducing the setup to one
external monitor may not reproduce the same behavior reliably.

## Technical observation

Firefox chooses a browser window in `BrowserContentHandler` through
`BrowserWindowTracker.getTopWindow()` before Zen's tab-level routing runs.
Zen then invokes `gZenSpaceRoutingManager.onBeforeAddTab(..., window)` and
applies the resolved Space inside that already-selected window.

A possible correction is a Zen-specific external-URL window-resolution step,
before tab creation, that prefers a window whose
`gZenWorkspaces.activeWorkspace` matches the native route destination.

An experimental privileged extension is being used to validate this boundary
by intercepting the JavaScript `BrowserDOMWindow.prototype.openURI` before the
tab is created. The per-window XPCOM facade is read-only, but the underlying
class prototype is a candidate injection point. The prototype reuses Zen's
native `routeUri()` and Firefox's native MRU window ordering; it does not
maintain parallel URL rules.

## Environment

- Zen Browser 1.21.16b
- macOS Intel
- MacBook Pro 2017
- Built-in display, external LG display, and iPad Sidecar extended display

No screenshots or video are provided.
