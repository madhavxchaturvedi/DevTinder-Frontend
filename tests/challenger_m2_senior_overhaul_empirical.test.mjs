import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import esbuild from "esbuild";
import React from "react";
import { renderToString } from "react-dom/server";

const FRONTEND_DIR = path.resolve(import.meta.dirname, "..");
const SRC_DIR = path.join(FRONTEND_DIR, "src");
const DIST_DIR = path.join(FRONTEND_DIR, "dist");

// Setup minimal Node window mock for component rendering
const mockStorage = {
  _store: {},
  getItem(key) { return this._store[key] || null; },
  setItem(key, val) { this._store[key] = String(val); },
  removeItem(key) { delete this._store[key]; },
  clear() { this._store = {}; },
};

if (typeof globalThis.window === "undefined") {
  globalThis.window = {
    location: { pathname: "/", search: "", hash: "" },
    matchMedia: () => ({ matches: false, addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {} }),
    localStorage: mockStorage,
    sessionStorage: mockStorage,
    scrollTo: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
  };
}

globalThis.localStorage = globalThis.window.localStorage || mockStorage;
globalThis.sessionStorage = globalThis.window.sessionStorage || mockStorage;

if (typeof globalThis.document === "undefined") {
  globalThis.document = {
    cookie: "",
    getElementById: () => null,
    addEventListener: () => {},
    removeEventListener: () => {},
  };
}

// Dummy Icon Component for Lucide mock
const DummyIcon = ({ className, ...props }) => React.createElement("svg", { className, ...props });
const lucideMock = new Proxy({}, {
  get: () => DummyIcon,
});

// React Router Link mock
const LinkMock = ({ to, children, className, ...rest }) => React.createElement("a", { href: to, className, ...rest }, children);

// Framer Motion mock
const motionMock = {
  div: ({ children, ...props }) => React.createElement("div", props, children),
  span: ({ children, ...props }) => React.createElement("span", props, children),
  button: ({ children, ...props }) => React.createElement("button", props, children),
  section: ({ children, ...props }) => React.createElement("section", props, children),
  p: ({ children, ...props }) => React.createElement("p", props, children),
};
const AnimatePresenceMock = ({ children }) => React.createElement(React.Fragment, null, children);

// Dynamic JSX loader using esbuild
const loadTranspiled = (relPath, mocks = {}) => {
  const filePath = path.join(SRC_DIR, relPath);
  const source = fs.readFileSync(filePath, "utf8");
  const transformed = esbuild.transformSync(source, {
    loader: "jsx",
    format: "cjs",
  });

  const fakeRequire = (name) => {
    if (mocks[name]) return mocks[name];
    if (name === "react") return React;
    if (name === "react-router-dom") {
      return {
        Link: LinkMock,
        useLocation: () => ({ pathname: "/", search: "", hash: "" }),
        useNavigate: () => () => {},
        useParams: () => ({}),
      };
    }
    if (name === "lucide-react") return lucideMock;
    if (name === "framer-motion") {
      return {
        motion: motionMock,
        AnimatePresence: AnimatePresenceMock,
      };
    }
    // Subcomponents mock
    const dummyComponent = (props) => React.createElement("div", { "data-mock": name, ...props });
    return { default: dummyComponent, __esModule: true, ...dummyComponent };
  };

  const moduleObj = { exports: {} };
  const fn = new Function("require", "module", "exports", transformed.code);
  fn(fakeRequire, moduleObj, moduleObj.exports);
  return moduleObj.exports.default || moduleObj.exports;
};

// Comprehensive Unicode Emoji regular expression
const EMOJI_REGEX = /([\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F1E6}-\u{1F1FF}]|[\u{FE00}-\u{FE0F}]|\p{Extended_Pictographic})/gu;

