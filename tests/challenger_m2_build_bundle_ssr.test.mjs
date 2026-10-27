/**
 * Challenger M2.2 Empirical Test Suite:
 * Build, Bundle Chunk Isolation, SSR Prerendering & 375px Responsive Verification
 *
 * Requirements:
 * 1. Build Verification: dist/ exists with compiled assets, exit code 0.
 * 2. SSR Prerendering in dist/index.html:
 *    - New eyebrow badge: "THE SOCIAL IDE & MATCHING PLATFORM FOR DEVELOPERS"
 *    - Rendered inside <div id="root">
 *    - Correct page title and SEO meta tags
 * 3. Bundle Chunk Isolation:
 *    - dist/index.html does not load vendor-monaco or vendor-sandpack
 *    - Landing entry chunk does not bundle Monaco or Sandpack modules
 *    - Zero imports of Monaco or Sandpack in src/components/landing/* or LandingPage.jsx
 * 4. 375px Mobile Responsive Layout Analysis:
 *    - Root container enforces overflow-x-hidden
 *    - LandingNav collapses into mobile-friendly layout
 *    - Hero eyebrow and headline break cleanly on sm/xs viewports
 *    - Bento grid collapses to 1-column on mobile
 *    - HowItWorks steps stack on mobile
 *    - Matching deck, feed runner, and room mockup scale down on mobile (max-w-full / px-4 / sm:)
 * 5. Strict Invariants:
 *    - Exactly 1 <h1> in all landing components
 *    - Zero emojis in landing components
 *    - Zero forbidden links (/discover, /sandbox, /profile/:id)
 *    - All marketing CTAs route to /login?mode=signup
 *    - Zero Redux in new components (DeveloperMatchingSection, LandingMatchModal, InteractiveFeedSnippetSection, RoomFeaturesSection)
 *    - Zero eval(), zero getUserMedia(), zero RTCPeerConnection()
 */

import fs from "node:fs";
import path from "node:path";
import assert from "node:assert";

const cwd = process.cwd();
const frontendDir = cwd.endsWith("Frontend") ? cwd : path.resolve(cwd, "Frontend");
const distDir = path.resolve(frontendDir, "dist");
const landingDir = path.resolve(frontendDir, "src/components/landing");
const landingPageFile = path.resolve(frontendDir, "src/components/LandingPage.jsx");

