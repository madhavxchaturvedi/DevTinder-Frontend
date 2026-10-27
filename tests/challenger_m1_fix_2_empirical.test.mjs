import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT_DIR = process.cwd().endsWith("Frontend")
  ? path.resolve(process.cwd(), "..")
  : process.cwd();
const FRONTEND_DIR = path.join(ROOT_DIR, "Frontend");
const LANDING_DIR = path.join(FRONTEND_DIR, "src/components/landing");

const COMPONENT_FILES = {
  matching: path.join(LANDING_DIR, "DeveloperMatchingSection.jsx"),
  modal: path.join(LANDING_DIR, "LandingMatchModal.jsx"),
  feed: path.join(LANDING_DIR, "InteractiveFeedSnippetSection.jsx"),
  room: path.join(LANDING_DIR, "RoomFeaturesSection.jsx"),
  hero: path.join(LANDING_DIR, "HeroSection.jsx"),
};

// Read source files
const sources = {};
for (const [key, filePath] of Object.entries(COMPONENT_FILES)) {
  assert.ok(fs.existsSync(filePath), `File must exist: ${filePath}`);
  sources[key] = fs.readFileSync(filePath, "utf8");
}

test("Empirical Challenger Suite: Milestone 1 Gate Verification", async (t) => {

  await t.test("1. Production Build & Prerender Verification", () => {
    const buildOutput = execSync("npm run build", {
      cwd: FRONTEND_DIR,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });

    assert.ok(buildOutput.includes("built in"), "Build must succeed");
    assert.ok(buildOutput.includes("[prerender] Injected prerendered SSR markup"), "Prerender must succeed");

    const distIndex = path.join(FRONTEND_DIR, "dist/index.html");
    assert.ok(fs.existsSync(distIndex), "dist/index.html must exist");
    const htmlContent = fs.readFileSync(distIndex, "utf8");

    // Verify prerendered single <h1> in dist/index.html
    const h1Matches = htmlContent.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
    assert.equal(h1Matches.length, 1, `dist/index.html must contain exactly one <h1>, found ${h1Matches.length}`);
    assert.ok(h1Matches[0].includes("Pick a project. Pair up. Build it live."));
  });

  await t.test("2. Bundle & Chunk Isolation: Zero Monaco or Sandpack in Landing", () => {
    const distIndex = path.join(FRONTEND_DIR, "dist/index.html");
    const htmlContent = fs.readFileSync(distIndex, "utf8");

    // Extract all scripts and modulepreloads in dist/index.html
    const scriptSrcMatches = [...htmlContent.matchAll(/src="([^"]+)"/g)].map(m => m[1]);
    const linkHrefMatches = [...htmlContent.matchAll(/<link rel="modulepreload"[^>]*href="([^"]+)"/g)].map(m => m[1]);

    const initialLoadedAssets = [...scriptSrcMatches, ...linkHrefMatches];

    // Assert neither vendor-monaco nor vendor-sandpack is loaded on landing page
    for (const asset of initialLoadedAssets) {
      assert.ok(!asset.includes("vendor-monaco"), `Landing page must not preload vendor-monaco chunk: ${asset}`);
      assert.ok(!asset.includes("vendor-sandpack"), `Landing page must not preload vendor-sandpack chunk: ${asset}`);
    }

    // Inspect the entry chunk content directly
    const entryScript = scriptSrcMatches.find(src => src.includes("/assets/index-"));
    assert.ok(entryScript, "Entry script must be found in dist/index.html");

    const entryScriptPath = path.join(FRONTEND_DIR, "dist", entryScript.replace(/^\//, ""));
    assert.ok(fs.existsSync(entryScriptPath), `Entry script file must exist: ${entryScriptPath}`);
    const entryJs = fs.readFileSync(entryScriptPath, "utf8");

    // Verify no static imports of monaco or sandpack in the entry chunk
    // (Only dynamic code-splitting map entries allowed)
    const codeWithoutDynamicMap = entryJs.replace(/const __vite__mapDeps=[\s\S]*?;\n?/, "");
    assert.ok(!codeWithoutDynamicMap.includes("@codesandbox"), "Entry chunk must not contain @codesandbox outside lazy map");
    assert.ok(!codeWithoutDynamicMap.includes("@monaco-editor"), "Entry chunk must not contain @monaco-editor outside lazy map");

    // Also verify all 4 M1 source files have zero imports of monaco or sandpack
    for (const [name, code] of Object.entries(sources)) {
      assert.ok(!code.includes("monaco"), `${name} must not import monaco`);
      assert.ok(!code.includes("sandpack"), `${name} must not import sandpack`);
    }
  });

  await t.test("3. Strict Invariant 1: Zero Redux", () => {
    for (const [name, code] of Object.entries(sources)) {
      assert.ok(!code.includes("react-redux"), `${name} must not import react-redux`);
      assert.ok(!code.includes("@reduxjs/toolkit"), `${name} must not import @reduxjs/toolkit`);
      assert.ok(!code.includes("useSelector"), `${name} must not use useSelector`);
      assert.ok(!code.includes("useDispatch"), `${name} must not use useDispatch`);
      assert.ok(!code.includes("useStore"), `${name} must not use useStore`);
    }
  });

  await t.test("4. Strict Invariant 2: Zero Unicode Emojis", () => {
    const emojiRegex = /[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]/gu;
    for (const [name, code] of Object.entries(sources)) {
      const matches = code.match(emojiRegex);
      assert.equal(matches, null, `${name} must not contain Unicode emojis, found: ${matches}`);
    }
  });

  await t.test("5. Strict Invariant 3: Zero Forbidden Routes", () => {
    const forbidden = ['"/discover"', "'/discover'", '"/sandbox"', "'/sandbox'", '"/profile/', "'/profile/"];
    for (const [name, code] of Object.entries(sources)) {
      for (const f of forbidden) {
        assert.ok(!code.includes(f), `${name} must not reference forbidden route: ${f}`);
      }
    }
  });

  await t.test("6. Strict Invariant 4: All CTAs Route Strictly to /login?mode=signup", () => {
    // Check all Link components in the 4 M1 components
    for (const [name, code] of Object.entries(sources)) {
      const linkToMatches = [...code.matchAll(/<Link\s+[^>]*to=(["'][^"']+["'])/g)].map(m => m[1]);
      for (const to of linkToMatches) {
        assert.equal(to, '"/login?mode=signup"', `${name} <Link> to must be "/login?mode=signup", found ${to}`);
      }
    }
  });

  await t.test("7. Strict Invariant 5: Exactly One <h1> in HeroSection and None in M1 Components", () => {
    const heroH1Count = (sources.hero.match(/<h1[^>]*>/gi) || []).length;
    assert.equal(heroH1Count, 1, `HeroSection must have exactly one <h1>, found ${heroH1Count}`);

    const m1Components = ["matching", "modal", "feed", "room"];
    for (const key of m1Components) {
      const h1Count = (sources[key].match(/<h1[^>]*>/gi) || []).length;
      assert.equal(h1Count, 0, `${key} must have exactly zero <h1>, found ${h1Count}`);
    }
  });

  await t.test("8. Strict Invariant 6: Zero eval() or new Function()", () => {
    for (const [name, code] of Object.entries(sources)) {
      assert.ok(!code.includes(" eval("), `${name} must not call eval()`);
      assert.ok(!code.includes("eval`"), `${name} must not use eval tag`);
      assert.ok(!code.includes("new Function("), `${name} must not call new Function()`);
    }
  });

  await t.test("9. Strict Invariant 7: Zero Hardware Media APIs", () => {
    const hardwareKeywords = [
      "getUserMedia",
      "RTCPeerConnection",
      "mediaDevices",
      "MediaRecorder",
      "AudioContext",
      "webkitAudioContext"
    ];
    for (const [name, code] of Object.entries(sources)) {
      for (const kw of hardwareKeywords) {
        assert.ok(!code.includes(kw), `${name} must not use hardware media API keyword: ${kw}`);
      }
    }
  });

  await t.test("10. Worker M1 Fix Integrity: SSR Neutral Fallback in runInSandbox", () => {
    const feedSrc = sources.feed;
    // SSR guard must return neutral { lines: [], time: 0 } and not synthetic quicksort
    assert.ok(feedSrc.includes('resolve({ lines: [], time: 0 });'), "Must resolve neutral empty payload in SSR");
    assert.ok(!feedSrc.includes('resolve({ lines: ["1, 1, 2, 3, 6, 8, 10"], time: 8 });'), "Must NOT contain hardcoded quicksort in SSR fallback");
  });

  await t.test("11. Concurrency Hardening: Preset Button Disabling & Handler Guard", () => {
    const feedSrc = sources.feed;
    assert.ok(feedSrc.includes("disabled={isRunning}"), "Preset buttons must be disabled when isRunning is true");
    assert.ok(feedSrc.includes("if (isRunning) return;"), "handleSelectPreset must guard against active execution");
  });

  await t.test("12. Sandbox Message Validation: e.source Check", () => {
    const feedSrc = sources.feed;
    assert.ok(
      feedSrc.includes("if (e.source !== iframe.contentWindow) return;"),
      "Message listener must verify e.source === iframe.contentWindow"
    );
  });

  await t.test("13. Feed Tablist WAI-ARIA Semantics", () => {
    const feedSrc = sources.feed;
    assert.ok(feedSrc.includes('role="tablist"'), "Tab container must have role='tablist'");
    assert.ok(feedSrc.includes('role="tab"'), "Tab buttons must have role='tab'");
    assert.ok(feedSrc.includes('role="tabpanel"'), "Tab contents must have role='tabpanel'");
    assert.ok(feedSrc.includes('aria-selected='), "Tab buttons must have aria-selected attribute");
  });

  await t.test("14. LandingMatchModal Focus Trap, Initial Focus, Scroll Lock & Detached Element Safety", () => {
    const modalSrc = sources.modal;
    assert.ok(modalSrc.includes('e.key === "Tab"'), "Modal must intercept Tab key");
    assert.ok(modalSrc.includes("e.shiftKey"), "Modal must handle Shift+Tab wrapping");
    assert.ok(modalSrc.includes("document.body.style.overflow = \"hidden\""), "Modal must lock body scroll");
    assert.ok(modalSrc.includes("document.body.style.overflow = originalOverflow"), "Modal must restore original scroll");
    assert.ok(modalSrc.includes("closeButtonRef.current.focus()"), "Modal must place initial focus on close button");
    assert.ok(modalSrc.includes("document.body.contains(previousActiveElement)"), "Modal must check if previous element remains in DOM");
    assert.ok(modalSrc.includes('(dev.skills || []).map'), "dev.skills must be defensively mapped");
    assert.ok(modalSrc.includes("if (!dev) return null;"), "dev null check must be present");
  });

  await t.test("15. Section Anchors for Seamless Landing Navigation", () => {
    assert.ok(sources.matching.includes('id="matching"'), "DeveloperMatchingSection must have id='matching'");
    assert.ok(sources.feed.includes('id="feed"'), "InteractiveFeedSnippetSection must have id='feed'");
    assert.ok(sources.room.includes('id="room-features"'), "RoomFeaturesSection must have id='room-features'");
  });

  await t.test("16. Holistic Verification Script Exit Code 0 & Breakdown", () => {
    const output = execSync("node .agents/teamwork/explorer_m1_fix_3/holistic_verification.mjs", {
      cwd: path.resolve(FRONTEND_DIR, ".."),
      encoding: "utf8",
    });

    assert.ok(output.includes("Invariant 1: Zero Redux imports across all 4 components"));
    assert.ok(output.includes("PASS: Invariant 1"));
    assert.ok(output.includes("PASS: Invariant 2"));
    assert.ok(output.includes("PASS: Invariant 3"));
    assert.ok(output.includes("PASS: Invariant 4"));
    assert.ok(output.includes("PASS: Invariant 5"));
    assert.ok(output.includes("PASS: Invariant 6"));
    assert.ok(output.includes("PASS: Invariant 7a"));
    assert.ok(output.includes("PASS: Invariant 7b"));
    assert.ok(output.includes("PASS: Invariant 7c"));
    assert.ok(output.includes("PASS: Finding 1 (Critical)"));
    assert.ok(output.includes("PASS: Finding 2a (Critical)"));
    assert.ok(output.includes("PASS: Finding 2b (Critical)"));
    assert.ok(output.includes("PASS: Finding 2c (Critical)"));
    assert.ok(output.includes("PASS: Finding 3 (Major)"));
    assert.ok(output.includes("PASS: Finding 4 (Minor)"));
    assert.ok(output.includes("PASS: Finding 5 (Minor)"));
    assert.ok(output.includes("PASS: Contract 1"));
    assert.ok(output.includes("PASS: Contract 2"));
    assert.ok(output.includes("PASS: Contract 3"));
    assert.ok(output.includes("PASS: Contract 4"));
  });
});