describe("Milestone 2 Senior UI/UX & Motion Overhaul — Empirical Challenge Suite", () => {

  describe("1. Static Prerender HTML: Strictly exactly one <h1> per route across all 7 marketing routes", () => {
    const routes = [
      { path: "index.html", name: "Root (/)" },
      { path: "features/match/index.html", name: "/features/match" },
      { path: "features/collab/index.html", name: "/features/collab" },
      { path: "features/feed/index.html", name: "/features/feed" },
      { path: "features/projects/index.html", name: "/features/projects" },
      { path: "pricing/index.html", name: "/pricing" },
      { path: "community/index.html", name: "/community" },
    ];

    for (const r of routes) {
      it(`dist/${r.path} (${r.name}) must contain strictly 1 <h1> in prerendered HTML`, () => {
        const fullPath = path.join(DIST_DIR, r.path);
        assert.ok(fs.existsSync(fullPath), `Prerendered file dist/${r.path} must exist`);
        const html = fs.readFileSync(fullPath, "utf8");
        const h1Matches = html.match(/<h1(\s|>)/gi) || [];
        assert.strictEqual(
          h1Matches.length,
          1,
          `dist/${r.path} must contain exactly 1 <h1>, but found ${h1Matches.length}`
        );
      });
    }
  });

  describe("2. JSX Source Hierarchy: Exactly one <h1> in top hero components, zero in subcomponents", () => {
    const heroPages = [
      { rel: "components/landing/HeroSection.jsx", name: "HeroSection (Root /)" },
      { rel: "pages/marketing/FeaturesMatchPage.jsx", name: "FeaturesMatchPage" },
      { rel: "pages/marketing/FeaturesCollabPage.jsx", name: "FeaturesCollabPage" },
      { rel: "pages/marketing/FeaturesFeedPage.jsx", name: "FeaturesFeedPage" },
      { rel: "pages/marketing/FeaturesProjectsPage.jsx", name: "FeaturesProjectsPage" },
      { rel: "pages/marketing/PricingDestinationPage.jsx", name: "PricingDestinationPage" },
      { rel: "pages/marketing/CommunityDestinationPage.jsx", name: "CommunityDestinationPage" },
    ];

    for (const p of heroPages) {
      it(`${p.name} source (${p.rel}) must contain exactly 1 <h1 tag`, () => {
        const fullPath = path.join(SRC_DIR, p.rel);
        const content = fs.readFileSync(fullPath, "utf8");
        const matches = content.match(/<h1(\s|>)/gi) || [];
        assert.strictEqual(
          matches.length,
          1,
          `${p.rel} must have exactly 1 <h1>, found ${matches.length}`
        );
      });
    }

    const subcomponents = [
      "components/landing/HowItWorksSection.jsx",
      "components/landing/DeveloperMatchingSection.jsx",
      "components/landing/ProfileShowcaseBand.jsx",
      "components/landing/FinalCtaSection.jsx",
      "components/landing/RoomFeaturesSection.jsx",
      "components/landing/FeatureBentoGrid.jsx",
      "components/landing/WatchSessionSection.jsx",
      "components/landing/PricingSection.jsx",
      "components/landing/FaqSection.jsx",
      "components/landing/HeroMockEditor.jsx",
      "components/landing/FeatureTeasersSection.jsx",
      "components/landing/PositioningBand.jsx",
    ];

    for (const rel of subcomponents) {
      it(`Subcomponent ${rel} must contain exactly 0 <h1 tags`, () => {
        const fullPath = path.join(SRC_DIR, rel);
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, "utf8");
          const matches = content.match(/<h1(\s|>)/gi) || [];
          assert.strictEqual(
            matches.length,
            0,
            `Subcomponent ${rel} must have 0 <h1>, but found ${matches.length}`
          );
        }
      });
    }
  });

  describe("3. Prerender Script (prerender.mjs) Invariant", () => {
    it("prerender.mjs emits <h1> across all marketing routes", () => {
      const scriptPath = path.join(FRONTEND_DIR, "scripts/prerender.mjs");
      const content = fs.readFileSync(scriptPath, "utf8");
      // Must not use route.isRoot ? 'h1' : 'h2'
      assert.ok(
        !content.includes('route.isRoot ? "h1" : "h2"'),
        "prerender.mjs must not restrict h1 to isRoot"
      );
      assert.ok(
        content.includes('React.createElement(\n        "h1"'),
        'prerender.mjs line 203 must emit React.createElement("h1"'
      );
    });
  });

  describe("4. /features/match: PositioningBand Removal & Skiper Interactive Match Deck Verification", () => {
    const matchPath = path.join(SRC_DIR, "pages/marketing/FeaturesMatchPage.jsx");
    const content = fs.readFileSync(matchPath, "utf8");

    it("PositioningBand is NOT imported or rendered in FeaturesMatchPage.jsx", () => {
      assert.ok(
        !content.includes("PositioningBand"),
        "FeaturesMatchPage must not import or render PositioningBand"
      );
    });

    it("FeaturesMatchPage defines and renders HeroMatchDeck component", () => {
      assert.ok(content.includes("HeroMatchDeck"), "HeroMatchDeck must be defined and rendered");
    });

    it("HeroMatchDeck contains 98% circular compatibility gauge with SVG stroke offsets", () => {
      assert.ok(content.includes('strokeDasharray="251.2"'), "Gauge must specify strokeDasharray 251.2");
      assert.ok(content.includes('strokeDashoffset="5.02"'), "Gauge must specify strokeDashoffset 5.02 (98% fill)");
      assert.ok(content.includes("98%"), "Gauge must display '98%' text");
      assert.ok(content.includes("MATCH"), "Gauge must display 'MATCH' text");
      assert.ok(content.includes("Chemistry Rating"), "HeroMatchDeck must include Chemistry Rating label");
    });

    it("HeroMatchDeck renders shared core skills pills", () => {
      assert.ok(content.includes("Rust"), "HeroMatchDeck must include Rust pill");
      assert.ok(content.includes("WebRTC"), "HeroMatchDeck must include WebRTC pill");
      assert.ok(content.includes("Tokio"), "HeroMatchDeck must include Tokio pill");
      assert.ok(content.includes("P2P Mesh"), "HeroMatchDeck must include P2P Mesh pill");
    });

    it("HeroMatchDeck renders live ready-to-pair beacon", () => {
      assert.ok(content.includes("Ready to pair right now"), "HeroMatchDeck must display 'Ready to pair right now'");
      assert.ok(content.includes("animate-ping"), "HeroMatchDeck must have animate-ping pulsing radar beacon");
    });

    it("HeroMatchDeck provides interactive tab toggle (Chemistry vs Proof) and state button", () => {
      assert.ok(content.includes("setActiveTab"), "HeroMatchDeck must have setActiveTab handler");
      assert.ok(content.includes("activeTab === \"compatibility\""), "HeroMatchDeck must toggle compatibility view");
      assert.ok(content.includes("activeTab === \"proof\""), "HeroMatchDeck must toggle proof view");
      assert.ok(content.includes("Instant Pair With Elena"), "HeroMatchDeck must have 'Instant Pair With Elena' CTA");
      assert.ok(content.includes("Pairing Request Dispatched"), "HeroMatchDeck must have dispatched confirmation state");
    });

    it("FeaturesMatchPage uses overflow-x-clip container", () => {
      assert.ok(content.includes("overflow-x-clip"), "FeaturesMatchPage must use overflow-x-clip");
    });

    it("Dynamic SSR render of FeaturesMatchPage outputs HeroMatchDeck with 98% gauge and single <h1>", () => {
      const FeaturesMatchPage = loadTranspiled("pages/marketing/FeaturesMatchPage.jsx");
      const html = renderToString(React.createElement(FeaturesMatchPage));
      assert.ok(html.includes("98%"), "SSR HTML must render 98% compatibility gauge");
      assert.ok(html.includes("Ready to pair right now"), "SSR HTML must render ready beacon");
      assert.ok(html.includes("Developer Discovery &amp; Matchmaking"), "SSR HTML must render h1 text");
      const h1Count = (html.match(/<h1(\s|>)/gi) || []).length;
      assert.strictEqual(h1Count, 1, `SSR HTML must contain exactly 1 <h1>, got ${h1Count}`);
    });
  });

  describe("5. Root (/): Vengeance UI Perspective Grid, Shimmer Gradient, and Skiper Dual Cursor Mock Editor", () => {
    const heroSectionPath = path.join(SRC_DIR, "components/landing/HeroSection.jsx");
    const heroMockPath = path.join(SRC_DIR, "components/landing/HeroMockEditor.jsx");
    const indexCssPath = path.join(SRC_DIR, "index.css");

    const heroSectionSrc = fs.readFileSync(heroSectionPath, "utf8");
    const heroMockSrc = fs.readFileSync(heroMockPath, "utf8");
    const indexCssSrc = fs.readFileSync(indexCssPath, "utf8");

    it("HeroSection.jsx includes Vengeance 3D perspective grid plane and radial gradient mask", () => {
      assert.ok(heroSectionSrc.includes("[perspective:1000px]"), "HeroSection must use 3D perspective 1000px");
      assert.ok(
        heroSectionSrc.includes("[transform:rotateX(60deg)_translateY(-80px)_scale(2.5)]") ||
        heroSectionSrc.includes("rotateX(60deg)"),
        "HeroSection must apply rotateX(60deg) grid perspective transform"
      );
      assert.ok(heroSectionSrc.includes("maskImage"), "HeroSection must apply radial mask to perspective grid");
    });

    it("HeroSection.jsx applies animated text shimmer gradient on headline", () => {
      assert.ok(heroSectionSrc.includes("animate-shimmer"), "HeroSection headline must use animate-shimmer");
      assert.ok(heroSectionSrc.includes("bg-clip-text text-transparent"), "HeroSection headline must clip shimmer gradient");
      assert.ok(heroSectionSrc.includes("Build it live."), "Headline must shimmer on 'Build it live.'");
    });

    it("index.css defines shimmer animation keyframes and utility", () => {
      assert.ok(indexCssSrc.includes("@keyframes shimmer"), "index.css must define @keyframes shimmer");
      assert.ok(indexCssSrc.includes(".animate-shimmer"), "index.css must define .animate-shimmer utility");
      assert.ok(indexCssSrc.includes("--animate-shimmer"), "index.css must configure theme variable --animate-shimmer");
      // prefers-reduced-motion check
      assert.ok(
        indexCssSrc.includes("prefers-reduced-motion") && indexCssSrc.includes(".animate-shimmer"),
        "index.css must disable animate-shimmer under prefers-reduced-motion"
      );
    });

    it("HeroMockEditor.jsx features Skiper UI dual cursor badge with angled pointer head", () => {
      assert.ok(
        heroMockSrc.includes("M3.5 2.5L19.5 12.5L11.5 14L8.5 21.5L3.5 2.5Z"),
        "CursorElement must render Skiper angled SVG pointer head"
      );
      assert.ok(heroMockSrc.includes('name="Alex"'), "HeroMockEditor must render Alex presence badge");
      assert.ok(heroMockSrc.includes('name="Elena"'), "HeroMockEditor must render Elena presence badge");
      assert.ok(heroMockSrc.includes("LIVE PEERS (2)"), "HeroMockEditor header must render LIVE PEERS (2)");
    });

    it("HeroMockEditor.jsx applies active typing row border highlights on lines 7-11", () => {
      assert.ok(
        heroMockSrc.includes("border-l-2 border-[#ccff00]"),
        "HeroMockEditor must highlight Alex typing line with border-l-2 border-[#ccff00]"
      );
      assert.ok(
        heroMockSrc.includes("border-l-2 border-[#b266ff]"),
        "HeroMockEditor must highlight Elena typing line with border-l-2 border-[#b266ff]"
      );
    });

    it("Dynamic SSR render of HeroSection outputs single <h1> and perspective grid markup", () => {
      const HeroSection = loadTranspiled("components/landing/HeroSection.jsx");
      const html = renderToString(React.createElement(HeroSection));
      assert.ok(html.includes("perspective:1000px"), "SSR HTML must contain perspective:1000px");
      assert.ok(html.includes("animate-shimmer"), "SSR HTML must contain animate-shimmer");
      assert.ok(html.includes("Pick a project. Pair up."), "SSR HTML must render hero headline");
      const h1Count = (html.match(/<h1(\s|>)/gi) || []).length;
      assert.strictEqual(h1Count, 1, `HeroSection SSR must contain strictly 1 <h1>, got ${h1Count}`);
    });
  });

  describe("6. Sub-Page Archetypes: Collab, Feed, Projects, Pricing, Community", () => {
    it("/features/collab includes simulated multiplayer studio with dynamic island, audio mesh, and synced terminal", () => {
      const collabSrc = fs.readFileSync(path.join(SRC_DIR, "pages/marketing/FeaturesCollabPage.jsx"), "utf8");
      assert.ok(collabSrc.includes("HeroMultiplayerStudio"), "Must define HeroMultiplayerStudio");
      assert.ok(collabSrc.includes("mesh_transport.rs"), "Must render dynamic island capsule with mesh_transport.rs");
      assert.ok(collabSrc.includes("18ms mesh"), "Must render 18ms latency capsule");
      assert.ok(collabSrc.includes("Voice Live"), "Must render audio mesh indicator");
      assert.ok(collabSrc.includes("SYNCED TERMINAL • zsh"), "Must render synced live terminal");
      assert.ok(collabSrc.includes("cargo test"), "Must render test verification output");
      assert.ok(collabSrc.includes("overflow-x-clip"), "Must have overflow-x-clip");
    });

    it("/features/feed includes AnimMaster Radar Pulse Beacon Card with glowing border beam & code runner", () => {
      const feedSrc = fs.readFileSync(path.join(SRC_DIR, "pages/marketing/FeaturesFeedPage.jsx"), "utf8");
      assert.ok(feedSrc.includes("animate-[spin_8s_linear_infinite]"), "Must render Vengeance rotating border beam");
      assert.ok(feedSrc.includes("conic-gradient"), "Border beam must use conic gradient");
      assert.ok(feedSrc.includes("animate-ping"), "Must render concentric emergency radar pulse rings");
      assert.ok(feedSrc.includes("runHeroSandbox"), "Must include in-browser runnable code sandbox");
      assert.ok(feedSrc.includes("DEBUG SOS // PRIORITY_1"), "Must display emergency debug alert header");
      assert.ok(feedSrc.includes("overflow-x-clip"), "Must have overflow-x-clip");
    });

    it("/features/projects includes Tech Stack Filter Bar and dynamic filtered sprint cards", () => {
      const projSrc = fs.readFileSync(path.join(SRC_DIR, "pages/marketing/FeaturesProjectsPage.jsx"), "utf8");
      assert.ok(projSrc.includes('"All"'), "Tech stack filter must include All");
      assert.ok(projSrc.includes('"Rust"'), "Tech stack filter must include Rust");
      assert.ok(projSrc.includes('"Go"'), "Tech stack filter must include Go");
      assert.ok(projSrc.includes('"TypeScript"'), "Tech stack filter must include TypeScript");
      assert.ok(projSrc.includes('"Python"'), "Tech stack filter must include Python");
      assert.ok(projSrc.includes("filteredHeroProjects"), "Must dynamically filter sprint cards");
      assert.ok(projSrc.includes("overflow-x-clip"), "Must have overflow-x-clip");
    });

    it("/pricing includes consolidated single-hero architecture with monthly/annual toggle and border beam Pro card", () => {
      const pricingSrc = fs.readFileSync(path.join(SRC_DIR, "pages/marketing/PricingDestinationPage.jsx"), "utf8");
      const sectionSrc = fs.readFileSync(path.join(SRC_DIR, "components/landing/PricingSection.jsx"), "utf8");
      assert.ok(pricingSrc.includes("<PricingSection hideHeader={true} />"), "Must pass hideHeader={true} to PricingSection");
      assert.ok(sectionSrc.includes("hideHeader = false"), "PricingSection must support hideHeader prop");
      assert.ok(sectionSrc.includes("!hideHeader &&"), "PricingSection must skip duplicate h2 when hideHeader=true");
      assert.ok(sectionSrc.includes("animate-[spin_6s_linear_infinite]"), "Pro card must feature rotating border beam");
      assert.ok(sectionSrc.includes("Save 17%"), "Pricing must display Save 17% on Annual toggle");
    });

    it("/community includes Global Developer Command Center with animated telemetry dashboard and Discord Lounge", () => {
      const commSrc = fs.readFileSync(path.join(SRC_DIR, "pages/marketing/CommunityDestinationPage.jsx"), "utf8");
      assert.ok(commSrc.includes("1,420+"), "Must render 1,420+ Active Builders metric");
      assert.ok(commSrc.includes("380+"), "Must render 380+ Open Repositories metric");
      assert.ok(commSrc.includes("2,850+"), "Must render 2,850+ Shipped Sessions metric");
      assert.ok(commSrc.includes("18ms"), "Must render 18ms Latency metric");
      assert.ok(commSrc.includes("Discord Developer Lounge"), "Must render Discord Developer Lounge card");
      assert.ok(commSrc.includes("rust-systems-jam"), "Must render live voice channel jam");
      assert.ok(commSrc.includes("#{ch.name}"), "Must render channel name with hashtag prefix");
      assert.ok(commSrc.includes("WEEKLY_HACK_SPRINTS"), "Must render weekly hack sprint schedule");
    });
  });

  describe("7. Zero Emojis Invariant: Complete absence of raw unicode emojis across all modified files", () => {
    const filesToCheck = [
      "components/landing/HeroSection.jsx",
      "components/landing/HeroMockEditor.jsx",
      "pages/marketing/FeaturesMatchPage.jsx",
      "pages/marketing/FeaturesCollabPage.jsx",
      "pages/marketing/FeaturesFeedPage.jsx",
      "pages/marketing/FeaturesProjectsPage.jsx",
      "pages/marketing/PricingDestinationPage.jsx",
      "components/landing/PricingSection.jsx",
      "pages/marketing/CommunityDestinationPage.jsx",
    ];

    for (const rel of filesToCheck) {
      it(`${rel} contains strictly 0 unicode emojis`, () => {
        const fullPath = path.join(SRC_DIR, rel);
        const content = fs.readFileSync(fullPath, "utf8");
        const matches = content.match(EMOJI_REGEX);
        assert.strictEqual(
          matches,
          null,
          `File ${rel} contains prohibited unicode emojis: ${JSON.stringify(matches)}`
        );
      });
    }
  });

  describe("8. Dynamic SSR Execution for All 6 Marketing Sub-Pages", () => {
    const subpages = [
      { rel: "pages/marketing/FeaturesCollabPage.jsx", name: "FeaturesCollabPage", expectedH1: "Sub-50ms Live Collaboration" },
      { rel: "pages/marketing/FeaturesFeedPage.jsx", name: "FeaturesFeedPage", expectedH1: "Interactive Code Feed" },
      { rel: "pages/marketing/FeaturesProjectsPage.jsx", name: "FeaturesProjectsPage", expectedH1: "Open Developer Projects" },
      { rel: "pages/marketing/PricingDestinationPage.jsx", name: "PricingDestinationPage", expectedH1: "Simple, Predictable Plans for Developers" },
      { rel: "pages/marketing/CommunityDestinationPage.jsx", name: "CommunityDestinationPage", expectedH1: "Global Developer Telemetry &amp; Community" },
    ];

    for (const sp of subpages) {
      it(`Dynamic SSR of ${sp.name} executes cleanly and renders strictly 1 <h1>`, () => {
        const Component = loadTranspiled(sp.rel);
        const html = renderToString(React.createElement(Component));
        assert.ok(html.includes(sp.expectedH1), `SSR output must contain expected heading ${sp.expectedH1}`);
        const h1Matches = html.match(/<h1(\s|>)/gi) || [];
        assert.strictEqual(
          h1Matches.length,
          1,
          `${sp.name} SSR output must contain strictly 1 <h1>, got ${h1Matches.length}`
        );
      });
    }
  });

});
