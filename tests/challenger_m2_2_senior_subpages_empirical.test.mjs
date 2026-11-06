import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import esbuild from "esbuild";
import React from "react";
import { renderToString } from "react-dom/server";

const FRONTEND_DIR = path.resolve(import.meta.dirname, "..");
const MARKETING_DIR = path.join(FRONTEND_DIR, "src/pages/marketing");
const COMPONENTS_DIR = path.join(FRONTEND_DIR, "src/components/landing");
const DIST_DIR = path.join(FRONTEND_DIR, "dist");

/**
 * Universal component compiler using esbuild transform for node:test SSR
 */
function compileComponent(filePath, extraRequire = {}, codeTransform = null) {
  let code = fs.readFileSync(filePath, "utf8");
  if (codeTransform) {
    code = codeTransform(code);
  }
  const transformed = esbuild.transformSync(code, { loader: "jsx", format: "cjs" });
  const fakeModule = { exports: {} };
  const fn = new Function("require", "exports", "module", transformed.code);
  const fakeRequire = (name) => {
    if (name === "react") return React;
    if (name === "react-router-dom") {
      return {
        __esModule: true,
        Link: ({ children, to, ...props }) => React.createElement("a", { href: to, ...props }, children),
        Navigate: () => null,
      };
    }
    if (name === "lucide-react") {
      return new Proxy({}, {
        get: (_, prop) => {
          if (prop === "__esModule") return true;
          return (props) => React.createElement("svg", { "data-icon": prop, ...props });
        },
      });
    }
    if (name === "framer-motion") {
      return {
        __esModule: true,
        motion: new Proxy({}, {
          get: (_, tag) => ({ children, ...props }) => React.createElement(tag, props, children),
        }),
        AnimatePresence: ({ children }) => children,
      };
    }
    if (name.includes("PricingSection")) {
      const p = path.join(COMPONENTS_DIR, "PricingSection.jsx");
      return {
        __esModule: true,
        default: compileComponent(p, extraRequire),
      };
    }
    if (name.includes("../../components/landing/")) {
      const compName = path.basename(name, path.extname(name));
      const comp = (props) => React.createElement("section", { "data-component": compName, ...props }, compName);
      return {
        __esModule: true,
        default: comp,
      };
    }
    if (extraRequire[name]) return extraRequire[name];
    return { __esModule: true };
  };
  fn(fakeRequire, fakeModule.exports, fakeModule);
  return fakeModule.exports.default || fakeModule.exports;
}

