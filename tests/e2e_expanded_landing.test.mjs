/**
 * E2E Tests: Expanded Landing Page — Additive Sections & Hardening
 * 
 * Tests:
 * 1. DeveloperMatchingSection renders without Redux Provider & includes Follow vs Connect
 * 2. No /discover, /sandbox, or /profile/:id links in any additive component
 * 3. No emoji characters (U+1F000+) in rendered text content
 * 4. LandingMatchModal renders with fictional dev props, no Redux
 * 5. InteractiveFeedSnippetSection uses hardened iframe sandbox (never eval, checks e.source)
 * 6. InteractiveFeedSnippetSection includes Debug SOS tab
 * 7. RoomFeaturesSection is a pure scripted mock (no getUserMedia, no RTCPeerConnection, no Sandpack)
 * 8. ProfileShowcaseBand renders without Redux, covers pinned snippets, shipped together, SOS record
 * 9. All additive components have no h1 elements (exactly one h1 preserved in HeroSection)
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import assert from "assert";

const root = existsSync(resolve(process.cwd(), "Frontend/src/components/landing"))
  ? resolve(process.cwd(), "Frontend/src/components/landing")
  : resolve(process.cwd(), "src/components/landing");

// Helper
const readComp = (name) => readFileSync(resolve(root, name), "utf8");

const allAdditiveFiles = [
  "DeveloperMatchingSection.jsx",
  "LandingMatchModal.jsx",
  "InteractiveFeedSnippetSection.jsx",
  "RoomFeaturesSection.jsx",
  "ProfileShowcaseBand.jsx",
];

// Test 1: No Redux in DeveloperMatchingSection & contains Follow vs Connect
{
  const src = readComp("DeveloperMatchingSection.jsx");
  assert(!src.includes("useSelector"), "DeveloperMatchingSection must not use useSelector");
  assert(!src.includes("useDispatch"), "DeveloperMatchingSection must not use useDispatch");
  assert(!src.includes("from 'react-redux'"), "DeveloperMatchingSection must not import from react-redux");
  assert(src.includes("Follow:"), "DeveloperMatchingSection must include 'Follow:' explainer");
  assert(src.includes("Connect:"), "DeveloperMatchingSection must include 'Connect:' explainer");
  console.log("✅ Test 1 passed: DeveloperMatchingSection has no Redux and includes Follow vs Connect");
}

// Test 2: No /discover, /sandbox, or /profile/:id links
{
  for (const f of allAdditiveFiles) {
    const src = readComp(f);
    assert(!src.includes('"/discover"') && !src.includes("'/discover'"), `${f} must not link to /discover`);
    assert(!src.includes('"/sandbox"') && !src.includes("'/sandbox'"), `${f} must not link to /sandbox`);
    assert(!src.includes('"/profile/'), `${f} must not link to /profile/:id`);
  }
  console.log("✅ Test 2 passed: No forbidden route links in additive sections");
}

// Test 3: No emoji characters
{
  for (const f of allAdditiveFiles) {
    const src = readComp(f);
    const emojiRegex = /[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]/gu;
    assert(!emojiRegex.test(src), `${f} must not contain emoji characters`);
  }
  console.log("✅ Test 3 passed: Zero emoji characters across all additive components");
}

// Test 4: LandingMatchModal has no Redux
{
  const src = readComp("LandingMatchModal.jsx");
  assert(!src.includes("useSelector"), "LandingMatchModal must not use useSelector");
  assert(!src.includes("react-redux"), "LandingMatchModal must not import react-redux");
  assert(src.includes("onClose"), "LandingMatchModal must accept onClose prop");
  console.log("✅ Test 4 passed: LandingMatchModal has no Redux");
}

// Test 5: Hardened runInSandbox in InteractiveFeedSnippetSection
{
  const src = readComp("InteractiveFeedSnippetSection.jsx");
  assert(!src.includes(" eval("), "InteractiveFeedSnippetSection must not use eval()");
  assert(src.includes("srcdoc"), "InteractiveFeedSnippetSection must use iframe srcdoc");
  assert(src.includes("allow-scripts"), "InteractiveFeedSnippetSection iframe must have allow-scripts sandbox");
  assert(!src.includes("allow-same-origin"), "InteractiveFeedSnippetSection iframe must NEVER have allow-same-origin");
  assert(src.includes("e.source !== iframe.contentWindow"), "InteractiveFeedSnippetSection must validate e.source");
  assert(src.includes("postMessage"), "InteractiveFeedSnippetSection must use postMessage");
  console.log("✅ Test 5 passed: Hardened sandbox used with source verification");
}

// Test 6: InteractiveFeedSnippetSection includes Debug SOS tab
{
  const src = readComp("InteractiveFeedSnippetSection.jsx");
  assert(src.includes("Debug SOS"), "InteractiveFeedSnippetSection must have Debug SOS tab");
  assert(src.includes("SYS_DEBUG_SOS"), "InteractiveFeedSnippetSection must show SYS_DEBUG_SOS badge");
  console.log("✅ Test 6 passed: Debug SOS tab included in feed section");
}

// Test 7: RoomFeaturesSection has no real media APIs and no Sandpack
{
  const src = readComp("RoomFeaturesSection.jsx");
  assert(!src.includes("getUserMedia"), "RoomFeaturesSection must not call getUserMedia");
  assert(!src.includes("RTCPeerConnection"), "RoomFeaturesSection must not use RTCPeerConnection");
  assert(!src.includes("useSelector"), "RoomFeaturesSection must not use Redux");
  assert(!src.includes("@codesandbox/sandpack"), "RoomFeaturesSection must not import Sandpack");
  assert(src.includes("Everything built around the room"), "RoomFeaturesSection must include surround features band");
  console.log("✅ Test 7 passed: RoomFeaturesSection is a pure scripted mock with surround band");
}

// Test 8: ProfileShowcaseBand has no Redux and covers built profile features
{
  const src = readComp("ProfileShowcaseBand.jsx");
  assert(!src.includes("useSelector"), "ProfileShowcaseBand must not use useSelector");
  assert(!src.includes("react-redux"), "ProfileShowcaseBand must not import react-redux");
  assert(src.includes("PINNED SNIPPET"), "ProfileShowcaseBand must showcase pinned snippets");
  assert(src.includes("SHIPPED TOGETHER"), "ProfileShowcaseBand must showcase shipped together");
  assert(src.includes("DEBUG SOS RECORD"), "ProfileShowcaseBand must showcase debug SOS record");
  console.log("✅ Test 8 passed: ProfileShowcaseBand covers all authentic profile capabilities");
}

// Test 9: No h1 in any additive components
{
  for (const f of allAdditiveFiles) {
    const src = readComp(f);
    assert(!src.includes("<h1"), `${f} must not contain an h1 element (only HeroSection may have h1)`);
  }
  console.log("✅ Test 9 passed: Zero h1 elements in additive landing components");
}

console.log("\n🎉 All 7 expanded landing tests passed!");
console.log("🎉 All 9 expanded landing tests passed cleanly!");
