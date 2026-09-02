# Space Routing should target the window already displaying the destination Space

Upstream issue:
[zen-browser/desktop#15209](https://github.com/zen-browser/desktop/issues/15209)

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
2. If several windows match, prefer a non-minimized matching window, then use
   most-recent order within the eligible group.
3. If no window matches, preserve the current behavior and switch the normal
   target window to the destination Space.
4. Preserve the existing behavior for `Most recent Space`.

This makes the destination `URL -> Space -> matching window`, rather than
`URL -> arbitrary Firefox-selected window -> change that window's Space`.

## Steps to reproduce

1. On macOS, enable `Displays have separate Spaces`.
2. Use at least two displays and open one Zen window on each.
3. Show Space A in Window A and Space B in Window B.
4. Add a Space Routing rule sending `youtube.com` to Space B, and set the
   default external route to Space A.
5. Focus Window A and open a YouTube link from another application.
6. Focus Window B and open a non-YouTube link from another application.
7. Repeat after changing focus, fullscreen state, or display placement.

The issue was most consistently observable with three displays, including two
external displays, but that may not be a strict requirement.

For testing without several physical displays, a virtual display created with
[DeskPad](https://github.com/Stengo/DeskPad) may help reproduce the
multi-display window-selection path, although this has not been verified as
identical to a physical display.

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
- macOS

No screenshots or video are provided.
