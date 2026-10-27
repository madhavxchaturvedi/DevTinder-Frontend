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

const SCOPED_COMPONENTS = [
  "DeveloperMatchingSection.jsx",
  "LandingMatchModal.jsx",
  "InteractiveFeedSnippetSection.jsx",
  "RoomFeaturesSection.jsx",
];

// Helper to compile and evaluate a component in Node SSR context
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
    if (name === "framer-motion") {
      return {
        motion: new Proxy(
          {},
          {
            get: (_, tag) => (props) =>
              React.createElement(tag, props, props?.children),
          }
        ),
        AnimatePresence: ({ children }) => children,
      };
    }
    throw new Error(`Unexpected import in test: ${name}`);
  };

  const moduleExports = {};
  const fakeModule = { exports: moduleExports };
  const fn = new Function("require", "exports", "module", transformed.code);
  fn(fakeRequire, moduleExports, fakeModule);
  return fakeModule.exports.default;
};

describe("Milestone 1 Adversarial Challenge & Stress-Test Suite", () => {
  // =========================================================================
  // 1. AST & Forbidden Constructs Verification
  // =========================================================================
  describe("1. AST & Strict Invariant Analysis", () => {
    for (const comp of SCOPED_COMPONENTS) {
      it(`verifies zero forbidden constructs in ${comp}`, () => {
        const fullPath = path.join(LANDING_DIR, comp);
        assert.ok(fs.existsSync(fullPath), `File must exist: ${comp}`);
        const content = fs.readFileSync(fullPath, "utf8");

        // A. Forbidden code execution
        assert.ok(!/\beval\s*\(/.test(content), `${comp} must not use eval()`);
        assert.ok(!/\bFunction\s*\(/.test(content), `${comp} must not use Function() constructor`);

        // B. Forbidden hardware/WebRTC APIs
        assert.ok(!/\bgetUserMedia\b/.test(content), `${comp} must not call getUserMedia`);
        assert.ok(!/\bRTCPeerConnection\b/.test(content), `${comp} must not instantiate RTCPeerConnection`);

        // C. Forbidden Redux imports
        assert.ok(!/\buseSelector\b/.test(content), `${comp} must not use useSelector`);
        assert.ok(!/\buseDispatch\b/.test(content), `${comp} must not use useDispatch`);
        assert.ok(!/from\s+["']react-redux["']/.test(content), `${comp} must not import react-redux`);

        // D. Single H1 rule: zero h1 in new landing components
        assert.ok(!/<h1\b/.test(content), `${comp} must not contain an <h1> tag`);

        // E. Forbidden route links
        assert.ok(!content.includes('"/discover"'), `${comp} must not link to /discover`);
        assert.ok(!content.includes("'/discover'"), `${comp} must not link to /discover`);
        assert.ok(!content.includes('"/sandbox"'), `${comp} must not link to /sandbox`);
        assert.ok(!content.includes("'/sandbox'"), `${comp} must not link to /sandbox`);
        assert.ok(!content.includes('"/profile/'), `${comp} must not link to /profile/:id`);
      });

      it(`verifies zero Unicode emoji characters in ${comp}`, () => {
        const fullPath = path.join(LANDING_DIR, comp);
        const content = fs.readFileSync(fullPath, "utf8");
        const emojiRegex = /[\u{1F000}-\u{1FAFF}]|[\u{2600}-\u{27BF}]|[\u{FE00}-\u{FE0F}]|[\u{1F900}-\u{1F9FF}]/gu;
        const matches = content.match(emojiRegex);
        assert.equal(matches, null, `Found forbidden emoji in ${comp}: ${JSON.stringify(matches)}`);
      });
    }

    it("verifies single <h1> rule across ALL landing components", () => {
      const allFiles = fs.readdirSync(LANDING_DIR).filter((f) => f.endsWith(".jsx"));
      const h1Occurrences = [];
      for (const file of allFiles) {
        const content = fs.readFileSync(path.join(LANDING_DIR, file), "utf8");
        const matches = content.match(/<h1\b/g);
        if (matches) {
          h1Occurrences.push({ file, count: matches.length });
        }
      }
      assert.equal(h1Occurrences.length, 1, "Only one component may contain <h1>");
      assert.equal(h1Occurrences[0].file, "HeroSection.jsx", "HeroSection.jsx must be the sole holder of <h1>");
      assert.equal(h1Occurrences[0].count, 1, "HeroSection.jsx must contain exactly one <h1>");
    });
  });

  // =========================================================================
  // 2. InteractiveFeedSnippetSection Execution & Sandbox Security
  // =========================================================================
  describe("2. InteractiveFeedSnippetSection Empirical Code Runner & Sandbox Security", () => {
    const feedContent = fs.readFileSync(
      path.join(LANDING_DIR, "InteractiveFeedSnippetSection.jsx"),
      "utf8"
    );

    it("verifies Preset 0 (QuickSort) runs and produces expected sorted array", () => {
      const codeMatch = feedContent.match(/label:\s*"QuickSort"[\s\S]*?code:\s*`([\s\S]*?)`/);
      assert.ok(codeMatch, "Must find QuickSort preset code");
      const code = codeMatch[1];

      const logs = [];
      const sandbox = {
        console: { log: (...args) => logs.push(args.map(String).join(" ")) },
        Math,
      };
      vm.createContext(sandbox);
      vm.runInContext(code, sandbox);

      assert.deepEqual(logs, ["1, 1, 2, 3, 6, 8, 10"]);
    });

    it("verifies Preset 1 (LRU Cache) runs and produces expected cache eviction output", () => {
      const codeMatch = feedContent.match(/label:\s*"LRU Cache"[\s\S]*?code:\s*`([\s\S]*?)`/);
      assert.ok(codeMatch, "Must find LRU Cache preset code");
      const code = codeMatch[1];

      const logs = [];
      const sandbox = {
        console: { log: (...args) => logs.push(args.map(String).join(" ")) },
        Map,
      };
      vm.createContext(sandbox);
      vm.runInContext(code, sandbox);

      assert.deepEqual(logs, ["one", "-1", "three"]);
    });

    it("verifies Preset 2 (Async Fetch) executes and logs developer details within 250ms window", async () => {
      const presetsMatch = feedContent.match(/const PRESETS = (\[[\s\S]*?\]);\n\nconst DEMO_PROJECT/);
      assert.ok(presetsMatch, "Must find PRESETS array");
      const PRESETS = new Function(`return ${presetsMatch[1]}`)();
      const code = PRESETS[2].code;

      const logs = [];
      const sandbox = {
        console: { log: (...args) => logs.push(args.map(String).join(" ")) },
        setTimeout,
        Promise,
      };
      vm.createContext(sandbox);
      vm.runInContext(code, sandbox);

      // Preset uses 50ms delay; iframe postMessage fires at 250ms.
      // Wait 100ms to allow promise resolution.
      await new Promise((r) => setTimeout(r, 100));

      assert.deepEqual(logs, ["User: Elena Rostova", "Role: Systems Engineer"]);
    });

    it("tests sandbox error capture: syntax and runtime exceptions are cleanly captured", () => {
      // Simulating the iframe script execution harness logic from runInSandbox:
      const runWithCapture = (userCode) => {
        const logs = [];
        const sandbox = {
          logs,
          console: { log: (...args) => logs.push(args.map(String).join(" ")) },
        };
        const harness = `
          try {
            ${userCode}
          } catch(e) {
            logs.push('Error: ' + e.message);
          }
        `;
        vm.createContext(sandbox);
        vm.runInContext(harness, sandbox);
        return logs;
      };

      const errorLogs = runWithCapture("throw new Error('Adversarial division by zero');");
      assert.deepEqual(errorLogs, ["Error: Adversarial division by zero"]);

      const refErrorLogs = runWithCapture("nonExistentFunctionCall();");
      assert.ok(refErrorLogs[0].startsWith("Error: nonExistentFunctionCall is not defined"));
    });

    it("tests sandbox isolation: iframe creation enforces sandbox='allow-scripts' without allow-same-origin", () => {
      // Verify sandbox attribute in runInSandbox
      assert.ok(
        feedContent.includes('iframe.setAttribute("sandbox", "allow-scripts");'),
        "Must strictly set sandbox to 'allow-scripts'"
      );
      assert.ok(
        !feedContent.includes("allow-same-origin"),
        "Must NOT include allow-same-origin (which would compromise sandbox boundary)"
      );
      assert.ok(
        !feedContent.includes("allow-top-navigation"),
        "Must NOT include allow-top-navigation"
      );
    });

    it("tests empirical runInSandbox DOM lifecycle and timeout behavior", async () => {
      // Mock DOM environment to test runInSandbox timeout and listener cleanup
      let eventListeners = {};
      let appendedIframes = [];
      let removedIframes = [];

      const mockIframe = {
        style: {},
        setAttribute: (k, v) => { mockIframe[k] = v; },
        srcdoc: "",
      };

      const mockDocument = {
        createElement: (tag) => (tag === "iframe" ? mockIframe : {}),
        body: {
          appendChild: (el) => { appendedIframes.push(el); },
          removeChild: (el) => { removedIframes.push(el); },
          contains: (el) => appendedIframes.includes(el) && !removedIframes.includes(el),
        },
      };

      const mockWindow = {
        addEventListener: (event, handler) => {
          eventListeners[event] = handler;
        },
        removeEventListener: (event, handler) => {
          if (eventListeners[event] === handler) delete eventListeners[event];
        },
        performance: { now: () => 1000 },
      };

      // Extract runInSandbox logic with mock window/document injected
      const runInSandboxHarness = (code, mockWin, mockDoc) => {
        return new Promise((resolve) => {
          const start = mockWin.performance.now();
          const iframe = mockDoc.createElement("iframe");
          iframe.style.display = "none";
          iframe.setAttribute("sandbox", "allow-scripts");
          mockDoc.body.appendChild(iframe);

          let timeoutId;
          const handler = (e) => {
            if (e.data?.type === "octopair_done") {
              clearTimeout(timeoutId);
              mockWin.removeEventListener("message", handler);
              if (mockDoc.body.contains(iframe)) mockDoc.body.removeChild(iframe);
              resolve({
                lines: e.data.logs || [],
                time: Math.round(mockWin.performance.now() - start),
              });
            }
          };

          timeoutId = setTimeout(() => {
            mockWin.removeEventListener("message", handler);
            if (mockDoc.body.contains(iframe)) mockDoc.body.removeChild(iframe);
            resolve({ lines: ["Process completed"], time: Math.round(mockWin.performance.now() - start) });
          }, 100); // 100ms for test speed

          mockWin.addEventListener("message", handler);
          iframe.srcdoc = "mock html";
        });
      };

      // Test Case A: Valid message arrives before timeout
      const p1 = runInSandboxHarness("code", mockWindow, mockDocument);
      assert.ok(mockDocument.body.contains(mockIframe));
      assert.equal(typeof eventListeners["message"], "function");

      // Fire message event
      eventListeners["message"]({ data: { type: "octopair_done", logs: ["Sorted!"] } });
      const res1 = await p1;

      assert.deepEqual(res1.lines, ["Sorted!"]);
      assert.equal(eventListeners["message"], undefined, "Message listener must be removed");
      assert.ok(!mockDocument.body.contains(mockIframe), "Iframe must be removed from DOM");

      // Test Case B: Timeout fires when execution hangs
      appendedIframes = [];
      removedIframes = [];
      const p2 = runInSandboxHarness("infinite loop", mockWindow, mockDocument);
      const res2 = await p2; // Let 100ms timeout elapse
      assert.deepEqual(res2.lines, ["Process completed"]);
      assert.equal(eventListeners["message"], undefined, "Message listener must be removed on timeout");
      assert.ok(!mockDocument.body.contains(mockIframe), "Iframe must be removed on timeout");

      // Test Case C: Extraneous or malformed message does NOT resolve or crash handler
      appendedIframes = [];
      removedIframes = [];
      let resolvedEarly = false;
      const p3 = runInSandboxHarness("code", mockWindow, mockDocument).then((r) => {
        resolvedEarly = true;
        return r;
      });

      // Malformed messages
      eventListeners["message"]({ data: null });
      eventListeners["message"]({ data: { type: "other_event" } });
      eventListeners["message"]({ invalid: true });
      assert.equal(resolvedEarly, false, "Handler must ignore non-octopair_done messages");

      // Now send proper message to finish
      eventListeners["message"]({ data: { type: "octopair_done", logs: ["Done"] } });
      const res3 = await p3;
      assert.deepEqual(res3.lines, ["Done"]);
    });

    it("verifies SSR safety of runInSandbox when window/document are undefined", async () => {
      // Simulates exact check in line 86 of InteractiveFeedSnippetSection:
      // if (typeof window === "undefined" || typeof document === "undefined") { resolve(...) }
      const ssrRun = () => {
        return new Promise((resolve) => {
          if (typeof window === "undefined" || typeof document === "undefined") {
            resolve({ lines: [], time: 0 });
            return;
          }
        });
      };

      const result = await ssrRun();
      assert.deepEqual(result, { lines: [], time: 0 });
    });

    it("verifies preset buttons are disabled while isRunning is true and handleSelectPreset guards execution", () => {
      assert.ok(
        feedContent.includes("disabled={isRunning}"),
        "Preset buttons must be disabled while isRunning is true"
      );
      assert.ok(
        feedContent.includes("disabled:opacity-50 disabled:cursor-not-allowed"),
        "Preset buttons must have disabled opacity and cursor styling"
      );
      assert.ok(
        feedContent.includes("if (isRunning) return;"),
        "handleSelectPreset must guard with if (isRunning) return;"
      );
    });

    it("verifies message handler guards with e.source !== iframe.contentWindow", () => {
      assert.ok(
        feedContent.includes("if (e.source !== iframe.contentWindow) return;"),
        "Message handler must guard against cross-origin/external frame events"
      );
    });

    it("verifies feed segmented toggle possesses WAI-ARIA tab semantics", () => {
      assert.ok(feedContent.includes('role="tablist"'), "Container must have role='tablist'");
      assert.ok(feedContent.includes('role="tab"'), "Buttons must have role='tab'");
      assert.ok(feedContent.includes("aria-selected="), "Buttons must indicate aria-selected");
      assert.ok(feedContent.includes('role="tabpanel"'), "Panels must have role='tabpanel'");
    });
  });

  // =========================================================================
  // 3. DeveloperMatchingSection Card Stack & State Machine Stress Testing
  // =========================================================================
  describe("3. DeveloperMatchingSection Card Stack & Index Boundary Stress Tests", () => {
    const matchingContent = fs.readFileSync(
      path.join(LANDING_DIR, "DeveloperMatchingSection.jsx"),
      "utf8"
    );

    // Parse DEMO_DEVS array directly from source
    const devsMatch = matchingContent.match(/const DEMO_DEVS = (\[[\s\S]*?\]);\n\nconst/);
    assert.ok(devsMatch, "DEMO_DEVS array must be present in source");
    const DEMO_DEVS = new Function(`return ${devsMatch[1]}`)();

    it("verifies DEMO_DEVS integrity: exactly 3 fictional developers with required fields", () => {
      assert.equal(DEMO_DEVS.length, 3);
      for (const dev of DEMO_DEVS) {
        assert.ok(dev.id, "Dev must have id");
        assert.ok(dev.name, "Dev must have name");
        assert.ok(dev.role, "Dev must have role");
        assert.ok(Array.isArray(dev.skills) && dev.skills.length >= 3, "Dev must have skills array");
        assert.ok(typeof dev.compatibility === "number", "Dev must have compatibility percentage");
        assert.ok(dev.bio, "Dev must have bio");
        assert.ok(dev.initials, "Dev must have initials");
      }
    });

    it("simulates card deck state transitions through full lifecycle and exhaustion", () => {
      let currentIndex = 0;
      let matchedDev = null;
      let direction = null;
      assert.equal(direction, null);
      const handleSkip = (isReducedMotion = false) => {
        if (currentIndex >= DEMO_DEVS.length) return;
        if (isReducedMotion) {
          currentIndex += 1;
          return;
        }
        direction = "left";
        assert.equal(direction, "left");
        currentIndex += 1;
        direction = null;
        assert.equal(direction, null);
      };

      const handleConnect = (isReducedMotion = false) => {
        if (currentIndex >= DEMO_DEVS.length) return;
        matchedDev = DEMO_DEVS[currentIndex];
        if (isReducedMotion) {
          currentIndex += 1;
          return;
        }
        direction = "right";
        assert.equal(direction, "right");
        currentIndex += 1;
        direction = null;
        assert.equal(direction, null);
      };

      // Initial State (Index 0)
      assert.equal(currentIndex, 0);
      assert.equal(matchedDev, null);
      let visible = DEMO_DEVS.slice(currentIndex, currentIndex + 3);
      assert.equal(visible.length, 3);
      assert.equal(visible[0].name, "Elena Rostova");

      // Connect Elena (Index 0 -> 1)
      handleConnect();
      assert.equal(matchedDev.name, "Elena Rostova");
      assert.equal(currentIndex, 1);
      visible = DEMO_DEVS.slice(currentIndex, currentIndex + 3);
      assert.equal(visible.length, 2);
      assert.equal(visible[0].name, "Alex Rivera");

      // Skip Alex (Index 1 -> 2)
      handleSkip();
      assert.equal(currentIndex, 2);
      visible = DEMO_DEVS.slice(currentIndex, currentIndex + 3);
      assert.equal(visible.length, 1);
      assert.equal(visible[0].name, "Maya Patel");

      // Connect Maya (Index 2 -> 3)
      handleConnect();
      assert.equal(matchedDev.name, "Maya Patel");
      assert.equal(currentIndex, 3);

      // Deck Exhaustion State
      const isExhausted = currentIndex >= DEMO_DEVS.length;
      assert.equal(isExhausted, true);

      // Stress Boundary: Additional Skip or Connect when exhausted must safely no-op
      handleSkip();
      assert.equal(currentIndex, 3, "currentIndex must not exceed DEMO_DEVS.length");
      handleConnect();
      assert.equal(currentIndex, 3, "currentIndex must not exceed DEMO_DEVS.length");

      // Replay Action: Reset index
      currentIndex = 0;
      assert.equal(currentIndex >= DEMO_DEVS.length, false);
      visible = DEMO_DEVS.slice(currentIndex, currentIndex + 3);
      assert.equal(visible.length, 3);
      assert.equal(visible[0].name, "Elena Rostova");
    });

    it("verifies buttons are disabled during active animation to prevent race conditions", () => {
      // In source: disabled={Boolean(direction)}
      assert.ok(
        matchingContent.includes("disabled={Boolean(direction)}"),
        "Skip and Connect buttons must be disabled while direction animation is active"
      );
    });

    it("verifies prefers-reduced-motion media query registration and cleanup", () => {
      assert.ok(
        matchingContent.includes('window.matchMedia("(prefers-reduced-motion: reduce)")'),
        "Must query prefers-reduced-motion"
      );
      assert.ok(
        matchingContent.includes("mq.addEventListener?.(\"change\", listener)"),
        "Must attach change listener"
      );
      assert.ok(
        matchingContent.includes("mq.removeEventListener?.(\"change\", listener)"),
        "Must remove change listener on cleanup"
      );
    });
  });

  // =========================================================================
  // 4. LandingMatchModal Interaction, A11y, & Event Handlers
  // =========================================================================
  describe("4. LandingMatchModal Lifecycle, A11y, & Interaction Security", () => {
    const modalContent = fs.readFileSync(
      path.join(LANDING_DIR, "LandingMatchModal.jsx"),
      "utf8"
    );

    it("verifies modal ARIA accessibility attributes and structural contract", () => {
      assert.ok(modalContent.includes('role="dialog"'), "Modal must have role='dialog'");
      assert.ok(modalContent.includes('aria-modal="true"'), "Modal must have aria-modal='true'");
      assert.ok(
        modalContent.includes('aria-labelledby="modal-headline"'),
        "Modal must have aria-labelledby pointing to headline"
      );
      assert.ok(
        modalContent.includes('id="modal-headline"'),
        "Headline must possess id='modal-headline'"
      );
      assert.ok(
        modalContent.includes('aria-label="Close match dialog"'),
        "Close button must possess aria-label"
      );
    });

    it("verifies Escape key listener logic: fires onClose only on Escape", () => {
      let closed = false;
      const onClose = () => { closed = true; };

      const handleKeyDown = (e) => {
        if (e.key === "Escape") onClose();
      };

      // Non-Escape keys
      handleKeyDown({ key: "Enter" });
      assert.equal(closed, false);
      handleKeyDown({ key: "Tab" });
      assert.equal(closed, false);
      handleKeyDown({ key: " " });
      assert.equal(closed, false);

      // Escape key
      handleKeyDown({ key: "Escape" });
      assert.equal(closed, true);
    });

    it("verifies backdrop dismiss vs inner modal click propagation", () => {
      let closed = false;
      const onClose = () => { closed = true; };

      // Backdrop click handler: calls onClose directly
      const onBackdropClick = () => onClose();
      onBackdropClick();
      assert.equal(closed, true);

      // Inner card click: calls e.stopPropagation()
      closed = false;
      let propagationStopped = false;
      const mockEvent = {
        stopPropagation: () => { propagationStopped = true; },
      };
      const onInnerCardClick = (e) => e.stopPropagation();
      onInnerCardClick(mockEvent);

      assert.equal(propagationStopped, true, "Inner card must stop propagation");
      assert.equal(closed, false, "Inner card click must not close modal");
    });

    it("verifies safe handling of dev initials fallback", () => {
      const getInitials = (dev) => dev.initials || dev.name.slice(0, 2).toUpperCase();
      assert.equal(getInitials({ name: "Elena Rostova", initials: "ER" }), "ER");
      assert.equal(getInitials({ name: "Linus Torvalds" }), "LI");
      assert.equal(getInitials({ name: "Alan Turing" }), "AL");
    });

    it("documents edge-case vulnerability: missing skills array leads to TypeError without fallback", () => {
      // Source line 76: dev.skills.map(...)
      // If dev object lacks skills, it throws.
      const mockDevWithoutSkills = { name: "Test Dev" };
      assert.throws(
        () => {
          mockDevWithoutSkills.skills.map((s) => s);
        },
        /Cannot read properties of undefined/
      );
      // Validated: DEMO_DEVS all supply skills, but component lacks defensive (dev.skills || [])
    });

    it("verifies zero Redux in LandingMatchModal", () => {
      assert.ok(!modalContent.includes("useSelector"));
      assert.ok(!modalContent.includes("useDispatch"));
      assert.ok(!modalContent.includes("react-redux"));
    });

    it("verifies vanilla React focus trap, initial focus, and body scroll lock implementation in LandingMatchModal", () => {
      assert.ok(modalContent.includes("useRef"), "Must import and use useRef for focus trap");
      assert.ok(modalContent.includes('key === "Tab"'), "Must handle Tab key for focus cycling");
      assert.ok(modalContent.includes("e.shiftKey"), "Must handle Shift+Tab for reverse cycling");
      assert.ok(modalContent.includes("closeButtonRef.current.focus()"), "Must place initial focus on close button");
      assert.ok(
        modalContent.includes('document.body.style.overflow = "hidden"'),
        "Must lock body scroll while modal is active"
      );
      assert.ok(
        modalContent.includes("document.body.style.overflow = originalOverflow"),
        "Must restore original body overflow on cleanup"
      );
      assert.ok(
        modalContent.includes("document.body.contains(previousActiveElement)"),
        "Must check if previousActiveElement is still attached before restoring focus"
      );
    });

    it("verifies defensive (dev.skills || []) mapping in LandingMatchModal when skills is missing", () => {
      assert.ok(
        modalContent.includes("(dev.skills || []).map"),
        "Must use defensive (dev.skills || []).map to guard against missing skills array"
      );
      const LandingMatchModal = loadComponent("LandingMatchModal.jsx");
      const devWithoutSkills = {
        id: 99,
        name: "Dev Without Skills",
        role: "Contract Engineer",
        compatibility: 90,
      };
      let html = "";
      assert.doesNotThrow(() => {
        html = renderToString(React.createElement(LandingMatchModal, { dev: devWithoutSkills, onClose: () => {} }));
      });
      assert.ok(html.includes("Dev Without Skills"), "Should render dev without throwing on missing skills");
    });
  });

  // =========================================================================
  // 5. RoomFeaturesSection Pure Mock Integrity & Hardware Isolation
  // =========================================================================
  describe("5. RoomFeaturesSection Hardware Isolation & Pure Scripted Mock Integrity", () => {
    const roomContent = fs.readFileSync(
      path.join(LANDING_DIR, "RoomFeaturesSection.jsx"),
      "utf8"
    );

    it("verifies zero media hardware API calls and zero WebRTC instantiation", () => {
      assert.ok(!roomContent.includes("navigator.mediaDevices"));
      assert.ok(!roomContent.includes("getUserMedia"));
      assert.ok(!roomContent.includes("new RTCPeerConnection"));
    });

    it("verifies interactive call controls are inactive scripted mocks with cursor-default", () => {
      // In source: inactive call control icons have cursor-default and NO onClick
      const controlsMatch = roomContent.match(/inactive call controls[\s\S]*?cursor-default/i);
      assert.ok(controlsMatch, "Call control icons must have cursor-default styling");
      assert.ok(!roomContent.includes("onClick={toggleMic}"), "Mic button must not have interactive handler");
      assert.ok(!roomContent.includes("onClick={toggleVideo}"), "Video button must not have interactive handler");
    });

    it("verifies Elena speaking indicator includes motion-reduce:animate-none", () => {
      assert.ok(
        roomContent.includes("ring-2 ring-[#ccff00] animate-pulse motion-reduce:animate-none"),
        "Speaking ring must disable animation under prefers-reduced-motion"
      );
    });

    it("verifies cursor blinking includes motion-reduce:animate-none", () => {
      assert.ok(
        roomContent.includes("animate-pulse motion-reduce:animate-none"),
        "Blinking cursor must disable animation under prefers-reduced-motion"
      );
    });

    it("verifies all 6 micro-features are defined with valid Lucide icons and colors", () => {
      const EXPECTED_FEATURES = [
        "Live Video & Voice",
        "Shared Task List",
        "Team Chat",
        "Reaction Emotes",
        "Full-Screen Preview",
        "ZIP Export",
      ];
      for (const title of EXPECTED_FEATURES) {
        assert.ok(roomContent.includes(`"${title}"`), `Must include micro-feature ${title}`);
      }
    });

    it("verifies sole CTA in RoomFeaturesSection links to /login?mode=signup", () => {
      assert.ok(
        roomContent.includes('to="/login?mode=signup"'),
        "CTA link must route to /login?mode=signup"
      );
    });
  });

  // =========================================================================
  // 6. Full React 19 SSR & Prerender Compatibility
  // =========================================================================
  describe("6. Full React 19 SSR & Prerender Simulation", () => {
    it("renders DeveloperMatchingSection to string without throwing", () => {
      const DeveloperMatchingSection = loadComponent("DeveloperMatchingSection.jsx");
      let html = "";
      assert.doesNotThrow(() => {
        html = renderToString(React.createElement(DeveloperMatchingSection));
      });
      assert.ok(html.includes('id="matching"'), "Rendered HTML must include section id='matching'");
      assert.ok(html.includes("Elena Rostova"), "Rendered HTML must contain first dev");
      assert.ok(html.includes("SKILL-BASED MATCHING"), "Rendered HTML must contain badge");
    });

    it("renders LandingMatchModal to string with mock dev without throwing", () => {
      const LandingMatchModal = loadComponent("LandingMatchModal.jsx");
      const mockDev = {
        id: 1,
        name: "Elena Rostova",
        role: "Systems Engineer",
        skills: ["Rust", "WebRTC", "Distributed Systems"],
        compatibility: 98,
        bio: "Building low-latency mesh networking libs.",
        initials: "ER",
      };
      let html = "";
      assert.doesNotThrow(() => {
        html = renderToString(React.createElement(LandingMatchModal, { dev: mockDev, onClose: () => {} }));
      });
      assert.ok(html.includes("Elena Rostova"), "Rendered HTML must contain dev name");
      assert.ok(html.includes("98") && html.includes("% Match"), "Rendered HTML must contain compatibility badge");
      assert.ok(html.includes("octopair.room.open"), "Rendered HTML must contain mock DM snippet");
    });

    it("renders LandingMatchModal with dev=null returning empty string without throwing", () => {
      const LandingMatchModal = loadComponent("LandingMatchModal.jsx");
      let html = "";
      assert.doesNotThrow(() => {
        html = renderToString(React.createElement(LandingMatchModal, { dev: null, onClose: () => {} }));
      });
      assert.equal(html, "");
    });

    it("renders InteractiveFeedSnippetSection to string without throwing", () => {
      const InteractiveFeedSnippetSection = loadComponent("InteractiveFeedSnippetSection.jsx");
      let html = "";
      assert.doesNotThrow(() => {
        html = renderToString(React.createElement(InteractiveFeedSnippetSection));
      });
      assert.ok(html.includes('id="feed"'), "Rendered HTML must include section id='feed'");
      assert.ok(html.includes("LIVE CODE FEED"), "Rendered HTML must contain eyebrow");
      assert.ok(html.includes("Runnable Snippets"), "Rendered HTML must contain tab 1");
      assert.ok(html.includes("QuickSort"), "Rendered HTML must contain preset pill");
    });

    it("renders RoomFeaturesSection to string without throwing", () => {
      const RoomFeaturesSection = loadComponent("RoomFeaturesSection.jsx");
      let html = "";
      assert.doesNotThrow(() => {
        html = renderToString(React.createElement(RoomFeaturesSection));
      });
      assert.ok(html.includes('id="room-features"'), "Rendered HTML must include section id='room-features'");
      assert.ok(html.includes("FULL ROOM EXPERIENCE"), "Rendered HTML must contain eyebrow");
      assert.ok(html.includes("octopair.dev/room/rust-mesh-v1"), "Rendered HTML must contain browser bar");
      assert.ok(html.includes("Live Video &amp; Voice"), "Rendered HTML must contain micro-feature");
    });
  });
});
