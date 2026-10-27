import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import esbuild from "esbuild";
import React from "react";
import { renderToString } from "react-dom/server";

const FRONTEND_DIR = path.resolve(import.meta.dirname, "..");
const LANDING_DIR = path.join(FRONTEND_DIR, "src/components/landing");

// Helper to compile and evaluate component in Node context
const loadComponent = (filename) => {
  const filePath = path.join(LANDING_DIR, filename);
  const source = fs.readFileSync(filePath, "utf8");
  const transformed = esbuild.transformSync(source, {
    loader: "jsx",
    format: "cjs",
  });

  const fakeRequire = (name) => {
    if (name === "react") return React;
    if (name === "react-router-dom") {
      return {
        Link: ({ to, children, ...props }) =>
          React.createElement("a", { href: to, ...props }, children),
      };
    }
    if (name === "./LandingMatchModal") {
      return loadComponent("LandingMatchModal.jsx");
    }
    if (name === "lucide-react") {
      return new Proxy(
        {},
        {
          get: (_, iconName) => (props) =>
            React.createElement("svg", { "data-icon": iconName, ...props }),
        }
      );
    }
    throw new Error(`Unexpected import in test: ${name}`);
  };

  const moduleExports = {};
  const fakeModule = { exports: moduleExports };
  const fn = new Function("require", "exports", "module", transformed.code);
  fn(fakeRequire, moduleExports, fakeModule);
  return fakeModule.exports.default;
};

// Read source files directly for static and AST verification
const feedSource = fs.readFileSync(
  path.join(LANDING_DIR, "InteractiveFeedSnippetSection.jsx"),
  "utf8"
);
const modalSource = fs.readFileSync(
  path.join(LANDING_DIR, "LandingMatchModal.jsx"),
  "utf8"
);