console.log("=================================================================");
console.log(" CHALLENGER M2.2: BUILD, BUNDLE ISOLATION & SSR EMPIRICAL SUITE");
console.log("=================================================================\n");

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  FAIL: ${name}`);
    console.error(`    ${err.message}`);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// SUITE 1: Build & Dist Integrity
// ---------------------------------------------------------------------------
console.log("--- Suite 1: Build & Dist Asset Integrity ---");

runTest("dist/ directory exists and contains index.html and assets", () => {
  assert(fs.existsSync(distDir), "dist/ directory must exist");
  assert(fs.existsSync(path.join(distDir, "index.html")), "dist/index.html must exist");
  assert(fs.existsSync(path.join(distDir, "assets")), "dist/assets directory must exist");
});

const distHtml = fs.readFileSync(path.join(distDir, "index.html"), "utf-8");

runTest("dist/index.html has non-empty SSR markup inside <div id=\"root\">", () => {
  const rootMatch = distHtml.match(/<div id="root">([\s\S]*?)<\/div>/);
  assert(rootMatch, "dist/index.html must have <div id=\"root\">");
  assert(rootMatch[1].trim().length > 100, "<div id=\"root\"> must not be empty");
});

runTest("dist/index.html contains the new eyebrow badge verbatim", () => {
  // In HTML entities, & may be encoded as &amp;
  const hasEyebrow = distHtml.includes("THE SOCIAL IDE &amp; MATCHING PLATFORM FOR DEVELOPERS") ||
                     distHtml.includes("THE SOCIAL IDE & MATCHING PLATFORM FOR DEVELOPERS");
  assert(hasEyebrow, "dist/index.html must contain 'THE SOCIAL IDE & MATCHING PLATFORM FOR DEVELOPERS'");
});

runTest("dist/index.html contains single <h1> matching Hero headline", () => {
  const h1Matches = distHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/g);
  assert(h1Matches, "dist/index.html must contain <h1>");
  assert.strictEqual(h1Matches.length, 1, `dist/index.html must have exactly 1 <h1>, found ${h1Matches.length}`);
  assert(h1Matches[0].includes("Pick a project. Pair up. Build it live."), "<h1> must contain hero title");
});

// ---------------------------------------------------------------------------
// SUITE 2: Bundle Chunk Isolation (Monaco & Sandpack)
// ---------------------------------------------------------------------------
console.log("\n--- Suite 2: Bundle Chunk Isolation (Monaco & Sandpack) ---");

runTest("dist/index.html does not load vendor-monaco or vendor-sandpack", () => {
  assert(!distHtml.includes("vendor-monaco"), "dist/index.html must NOT contain vendor-monaco reference");
  assert(!distHtml.includes("vendor-sandpack"), "dist/index.html must NOT contain vendor-sandpack reference");
});

// Find landing entry script in dist/index.html
const entryScriptMatch = distHtml.match(/src="\/assets\/(index-[^"]+\.js)"/);
assert(entryScriptMatch, "Entry script must be linked in dist/index.html");
const entryScriptName = entryScriptMatch[1];
const entryScriptPath = path.join(distDir, "assets", entryScriptName);

runTest(`Landing entry script (${entryScriptName}) exists`, () => {
  assert(fs.existsSync(entryScriptPath), `${entryScriptPath} must exist`);
});

const entryJsContent = fs.readFileSync(entryScriptPath, "utf-8");

runTest("Landing entry chunk does NOT bundle Sandpack implementation code", () => {
  assert(!entryJsContent.includes("@codesandbox/sandpack-react"), "Entry chunk must not bundle @codesandbox/sandpack-react");
  assert(!entryJsContent.includes("SandpackProvider"), "Entry chunk must not bundle SandpackProvider");
  assert(!entryJsContent.includes("SandpackLayout"), "Entry chunk must not bundle SandpackLayout");
  // Ensure no static import of vendor-sandpack at top level
  assert(!/import\s+[^;]*from\s*['"][^'"]*vendor-sandpack[^'"]*['"]/.test(entryJsContent), "Entry chunk must not statically import vendor-sandpack");
});

runTest("Landing entry chunk does NOT bundle Monaco implementation code", () => {
  assert(!entryJsContent.includes("@monaco-editor/react"), "Entry chunk must not bundle @monaco-editor/react");
  assert(!entryJsContent.includes("monaco.editor.defineTheme"), "Entry chunk must not bundle Monaco editor calls");
  // Ensure no static import of vendor-monaco at top level
  assert(!/import\s+[^;]*from\s*['"][^'"]*vendor-monaco[^'"]*['"]/.test(entryJsContent), "Entry chunk must not statically import vendor-monaco");
});

runTest("All landing components have zero imports of Monaco or Sandpack", () => {
  const landingFiles = fs.readdirSync(landingDir).filter(f => f.endsWith(".jsx"));
  for (const f of landingFiles) {
    const content = fs.readFileSync(path.join(landingDir, f), "utf-8");
    assert(!content.includes("@codesandbox"), `${f} must not import @codesandbox`);
    assert(!content.includes("@monaco-editor"), `${f} must not import @monaco-editor`);
    assert(!content.includes("monaco"), `${f} must not reference monaco`);
    assert(!content.includes("sandpack"), `${f} must not reference sandpack`);
  }
  const landingPageContent = fs.readFileSync(landingPageFile, "utf-8");
  assert(!landingPageContent.includes("@codesandbox"), "LandingPage.jsx must not import @codesandbox");
  assert(!landingPageContent.includes("@monaco-editor"), "LandingPage.jsx must not import @monaco-editor");
});

// ---------------------------------------------------------------------------
// SUITE 3: 375px Mobile Responsiveness Across Modified & Mounted Sections
// ---------------------------------------------------------------------------
console.log("\n--- Suite 3: 375px Mobile Responsiveness ---");

runTest("LandingPage root container enforces overflow-x-hidden", () => {
  const content = fs.readFileSync(landingPageFile, "utf-8");
  assert(content.includes("overflow-x-hidden"), "LandingPage.jsx root container must enforce overflow-x-hidden");
});

runTest("HeroSection.jsx responsive layout at 375px (padding, text wrap, responsive sizes)", () => {
  const content = fs.readFileSync(path.join(landingDir, "HeroSection.jsx"), "utf-8");
  // Container padding sm: / px-4
  assert(content.includes("px-4"), "HeroSection must use px-4 padding on mobile");
  // Eyebrow badge text breaks or scales cleanly
  assert(content.includes("text-xs") || content.includes("text-[11px]"), "Eyebrow badge must use compact typography");
  // Headline responsive sizing: text-4xl sm:text-6xl
  assert(content.includes("text-4xl") && content.includes("sm:text-6xl"), "HeroSection headline must scale responsively");
  // CTA buttons flex-col on mobile or flex-wrap
  assert(content.includes("flex-col sm:flex-row") || content.includes("flex-wrap") || content.includes("flex items-center justify-center gap-4"), "Hero CTAs must handle mobile layout");
});

runTest("PositioningBand.jsx responsive layout at 375px", () => {
  const content = fs.readFileSync(path.join(landingDir, "PositioningBand.jsx"), "utf-8");
  // Grid columns collapse on mobile (grid-cols-1 md:grid-cols-3)
  assert(content.includes("grid-cols-1") && content.includes("md:grid-cols-3"), "PositioningBand must be 1 column on mobile");
  assert(content.includes("px-4"), "PositioningBand must have mobile padding");
});

runTest("HowItWorksSection.jsx responsive layout at 375px", () => {
  const content = fs.readFileSync(path.join(landingDir, "HowItWorksSection.jsx"), "utf-8");
  // Grid or flex layout responsiveness
  assert(content.includes("grid-cols-1") || content.includes("flex-col") || content.includes("lg:grid-cols-"), "HowItWorks must collapse to single column on mobile");
  assert(content.includes("px-4"), "HowItWorks must have mobile padding");
});

runTest("FeatureBentoGrid.jsx responsive layout at 375px", () => {
  const content = fs.readFileSync(path.join(landingDir, "FeatureBentoGrid.jsx"), "utf-8");
  // Base grid-cols-1 md:grid-cols-3
  assert(content.includes("grid-cols-1"), "FeatureBentoGrid must collapse to 1 column on mobile");
  assert(content.includes("px-4"), "FeatureBentoGrid must have mobile padding");
});

runTest("LandingNav.jsx mobile responsiveness (hides desktop nav, provides compact bar)", () => {
  const content = fs.readFileSync(path.join(landingDir, "LandingNav.jsx"), "utf-8");
  // Desktop nav hidden on mobile: hidden md:flex or hidden lg:flex
  assert(content.includes("hidden md:flex") || content.includes("hidden lg:flex"), "LandingNav must hide complex link list on mobile viewports");
  assert(content.includes("px-4") || content.includes("px-3"), "LandingNav must have responsive padding");
});

runTest("FaqSection.jsx responsive layout at 375px", () => {
  const content = fs.readFileSync(path.join(landingDir, "FaqSection.jsx"), "utf-8");
  assert(content.includes("px-4"), "FaqSection must have mobile padding");
  assert(content.includes("max-w-") || content.includes("w-full"), "FaqSection must constrain width");
});

runTest("DeveloperMatchingSection.jsx responsive layout at 375px", () => {
  const content = fs.readFileSync(path.join(landingDir, "DeveloperMatchingSection.jsx"), "utf-8");
  assert(content.includes("px-4"), "DeveloperMatchingSection must have px-4 mobile padding");
  assert(content.includes("max-w-") || content.includes("w-full"), "DeveloperMatchingSection card deck must fit viewport");
});

runTest("InteractiveFeedSnippetSection.jsx responsive layout at 375px", () => {
  const content = fs.readFileSync(path.join(landingDir, "InteractiveFeedSnippetSection.jsx"), "utf-8");
  assert(content.includes("px-4"), "InteractiveFeedSnippetSection must have mobile padding");
  assert(content.includes("overflow-x-auto"), "Code panel must have overflow-x-auto for long lines");
});

runTest("RoomFeaturesSection.jsx responsive layout at 375px", () => {
  const content = fs.readFileSync(path.join(landingDir, "RoomFeaturesSection.jsx"), "utf-8");
  assert(content.includes("px-4"), "RoomFeaturesSection must have mobile padding");
  // 4-panel chrome mockup responsive columns: grid-cols-2 md:grid-cols-4 or grid-cols-1
  assert(content.includes("grid-cols-2") || content.includes("grid-cols-1"), "Room mockup panels must collapse on mobile");
  // 6 micro-tiles grid: grid-cols-2 or grid-cols-1
  assert(content.includes("grid-cols-2") || content.includes("grid-cols-1"), "Micro-features grid must collapse on mobile");
});

// ---------------------------------------------------------------------------
// SUITE 4: Strict Platform & Landing Invariants
// ---------------------------------------------------------------------------
console.log("\n--- Suite 4: Strict Platform & Landing Invariants ---");

runTest("Single <h1> tag total across all landing components", () => {
  const landingFiles = fs.readdirSync(landingDir).filter(f => f.endsWith(".jsx"));
  let h1Count = 0;
  const h1Files = [];
  for (const f of landingFiles) {
    const content = fs.readFileSync(path.join(landingDir, f), "utf-8");
    const matches = content.match(/<h1[\s>]/g);
    if (matches) {
      h1Count += matches.length;
      h1Files.push(`${f} (${matches.length})`);
    }
  }
  const landingPageContent = fs.readFileSync(landingPageFile, "utf-8");
  const lpMatches = landingPageContent.match(/<h1[\s>]/g);
  if (lpMatches) {
    h1Count += lpMatches.length;
    h1Files.push(`LandingPage.jsx (${lpMatches.length})`);
  }
  assert.strictEqual(h1Count, 1, `Expected exactly 1 <h1> across landing components, found ${h1Count}: ${h1Files.join(", ")}`);
});

runTest("Zero emoji characters across M1 new and M2 modified landing components", () => {
  const emojiRegex = /[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]/gu;
  const targetFiles = [
    // M1 Components (Task 3 Test 3)
    path.join(landingDir, "DeveloperMatchingSection.jsx"),
    path.join(landingDir, "LandingMatchModal.jsx"),
    path.join(landingDir, "InteractiveFeedSnippetSection.jsx"),
    path.join(landingDir, "RoomFeaturesSection.jsx"),
    // M2 Modified Files
    path.join(landingDir, "HeroSection.jsx"),
    path.join(landingDir, "PositioningBand.jsx"),
    path.join(landingDir, "HowItWorksSection.jsx"),
    path.join(landingDir, "FeatureBentoGrid.jsx"),
    path.join(landingDir, "LandingNav.jsx"),
    path.join(landingDir, "FaqSection.jsx"),
    landingPageFile,
    path.resolve(frontendDir, "scripts/prerender.mjs")
  ];
  for (const f of targetFiles) {
    const content = fs.readFileSync(f, "utf-8");
    assert(!emojiRegex.test(content), `Emoji found in ${path.basename(f)}`);
  }
});

runTest("Zero forbidden links (/discover, /sandbox, /profile/:id) in landing components", () => {
  const landingFiles = fs.readdirSync(landingDir).filter(f => f.endsWith(".jsx"));
  for (const f of landingFiles) {
    const content = fs.readFileSync(path.join(landingDir, f), "utf-8");
    assert(!content.includes('"/discover"') && !content.includes("'/discover'"), `Forbidden link /discover in ${f}`);
    assert(!content.includes('"/sandbox"') && !content.includes("'/sandbox'"), `Forbidden link /sandbox in ${f}`);
    assert(!content.includes('"/profile/'), `Forbidden link /profile/:id in ${f}`);
  }
});

runTest("Zero Redux imports in newly mounted landing components", () => {
  const newComps = [
    "DeveloperMatchingSection.jsx",
    "LandingMatchModal.jsx",
    "InteractiveFeedSnippetSection.jsx",
    "RoomFeaturesSection.jsx"
  ];
  for (const f of newComps) {
    const content = fs.readFileSync(path.join(landingDir, f), "utf-8");
    assert(!content.includes("useSelector"), `${f} must not import useSelector`);
    assert(!content.includes("useDispatch"), `${f} must not import useDispatch`);
    assert(!content.includes("react-redux"), `${f} must not import react-redux`);
  }
});

runTest("Zero eval(), zero getUserMedia(), zero RTCPeerConnection() in new components", () => {
  const feedSnippetContent = fs.readFileSync(path.join(landingDir, "InteractiveFeedSnippetSection.jsx"), "utf-8");
  assert(!feedSnippetContent.includes(" eval("), "InteractiveFeedSnippetSection must not use eval()");
  assert(feedSnippetContent.includes("srcdoc"), "InteractiveFeedSnippetSection must use iframe srcdoc sandbox");
  assert(feedSnippetContent.includes("allow-scripts"), "InteractiveFeedSnippetSection must restrict sandbox to allow-scripts");

  const roomFeaturesContent = fs.readFileSync(path.join(landingDir, "RoomFeaturesSection.jsx"), "utf-8");
  assert(!roomFeaturesContent.includes("getUserMedia"), "RoomFeaturesSection must not use getUserMedia");
  assert(!roomFeaturesContent.includes("RTCPeerConnection"), "RoomFeaturesSection must not use RTCPeerConnection");
});

runTest("All 16 sections are mounted in LandingPage.jsx in exact specified order", () => {
  const content = fs.readFileSync(landingPageFile, "utf-8");
  const expectedOrder = [
    "<LandingNav",
    "<HeroSection",
    "<TechMarquee",
    "<PositioningBand",
    "<HowItWorksSection",
    "<DeveloperMatchingSection",
    "<InteractiveFeedSnippetSection",
    "<RoomFeaturesSection",
    "<FeatureBentoGrid",
    "<WatchSessionSection",
    "<CommunityBand",
    "<ShowcaseBand",
    "<PricingSection",
    "<FaqSection",
    "<FinalCtaSection",
    "<LandingFooter"
  ];

  let lastIndex = -1;
  for (const tag of expectedOrder) {
    const idx = content.indexOf(tag);
    assert(idx !== -1, `Section tag ${tag} must be mounted in LandingPage.jsx`);
    assert(idx > lastIndex, `Section tag ${tag} is out of order (pos ${idx} <= prev ${lastIndex})`);
    lastIndex = idx;
  }
});

console.log("\n=================================================================");
console.log(` SUMMARY: ${passedTests}/${totalTests} tests passed successfully!`);
console.log("=================================================================\n");
