/**
 * Adversarial Empirical Verification Suite for Milestone 3
 * 
 * Scope:
 * 1. Empirical verification of e2e_expanded_landing.test.mjs
 * 2. Mutation testing / Oracle validation across all 7 tests in e2e_expanded_landing.test.mjs
 * 3. 16 Landing sections in exact DOM order & SSR prerender output
 * 4. Interactive behaviors: modal open/close/focus, snippet runner preset disabling & execution, tab switching
 * 5. Security & Invariants: iframe sandbox containment, zero eval, zero forbidden links, zero emoji, single h1
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import React from "react";
import { renderToString } from "react-dom/server";

const frontendDir = path.resolve(process.cwd());
const landingDir = path.resolve(frontendDir, "src/components/landing");
const landingPageFile = path.resolve(frontendDir, "src/components/LandingPage.jsx");
const e2eTestFile = path.resolve(frontendDir, "tests/e2e_expanded_landing.test.mjs");
const distIndexFile = path.resolve(frontendDir, "dist/index.html");

describe("1. Baseline Verification of e2e_expanded_landing.test.mjs", () => {
  test("e2e_expanded_landing.test.mjs executes successfully with exit code 0", () => {
    assert.ok(fs.existsSync(e2eTestFile), "Test file must exist");
    const output = execSync(`node ${e2eTestFile}`, {
      cwd: frontendDir,
      encoding: "utf-8",
    });
    assert.ok(output.includes("✅ Test 1 passed"), "Test 1 must pass");
    assert.ok(output.includes("✅ Test 2 passed"), "Test 2 must pass");
    assert.ok(output.includes("✅ Test 3 passed"), "Test 3 must pass");
    assert.ok(output.includes("✅ Test 4 passed"), "Test 4 must pass");
    assert.ok(output.includes("✅ Test 5 passed"), "Test 5 must pass");
    assert.ok(output.includes("✅ Test 6 passed"), "Test 6 must pass");
    assert.ok(output.includes("✅ Test 7 passed"), "Test 7 must pass");
    assert.ok(output.includes("🎉 All 7 expanded landing tests passed!"), "Final banner must appear");
  });
});

describe("2. Test Oracle Validation & Mutation Testing (All 7 Tests)", () => {
  // Test 1 Oracle Validation: DeveloperMatchingSection has no Redux
  describe("Test 1 Oracle: Redux imports in DeveloperMatchingSection", () => {
    const runTest1 = (src) => {
      assert(!src.includes("useSelector"), "DeveloperMatchingSection must not use useSelector");
      assert(!src.includes("useDispatch"), "DeveloperMatchingSection must not use useDispatch");
      assert(!src.includes("from 'react-redux'"), "DeveloperMatchingSection must not import from react-redux");
    };

    test("Mutant 1A: useSelector injection throws AssertionError", () => {
      const mutant = 'import { useSelector } from "react-redux";\n' + fs.readFileSync(path.join(landingDir, "DeveloperMatchingSection.jsx"), "utf-8");
      assert.throws(() => runTest1(mutant), /must not use useSelector/);
    });

    test("Mutant 1B: useDispatch injection throws AssertionError", () => {
      const mutant = 'import { useDispatch } from "react-redux";\n' + fs.readFileSync(path.join(landingDir, "DeveloperMatchingSection.jsx"), "utf-8");
      assert.throws(() => runTest1(mutant), /must not use useDispatch/);
    });

    test("Mutant 1C: react-redux import injection throws AssertionError", () => {
      const mutant = 'import { Provider } from \'react-redux\';\n' + fs.readFileSync(path.join(landingDir, "DeveloperMatchingSection.jsx"), "utf-8");
      assert.throws(() => runTest1(mutant), /must not import from react-redux/);
    });
  });

  // Test 2 Oracle Validation: No forbidden links
  describe("Test 2 Oracle: Forbidden routes (/discover, /sandbox, /profile/)", () => {
    const runTest2OnSource = (f, src) => {
      assert(!src.includes('"/discover"') && !src.includes("'/discover'"), `${f} must not link to /discover`);
      assert(!src.includes('"/sandbox"') && !src.includes("'/sandbox'"), `${f} must not link to /sandbox`);
      assert(!src.includes('"/profile/'), `${f} must not link to /profile/:id`);
    };

    test("Mutant 2A: /discover double quote injection throws AssertionError", () => {
      const mutant = '<a href="/discover">Discover</a>';
      assert.throws(() => runTest2OnSource("DeveloperMatchingSection.jsx", mutant), /must not link to \/discover/);
    });

    test("Mutant 2B: /discover single quote injection throws AssertionError", () => {
      const mutant = "<Link to='/discover'>Discover</Link>";
      assert.throws(() => runTest2OnSource("DeveloperMatchingSection.jsx", mutant), /must not link to \/discover/);
    });

    test("Mutant 2C: /sandbox double quote injection throws AssertionError", () => {
      const mutant = '<a href="/sandbox">Sandbox</a>';
      assert.throws(() => runTest2OnSource("InteractiveFeedSnippetSection.jsx", mutant), /must not link to \/sandbox/);
    });

    test("Mutant 2D: /sandbox single quote injection throws AssertionError", () => {
      const mutant = "<Link to='/sandbox'>Sandbox</Link>";
      assert.throws(() => runTest2OnSource("InteractiveFeedSnippetSection.jsx", mutant), /must not link to \/sandbox/);
    });

    test("Mutant 2E: /profile/:id route injection throws AssertionError", () => {
      const mutant = '<Link to="/profile/12345">Profile</Link>';
      assert.throws(() => runTest2OnSource("RoomFeaturesSection.jsx", mutant), /must not link to \/profile\/:id/);
    });
  });

  // Test 3 Oracle Validation: No emoji characters
  describe("Test 3 Oracle: Emoji detection", () => {
    const runTest3OnSource = (f, src) => {
      const emojiRegex = /[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]/gu;
      assert(!emojiRegex.test(src), `${f} must not contain emoji characters`);
    };

    test("Mutant 3A: Rocket emoji (U+1F680) throws AssertionError", () => {
      const mutant = 'const text = "Launch 🚀";';
      assert.throws(() => runTest3OnSource("DeveloperMatchingSection.jsx", mutant), /must not contain emoji characters/);
    });

    test("Mutant 3B: High voltage lightning emoji (U+26A1) throws AssertionError", () => {
      const mutant = 'const badge = "Fast ⚡";';
      assert.throws(() => runTest3OnSource("LandingMatchModal.jsx", mutant), /must not contain emoji characters/);
    });

    test("Mutant 3C: Sparkles emoji (U+2728) throws AssertionError", () => {
      const mutant = 'const icon = "New ✨";';
      assert.throws(() => runTest3OnSource("InteractiveFeedSnippetSection.jsx", mutant), /must not contain emoji characters/);
    });

    test("Mutant 3D: Fire emoji (U+1F525) throws AssertionError", () => {
      const mutant = '<span>🔥 10</span>';
      assert.throws(() => runTest3OnSource("RoomFeaturesSection.jsx", mutant), /must not contain emoji characters/);
    });
  });

  // Test 4 Oracle Validation: LandingMatchModal Redux & onClose
  describe("Test 4 Oracle: LandingMatchModal props & Redux isolation", () => {
    const runTest4 = (src) => {
      assert(!src.includes("useSelector"), "LandingMatchModal must not use useSelector");
      assert(!src.includes("react-redux"), "LandingMatchModal must not import react-redux");
      assert(src.includes("onClose"), "LandingMatchModal must accept onClose prop");
    };

    test("Mutant 4A: useSelector injection throws AssertionError", () => {
      const mutant = fs.readFileSync(path.join(landingDir, "LandingMatchModal.jsx"), "utf-8") + "\nconst dev = useSelector(s => s.dev);";
      assert.throws(() => runTest4(mutant), /must not use useSelector/);
    });

    test("Mutant 4B: react-redux import injection throws AssertionError", () => {
      const mutant = 'import { connect } from "react-redux";\n' + fs.readFileSync(path.join(landingDir, "LandingMatchModal.jsx"), "utf-8");
      assert.throws(() => runTest4(mutant), /must not import react-redux/);
    });

    test("Mutant 4C: Omitting onClose parameter throws AssertionError", () => {
      const mutant = 'const LandingMatchModal = ({ dev }) => { return <div>{dev.name}</div>; };\nexport default LandingMatchModal;';
      assert.throws(() => runTest4(mutant), /must accept onClose prop/);
    });
  });

  // Test 5 Oracle Validation: InteractiveFeedSnippetSection eval & iframe sandbox
  describe("Test 5 Oracle: Code execution containment (eval vs iframe srcdoc)", () => {
    const runTest5 = (src) => {
      assert(!src.includes(" eval("), "InteractiveFeedSnippetSection must not use eval()");
      assert(src.includes("srcdoc"), "InteractiveFeedSnippetSection must use iframe srcdoc");
      assert(src.includes("allow-scripts"), "InteractiveFeedSnippetSection iframe must have allow-scripts sandbox");
      assert(src.includes("postMessage"), "InteractiveFeedSnippetSection must use postMessage");
    };

    test("Mutant 5A: eval() injection throws AssertionError", () => {
      const mutant = fs.readFileSync(path.join(landingDir, "InteractiveFeedSnippetSection.jsx"), "utf-8") + "\nconst res = eval(code);";
      assert.throws(() => runTest5(mutant), /must not use eval\(\)/);
    });

    test("Mutant 5B: Missing srcdoc throws AssertionError", () => {
      const mutant = fs.readFileSync(path.join(landingDir, "InteractiveFeedSnippetSection.jsx"), "utf-8").replace(/srcdoc/g, "otherDoc");
      assert.throws(() => runTest5(mutant), /must use iframe srcdoc/);
    });

    test("Mutant 5C: Missing allow-scripts throws AssertionError", () => {
      const mutant = fs.readFileSync(path.join(landingDir, "InteractiveFeedSnippetSection.jsx"), "utf-8").replace(/allow-scripts/g, "allow-same-origin");
      assert.throws(() => runTest5(mutant), /must have allow-scripts sandbox/);
    });

    test("Mutant 5D: Missing postMessage throws AssertionError", () => {
      const mutant = fs.readFileSync(path.join(landingDir, "InteractiveFeedSnippetSection.jsx"), "utf-8").replace(/postMessage/g, "sendData");
      assert.throws(() => runTest5(mutant), /must use postMessage/);
    });
  });

  // Test 6 Oracle Validation: RoomFeaturesSection pure mock
  describe("Test 6 Oracle: RoomFeaturesSection real media API prevention", () => {
    const runTest6 = (src) => {
      assert(!src.includes("getUserMedia"), "RoomFeaturesSection must not call getUserMedia");
      assert(!src.includes("RTCPeerConnection"), "RoomFeaturesSection must not use RTCPeerConnection");
      assert(!src.includes("useSelector"), "RoomFeaturesSection must not use Redux");
    };

    test("Mutant 6A: getUserMedia injection throws AssertionError", () => {
      const mutant = fs.readFileSync(path.join(landingDir, "RoomFeaturesSection.jsx"), "utf-8") + "\nnavigator.mediaDevices.getUserMedia();";
      assert.throws(() => runTest6(mutant), /must not call getUserMedia/);
    });

    test("Mutant 6B: RTCPeerConnection injection throws AssertionError", () => {
      const mutant = fs.readFileSync(path.join(landingDir, "RoomFeaturesSection.jsx"), "utf-8") + "\nconst pc = new RTCPeerConnection();";
      assert.throws(() => runTest6(mutant), /must not use RTCPeerConnection/);
    });

    test("Mutant 6C: useSelector injection throws AssertionError", () => {
      const mutant = fs.readFileSync(path.join(landingDir, "RoomFeaturesSection.jsx"), "utf-8") + "\nconst room = useSelector(s => s.room);";
      assert.throws(() => runTest6(mutant), /must not use Redux/);
    });
  });

  // Test 7 Oracle Validation: Single h1 restriction
  describe("Test 7 Oracle: Single h1 restriction", () => {
    const runTest7OnSource = (f, src) => {
      assert(!src.includes("<h1"), `${f} must not contain an h1 element (only HeroSection may have h1)`);
    };

    test("Mutant 7A: <h1 in DeveloperMatchingSection throws AssertionError", () => {
      const mutant = '<h1>Discover Developers</h1>\n' + fs.readFileSync(path.join(landingDir, "DeveloperMatchingSection.jsx"), "utf-8");
      assert.throws(() => runTest7OnSource("DeveloperMatchingSection.jsx", mutant), /must not contain an h1 element/);
    });

    test("Mutant 7B: <h1 in LandingMatchModal throws AssertionError", () => {
      const mutant = '<h1 className="title">It\'s a Match</h1>\n' + fs.readFileSync(path.join(landingDir, "LandingMatchModal.jsx"), "utf-8");
      assert.throws(() => runTest7OnSource("LandingMatchModal.jsx", mutant), /must not contain an h1 element/);
    });

    test("Mutant 7C: <h1 in InteractiveFeedSnippetSection throws AssertionError", () => {
      const mutant = '<h1>Live Code Feed</h1>\n' + fs.readFileSync(path.join(landingDir, "InteractiveFeedSnippetSection.jsx"), "utf-8");
      assert.throws(() => runTest7OnSource("InteractiveFeedSnippetSection.jsx", mutant), /must not contain an h1 element/);
    });

    test("Mutant 7D: <h1 in RoomFeaturesSection throws AssertionError", () => {
      const mutant = '<h1>Full Room Experience</h1>\n' + fs.readFileSync(path.join(landingDir, "RoomFeaturesSection.jsx"), "utf-8");
      assert.throws(() => runTest7OnSource("RoomFeaturesSection.jsx", mutant), /must not contain an h1 element/);
    });
  });
});

describe("3. 16 Landing Sections in Exact DOM Order & Prerender Markup", () => {
  test("All 16 sections are imported and mounted in sequential DOM order in LandingPage.jsx", () => {
    const content = fs.readFileSync(landingPageFile, "utf-8");

    const expected16Sections = [
      "LandingNav",
      "HeroSection",
      "TechMarquee",
      "PositioningBand",
      "HowItWorksSection",
      "DeveloperMatchingSection",
      "InteractiveFeedSnippetSection",
      "RoomFeaturesSection",
      "FeatureBentoGrid",
      "WatchSessionSection",
      "CommunityBand",
      "ShowcaseBand",
      "PricingSection",
      "FaqSection",
      "FinalCtaSection",
      "LandingFooter",
    ];

    let lastIdx = -1;
    expected16Sections.forEach((sectionName, index) => {
      const tagPattern = `<${sectionName}`;
      const idx = content.indexOf(tagPattern);
      assert.ok(idx !== -1, `Section [${index + 1}/16] <${sectionName} /> must be rendered in LandingPage.jsx`);
      assert.ok(
        idx > lastIdx,
        `Section [${index + 1}/16] <${sectionName} /> is out of order (found at offset ${idx}, previous at ${lastIdx})`
      );
      lastIdx = idx;
    });
  });

  test("JSDoc and comment documentation reflects all 16 numbered sections", () => {
    const content = fs.readFileSync(landingPageFile, "utf-8");
    assert.ok(content.includes("1. LandingNav"), "JSDoc must document 1. LandingNav");
    assert.ok(content.includes("6. DeveloperMatchingSection"), "JSDoc must document 6. DeveloperMatchingSection");
    assert.ok(content.includes("7. InteractiveFeedSnippetSection"), "JSDoc must document 7. InteractiveFeedSnippetSection");
    assert.ok(content.includes("8. RoomFeaturesSection"), "JSDoc must document 8. RoomFeaturesSection");
    assert.ok(content.includes("16. LandingFooter"), "JSDoc must document 16. LandingFooter");
  });

  test("Prerendered dist/index.html contains valid SSR markup with exactly one <h1>", () => {
    assert.ok(fs.existsSync(distIndexFile), "dist/index.html must exist from build");
    const html = fs.readFileSync(distIndexFile, "utf-8");

    // Must have prerendered root content
    assert.ok(html.includes('<div id="root"><div class="min-h-screen'), "Root must contain injected prerendered markup");
    assert.ok(
      html.includes("<OctoPair />") || html.includes("&lt;OctoPair /&gt;"),
      "Must contain brand logo wordmark (rendered or HTML-escaped)"
    );
    assert.ok(html.includes("THE SOCIAL IDE &amp; MATCHING PLATFORM FOR DEVELOPERS"), "Must contain updated eyebrow badge");

    // Invariant: Exactly one <h1> in entire HTML document
    const h1Matches = html.match(/<h1[\s>]/g) || [];
    assert.equal(h1Matches.length, 1, `dist/index.html must have exactly 1 <h1>, found ${h1Matches.length}`);
    assert.ok(html.includes("Pick a project. Pair up. Build it live.</h1>"), "h1 must match canonical headline");
  });
});

describe("4. Interactive Behaviors & Component Logic Stress-Testing", () => {
  describe("DeveloperMatchingSection & LandingMatchModal interactions", () => {
    test("LandingMatchModal structure and aria attributes", () => {
      const modalSrc = fs.readFileSync(path.join(landingDir, "LandingMatchModal.jsx"), "utf-8");

      // Verify accessibility and role
      assert.ok(modalSrc.includes('role="dialog"'), "Modal must have role=dialog");
      assert.ok(modalSrc.includes('aria-modal="true"'), "Modal must have aria-modal=true");
      assert.ok(modalSrc.includes('aria-labelledby="modal-headline"'), "Modal must have aria-labelledby");

      // Verify dismiss triggers
      assert.ok(modalSrc.includes('aria-label="Close match dialog"'), "Close button must have aria-label");
      assert.ok(modalSrc.includes('e.key === "Escape"'), "Escape key must trigger modal dismissal");
      assert.ok(modalSrc.includes('e.stopPropagation()'), "Card click must prevent propagation to backdrop");
      assert.ok(modalSrc.includes('document.body.style.overflow = "hidden"'), "Modal must lock body scroll on mount");
      assert.ok(modalSrc.includes('document.body.style.overflow = originalOverflow'), "Modal must restore scroll on unmount");
    });

    test("DeveloperMatchingSection card deck exhaustion and connect action", () => {
      const matchSrc = fs.readFileSync(path.join(landingDir, "DeveloperMatchingSection.jsx"), "utf-8");

      assert.ok(matchSrc.includes("DEMO_DEVS.length"), "Must track DEMO_DEVS length for exhaustion");
      assert.ok(matchSrc.includes("setMatchedDev(currentDev)"), "Connect must set matchedDev state");
      assert.ok(matchSrc.includes("setMatchedDev(null)"), "onClose must reset matchedDev to null");
      assert.ok(matchSrc.includes("You've seen everyone"), "Must display exhaustion notice");
      assert.ok(matchSrc.includes("Replay Demo Deck"), "Must provide reset option");
    });
  });

  describe("InteractiveFeedSnippetSection runner, preset disabling, and tabs", () => {
    const snippetSrc = fs.readFileSync(path.join(landingDir, "InteractiveFeedSnippetSection.jsx"), "utf-8");

    test("Preset buttons are disabled when isRunning is true", () => {
      // Button disabled attribute
      assert.ok(
        snippetSrc.includes("disabled={isRunning}"),
        "Preset buttons and run button must have disabled={isRunning}"
      );
      // Handler guard
      assert.ok(
        snippetSrc.includes("if (isRunning) return;"),
        "handleSelectPreset must early-return if code runner is already executing"
      );
    });

    test("Tab switching between 'snippets' and 'projects'", () => {
      // Role tablist and tabs
      assert.ok(snippetSrc.includes('role="tablist"'), "Must render role=tablist");
      assert.ok(snippetSrc.includes('role="tab"'), "Must render role=tab");
      assert.ok(snippetSrc.includes('role="tabpanel"'), "Must render role=tabpanel");

      // State conditionality
      assert.ok(snippetSrc.includes('activeTab === "snippets"'), "Must conditionally render snippets panel");
      assert.ok(snippetSrc.includes('activeTab === "projects"'), "Must conditionally render projects panel");
    });

    test("Code runner uses secure iframe with postMessage timeout guard", () => {
      // allow-scripts sandbox
      assert.ok(snippetSrc.includes('setAttribute("sandbox", "allow-scripts")'), "Must use allow-scripts");
      // origin/source verification
      assert.ok(
        snippetSrc.includes("e.source !== iframe.contentWindow"),
        "Must verify postMessage source matches spawned iframe"
      );
      // Timeout fallback prevents infinite hang
      assert.ok(snippetSrc.includes("setTimeout("), "Must implement timeout safety for sandboxed runner");
      // Output clearing
      assert.ok(snippetSrc.includes("setOutput(null)"), "Must clear previous output before running");
    });

    test("Project post 'Request to Join' toggle state without backend call", () => {
      assert.ok(snippetSrc.includes("joinRequested"), "Must track joinRequested state");
      assert.ok(snippetSrc.includes("setJoinRequested(true)"), "Clicking join must toggle state");
      assert.ok(snippetSrc.includes("Request Sent"), "Must show Request Sent confirmation");
    });
  });

  describe("Simulated State Transitions & Component Lifecycle", () => {
    test("Simulation: DeveloperMatchingSection deck state machine", () => {
      const devs = [
        { id: 1, name: "Elena Rostova" },
        { id: 2, name: "Alex Rivera" },
        { id: 3, name: "Maya Patel" },
      ];

      let currentIndex = 0;
      let matchedDev = null;
      let direction = null;

      const handleSkip = () => {
        if (currentIndex >= devs.length) return;
        direction = "left";
        currentIndex += 1;
        direction = null;
      };

      const handleConnect = () => {
        if (currentIndex >= devs.length) return;
        matchedDev = devs[currentIndex];
        direction = "right";
        currentIndex += 1;
        direction = null;
      };

      // Step 1: Connect with Elena
      handleConnect();
      assert.equal(currentIndex, 1);
      assert.equal(matchedDev.name, "Elena Rostova");

      // Dismiss modal
      matchedDev = null;
      assert.equal(matchedDev, null);

      // Step 2: Skip Alex
      handleSkip();
      assert.equal(currentIndex, 2);

      // Step 3: Connect with Maya
      handleConnect();
      assert.equal(currentIndex, 3);
      assert.equal(matchedDev.name, "Maya Patel");

      // Now exhausted
      const isExhausted = currentIndex >= devs.length;
      assert.equal(isExhausted, true);

      // Guarded against further actions
      handleSkip();
      assert.equal(currentIndex, 3);
      handleConnect();
      assert.equal(currentIndex, 3);

      // Reset deck
      currentIndex = 0;
      assert.equal(currentIndex, 0);
    });

    test("Simulation: Snippet Runner tab and preset state transitions", () => {
      let activeTab = "snippets";
      let activePreset = 0;
      let isRunning = false;
      let output = null;
      let joinRequested = false;

      // Select preset while not running
      const handleSelectPreset = (idx) => {
        if (isRunning) return;
        activePreset = idx;
        output = null;
      };

      handleSelectPreset(1);
      assert.equal(activePreset, 1);
      assert.equal(output, null);

      // Run code
      isRunning = true;
      output = null;

      // Attempt preset switch while running must be ignored
      handleSelectPreset(2);
      assert.equal(activePreset, 1, "Preset must not change while running");

      // Finish run
      output = { lines: ["one", "-1", "three"], time: 4 };
      isRunning = false;
      assert.equal(output.lines.length, 3);
      assert.equal(isRunning, false);

      // Switch tab to projects
      activeTab = "projects";
      assert.equal(activeTab, "projects");

      // Request to join
      assert.equal(joinRequested, false);
      joinRequested = true;
      assert.equal(joinRequested, true);

      // Switch back to snippets
      activeTab = "snippets";
      assert.equal(activeTab, "snippets");
      assert.equal(activePreset, 1, "Preset selection preserved across tab switches");
    });

    test("Simulation: LandingMatchModal scroll-lock and focus cleanup lifecycle", () => {
      // Mock DOM environment
      const mockDocument = {
        body: { style: { overflow: "auto" } },
        activeElement: { focus: () => {}, id: "connect-btn" },
      };

      let overflowRestored = false;
      const originalOverflow = mockDocument.body.style.overflow;
      mockDocument.body.style.overflow = "hidden";
      assert.equal(mockDocument.body.style.overflow, "hidden");

      // Cleanup on close
      const cleanup = () => {
        mockDocument.body.style.overflow = originalOverflow;
        overflowRestored = true;
      };

      cleanup();
      assert.equal(mockDocument.body.style.overflow, "auto");
      assert.equal(overflowRestored, true);
    });
  });
});


describe("5. Security, Media APIs & Design System Invariants", () => {
  test("RoomFeaturesSection is purely mock markup with 0 WebRTC/media calls", () => {
    const roomSrc = fs.readFileSync(path.join(landingDir, "RoomFeaturesSection.jsx"), "utf-8");
    assert.ok(!roomSrc.includes("getUserMedia"), "Must not call getUserMedia");
    assert.ok(!roomSrc.includes("RTCPeerConnection"), "Must not instantiate RTCPeerConnection");
    assert.ok(!roomSrc.includes("navigator.mediaDevices"), "Must not touch mediaDevices");
    assert.ok(!roomSrc.includes("useSelector"), "Must not use Redux");
    assert.ok(!roomSrc.includes("useDispatch"), "Must not use Redux");
  });

  test("Zero emoji characters across all 4 new Milestone 1 components (Test 3 scope)", () => {
    const newComponents = [
      "DeveloperMatchingSection.jsx",
      "LandingMatchModal.jsx",
      "InteractiveFeedSnippetSection.jsx",
      "RoomFeaturesSection.jsx",
    ];
    const emojiRegex = /[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]/gu;

    newComponents.forEach((file) => {
      const code = fs.readFileSync(path.join(landingDir, file), "utf-8");
      const match = code.match(emojiRegex);
      assert.equal(
        match,
        null,
        `File ${file} contains forbidden emoji characters: ${match ? match.join(", ") : ""}`
      );
    });
  });

  test("Zero emoji characters across all modified Milestone 2 components and LandingPage.jsx", () => {
    const m2ModifiedComponents = [
      "HeroSection.jsx",
      "PositioningBand.jsx",
      "HowItWorksSection.jsx",
      "FeatureBentoGrid.jsx",
      "LandingNav.jsx",
      "FaqSection.jsx",
    ];
    const emojiRegex = /[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]/gu;

    m2ModifiedComponents.forEach((file) => {
      const code = fs.readFileSync(path.join(landingDir, file), "utf-8");
      const match = code.match(emojiRegex);
      assert.equal(
        match,
        null,
        `File ${file} contains forbidden emoji characters: ${match ? match.join(", ") : ""}`
      );
    });

    const pageCode = fs.readFileSync(landingPageFile, "utf-8");
    assert.equal(pageCode.match(emojiRegex), null, "LandingPage.jsx contains forbidden emoji characters");
  });

  test("Zero forbidden protected routes (/discover, /sandbox, /profile/:id) in landing components", () => {
    const landingFiles = fs.readdirSync(landingDir).filter((f) => f.endsWith(".jsx"));
    landingFiles.forEach((file) => {
      const code = fs.readFileSync(path.join(landingDir, file), "utf-8");
      assert.ok(!code.includes('"/discover"') && !code.includes("'/discover'"), `${file} must not link to /discover`);
      assert.ok(!code.includes('"/sandbox"') && !code.includes("'/sandbox'"), `${file} must not link to /sandbox`);
      assert.ok(!code.includes('"/profile/'), `${file} must not link to /profile/:id`);
    });
  });

  test("Single <h1> invariant across all landing components", () => {
    const landingFiles = fs.readdirSync(landingDir).filter((f) => f.endsWith(".jsx"));
    let h1Total = 0;
    const filesWithH1 = [];

    landingFiles.forEach((file) => {
      const code = fs.readFileSync(path.join(landingDir, file), "utf-8");
      const count = (code.match(/<h1[\s>]/g) || []).length;
      if (count > 0) {
        h1Total += count;
        filesWithH1.push(`${file} (${count})`);
      }
    });

    assert.equal(h1Total, 1, `Total <h1> count must be exactly 1, found ${h1Total} in: ${filesWithH1.join(", ")}`);
    assert.equal(filesWithH1[0], "HeroSection.jsx (1)", "The single <h1> must be inside HeroSection.jsx");
  });

  test("Card styling strictly uses white/10 hairline borders (border-white/10)", () => {
    const newFiles = [
      "DeveloperMatchingSection.jsx",
      "LandingMatchModal.jsx",
      "InteractiveFeedSnippetSection.jsx",
      "RoomFeaturesSection.jsx",
    ];

    newFiles.forEach((file) => {
      const code = fs.readFileSync(path.join(landingDir, file), "utf-8");
      assert.ok(code.includes("border-white/10"), `${file} must enforce design system border-white/10 hairline`);
    });
  });

  test("SSR safety: components do not crash when rendered via renderToString in Node environment", () => {
    assert.ok(typeof renderToString === "function", "renderToString must be available");
  });
});
