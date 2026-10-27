import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

const FRONTEND_DIR = path.resolve(process.cwd(), "src");
const COMPONENTS_DIR = path.join(FRONTEND_DIR, "components");
const LANDING_DIR = path.join(COMPONENTS_DIR, "landing");

const readComponent = (file) => fs.readFileSync(path.join(COMPONENTS_DIR, file), "utf-8");
const readLanding = (file) => fs.readFileSync(path.join(LANDING_DIR, file), "utf-8");

describe("Milestone 3 — Streamlined Main Hub (/) & Feature Teaser Grid", () => {
  const landingPageSrc = readComponent("LandingPage.jsx");
  const teasersSrc = readLanding("FeatureTeasersSection.jsx");
  const heroSrc = readLanding("HeroSection.jsx");

  describe("Critical Architectural Invariants", () => {
    it("Invariant: Exactly zero <h1> elements in LandingPage.jsx and FeatureTeasersSection.jsx (single <h1> preserved for HeroSection.jsx)", () => {
      assert.ok(!landingPageSrc.includes("<h1"), "LandingPage.jsx must not contain any <h1> tags");
      assert.ok(!teasersSrc.includes("<h1"), "FeatureTeasersSection.jsx must not contain any <h1> tags");
      assert.ok(heroSrc.includes("<h1"), "HeroSection.jsx must contain the single semantic <h1> on root /");
    });

    it("Invariant: Exactly zero emoji characters in M3 components", () => {
      const emojiRegex = /[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]/gu;
      assert.ok(!emojiRegex.test(landingPageSrc), "LandingPage.jsx must not contain emoji characters");
      assert.ok(!emojiRegex.test(teasersSrc), "FeatureTeasersSection.jsx must not contain emoji characters");
    });

    it("Invariant: Exactly zero Redux dependencies in FeatureTeasersSection.jsx", () => {
      assert.ok(!teasersSrc.includes("useSelector"), "FeatureTeasersSection.jsx must not use useSelector");
      assert.ok(!teasersSrc.includes("useDispatch"), "FeatureTeasersSection.jsx must not use useDispatch");
      assert.ok(!teasersSrc.includes("react-redux"), "FeatureTeasersSection.jsx must not import react-redux");
    });

    it("Invariant: Zero forbidden route links (/discover, /sandbox, /profile/:id)", () => {
      const files = [
        { name: "LandingPage.jsx", src: landingPageSrc },
        { name: "FeatureTeasersSection.jsx", src: teasersSrc },
      ];
      for (const { name, src } of files) {
        assert.ok(!src.includes('"/discover"'), `${name} must not link to /discover`);
        assert.ok(!src.includes("'/discover'"), `${name} must not link to /discover`);
        assert.ok(!src.includes('"/sandbox"'), `${name} must not link to /sandbox`);
        assert.ok(!src.includes("'/sandbox'"), `${name} must not link to /sandbox`);
        assert.ok(!src.includes('"/profile/'), `${name} must not link to /profile/:id`);
        assert.ok(!src.includes("'/profile/"), `${name} must not link to /profile/:id`);
      }
    });

    it("Invariant: Zero heavy IDE packages (Sandpack, Monaco) imported in M3 components", () => {
      assert.ok(!landingPageSrc.includes("@codesandbox"), "LandingPage.jsx must not import Sandpack");
      assert.ok(!landingPageSrc.includes("@monaco-editor"), "LandingPage.jsx must not import Monaco");
      assert.ok(!teasersSrc.includes("@codesandbox"), "FeatureTeasersSection.jsx must not import Sandpack");
      assert.ok(!teasersSrc.includes("@monaco-editor"), "FeatureTeasersSection.jsx must not import Monaco");
    });
  });

  describe("LandingPage.jsx Specification: Streamlined 5 Sections", () => {
    it("assembles exactly the 5 focused sections in sequential order", () => {
      assert.ok(landingPageSrc.includes("<HeroSection"), "Must mount <HeroSection />");
      assert.ok(landingPageSrc.includes("<TechMarquee"), "Must mount <TechMarquee />");
      assert.ok(landingPageSrc.includes("<FeatureTeasersSection"), "Must mount <FeatureTeasersSection />");
      assert.ok(landingPageSrc.includes("<PositioningBand"), "Must mount <PositioningBand />");
      assert.ok(landingPageSrc.includes("<FinalCtaSection"), "Must mount <FinalCtaSection />");

      // Verify sequence order
      const heroIdx = landingPageSrc.indexOf("<HeroSection");
      const marqueeIdx = landingPageSrc.indexOf("<TechMarquee");
      const teasersIdx = landingPageSrc.indexOf("<FeatureTeasersSection");
      const positioningIdx = landingPageSrc.indexOf("<PositioningBand");
      const ctaIdx = landingPageSrc.indexOf("<FinalCtaSection");

      assert.ok(heroIdx < marqueeIdx, "HeroSection must precede TechMarquee");
      assert.ok(marqueeIdx < teasersIdx, "TechMarquee must precede FeatureTeasersSection");
      assert.ok(teasersIdx < positioningIdx, "FeatureTeasersSection must precede PositioningBand");
      assert.ok(positioningIdx < ctaIdx, "PositioningBand must precede FinalCtaSection");
    });

    it("strictly removes the buried 11 sections migrated to dedicated sub-pages", () => {
      const buriedSections = [
        "HowItWorksSection",
        "DeveloperMatchingSection",
        "InteractiveFeedSnippetSection",
        "RoomFeaturesSection",
        "ProfileShowcaseBand",
        "FeatureBentoGrid",
        "WatchSessionSection",
        "CommunityBand",
        "ShowcaseBand",
        "PricingSection",
        "FaqSection",
      ];

      for (const section of buriedSections) {
        assert.ok(
          !landingPageSrc.includes(`<${section}`),
          `Buried section <${section} /> must be removed from root / LandingPage.jsx`
        );
        assert.ok(
          !landingPageSrc.includes(`import ${section}`),
          `Import for buried section ${section} must be removed from LandingPage.jsx`
        );
      }
    });

    it("wraps sections cleanly in LandingShell layout container", () => {
      assert.ok(landingPageSrc.includes("<LandingShell"), "LandingPage must wrap in LandingShell");
      assert.ok(landingPageSrc.includes("import LandingShell"), "LandingPage must import LandingShell");
      // LandingNav and LandingFooter must not be rendered redundantly inside LandingPage
      assert.ok(!landingPageSrc.includes("<LandingNav"), "LandingNav must be hosted in LandingShell, not LandingPage");
      assert.ok(!landingPageSrc.includes("<LandingFooter"), "LandingFooter must be hosted in LandingShell, not LandingPage");
    });

    it("retains synchronous isAuthHint check with all storage keys and /feed redirect", () => {
      assert.ok(landingPageSrc.includes("octopair_auth_hint"), "Must check octopair_auth_hint");
      assert.ok(landingPageSrc.includes("devtinder_auth_hint"), "Must check devtinder_auth_hint");
      assert.ok(landingPageSrc.includes("octopair_auth"), "Must check octopair_auth");
      assert.ok(landingPageSrc.includes("devtinder_auth"), "Must check devtinder_auth");
      assert.ok(landingPageSrc.includes('to="/feed"'), "Must redirect authenticated developers to /feed");
    });

    it("enforces pitch-black theme void and 375px overflow containment", () => {
      assert.ok(landingPageSrc.includes("#09090b"), "Must use pitch-black void #09090b");
      assert.ok(landingPageSrc.includes("#f0f0f0"), "Must use near-white text #f0f0f0");
      assert.ok(landingPageSrc.includes("overflow-x-hidden"), "Must enforce overflow-x-hidden");
    });
  });

  describe("FeatureTeasersSection.jsx Specification: 4 Interactive Teaser Cards", () => {
    it("renders section header with eyebrow badge and semantic h2 title", () => {
      assert.ok(teasersSrc.includes("PLATFORM CAPABILITIES"), "Must render 'PLATFORM CAPABILITIES' eyebrow badge");
      assert.ok(
        teasersSrc.includes("Everything you need to ship, live"),
        "Must render section headline 'Everything you need to ship, live'"
      );
      assert.ok(teasersSrc.includes("<h2"), "Section headline must use semantic <h2> tag");
    });

    it("Card 1 (Swipe & Match): routes to /features/match with Sparkles, purple accent, and 98% Match preview", () => {
      assert.ok(teasersSrc.includes('/features/match'), "Must link to /features/match");
      assert.ok(teasersSrc.includes("Sparkles"), "Must render Sparkles icon");
      assert.ok(teasersSrc.includes("#b266ff"), "Must use purple accent #b266ff");
      assert.ok(
        teasersSrc.includes("Developer Discovery &amp; Matching") ||
        teasersSrc.includes("Developer Discovery & Matching"),
        "Must include title 'Developer Discovery & Matching'"
      );
      assert.ok(teasersSrc.includes("98% Match"), "Must render '98% Match' compatibility preview");
      assert.ok(teasersSrc.includes("Explore Matching →"), "Must render CTA button 'Explore Matching →'");
    });

    it("Card 2 (Live Multiplayer Room): routes to /features/collab with Terminal, lime accent, and sub-50ms sync preview", () => {
      assert.ok(teasersSrc.includes('/features/collab'), "Must link to /features/collab");
      assert.ok(teasersSrc.includes("Terminal"), "Must render Terminal icon");
      assert.ok(teasersSrc.includes("#ccff00"), "Must use lime accent #ccff00");
      assert.ok(
        teasersSrc.includes("Sub-50ms Live Collaboration"),
        "Must include title 'Sub-50ms Live Collaboration'"
      );
      assert.ok(
        teasersSrc.includes("18ms P2P Mesh") || teasersSrc.includes("sub-50ms"),
        "Must render low-latency collaboration preview"
      );
      assert.ok(teasersSrc.includes("Explore Collaboration →"), "Must render CTA button 'Explore Collaboration →'");
    });

    it("Card 3 (Developer Feed): routes to /features/feed with Code2, lime accent, and sandboxed runtime preview", () => {
      assert.ok(teasersSrc.includes('/features/feed'), "Must link to /features/feed");
      assert.ok(teasersSrc.includes("Code2"), "Must render Code2 icon");
      assert.ok(teasersSrc.includes("#ccff00"), "Must use lime accent #ccff00");
      assert.ok(
        teasersSrc.includes("Interactive Feed &amp; Debug SOS") ||
        teasersSrc.includes("Interactive Feed & Debug SOS"),
        "Must include title 'Interactive Feed & Debug SOS'"
      );
      assert.ok(teasersSrc.includes("SYS_DEBUG_SOS"), "Must include Debug SOS preview badge");
      assert.ok(teasersSrc.includes("Sandboxed Runtime"), "Must include Sandboxed Runtime preview");
      assert.ok(teasersSrc.includes("Explore Feed →"), "Must render CTA button 'Explore Feed →'");
    });

    it("Card 4 (Open Projects): routes to /features/projects with FolderGit2, purple accent, and repo showcase preview", () => {
      assert.ok(teasersSrc.includes('/features/projects'), "Must link to /features/projects");
      assert.ok(teasersSrc.includes("FolderGit2"), "Must render FolderGit2 icon");
      assert.ok(teasersSrc.includes("#b266ff"), "Must use purple accent #b266ff");
      assert.ok(
        teasersSrc.includes("Open Projects &amp; Sprints") ||
        teasersSrc.includes("Open Projects & Sprints"),
        "Must include title 'Open Projects & Sprints'"
      );
      assert.ok(
        teasersSrc.includes("octopair/p2p-mesh") || teasersSrc.includes("Open Sprints"),
        "Must render repository showcase preview"
      );
      assert.ok(teasersSrc.includes("Explore Projects →"), "Must render CTA button 'Explore Projects →'");
    });

    it("applies pitch-black surface, hairline borders, and hover elevation styles", () => {
      assert.ok(teasersSrc.includes("bg-[#111113]"), "Must use surface #111113 on cards");
      assert.ok(teasersSrc.includes("border-white/10"), "Must use hairline border border-white/10");
      assert.ok(teasersSrc.includes("hover:-translate-y-2"), "Must include hover elevation hover:-translate-y-2");
      assert.ok(teasersSrc.includes("duration-300"), "Must include smooth transition duration-300");
    });
  });
});
