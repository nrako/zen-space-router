"use strict";

browser.zenSpaceRouter.start().then(
  () => console.info("[ZenSpaceRouter] started"),
  error => console.error("[ZenSpaceRouter] failed to start", error)
);