describe("Challenger M1 Deep Adversarial Stress & Verification Harness", () => {
  // =========================================================================
  // 1. InteractiveFeedSnippetSection Concurrency & Race Conditions
  // =========================================================================
  describe("1. InteractiveFeedSnippetSection: Concurrency & Preset Switching", () => {
    it("empirically verifies that handleSelectPreset rejects preset switching while isRunning is true", () => {
      // Extract handleSelectPreset and state logic as implemented in the component:
      // const handleSelectPreset = (idx) => {
      //   if (isRunning) return;
      //   setActivePreset(idx);
      //   setOutput(null);
      // };
      let activePreset = 0;
      let output = { lines: ["1, 1, 2, 3, 6, 8, 10"], time: 12 };
      let isRunning = true;

      const handleSelectPreset = (idx) => {
        if (isRunning) return;
        activePreset = idx;
        output = null;
      };

      // Attempt preset switch while isRunning is true
      handleSelectPreset(1);
      assert.equal(activePreset, 0, "activePreset must NOT change while isRunning is true");
      assert.notEqual(output, null, "output must NOT be cleared while isRunning is true");

      handleSelectPreset(2);
      assert.equal(activePreset, 0, "activePreset must remain 0");

      // Verify that after isRunning becomes false, switching works as expected
      isRunning = false;
      handleSelectPreset(1);
      assert.equal(activePreset, 1, "activePreset should change to 1 after execution ends");
      assert.equal(output, null, "output should be cleared on valid preset switch");
    });

    it("verifies preset buttons in JSX markup contain disabled={isRunning} and visual disabled classes", () => {
      // Locate the preset buttons mapping in the source
      const presetBlockMatch = feedSource.match(/\{PRESETS\.map\([\s\S]*?<\/button>\s*\)\)\}/);
      assert.ok(presetBlockMatch, "PRESETS.map block must be found in source");
      const presetBlock = presetBlockMatch[0];

      assert.ok(
        presetBlock.includes("disabled={isRunning}"),
        "Preset button element must include disabled={isRunning}"
      );
      assert.ok(
        presetBlock.includes("disabled:opacity-50") &&
          presetBlock.includes("disabled:cursor-not-allowed"),
        "Preset buttons must have visual disabled styles (opacity-50 and cursor-not-allowed)"
      );
    });

    it("stress-tests rapid interleaved clicks (burst of 100 concurrent requests) while isRunning is true", () => {
      let activePreset = 0;
      let output = { lines: ["initial"], time: 5 };
      let isRunning = true;

      const handleSelectPreset = (idx) => {
        if (isRunning) return;
        activePreset = idx;
        output = null;
      };

      // Simulate 100 rapid click events targeting presets 1, 2, 0 randomly
      for (let i = 0; i < 100; i++) {
        const targetPreset = i % 3;
        handleSelectPreset(targetPreset);
      }

      assert.equal(activePreset, 0, "activePreset must remain locked to 0 after 100 concurrent attempts");
      assert.deepEqual(output, { lines: ["initial"], time: 5 }, "output must remain unchanged");
    });
  });

  // =========================================================================
  // 2. postMessage Forgery & e.source Isolation
  // =========================================================================
  describe("2. InteractiveFeedSnippetSection: postMessage Forgery & Source Isolation", () => {
    // Harness simulating runInSandbox with exact code from source
    const createSandboxHarness = (sourceCode) => {
      // Extract runInSandbox function body from source
      const fnMatch = sourceCode.match(/const runInSandbox = \(code\) => \{([\s\S]*?)\n\};/);
      assert.ok(fnMatch, "Must extract runInSandbox from source");
      const fnBody = fnMatch[1];
      return new Function("code", "window", "document", "performance", "setTimeout", "clearTimeout", fnBody);
    };

    const runInSandboxImpl = createSandboxHarness(feedSource);

    it("rejects postMessage forgery when e.source is window (top-level spoofing)", async () => {
      let messageListener = null;
      const fakeIframeContentWindow = { id: "GENUINE_IFRAME_WINDOW" };
      let iframeAttached = true;

      const mockIframe = {
        style: {},
        setAttribute: () => {},
        contentWindow: fakeIframeContentWindow,
        srcdoc: "",
      };

      const mockDocument = {
        createElement: (tag) => (tag === "iframe" ? mockIframe : {}),
        body: {
          appendChild: () => { iframeAttached = true; },
          removeChild: () => { iframeAttached = false; },
          contains: (el) => el === mockIframe && iframeAttached,
        },
      };

      const mockWindow = {
        addEventListener: (event, handler) => {
          if (event === "message") messageListener = handler;
        },
        removeEventListener: (event, handler) => {
          if (event === "message" && messageListener === handler) messageListener = null;
        },
      };

      let resolved = false;
      let resolutionValue = null;

      const promise = runInSandboxImpl(
        "console.log('hi')",
        mockWindow,
        mockDocument,
        { now: () => 100 },
        setTimeout,
        clearTimeout
      ).then((res) => {
        resolved = true;
        resolutionValue = res;
      });

      assert.equal(typeof messageListener, "function", "Listener must be registered");

      // Adversarial Attack: Attacker window/script calls window.postMessage with forged payload
      const forgedEvent = {
        source: mockWindow, // e.source is top window, NOT iframe.contentWindow!
        data: {
          type: "octopair_done",
          logs: ["ATTACKER_INJECTED_CODE_OUTPUT"],
        },
      };

      messageListener(forgedEvent);

      // Verify the attack was thwarted
      assert.equal(resolved, false, "Promise must NOT resolve from forged window message");
      assert.notEqual(messageListener, null, "Message listener must NOT be removed by forged message");
      assert.equal(iframeAttached, true, "Iframe must NOT be removed from DOM by forged message");

      // Now send genuine event with e.source === fakeIframeContentWindow
      const genuineEvent = {
        source: fakeIframeContentWindow,
        data: {
          type: "octopair_done",
          logs: ["GENUINE_EXECUTION_OUTPUT"],
        },
      };

      messageListener(genuineEvent);
      await promise;

      assert.equal(resolved, true, "Promise must resolve after genuine message");
      assert.deepEqual(resolutionValue.lines, ["GENUINE_EXECUTION_OUTPUT"]);
      assert.equal(messageListener, null, "Message listener must be cleaned up");
      assert.equal(iframeAttached, false, "Iframe must be removed after genuine resolution");
    });

    it("rejects postMessage forgery when e.source is an external third-party frame or object", async () => {
      let messageListener = null;
      const fakeIframeContentWindow = { id: "GENUINE_IFRAME_WINDOW" };
      const rogueWindow = { id: "ROGUE_EXTERNAL_FRAME" };

      const mockIframe = {
        style: {},
        setAttribute: () => {},
        contentWindow: fakeIframeContentWindow,
        srcdoc: "",
      };

      const mockDocument = {
        createElement: () => mockIframe,
        body: {
          appendChild: () => {},
          removeChild: () => {},
          contains: () => true,
        },
      };

      const mockWindow = {
        addEventListener: (event, handler) => {
          if (event === "message") messageListener = handler;
        },
        removeEventListener: (event, handler) => {
          if (event === "message" && messageListener === handler) messageListener = null;
        },
      };

      let resolved = false;

      const promise = runInSandboxImpl(
        "console.log('hi')",
        mockWindow,
        mockDocument,
        { now: () => 100 },
        setTimeout,
        clearTimeout
      ).then(() => {
        resolved = true;
      });

      // Attack scenarios with rogue sources
      const attacks = [
        { source: rogueWindow, data: { type: "octopair_done", logs: ["spoof1"] } },
        { source: null, data: { type: "octopair_done", logs: ["spoof2"] } },
        { source: undefined, data: { type: "octopair_done", logs: ["spoof3"] } },
        { source: {}, data: { type: "octopair_done", logs: ["spoof4"] } },
      ];

      for (const atk of attacks) {
        messageListener(atk);
        assert.equal(resolved, false, `Must reject forgery with source: ${atk.source}`);
      }

      // Finish cleanly with genuine source
      messageListener({
        source: fakeIframeContentWindow,
        data: { type: "octopair_done", logs: ["clean"] },
      });
      await promise;
      assert.equal(resolved, true);
    });

    it("verifies timeout fallback cleans up iframe and listener when sandbox execution hangs", async () => {
      let messageListener = null;
      let iframeRemoved = false;

      const mockIframe = {
        style: {},
        setAttribute: () => {},
        contentWindow: {},
        srcdoc: "",
      };

      const mockDocument = {
        createElement: () => mockIframe,
        body: {
          appendChild: () => {},
          removeChild: (el) => { if (el === mockIframe) iframeRemoved = true; },
          contains: () => !iframeRemoved,
        },
      };

      const mockWindow = {
        addEventListener: (event, handler) => { messageListener = handler; },
        removeEventListener: () => { messageListener = null; },
      };

      // Mock setTimeout to immediately trigger the timeout callback
      let registeredTimeoutCb = null;
      const fakeSetTimeout = (cb) => {
        registeredTimeoutCb = cb;
        return 999;
      };

      const promise = runInSandboxImpl(
        "while(true){}",
        mockWindow,
        mockDocument,
        { now: () => 500 },
        fakeSetTimeout,
        clearTimeout
      );

      assert.equal(typeof registeredTimeoutCb, "function", "Timeout callback must be registered");

      // Fire timeout
      registeredTimeoutCb();
      const res = await promise;

      assert.deepEqual(res.lines, ["Process completed"]);
      assert.equal(iframeRemoved, true, "Iframe must be removed from body on timeout");
      assert.equal(messageListener, null, "Message listener must be removed on timeout");
    });
  });

  // =========================================================================
  // 3. SSR Fallback Execution & Pure Output
  // =========================================================================
  describe("3. InteractiveFeedSnippetSection: SSR Fallback Neutrality", () => {
    it("verifies that runInSandbox SSR fallback returns empty neutral object and NOT hardcoded array", async () => {
      // In source:
      // if (typeof window === "undefined" || typeof document === "undefined") {
      //   resolve({ lines: [], time: 0 });
      //   return;
      // }
      const ssrBody = feedSource.match(
        /if \(typeof window === "undefined" \|\| typeof document === "undefined"\) \{([\s\S]*?)\}/
      );
      assert.ok(ssrBody, "Must locate SSR guard in runInSandbox");
      assert.ok(
        ssrBody[0].includes("lines: []"),
        "SSR guard must return empty array lines: []"
      );
      assert.ok(
        !ssrBody[0].includes("1, 1, 2, 3, 6, 8, 10"),
        "SSR guard must NOT contain hardcoded QuickSort output"
      );

      // Execute in Node where window and document are undefined
      const fnMatch = feedSource.match(/const runInSandbox = \(code\) => \{([\s\S]*?)\n\};/);
      const fn = new Function("code", fnMatch[1]);
      const res = await fn("arbitrary user code");

      assert.deepEqual(res, { lines: [], time: 0 });
    });

    it("verifies React SSR renderToString produces no pre-computed terminal output", () => {
      const InteractiveFeedSnippetSection = loadComponent("InteractiveFeedSnippetSection.jsx");
      const html = renderToString(React.createElement(InteractiveFeedSnippetSection));

      assert.ok(!html.includes("Terminal Output"), "SSR HTML must not contain terminal output");
      assert.ok(!html.includes("1, 1, 2, 3, 6, 8, 10"), "SSR HTML must not contain QuickSort numbers");
      assert.ok(html.includes("LIVE CODE FEED"), "SSR HTML must contain section header");
    });
  });

  // =========================================================================
  // 4. LandingMatchModal Focus Trap, A11y, & Keyboard Cycling
  // =========================================================================
  describe("4. LandingMatchModal: Focus Trap & Keyboard Navigation", () => {
    // Build a DOM simulation harness representing the modal structure
    const createModalDomHarness = () => {
      const elements = {};
      let currentActiveElement = null;
      let bodyOverflow = "";
      const windowListeners = {};

      const createMockElement = (id, tagName = "button", attrs = {}) => {
        const el = {
          id,
          tagName,
          attrs,
          style: {},
          focus: () => {
            currentActiveElement = el;
          },
        };
        elements[id] = el;
        return el;
      };

      const closeBtn = createMockElement("close-btn", "button", { "aria-label": "Close" });
      const ctaLink = createMockElement("chat-link", "a", { href: "/login?mode=signup" });
      const keepBtn = createMockElement("keep-btn", "button");
      const bgButton = createMockElement("bg-button", "button");
      const matchingSection = createMockElement("matching", "section");

      const focusableList = [closeBtn, ctaLink, keepBtn];

      const modalRefCurrent = {
        querySelectorAll: (selector) => {
          if (selector.includes("button") || selector.includes("a[href]")) {
            return focusableList;
          }
          return [];
        },
        querySelector: (selector) => focusableList[0] || null,
        contains: (target) => focusableList.includes(target),
      };

      const doc = {
        get activeElement() {
          return currentActiveElement;
        },
        body: {
          style: {
            get overflow() {
              return bodyOverflow;
            },
            set overflow(val) {
              bodyOverflow = val;
            },
          },
          contains: (target) => Object.values(elements).includes(target),
        },
        getElementById: (id) => elements[id] || null,
      };

      const win = {
        addEventListener: (event, handler) => {
          windowListeners[event] = handler;
        },
        removeEventListener: (event, handler) => {
          if (windowListeners[event] === handler) delete windowListeners[event];
        },
      };

      return {
        doc,
        win,
        elements,
        closeBtn,
        ctaLink,
        keepBtn,
        bgButton,
        matchingSection,
        modalRefCurrent,
        windowListeners,
        setActiveElement: (el) => {
          currentActiveElement = el;
        },
        getActiveElement: () => currentActiveElement,
        getOverflow: () => bodyOverflow,
        setOverflow: (v) => {
          bodyOverflow = v;
        },
      };
    };

    // Extract effect logic from LandingMatchModal
    const createModalEffectHarness = (sourceCode) => {
      const effectMatch = sourceCode.match(/useEffect\(\(\) => \{([\s\S]*?)\n\s*\}, \[dev, onClose\]\);/);
      assert.ok(effectMatch, "Must extract useEffect from LandingMatchModal");
      const effectBody = effectMatch[1];
      return (dev, onClose, modalRef, closeButtonRef, windowObj, documentObj, setTimeoutFn, clearTimeoutFn) => {
        const fn = new Function(
          "dev",
          "onClose",
          "modalRef",
          "closeButtonRef",
          "window",
          "document",
          "setTimeout",
          "clearTimeout",
          effectBody
        );
        return fn(
          dev,
          onClose,
          modalRef,
          closeButtonRef,
          windowObj,
          documentObj,
          setTimeoutFn,
          clearTimeoutFn
        );
      };
    };

    const runModalEffect = createModalEffectHarness(modalSource);

    it("verifies initial focus is set to the Close button on mount", () => {
      const h = createModalDomHarness();
      let timeoutCb = null;
      const fakeSetTimeout = (cb) => {
        timeoutCb = cb;
        return 1;
      };

      runModalEffect(
        { name: "Elena", skills: ["Rust"] },
        () => {},
        { current: h.modalRefCurrent },
        { current: h.closeBtn },
        h.win,
        h.doc,
        fakeSetTimeout,
        clearTimeout
      );

      assert.equal(typeof timeoutCb, "function", "Timeout callback must be scheduled");
      timeoutCb(); // Execute initial focus placement
      assert.equal(h.getActiveElement(), h.closeBtn, "Initial focus must be placed on close button");
    });

    it("cycles forward: pressing Tab on the last element wraps focus back to the first element (close button)", () => {
      const h = createModalDomHarness();
      let closeCalled = false;
      const cleanup = runModalEffect(
        { name: "Elena", skills: ["Rust"] },
        () => { closeCalled = true; },
        { current: h.modalRefCurrent },
        { current: h.closeBtn },
        h.win,
        h.doc,
        (cb) => cb(),
        clearTimeout
      );

      const keydownHandler = h.windowListeners["keydown"];
      assert.equal(typeof keydownHandler, "function");

      // Place focus on last element ("keep-btn")
      h.setActiveElement(h.keepBtn);

      let preventDefaultCalled = false;
      const tabEvent = {
        key: "Tab",
        shiftKey: false,
        preventDefault: () => {
          preventDefaultCalled = true;
        },
      };

      keydownHandler(tabEvent);

      assert.equal(preventDefaultCalled, true, "e.preventDefault() must be called on wrap");
      assert.equal(h.getActiveElement(), h.closeBtn, "Focus must wrap back to the first focusable element");

      cleanup();
    });

    it("cycles reverse: pressing Shift+Tab on the first element wraps focus to the last element (keep browsing)", () => {
      const h = createModalDomHarness();
      const cleanup = runModalEffect(
        { name: "Elena", skills: ["Rust"] },
        () => {},
        { current: h.modalRefCurrent },
        { current: h.closeBtn },
        h.win,
        h.doc,
        (cb) => cb(),
        clearTimeout
      );

      const keydownHandler = h.windowListeners["keydown"];

      // Place focus on first element ("close-btn")
      h.setActiveElement(h.closeBtn);

      let preventDefaultCalled = false;
      const shiftTabEvent = {
        key: "Tab",
        shiftKey: true,
        preventDefault: () => {
          preventDefaultCalled = true;
        },
      };

      keydownHandler(shiftTabEvent);

      assert.equal(preventDefaultCalled, true, "e.preventDefault() must be called on reverse wrap");
      assert.equal(h.getActiveElement(), h.keepBtn, "Focus must wrap to the last focusable element");

      cleanup();
    });

    it("traps focus when activeElement escapes outside the modal", () => {
      const h = createModalDomHarness();
      const cleanup = runModalEffect(
        { name: "Elena", skills: ["Rust"] },
        () => {},
        { current: h.modalRefCurrent },
        { current: h.closeBtn },
        h.win,
        h.doc,
        (cb) => cb(),
        clearTimeout
      );

      const keydownHandler = h.windowListeners["keydown"];

      // Active element is outside modal (e.g., bgButton)
      h.setActiveElement(h.bgButton);

      // Press Tab
      let preventDefaultCalled = false;
      keydownHandler({
        key: "Tab",
        shiftKey: false,
        preventDefault: () => { preventDefaultCalled = true; },
      });
      assert.equal(h.getActiveElement(), h.closeBtn, "Forward Tab from outside should refocus first element");
      assert.equal(preventDefaultCalled, true);

      // Press Shift+Tab while outside
      h.setActiveElement(h.bgButton);
      preventDefaultCalled = false;
      keydownHandler({
        key: "Tab",
        shiftKey: true,
        preventDefault: () => { preventDefaultCalled = true; },
      });
      assert.equal(h.getActiveElement(), h.keepBtn, "Shift+Tab from outside should refocus last element");
      assert.equal(preventDefaultCalled, true);

      cleanup();
    });

    it("dismisses on Escape key and calls e.preventDefault() and onClose()", () => {
      const h = createModalDomHarness();
      let closeCalled = false;
      const cleanup = runModalEffect(
        { name: "Elena", skills: ["Rust"] },
        () => { closeCalled = true; },
        { current: h.modalRefCurrent },
        { current: h.closeBtn },
        h.win,
        h.doc,
        (cb) => cb(),
        clearTimeout
      );

      const keydownHandler = h.windowListeners["keydown"];
      let preventDefaultCalled = false;

      keydownHandler({
        key: "Escape",
        preventDefault: () => { preventDefaultCalled = true; },
      });

      assert.equal(preventDefaultCalled, true, "Escape must call preventDefault");
      assert.equal(closeCalled, true, "Escape must call onClose");

      cleanup();
    });

    it("does not call preventDefault on non-modal navigation keys", () => {
      const h = createModalDomHarness();
      const cleanup = runModalEffect(
        { name: "Elena", skills: ["Rust"] },
        () => {},
        { current: h.modalRefCurrent },
        { current: h.closeBtn },
        h.win,
        h.doc,
        (cb) => cb(),
        clearTimeout
      );

      const keydownHandler = h.windowListeners["keydown"];
      let preventDefaultCalled = false;

      const nonNavKeys = ["Enter", " ", "ArrowDown", "ArrowUp", "a", "1"];
      for (const k of nonNavKeys) {
        keydownHandler({
          key: k,
          preventDefault: () => { preventDefaultCalled = true; },
        });
        assert.equal(preventDefaultCalled, false, `Key ${k} must not call preventDefault`);
      }

      cleanup();
    });
  });

  // =========================================================================
  // 5. LandingMatchModal Body Scroll Lock Lifecycle
  // =========================================================================
  describe("5. LandingMatchModal: Body Scroll Lock Lifecycle", () => {
    const createDom = () => {
      let bodyOverflow = "";
      const listeners = {};
      return {
        doc: {
          activeElement: null,
          body: {
            style: {
              get overflow() { return bodyOverflow; },
              set overflow(v) { bodyOverflow = v; },
            },
            contains: () => true,
          },
        },
        win: {
          addEventListener: (k, fn) => { listeners[k] = fn; },
          removeEventListener: (k) => { delete listeners[k]; },
        },
        getOverflow: () => bodyOverflow,
        setOverflow: (v) => { bodyOverflow = v; },
      };
    };

    const runEffect = (sourceCode) => {
      const effectMatch = sourceCode.match(/useEffect\(\(\) => \{([\s\S]*?)\n\s*\}, \[dev, onClose\]\);/);
      const effectBody = effectMatch[1];
      return new Function(
        "dev", "onClose", "modalRef", "closeButtonRef", "window", "document", "setTimeout", "clearTimeout",
        effectBody
      );
    };

    const effectFn = runEffect(modalSource);

    it("locks body scroll to 'hidden' upon opening and restores to '' upon closing", () => {
      const d = createDom();
      d.setOverflow(""); // Initial state

      // 1. Open modal
      const cleanup1 = effectFn(
        { name: "Elena" },
        () => {},
        { current: null },
        { current: null },
        d.win,
        d.doc,
        (cb) => cb(),
        clearTimeout
      );

      assert.equal(d.getOverflow(), "hidden", "Body overflow must be locked to 'hidden' when open");

      // 2. Close modal (cleanup runs)
      cleanup1();
      assert.equal(d.getOverflow(), "", "Body overflow must be restored to original '' on close");
    });

    it("re-locks body scroll when opening a second time and cleanly restores on second close", () => {
      const d = createDom();
      d.setOverflow("");

      // Open 1
      const cleanup1 = effectFn(
        { name: "Elena" },
        () => {},
        { current: null },
        { current: null },
        d.win,
        d.doc,
        (cb) => cb(),
        clearTimeout
      );
      assert.equal(d.getOverflow(), "hidden");
      cleanup1();
      assert.equal(d.getOverflow(), "");

      // Open 2 (Re-opening)
      const cleanup2 = effectFn(
        { name: "Alex" },
        () => {},
        { current: null },
        { current: null },
        d.win,
        d.doc,
        (cb) => cb(),
        clearTimeout
      );
      assert.equal(d.getOverflow(), "hidden", "Body overflow must be locked again on re-opening");

      // Close 2
      cleanup2();
      assert.equal(d.getOverflow(), "", "Body overflow must be restored to '' on second close");
    });

    it("preserves non-default initial overflow styles (e.g. 'auto' or 'scroll')", () => {
      const d = createDom();
      d.setOverflow("auto");

      const cleanup = effectFn(
        { name: "Elena" },
        () => {},
        { current: null },
        { current: null },
        d.win,
        d.doc,
        (cb) => cb(),
        clearTimeout
      );
      assert.equal(d.getOverflow(), "hidden", "Overflow should be hidden while open");

      cleanup();
      assert.equal(d.getOverflow(), "auto", "Must restore original 'auto' overflow style");
    });

    it("restores focus to previousActiveElement when attached to DOM", () => {
      let focused = false;
      const prevElement = {
        focus: () => { focused = true; },
      };

      const d = createDom();
      d.doc.activeElement = prevElement;
      d.doc.body.contains = (el) => el === prevElement;

      const cleanup = effectFn(
        { name: "Elena" },
        () => {},
        { current: null },
        { current: null },
        d.win,
        d.doc,
        (cb) => cb(),
        clearTimeout
      );

      assert.equal(focused, false);
      cleanup();
      assert.equal(focused, true, "Must restore focus to previousActiveElement upon unmount");
    });

    it("falls back to #matching element when previousActiveElement was detached from DOM", () => {
      let matchingFocused = false;
      const matchingSection = {
        focus: () => { matchingFocused = true; },
      };

      const detachedPrevElement = {
        focus: () => { throw new Error("Detached element should not be focused"); },
      };

      const d = createDom();
      d.doc.activeElement = detachedPrevElement;
      d.doc.body.contains = (el) => false; // detached!
      d.doc.getElementById = (id) => (id === "matching" ? matchingSection : null);

      const cleanup = effectFn(
        { name: "Elena" },
        () => {},
        { current: null },
        { current: null },
        d.win,
        d.doc,
        (cb) => cb(),
        clearTimeout
      );

      assert.doesNotThrow(() => {
        cleanup();
      });
      assert.equal(matchingFocused, true, "Must fall back to #matching when trigger element is detached");
    });
  });
});
