# Zen Space Router

Experimental privileged extension that makes Zen Browser open an external URL
in the existing window already displaying the Space selected by native Space
Routing.

## Stack

- JavaScript ES modules and Node.js built-in tooling.
- Firefox Manifest V2 WebExtension with an `experiment_api`.
- Node's built-in test runner.
- The system `zip` command builds the XPI; there are no package dependencies.

## Conventions

- Keep the privileged browser-process patch as small as possible.
- Reuse Zen's native routing rules; never maintain a parallel URL-rule format.
- Preserve Zen's behavior when no window displays the destination Space.
- Never log or persist routed URLs.
- Keep deterministic window-selection logic isolated in `router-core.js` and
  covered by unit tests.
- Treat compatibility with new Zen releases as unverified until manually tested.
- Do not commit generated files under `dist/`.

## Communication and documentation

- Use concise, plain language and lead with the result or unresolved question.
- Document security-sensitive installation requirements explicitly.
- Keep the compatibility and validation boundary current in the README.
