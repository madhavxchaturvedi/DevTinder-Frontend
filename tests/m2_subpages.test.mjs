import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

const FRONTEND_DIR = path.resolve(process.cwd(), "src");
const MARKETING_DIR = path.join(FRONTEND_DIR, "pages/marketing");

const readPage = (file) => fs.readFileSync(path.join(MARKETING_DIR, file), "utf-8");

const SUBPAGE_FILES = [
  "FeaturesMatchPage.jsx",
  "FeaturesCollabPage.jsx",
  "FeaturesFeedPage.jsx",
  "FeaturesProjectsPage.jsx",
  "PricingDestinationPage.jsx",
  "CommunityDestinationPage.jsx",
];

describe("Milestone 2 — Dedicated Feature & Destination Sub-Pages", () => {
  const pages = SUBPAGE_FILES.map((filename) => ({
    filename,
    src: readPage(filename),
  }));

  const indexSrc = readPage("index.js");

  describe("Critical Architectural Invariants", () => {
    it("Invariant: Exactly zero <h1> tags across all 6 marketing sub-pages (single <h1> preserved for root /)", () => {
      for (const { filename, src } of pages) {
        assert.ok(
          !src.includes("<h1"),
          `${filename} must NOT contain any <h1> tags. Sub-page hero headers must use <h2>.`
        );
      }
    });

    it("Invariant: Exactly zero emoji characters across all 6 marketing sub-pages", () => {
      const emojiRegex = /[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]/gu;
      for (const { filename, src } of pages) {
        assert.ok(
          !emojiRegex.test(src),
          `${filename} must NOT contain emoji characters. Only Lucide SVG icons are permitted.`
        );
      }
    });

    it("Invariant: Exactly zero Redux dependencies across all marketing sub-pages", () => {
      for (const { filename, src } of pages) {
        assert.ok(!src.includes("useSelector"), `${filename} must not use useSelector`);
        assert.ok(!src.includes("useDispatch"), `${filename} must not use useDispatch`);
        assert.ok(!src.includes("react-redux"), `${filename} must not import from react-redux`);
      }
    });

    it("Invariant: Zero forbidden route links (/discover, /sandbox, /profile/:id)", () => {
      for (const { filename, src } of pages) {
        assert.ok(!src.includes('"/discover"'), `${filename} must not link to /discover`);
        assert.ok(!src.includes("'/discover'"), `${filename} must not link to /discover`);
        assert.ok(!src.includes('"/sandbox"'), `${filename} must not link to /sandbox`);
        assert.ok(!src.includes("'/sandbox'"), `${filename} must not link to /sandbox`);
        assert.ok(!src.includes('"/profile/'), `${filename} must not link to /profile/:id`);
        assert.ok(!src.includes("'/profile/"), `${filename} must not link to /profile/:id`);
      }
    });

    it("Invariant: All marketing CTAs route strictly to /login", () => {
      for (const { filename, src } of pages) {
        assert.ok(
          src.includes('to="/login'),
          `${filename} must contain CTA links routing to /login`
        );
      }
    });
  });

  describe("Clean Named & Default Exports in index.js", () => {
    it("exports all 6 marketing pages cleanly as named and default exports", () => {
      assert.ok(indexSrc.includes("export { default as FeaturesMatchPage } from \"./FeaturesMatchPage\";"));
      assert.ok(indexSrc.includes("export { default as FeaturesCollabPage } from \"./FeaturesCollabPage\";"));
      assert.ok(indexSrc.includes("export { default as FeaturesFeedPage } from \"./FeaturesFeedPage\";"));
      assert.ok(indexSrc.includes("export { default as FeaturesProjectsPage } from \"./FeaturesProjectsPage\";"));
      assert.ok(indexSrc.includes("export { default as PricingDestinationPage } from \"./PricingDestinationPage\";"));
      assert.ok(indexSrc.includes("export { default as CommunityDestinationPage } from \"./CommunityDestinationPage\";"));
      assert.ok(indexSrc.includes("export default"));
    });
  });

  describe("1. FeaturesMatchPage.jsx (/features/match)", () => {
    const src = readPage("FeaturesMatchPage.jsx");

    it("renders hero header with Sparkles eyebrow badge, semantic title, and breadcrumb link", () => {
      assert.ok(src.includes("Sparkles"), "Must import and render Sparkles icon");
      assert.ok(src.includes("SKILL-BASED MATCHMAKING"), "Must include eyebrow badge text");
      assert.ok(src.includes("Developer Discovery &amp; Matchmaking") || src.includes("Developer Discovery & Matchmaking"), "Must include hero title");
      assert.ok(src.includes("Back to Overview"), "Must include breadcrumb/back link to overview");
    });

    it("assembles PositioningBand, HowItWorksSection, DeveloperMatchingSection, and ProfileShowcaseBand", () => {
      assert.ok(src.includes("<PositioningBand"), "Must assemble PositioningBand");
      assert.ok(src.includes("<HowItWorksSection"), "Must assemble HowItWorksSection");
      assert.ok(src.includes("<DeveloperMatchingSection"), "Must assemble DeveloperMatchingSection");
      assert.ok(src.includes("<ProfileShowcaseBand"), "Must assemble ProfileShowcaseBand");
    });

    it("provides inter-feature CTA link to /features/collab and closing CTA to /login?mode=signup", () => {
      assert.ok(src.includes('/features/collab'), "Must link to next feature /features/collab");
      assert.ok(src.includes("Explore Live Collaboration"), "Must include 'Explore Live Collaboration' CTA text");
      assert.ok(src.includes("<FinalCtaSection") || src.includes('/login?mode=signup'), "Must render closing CTA banner");
    });
  });

  describe("2. FeaturesCollabPage.jsx (/features/collab)", () => {
    const src = readPage("FeaturesCollabPage.jsx");

    it("renders hero header with Terminal eyebrow badge, semantic title, and breadcrumb link", () => {
      assert.ok(src.includes("Terminal"), "Must import and render Terminal icon");
      assert.ok(src.includes("REAL-TIME MULTIPLAYER IDE"), "Must include eyebrow badge text");
      assert.ok(src.includes("Sub-50ms Live Collaboration"), "Must include hero title");
      assert.ok(src.includes("Back to Overview"), "Must include breadcrumb/back link");
    });

    it("assembles RoomFeaturesSection, FeatureBentoGrid, and WatchSessionSection", () => {
      assert.ok(src.includes("<RoomFeaturesSection"), "Must assemble RoomFeaturesSection");
      assert.ok(src.includes("<FeatureBentoGrid"), "Must assemble FeatureBentoGrid");
      assert.ok(src.includes("<WatchSessionSection"), "Must assemble WatchSessionSection");
    });

    it("provides inter-feature CTA link to /features/feed and closing CTA to /login?mode=signup", () => {
      assert.ok(src.includes('/features/feed'), "Must link to next feature /features/feed");
      assert.ok(src.includes("Explore Developer Feed"), "Must include 'Explore Developer Feed' CTA text");
      assert.ok(src.includes("<FinalCtaSection") || src.includes('/login?mode=signup'), "Must render closing CTA banner");
    });
  });

  describe("3. FeaturesFeedPage.jsx (/features/feed)", () => {
    const src = readPage("FeaturesFeedPage.jsx");

    it("renders hero header with Code2 eyebrow badge, semantic title, and breadcrumb link", () => {
      assert.ok(src.includes("Code2"), "Must import and render Code2 icon");
      assert.ok(src.includes("SOCIAL CODE FEED"), "Must include eyebrow badge text");
      assert.ok(src.includes("Interactive Code Feed &amp; Debug SOS") || src.includes("Interactive Code Feed & Debug SOS"), "Must include hero title");
      assert.ok(src.includes("Back to Overview"), "Must include breadcrumb/back link");
    });

    it("assembles InteractiveFeedSnippetSection", () => {
      assert.ok(src.includes("<InteractiveFeedSnippetSection"), "Must assemble InteractiveFeedSnippetSection");
    });

    it("provides inter-feature CTA link to /features/projects and closing CTA to /login?mode=signup", () => {
      assert.ok(src.includes('/features/projects'), "Must link to next feature /features/projects");
      assert.ok(src.includes("Explore Open Projects"), "Must include 'Explore Open Projects' CTA text");
      assert.ok(src.includes("<FinalCtaSection") || src.includes('/login?mode=signup'), "Must render closing CTA banner");
    });
  });

  describe("4. FeaturesProjectsPage.jsx (/features/projects)", () => {
    const src = readPage("FeaturesProjectsPage.jsx");

    it("renders hero header with FolderGit2 eyebrow badge, semantic title, and breadcrumb link", () => {
      assert.ok(src.includes("FolderGit2"), "Must import and render FolderGit2 icon");
      assert.ok(src.includes("CURATED CODEBASES"), "Must include eyebrow badge text");
      assert.ok(src.includes("Open Developer Projects &amp; Sprints") || src.includes("Open Developer Projects & Sprints"), "Must include hero title");
      assert.ok(src.includes("Back to Overview"), "Must include breadcrumb/back link");
    });

    it("assembles ShowcaseBand and provides graceful fallback showcase projects", () => {
      assert.ok(src.includes("<ShowcaseBand"), "Must assemble ShowcaseBand");
      assert.ok(src.includes("FALLBACK_SHOWCASE_PROJECTS"), "Must define graceful fallback showcase projects");
      assert.ok(src.includes("OctoMesh"), "Fallback projects must contain realistic engineering projects");
    });

    it("provides inter-feature CTA link to /pricing and closing CTA to /login?mode=signup", () => {
      assert.ok(src.includes('/pricing'), "Must link to next destination /pricing");
      assert.ok(src.includes("View Pricing Plans"), "Must include 'View Pricing Plans' CTA text");
      assert.ok(src.includes("<FinalCtaSection") || src.includes('/login?mode=signup'), "Must render closing CTA banner");
    });
  });

  describe("5. PricingDestinationPage.jsx (/pricing)", () => {
    const src = readPage("PricingDestinationPage.jsx");

    it("renders hero header with ShieldCheck eyebrow badge, semantic title, and breadcrumb link", () => {
      assert.ok(src.includes("ShieldCheck"), "Must import and render ShieldCheck icon");
      assert.ok(src.includes("TRANSPARENT PRICING"), "Must include eyebrow badge text");
      assert.ok(src.includes("Simple, Predictable Plans for Developers"), "Must include hero title");
      assert.ok(src.includes("Back to Overview"), "Must include breadcrumb/back link");
    });

    it("assembles PricingSection and FaqSection", () => {
      assert.ok(src.includes("<PricingSection"), "Must assemble PricingSection");
      assert.ok(src.includes("<FaqSection"), "Must assemble FaqSection");
    });

    it("provides closing CTA routing to /login?mode=signup", () => {
      assert.ok(src.includes("<FinalCtaSection") || src.includes('/login?mode=signup'), "Must render closing CTA banner");
    });
  });

  describe("6. CommunityDestinationPage.jsx (/community)", () => {
    const src = readPage("CommunityDestinationPage.jsx");

    it("renders hero header with Users eyebrow badge, semantic title, and breadcrumb link", () => {
      assert.ok(src.includes("Users"), "Must import and render Users icon");
      assert.ok(src.includes("BUILDER NETWORK"), "Must include eyebrow badge text");
      assert.ok(src.includes("Global Developer Telemetry &amp; Community") || src.includes("Global Developer Telemetry & Community"), "Must include hero title");
      assert.ok(src.includes("Back to Overview"), "Must include breadcrumb/back link");
    });

    it("assembles CommunityBand and provides fallback telemetry metrics", () => {
      assert.ok(src.includes("<CommunityBand"), "Must assemble CommunityBand");
      assert.ok(src.includes("FALLBACK_TELEMETRY_STATS"), "Must define fallback telemetry stats");
    });

    it("renders 3 highlight cards for developer telemetry, pairing sessions, and global reach", () => {
      assert.ok(src.includes("TELEMETRY // 01") || src.includes("Sub-50ms Global P2P Mesh"), "Must render developer telemetry card");
      assert.ok(src.includes("COLLABORATION // 02") || src.includes("Verified Proof of Work"), "Must render pairing sessions card");
      assert.ok(src.includes("NETWORK // 03") || src.includes("24/7 Builder Timezones"), "Must render global reach card");
    });

    it("provides closing CTA routing to /login?mode=signup", () => {
      assert.ok(src.includes("<FinalCtaSection") || src.includes('/login?mode=signup'), "Must render closing CTA banner");
    });
  });
});