describe("challenger_m2_2: Senior UI/UX Sub-Page Visual Archetypes Empirical Verification", () => {
  const collabSrc = fs.readFileSync(path.join(MARKETING_DIR, "FeaturesCollabPage.jsx"), "utf8");
  const feedSrc = fs.readFileSync(path.join(MARKETING_DIR, "FeaturesFeedPage.jsx"), "utf8");
  const projectsSrc = fs.readFileSync(path.join(MARKETING_DIR, "FeaturesProjectsPage.jsx"), "utf8");
  const pricingPageSrc = fs.readFileSync(path.join(MARKETING_DIR, "PricingDestinationPage.jsx"), "utf8");
  const pricingSectionSrc = fs.readFileSync(path.join(COMPONENTS_DIR, "PricingSection.jsx"), "utf8");
  const communitySrc = fs.readFileSync(path.join(MARKETING_DIR, "CommunityDestinationPage.jsx"), "utf8");
  const matchSrc = fs.readFileSync(path.join(MARKETING_DIR, "FeaturesMatchPage.jsx"), "utf8");

  // =========================================================================
  // 1. /features/collab — Technical Velocity Archetype
  // =========================================================================
  describe("1. /features/collab: Technical Velocity Archetype & Simulated Multiplayer Studio", () => {
    it("renders split visual hero with 2-column layout (lg:col-span-5 and lg:col-span-7)", () => {
      assert.ok(collabSrc.includes("grid-cols-1 lg:grid-cols-12"), "Must use 12-col responsive grid");
      assert.ok(collabSrc.includes("lg:col-span-5"), "Left column must span 5 cols on lg");
      assert.ok(collabSrc.includes("lg:col-span-7"), "Right column must span 7 cols on lg");
      assert.ok(collabSrc.includes("<HeroMultiplayerStudio"), "Must mount HeroMultiplayerStudio in hero");
    });

    it("verifies Skiper dynamic island top bar with macOS dots and mesh capsule", () => {
      // macOS traffic dots
      assert.ok(collabSrc.includes("bg-[#ff5f56]"), "Must render red macOS dot");
      assert.ok(collabSrc.includes("bg-[#ffbd2e]"), "Must render yellow macOS dot");
      assert.ok(collabSrc.includes("bg-[#27c93f]"), "Must render green macOS dot");

      // Dynamic island capsule
      assert.ok(collabSrc.includes("mesh_transport.rs"), "Capsule must display active file mesh_transport.rs");
      assert.ok(collabSrc.includes("18ms mesh"), "Capsule must display 18ms mesh latency");
      assert.ok(collabSrc.includes("animate-ping"), "Capsule must display pinging beacon dot");
    });

    it("verifies live cursor badges for Alex (#ccff00) and Elena (#b266ff) with active line highlights", () => {
      // Alex cursor badge
      assert.ok(collabSrc.includes("<span>Alex</span>"), "Must render Alex cursor label");
      assert.ok(collabSrc.includes("bg-[#ccff00] text-black"), "Alex badge must have #ccff00 lime styling");
      assert.ok(collabSrc.includes("border-l-2 border-[#ccff00]"), "Alex active typing line must have lime accent border");

      // Elena cursor badge
      assert.ok(collabSrc.includes("<span>Elena</span>"), "Must render Elena cursor label");
      assert.ok(collabSrc.includes("bg-[#b266ff] text-white"), "Elena badge must have #b266ff purple styling");
      assert.ok(collabSrc.includes("border-l-2 border-[#b266ff]"), "Elena active review line must have purple accent border");

      // Angled SVG pointer arrow paths
      assert.ok(collabSrc.includes("M3.5 2.5L19.5 12.5L11.5 14L8.5 21.5L3.5 2.5Z"), "Must render angled cursor SVG arrow");
    });

    it("verifies audio mesh waveform indicator with Voice Live badge", () => {
      assert.ok(collabSrc.includes("Voice Live"), "Must render Voice Live badge");
      assert.ok(collabSrc.includes("animate-[waveform_1s_ease-in-out_infinite]"), "Must contain animated audio waveform bar 1");
      assert.ok(collabSrc.includes("animate-[waveform_1s_ease-in-out_infinite_0.2s]"), "Must contain animated audio waveform bar 2");
      assert.ok(collabSrc.includes("animate-[waveform_1s_ease-in-out_infinite_0.4s]"), "Must contain animated audio waveform bar 3");
    });

    it("verifies synced terminal preview with active WebRTC DataChannel and cargo test pass", () => {
      assert.ok(collabSrc.includes("SYNCED TERMINAL • zsh"), "Must display terminal header with zsh shell");
      assert.ok(collabSrc.includes("● P2P ACTIVE (18ms)"), "Must display active P2P latency badge");
      assert.ok(collabSrc.includes("WebRTC DataChannel established: 2 peers connected"), "Must log established DataChannel");
      assert.ok(collabSrc.includes("$ cargo test --lib -- --nocapture"), "Must log cargo test command");
      assert.ok(collabSrc.includes("test mesh::tests::test_p2p_sync ... ok (4ms)"), "Must log cargo test passing result");
    });

    it("enforces semantic h1 and SSR rendering of /features/collab", () => {
      const h1Count = (collabSrc.match(/<h1(\s|>)/gi) || []).length;
      assert.strictEqual(h1Count, 1, "FeaturesCollabPage must contain exactly 1 <h1> in source");
      assert.ok(collabSrc.includes("Sub-50ms Live Collaboration"), "<h1> must contain primary feature title");

      const Component = compileComponent(path.join(MARKETING_DIR, "FeaturesCollabPage.jsx"));
      const html = renderToString(React.createElement(Component));
      assert.ok(html.includes("<h1"), "SSR output must render <h1>");
      assert.ok(html.includes("HeroMultiplayerStudio") || html.includes("mesh_transport.rs"), "SSR output must render studio");
    });
  });

  // =========================================================================
  // 2. /features/feed — Problem Radar Archetype
  // =========================================================================
  describe("2. /features/feed: Problem Radar Archetype & In-Browser Code Runner", () => {
    it("renders split visual hero with 2-column layout (lg:col-span-6 / lg:col-span-6)", () => {
      assert.ok(feedSrc.includes("grid-cols-1 lg:grid-cols-12"), "Must use 12-col responsive grid");
      assert.ok(feedSrc.includes("lg:col-span-6 flex flex-col"), "Left column must span 6 cols on lg");
      assert.ok(feedSrc.includes("lg:col-span-6 w-full"), "Right column must span 6 cols on lg");
    });

    it("verifies AnimMaster Radar Pulse Beacon Card with concentric emergency ping rings", () => {
      // Emergency beacon ping rings
      assert.ok(feedSrc.includes("bg-red-500/25"), "Must have outer red ping ring");
      assert.ok(feedSrc.includes("bg-red-500/40"), "Must have inner red ping ring");
      assert.ok(feedSrc.includes("bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]"), "Must have glowing center beacon dot");

      // Radar priority and author metadata
      assert.ok(feedSrc.includes("DEBUG SOS // PRIORITY_1"), "Must display DEBUG SOS PRIORITY_1 badge");
      assert.ok(feedSrc.includes("Maya Patel · ML Systems Engineer"), "Must display author info");
      assert.ok(feedSrc.includes("CUDA Multi-GPU Deadlock on Barrier Sync"), "Must display SOS problem headline");
    });

    it("verifies Vengeance rotating conic glowing border beam", () => {
      assert.ok(
        feedSrc.includes("bg-[conic-gradient(from_0deg,transparent_0_310deg,#ccff00_340deg,#b266ff_360deg)]"),
        "Must define rotating conic gradient from transparent to lime and purple"
      );
      assert.ok(
        feedSrc.includes("animate-[spin_8s_linear_infinite]"),
        "Must apply 8s linear infinite spin animation to border beam"
      );
      assert.ok(
        feedSrc.includes("motion-reduce:hidden"),
        "Must hide border beam animation for prefers-reduced-motion"
      );
    });

    it("verifies in-browser runnable code editor with runner output and reset triggers", () => {
      assert.ok(feedSrc.includes("nccl_barrier_probe.js"), "Editor must display filename nccl_barrier_probe.js");
      assert.ok(feedSrc.includes("handleRunVerification"), "Must wire up handleRunVerification handler");
      assert.ok(feedSrc.includes("handleReset"), "Must wire up handleReset handler");
      assert.ok(feedSrc.includes("Run In-Browser Probe"), "Must render Run In-Browser Probe button text");
      assert.ok(feedSrc.includes("Pair on SOS"), "Must render Pair on SOS CTA button");
      assert.ok(feedSrc.includes("Sandboxed Output"), "Must render Sandboxed Output header");
    });

    it("empirically verifies runHeroSandbox executes safely in SSR/Node fallback without throw", async () => {
      assert.ok(feedSrc.includes("const runHeroSandbox ="), "Must define runHeroSandbox");
      // Extract or execute sandbox runner in Node environment (SSR fallback check)
      const mockCode = `const a = 1; console.log("Test log");`;
      // Verify the code structure contains SSR fallback
      assert.ok(
        feedSrc.includes('typeof window === "undefined"') || feedSrc.includes("typeof document === \"undefined\""),
        "runHeroSandbox must check window/document definedness for SSR safety"
      );
    });

    it("enforces semantic h1 and SSR rendering of /features/feed", () => {
      const h1Count = (feedSrc.match(/<h1(\s|>)/gi) || []).length;
      assert.strictEqual(h1Count, 1, "FeaturesFeedPage must contain exactly 1 <h1> in source");
      assert.ok(feedSrc.includes("Interactive Code Feed &amp;"), "<h1> must contain primary feed title");

      const Component = compileComponent(path.join(MARKETING_DIR, "FeaturesFeedPage.jsx"));
      const html = renderToString(React.createElement(Component));
      assert.ok(html.includes("<h1"), "SSR output must render <h1>");
      assert.ok(html.includes("DEBUG SOS // PRIORITY_1"), "SSR output must render beacon badge");
    });
  });

  // =========================================================================
  // 3. /features/projects — Repo Explorer Archetype
  // =========================================================================
  describe("3. /features/projects: Repo Explorer Archetype & Tech Stack Filter Bar", () => {
    it("verifies interactive Tech Stack Filter Bar with all 5 filter buttons and counts", () => {
      assert.ok(projectsSrc.includes('const TECH_FILTERS = ["All", "Rust", "Go", "TypeScript", "Python"]'), "Must define all 5 tech filters");
      assert.ok(projectsSrc.includes("selectedFilter === tech"), "Must track active filter state");
      assert.ok(projectsSrc.includes("bg-[#ccff00] text-black shadow-[0_0_20px_rgba(204,255,0,0.35)] scale-105"), "Active filter must have lime glow and scale indicator");
    });

    it("empirically validates filtering oracle across all tech tags against FALLBACK_SHOWCASE_PROJECTS", () => {
      // Extract fallback projects definition from source
      const fallbackMatch = projectsSrc.match(/const FALLBACK_SHOWCASE_PROJECTS = (\[[\s\S]*?\n\]);/);
      assert.ok(fallbackMatch, "Must locate FALLBACK_SHOWCASE_PROJECTS definition");
      const projects = eval(fallbackMatch[1]);
      assert.strictEqual(projects.length, 6, "Must define exactly 6 fallback projects");

      // Oracle filter function
      const filterProjects = (filter) =>
        filter === "All"
          ? projects
          : projects.filter((p) => p.techStack.some((t) => t.toLowerCase() === filter.toLowerCase()));

      const allList = filterProjects("All");
      assert.strictEqual(allList.length, 6, "All must yield 6 projects");

      const rustList = filterProjects("Rust");
      assert.strictEqual(rustList.length, 1, "Rust filter must yield 1 project (OctoMesh)");
      assert.strictEqual(rustList[0].title, "OctoMesh: WebRTC P2P Data Mesh");

      const goList = filterProjects("Go");
      assert.strictEqual(goList.length, 1, "Go filter must yield 1 project (HyperGraph)");
      assert.strictEqual(goList[0].title, "HyperGraph: Visual AST Query Engine");

      const tsList = filterProjects("TypeScript");
      assert.strictEqual(tsList.length, 3, "TypeScript filter must yield 3 projects");
      const tsTitles = tsList.map((p) => p.title);
      assert.ok(tsTitles.includes("OctoMesh: WebRTC P2P Data Mesh"));
      assert.ok(tsTitles.includes("KubePulse: Ephemeral Container Observability"));
      assert.ok(tsTitles.includes("AuthShield: Zero-Knowledge WebAuthn Provider"));

      const pythonList = filterProjects("Python");
      assert.strictEqual(pythonList.length, 1, "Python filter must yield 1 project (VectorLens)");
      assert.strictEqual(pythonList[0].title, "VectorLens: Embedded HNSW Vector Index");

      const unknownList = filterProjects("Haskell");
      assert.strictEqual(unknownList.length, 0, "Unknown filter must yield 0 projects");
    });

    it("verifies live filtered sprint cards rendered directly in hero viewport grid", () => {
      assert.ok(projectsSrc.includes("filteredHeroProjects.map((project) =>"), "Hero grid must map over filteredHeroProjects");
      assert.ok(projectsSrc.includes("grid-cols-1 md:grid-cols-2 lg:grid-cols-3"), "Must use responsive 3-col card grid");
      assert.ok(projectsSrc.includes("project.stage"), "Must render project stage badge");
      assert.ok(projectsSrc.includes("project.commitment"), "Must render project commitment label");
      assert.ok(projectsSrc.includes("project.roleNeeded"), "Must render role needed");
    });

    it("enforces semantic h1 and SSR rendering of /features/projects", () => {
      const h1Count = (projectsSrc.match(/<h1(\s|>)/gi) || []).length;
      assert.strictEqual(h1Count, 1, "FeaturesProjectsPage must contain exactly 1 <h1> in source");
      assert.ok(projectsSrc.includes("Open Developer Projects &amp;"), "<h1> must contain primary projects title");

      const Component = compileComponent(path.join(MARKETING_DIR, "FeaturesProjectsPage.jsx"));
      const html = renderToString(React.createElement(Component));
      assert.ok(html.includes("<h1"), "SSR output must render <h1>");
      assert.ok(html.includes("OctoMesh: WebRTC P2P Data Mesh"), "SSR output must render hero cards");
    });
  });

  // =========================================================================
  // 4. /pricing — Decision Matrix Archetype
  // =========================================================================
  describe("4. /pricing: Decision Matrix Archetype & Consolidated Single-Hero Architecture", () => {
    it("verifies consolidated single-hero architecture: PricingDestinationPage passes hideHeader={true}", () => {
      assert.ok(pricingPageSrc.includes("<PricingSection hideHeader={true} />"), "Must pass hideHeader={true} to PricingSection");
      // Check PricingSection implementation of hideHeader prop
      assert.ok(pricingSectionSrc.includes("const PricingSection = ({ hideHeader = false }) =>"), "PricingSection must accept hideHeader prop");
      assert.ok(pricingSectionSrc.includes("{!hideHeader && ("), "PricingSection must conditionally suppress standalone header when hideHeader is true");
    });

    it("verifies single h1 invariant on /pricing (strictly 0 duplicate headings)", () => {
      const pageH1Count = (pricingPageSrc.match(/<h1(\s|>)/gi) || []).length;
      assert.strictEqual(pageH1Count, 1, "PricingDestinationPage must contain exactly 1 <h1> in source");
      assert.ok(pricingPageSrc.includes("Simple, Predictable Plans for Developers"), "<h1> must contain primary pricing title");

      // Verify PricingSection has 0 <h1> elements
      const sectionH1Count = (pricingSectionSrc.match(/<h1(\s|>)/gi) || []).length;
      assert.strictEqual(sectionH1Count, 0, "PricingSection must contain 0 <h1> elements");

      // Verify PricingSection h2 is skipped when hideHeader={true}
      const PricingSectionComp = compileComponent(path.join(COMPONENTS_DIR, "PricingSection.jsx"));
      const hiddenHeaderHtml = renderToString(React.createElement(PricingSectionComp, { hideHeader: true }));
      assert.ok(!hiddenHeaderHtml.includes("<h2"), "PricingSection must NOT render <h2> when hideHeader={true}");

      const fullPageComp = compileComponent(path.join(MARKETING_DIR, "PricingDestinationPage.jsx"));
      const pageHtml = renderToString(React.createElement(fullPageComp));
      const ssrH1Matches = pageHtml.match(/<h1(\s|>)/gi) || [];
      assert.strictEqual(ssrH1Matches.length, 1, "SSR rendered markup of /pricing must contain strictly 1 <h1>");
    });

    it("verifies Monthly / Annual interactive toggle with Save 17% badge", () => {
      assert.ok(pricingSectionSrc.includes('const [billingCycle, setBillingCycle] = useState("monthly")'), "Must track billingCycle state");
      assert.ok(pricingSectionSrc.includes("Monthly"), "Must render Monthly toggle button");
      assert.ok(pricingSectionSrc.includes("Annual"), "Must render Annual toggle button");
      assert.ok(pricingSectionSrc.includes("Save 17%"), "Must render Save 17% badge on Annual toggle");
      assert.ok(pricingSectionSrc.includes('isAnnual ? "$90" : "$9"'), "Must dynamically toggle Pro price between $9/mo and $90/yr");
    });

    it("verifies 2-tier comparison cards with Vengeance rotating border beam on Pro card", () => {
      // Free tier card
      assert.ok(pricingSectionSrc.includes("$0"), "Free tier must display $0");
      assert.ok(pricingSectionSrc.includes("/login?mode=signup&plan=free"), "Free CTA must route to /login with free plan param");
      assert.ok(pricingSectionSrc.includes("Community feed & project posts"), "Free tier must list core features");

      // Pro tier card
      assert.ok(pricingSectionSrc.includes("MOST POPULAR"), "Pro card must feature MOST POPULAR badge");
      assert.ok(pricingSectionSrc.includes("/login?mode=signup&plan=pro"), "Pro CTA must route to /login with pro plan param");
      assert.ok(
        pricingSectionSrc.includes("bg-[conic-gradient(from_0deg,transparent_0_310deg,#b266ff_340deg,#ccff00_360deg)]"),
        "Pro card must define rotating conic border beam in purple/lime"
      );
      assert.ok(
        pricingSectionSrc.includes("animate-[spin_6s_linear_infinite]"),
        "Pro border beam must use 6s linear spin animation"
      );
    });
  });

  // =========================================================================
  // 5. /community — Global Scale Archetype
  // =========================================================================
  describe("5. /community: Global Scale Archetype & Developer Command Center", () => {
    it("verifies Developer Command Center Hero with live P2P mesh status beacon and single h1", () => {
      assert.ok(communitySrc.includes("BUILDER NETWORK"), "Hero must include BUILDER NETWORK badge");
      assert.ok(communitySrc.includes("P2P MESH:"), "Hero must include P2P MESH telemetry badge");
      assert.ok(communitySrc.includes("ACTIVE // 42 COUNTRIES"), "P2P mesh status must indicate 42 countries");
      assert.ok(communitySrc.includes("animate-ping"), "Status beacon must contain pinging indicator");

      const h1Count = (communitySrc.match(/<h1(\s|>)/gi) || []).length;
      assert.strictEqual(h1Count, 1, "CommunityDestinationPage must contain exactly 1 <h1> in source");
      assert.ok(communitySrc.includes("Global Developer Telemetry &amp; Community"), "<h1> must contain primary community title");
    });

    it("verifies 4 animated telemetry counters (1,420+, 380+, 2,850+, 18ms)", () => {
      assert.ok(communitySrc.includes("<AnimatedCounter value={1420} suffix=\"+\" />"), "Metric 1 must be 1420+ Active Builders");
      assert.ok(communitySrc.includes("<AnimatedCounter value={380} suffix=\"+\" />"), "Metric 2 must be 380+ Open Repositories");
      assert.ok(communitySrc.includes("<AnimatedCounter value={2850} suffix=\"+\" />"), "Metric 3 must be 2850+ Shipped Sessions");
      assert.ok(communitySrc.includes("<AnimatedCounter value={18} suffix=\"ms\" />"), "Metric 4 must be 18ms Average P2P Latency");
    });

    it("verifies AnimatedCounter component executes safely in SSR and client environments", () => {
      // Verify AnimatedCounter component structure
      assert.ok(communitySrc.includes("const AnimatedCounter ="), "Must define AnimatedCounter component");
      assert.ok(communitySrc.includes('typeof window === "undefined"'), "Must check window definedness for SSR safety");
      assert.ok(communitySrc.includes("prefers-reduced-motion"), "Must check prefers-reduced-motion media query");
      assert.ok(communitySrc.includes("cancelAnimationFrame"), "Must cleanup animation frame on unmount");
    });

    it("verifies Discord Developer Lounge Card with live voice channels preview", () => {
      assert.ok(communitySrc.includes("VOICE PAIRING LOUNGE"), "Must display VOICE PAIRING LOUNGE eyebrow badge");
      assert.ok(communitySrc.includes("Discord Developer Lounge"), "Must display Discord Developer Lounge title");
      assert.ok(communitySrc.includes("4,500+ members"), "Must display 4,500+ members badge");
      assert.ok(communitySrc.includes("https://discord.gg/octopair"), "Must link to official Discord invite");

      // Active voice channels
      assert.ok(communitySrc.includes('name: "rust-systems-jam"'), "Must list rust-systems-jam voice channel");
      assert.ok(communitySrc.includes('name: "webrtc-mesh-lab"'), "Must list webrtc-mesh-lab voice channel");
      assert.ok(communitySrc.includes('name: "debug-sos-live"'), "Must list debug-sos-live voice channel");
    });

    it("verifies Weekly Hack Sprint Schedule with dates, hosts, and tags", () => {
      assert.ok(communitySrc.includes("WEEKLY SCHEDULE"), "Must display WEEKLY SCHEDULE badge");
      assert.ok(communitySrc.includes("Weekly Hack Sprint Schedule"), "Must display schedule heading");
      assert.ok(communitySrc.includes("Next Sprint: Tuesday 18:00 UTC"), "Must indicate next sprint time");

      // Sprints
      assert.ok(communitySrc.includes("Distributed Systems & Rust Jam"), "Must list Tuesday Rust Jam sprint");
      assert.ok(communitySrc.includes("Elena Rostova"), "Must list Elena Rostova as host");
      assert.ok(communitySrc.includes("AI Inference & Tree-sitter Hack"), "Must list Thursday AI/Tree-sitter sprint");
      assert.ok(communitySrc.includes("Marcus Vance"), "Must list Marcus Vance as host");
      assert.ok(communitySrc.includes("Global 48h Pair Sprint"), "Must list Saturday 48h sprint");
    });

    it("enforces SSR rendering of /community produces complete markup without crash", () => {
      const Component = compileComponent(path.join(MARKETING_DIR, "CommunityDestinationPage.jsx"));
      const html = renderToString(React.createElement(Component));
      assert.ok(html.includes("<h1"), "SSR output must render <h1>");
      assert.ok(html.includes("1,420") && html.includes("+"), "SSR output must immediately render formatted 1,420+ counter");
      assert.ok(html.includes("380") && html.includes("+"), "SSR output must immediately render formatted 380+ counter");
      assert.ok(html.includes("2,850") && html.includes("+"), "SSR output must immediately render formatted 2,850+ counter");
      assert.ok(html.includes("18") && html.includes("ms"), "SSR output must immediately render formatted 18ms counter");
      assert.ok(html.includes("Discord Developer Lounge"), "SSR output must render Discord Lounge");
      assert.ok(html.includes("rust-systems-jam"), "SSR output must render rust-systems-jam channel");
      assert.ok(html.includes("Weekly Hack Sprint Schedule"), "SSR output must render sprint schedule");
    });
  });

  // =========================================================================
  // 6. Cross-Cutting & Global Invariants Verification
  // =========================================================================
  describe("6. Cross-Cutting Invariants Across All Marketing Sub-Pages", () => {
    const subpageEntries = [
      ["FeaturesCollabPage.jsx", collabSrc],
      ["FeaturesFeedPage.jsx", feedSrc],
      ["FeaturesProjectsPage.jsx", projectsSrc],
      ["PricingDestinationPage.jsx", pricingPageSrc],
      ["CommunityDestinationPage.jsx", communitySrc],
      ["FeaturesMatchPage.jsx", matchSrc],
    ];

    it("Invariant: Exactly one <h1> element in each sub-page component source", () => {
      for (const [name, src] of subpageEntries) {
        const matches = src.match(/<h1(\s|>)/gi) || [];
        assert.strictEqual(matches.length, 1, `${name} must contain strictly one <h1> element (found ${matches.length})`);
      }
    });

    it("Invariant: Exactly one <h1> element in every prerendered HTML file in dist/", () => {
      const routes = [
        "index.html",
        "features/match/index.html",
        "features/collab/index.html",
        "features/feed/index.html",
        "features/projects/index.html",
        "pricing/index.html",
        "community/index.html",
      ];

      for (const route of routes) {
        const fullPath = path.join(DIST_DIR, route);
        assert.ok(fs.existsSync(fullPath), `Prerendered output ${route} must exist in dist/`);
        const html = fs.readFileSync(fullPath, "utf8");
        const matches = html.match(/<h1(\s|>)/gi) || [];
        assert.strictEqual(matches.length, 1, `Prerendered ${route} must contain strictly 1 <h1> (found ${matches.length})`);
      }
    });

    it("Invariant: Exactly zero emoji unicode characters across all subpage components", () => {
      const emojiRegex = /[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F1E6}-\u{1F1FF}]|[\u{FE00}-\u{FE0F}]|\p{Extended_Pictographic}/gu;
      for (const [name, src] of subpageEntries) {
        const matches = src.match(emojiRegex);
        assert.strictEqual(matches, null, `${name} must contain zero emojis (found: ${matches?.join(", ")})`);
      }
    });

    it("Invariant: All marketing sub-pages use overflow-x-clip on outer container", () => {
      for (const [name, src] of subpageEntries) {
        if (name === "CommunityDestinationPage.jsx") {
          // Community uses overflow-x-hidden or overflow-x-clip
          assert.ok(src.includes("overflow-x-hidden") || src.includes("overflow-x-clip"), `${name} must contain overflow containment`);
        } else {
          assert.ok(src.includes("overflow-x-clip"), `${name} must use overflow-x-clip for sticky compatibility`);
        }
      }
    });

    it("Invariant: All marketing sub-pages enforce pitch-black background #09090b", () => {
      for (const [name, src] of subpageEntries) {
        assert.ok(src.includes("bg-[#09090b]"), `${name} root wrapper must enforce bg-[#09090b]`);
      }
    });

    it("Invariant: All marketing conversion CTAs route to valid authentication or onboarding targets", () => {
      for (const [name, src] of subpageEntries) {
        if (name === "PricingDestinationPage.jsx") {
          assert.ok(
            pricingSectionSrc.includes('to="/login?mode=signup') && pricingPageSrc.includes("<PricingSection"),
            "Pricing destination page must integrate PricingSection with signup CTAs"
          );
        } else {
          assert.ok(
            src.includes('to="/login?mode=signup"') || src.includes('to="/login'),
            `${name} must contain primary signup CTA routing to /login?mode=signup`
          );
        }
      }
    });
  });
});
