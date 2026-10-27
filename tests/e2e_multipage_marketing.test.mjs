import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MARKETING_ROUTES } from "../scripts/prerender.mjs";

const FRONTEND_DIR = path.resolve(process.cwd());
const SRC_DIR = path.join(FRONTEND_DIR, "src");
const DIST_DIR = path.join(FRONTEND_DIR, "dist");
const PAGES_DIR = path.join(SRC_DIR, "pages", "marketing");
const COMPONENTS_DIR = path.join(SRC_DIR, "components");
const LANDING_DIR = path.join(COMPONENTS_DIR, "landing");

// Helpers to read files
const readSrc = (relative) => fs.readFileSync(path.join(SRC_DIR, relative), "utf-8");
const readDist = (relative) => fs.readFileSync(path.join(DIST_DIR, relative), "utf-8");

describe("E2E Acceptance Test Suite: Multi-Page Antigravity Marketing Architecture", () => {
  const appSrc = readSrc("App.jsx");
  const landingPageSrc = readSrc("components/LandingPage.jsx");
  const landingShellSrc = readSrc("components/landing/LandingShell.jsx");
  const landingNavSrc = readSrc("components/landing/LandingNav.jsx");
  const landingFooterSrc = readSrc("components/landing/LandingFooter.jsx");
  const teasersSrc = readSrc("components/landing/FeatureTeasersSection.jsx");
  const heroSrc = readSrc("components/landing/HeroSection.jsx");

  const subPages = [
    { name: "FeaturesMatchPage.jsx", route: "/features/match" },
    { name: "FeaturesCollabPage.jsx", route: "/features/collab" },
    { name: "FeaturesFeedPage.jsx", route: "/features/feed" },
    { name: "FeaturesProjectsPage.jsx", route: "/features/projects" },
    { name: "PricingDestinationPage.jsx", route: "/pricing" },
    { name: "CommunityDestinationPage.jsx", route: "/community" },
  ];

  const subPageSources = subPages.map((p) => ({
    ...p,
    src: readSrc(path.join("pages", "marketing", p.name)),
  }));

  // ───────────────────────────────────────────────────────────────────────────
  // SUITE 1: Critical Architectural Invariants
  // ───────────────────────────────────────────────────────────────────────────
  describe("Invariant Verification: Semantic Standards, No Redux, No Emojis, No Leakage", () => {
    it("Single <h1> Invariant: Exactly one <h1> on root / in HeroSection.jsx; zero <h1> on sub-pages or teasers", () => {
      // HeroSection must have the single semantic <h1>
      assert.ok(heroSrc.includes("<h1"), "HeroSection.jsx must contain the single <h1> headline for root /");

      // LandingPage and FeatureTeasersSection must have zero <h1>
      assert.ok(!landingPageSrc.includes("<h1"), "LandingPage.jsx must not contain any <h1> tags");
      assert.ok(!teasersSrc.includes("<h1"), "FeatureTeasersSection.jsx must not contain any <h1> tags");

      // Shell, Nav, and Footer must have zero <h1>
      assert.ok(!landingShellSrc.includes("<h1"), "LandingShell.jsx must not contain <h1>");
      assert.ok(!landingNavSrc.includes("<h1"), "LandingNav.jsx must not contain <h1>");
      assert.ok(!landingFooterSrc.includes("<h1"), "LandingFooter.jsx must not contain <h1>");

      // All 6 marketing sub-pages must use semantic <h2>, never <h1>
      for (const { name, src } of subPageSources) {
        assert.ok(!src.includes("<h1"), `${name} must not contain <h1> tags (single <h1> preserved on root)`);
        assert.ok(src.includes("<h2"), `${name} must use semantic <h2> for hero title`);
      }
    });

    it("Emoji-Free Invariant: Exactly zero unicode emojis in any marketing component or page", () => {
      const emojiRegex = /[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]/gu;
      const filesToCheck = [
        { name: "App.jsx", src: appSrc },
        { name: "LandingPage.jsx", src: landingPageSrc },
        { name: "LandingShell.jsx", src: landingShellSrc },
        { name: "LandingNav.jsx", src: landingNavSrc },
        { name: "LandingFooter.jsx", src: landingFooterSrc },
        { name: "FeatureTeasersSection.jsx", src: teasersSrc },
        ...subPageSources,
      ];

      for (const { name, src } of filesToCheck) {
        assert.ok(!emojiRegex.test(src), `${name} contains forbidden emoji characters`);
      }
    });

    it("Decoupled Marketing Pages: Zero Redux dependencies in marketing sub-pages or teasers", () => {
      const reduxFiles = [
        { name: "FeatureTeasersSection.jsx", src: teasersSrc },
        ...subPageSources,
      ];

      for (const { name, src } of reduxFiles) {
        assert.ok(!src.includes("useSelector"), `${name} must not use useSelector`);
        assert.ok(!src.includes("useDispatch"), `${name} must not use useDispatch`);
        assert.ok(!src.includes("react-redux"), `${name} must not import from react-redux`);
      }
    });

    it("Route Safety: Zero references to forbidden internal routes (/discover, /sandbox, /profile/:id)", () => {
      const filesToCheck = [
        { name: "LandingPage.jsx", src: landingPageSrc },
        { name: "LandingShell.jsx", src: landingShellSrc },
        { name: "LandingNav.jsx", src: landingNavSrc },
        { name: "LandingFooter.jsx", src: landingFooterSrc },
        { name: "FeatureTeasersSection.jsx", src: teasersSrc },
        ...subPageSources,
      ];

      for (const { name, src } of filesToCheck) {
        assert.ok(!src.includes('"/discover"'), `${name} must not link to /discover`);
        assert.ok(!src.includes("'/discover'"), `${name} must not link to /discover`);
        assert.ok(!src.includes('"/sandbox"'), `${name} must not link to /sandbox`);
        assert.ok(!src.includes("'/sandbox'"), `${name} must not link to /sandbox`);
        assert.ok(!src.includes('"/profile/'), `${name} must not link to /profile/:id`);
        assert.ok(!src.includes("'/profile/"), `${name} must not link to /profile/:id`);
      }
    });

    it("All marketing signup CTAs route strictly to /login", () => {
      for (const { name, src } of subPageSources) {
        assert.ok(
          src.includes('/login?mode=signup') || src.includes('/login'),
          `${name} must route CTAs to /login`
        );
      }
    });

    it("Bundle Isolation: Zero imports of heavy editor engines (@codesandbox, @monaco-editor) in marketing pages", () => {
      const marketingFiles = [
        { name: "LandingPage.jsx", src: landingPageSrc },
        { name: "FeatureTeasersSection.jsx", src: teasersSrc },
        ...subPageSources,
      ];

      for (const { name, src } of marketingFiles) {
        assert.ok(!src.includes("@codesandbox"), `${name} must not import Sandpack`);
        assert.ok(!src.includes("@monaco-editor"), `${name} must not import Monaco`);
      }
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SUITE 2: AC1 — Production Build & Static Prerendering
  // ───────────────────────────────────────────────────────────────────────────
  describe("AC1: Production Build & Multi-Route Static Prerendering", () => {
    it("dist directory contains prerendered HTML files for all 7 marketing paths", () => {
      assert.ok(fs.existsSync(DIST_DIR), "dist directory must exist");

      for (const route of MARKETING_ROUTES) {
        const filePath = path.join(DIST_DIR, route.outputPath);
        assert.ok(
          fs.existsSync(filePath),
          `Static prerendered file missing: dist/${route.outputPath} for route ${route.path}`
        );
      }
    });

    it("each prerendered HTML file contains tailored SEO title and meta description", () => {
      for (const route of MARKETING_ROUTES) {
        const fileContent = readDist(route.outputPath);

        // Check tailored title
        assert.ok(
          fileContent.includes(`<title>${route.title}</title>`),
          `dist/${route.outputPath} must contain title "${route.title}"`
        );

        // Check tailored meta description
        assert.ok(
          fileContent.includes(`name="description" content="${route.description}"`),
          `dist/${route.outputPath} must contain tailored meta description`
        );

        // Check OpenGraph and Twitter tags
        assert.ok(
          fileContent.includes(`property="og:title" content="${route.title}"`),
          `dist/${route.outputPath} must contain og:title`
        );
        assert.ok(
          fileContent.includes(`name="twitter:title" content="${route.title}"`),
          `dist/${route.outputPath} must contain twitter:title`
        );
      }
    });

    it("each prerendered HTML file contains injected SSR markup inside #root", () => {
      for (const route of MARKETING_ROUTES) {
        const fileContent = readDist(route.outputPath);
        assert.ok(
          !fileContent.includes('<div id="root"></div>'),
          `dist/${route.outputPath} must not have empty <div id="root"></div>`
        );
        assert.ok(
          fileContent.includes('<div id="root"><div class="w-full min-h-screen'),
          `dist/${route.outputPath} must have SSR shell markup injected inside #root`
        );
        assert.ok(
          fileContent.includes(route.eyebrow),
          `dist/${route.outputPath} must contain route eyebrow badge "${route.eyebrow}"`
        );
      }
    });

    it("prerendered HTML on root has single <h1>; prerendered sub-pages have zero <h1>", () => {
      const rootHtml = readDist("index.html");
      const rootH1Matches = rootHtml.match(/<h1[^>]*>/g) || [];
      assert.equal(rootH1Matches.length, 1, "dist/index.html must contain exactly one <h1>");

      for (const route of MARKETING_ROUTES) {
        if (!route.isRoot) {
          const subHtml = readDist(route.outputPath);
          const subH1Matches = subHtml.match(/<h1[^>]*>/g) || [];
          assert.equal(
            subH1Matches.length,
            0,
            `dist/${route.outputPath} must contain zero <h1> tags`
          );
          assert.ok(
            subHtml.includes("<h2"),
            `dist/${route.outputPath} must use semantic <h2> tag`
          );
        }
      }
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SUITE 3: AC2 — Root `/` Streamlined 5-Section Hub
  // ───────────────────────────────────────────────────────────────────────────
  describe("AC2: Root / Streamlined 5-Section Hub", () => {
    it("assembles exactly the 5 focused sections in sequential order", () => {
      assert.ok(landingPageSrc.includes("<HeroSection"), "LandingPage must include HeroSection");
      assert.ok(landingPageSrc.includes("<TechMarquee"), "LandingPage must include TechMarquee");
      assert.ok(landingPageSrc.includes("<FeatureTeasersSection"), "LandingPage must include FeatureTeasersSection");
      assert.ok(landingPageSrc.includes("<PositioningBand"), "LandingPage must include PositioningBand");
      assert.ok(landingPageSrc.includes("<FinalCtaSection"), "LandingPage must include FinalCtaSection");

      const heroPos = landingPageSrc.indexOf("<HeroSection");
      const marqueePos = landingPageSrc.indexOf("<TechMarquee");
      const teasersPos = landingPageSrc.indexOf("<FeatureTeasersSection");
      const positioningPos = landingPageSrc.indexOf("<PositioningBand");
      const ctaPos = landingPageSrc.indexOf("<FinalCtaSection");

      assert.ok(heroPos < marqueePos, "HeroSection must precede TechMarquee");
      assert.ok(marqueePos < teasersPos, "TechMarquee must precede FeatureTeasersSection");
      assert.ok(teasersPos < positioningPos, "FeatureTeasersSection must precede PositioningBand");
      assert.ok(positioningPos < ctaPos, "PositioningBand must precede FinalCtaSection");
    });

    it("strictly eliminates the 11 buried sections from root LandingPage.jsx", () => {
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
          `<${section} /> must not be rendered on root LandingPage.jsx`
        );
        assert.ok(
          !landingPageSrc.includes(`import ${section}`),
          `Import for ${section} must not be present in LandingPage.jsx`
        );
      }
    });

    it("preserves synchronous isAuthHint multi-key evaluation and /feed redirect", () => {
      assert.ok(landingPageSrc.includes("octopair_auth_hint"), "Must check octopair_auth_hint");
      assert.ok(landingPageSrc.includes("devtinder_auth_hint"), "Must check devtinder_auth_hint");
      assert.ok(landingPageSrc.includes("octopair_auth"), "Must check octopair_auth");
      assert.ok(landingPageSrc.includes("devtinder_auth"), "Must check devtinder_auth");
      assert.ok(landingPageSrc.includes('to="/feed"'), "Must redirect authenticated users to /feed");
    });

    it("FeatureTeasersSection links to all 4 feature sub-pages with rich previews", () => {
      assert.ok(teasersSrc.includes('/features/match'), "Must link to /features/match");
      assert.ok(teasersSrc.includes('/features/collab'), "Must link to /features/collab");
      assert.ok(teasersSrc.includes('/features/feed'), "Must link to /features/feed");
      assert.ok(teasersSrc.includes('/features/projects'), "Must link to /features/projects");

      assert.ok(teasersSrc.includes("98% Match"), "Must render 98% Match compatibility preview");
      assert.ok(teasersSrc.includes("P2P Mesh") || teasersSrc.includes("sub-50ms"), "Must render low-latency collaboration preview");
      assert.ok(teasersSrc.includes("Sandboxed Runtime") || teasersSrc.includes("SYS_DEBUG_SOS"), "Must render runtime/SOS preview");
      assert.ok(teasersSrc.includes("Open Sprints") || teasersSrc.includes("octopair/p2p-mesh"), "Must render repo showcase preview");
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SUITE 4: AC3, AC4, AC5 — Multi-Page Routing & Lazy Loading in App.jsx
  // ───────────────────────────────────────────────────────────────────────────
  describe("AC3, AC4, AC5: Multi-Page Routing, Lazy Loading & Navigation Integration", () => {
    it("App.jsx lazy-loads LandingShell, LandingPage, and all 6 marketing sub-pages", () => {
      assert.ok(
        appSrc.includes('const LandingShell = lazy(() => import("./components/landing/LandingShell"))'),
        "LandingShell must be lazy-loaded in App.jsx"
      );
      assert.ok(
        appSrc.includes('const LandingPage = lazy(() => import("./components/LandingPage"))'),
        "LandingPage must be lazy-loaded in App.jsx"
      );
      assert.ok(
        appSrc.includes('const FeaturesMatchPage = lazy(() => import("./pages/marketing/FeaturesMatchPage"))'),
        "FeaturesMatchPage must be lazy-loaded in App.jsx"
      );
      assert.ok(
        appSrc.includes('const FeaturesCollabPage = lazy(() => import("./pages/marketing/FeaturesCollabPage"))'),
        "FeaturesCollabPage must be lazy-loaded in App.jsx"
      );
      assert.ok(
        appSrc.includes('const FeaturesFeedPage = lazy(() => import("./pages/marketing/FeaturesFeedPage"))'),
        "FeaturesFeedPage must be lazy-loaded in App.jsx"
      );
      assert.ok(
        appSrc.includes('const FeaturesProjectsPage = lazy(() => import("./pages/marketing/FeaturesProjectsPage"))'),
        "FeaturesProjectsPage must be lazy-loaded in App.jsx"
      );
      assert.ok(
        appSrc.includes('const PricingDestinationPage = lazy(() => import("./pages/marketing/PricingDestinationPage"))'),
        "PricingDestinationPage must be lazy-loaded in App.jsx"
      );
      assert.ok(
        appSrc.includes('const CommunityDestinationPage = lazy(() => import("./pages/marketing/CommunityDestinationPage"))'),
        "CommunityDestinationPage must be lazy-loaded in App.jsx"
      );
    });

    it("App.jsx registers all 7 marketing routes under <Route element={<LandingShell />}>", () => {
      assert.ok(appSrc.includes("<Route element={<LandingShell />}>"), "Routes must contain <Route element={<LandingShell />}>");

      assert.ok(appSrc.includes('<Route path="/" element={<LandingPage />} />'), "Must register / -> LandingPage");
      assert.ok(appSrc.includes('<Route path="/features/match" element={<FeaturesMatchPage />} />'), "Must register /features/match");
      assert.ok(appSrc.includes('<Route path="/features/collab" element={<FeaturesCollabPage />} />'), "Must register /features/collab");
      assert.ok(appSrc.includes('<Route path="/features/feed" element={<FeaturesFeedPage />} />'), "Must register /features/feed");
      assert.ok(appSrc.includes('<Route path="/features/projects" element={<FeaturesProjectsPage />} />'), "Must register /features/projects");
      assert.ok(appSrc.includes('<Route path="/pricing" element={<PricingDestinationPage />} />'), "Must register /pricing");
      assert.ok(appSrc.includes('<Route path="/community" element={<CommunityDestinationPage />} />'), "Must register /community");
    });

    it("LandingNav.jsx defines desktop mega-menu with all 4 feature sub-page cards", () => {
      assert.ok(landingNavSrc.includes('FEATURE_DROPDOWN_ITEMS'), "LandingNav must define FEATURE_DROPDOWN_ITEMS");
      assert.ok(landingNavSrc.includes('"/features/match"'), "Features dropdown must contain /features/match");
      assert.ok(landingNavSrc.includes('"/features/collab"'), "Features dropdown must contain /features/collab");
      assert.ok(landingNavSrc.includes('"/features/feed"'), "Features dropdown must contain /features/feed");
      assert.ok(landingNavSrc.includes('"/features/projects"'), "Features dropdown must contain /features/projects");

      // Verify keyboard escape and outside click handlers
      assert.ok(landingNavSrc.includes("handleKeyDown"), "LandingNav must handle Escape key for dropdown");
      assert.ok(landingNavSrc.includes("handleClickOutside"), "LandingNav must handle click outside for dropdown");
    });

    it("LandingNav.jsx renders direct top-level links to Pricing and Community", () => {
      assert.ok(
        landingNavSrc.includes('to="/pricing"'),
        "LandingNav must contain top-level link to /pricing"
      );
      assert.ok(
        landingNavSrc.includes('to="/community"'),
        "LandingNav must contain top-level link to /community"
      );
    });

    it("LandingFooter.jsx renders canonical multi-page links to all marketing destinations", () => {
      assert.ok(landingFooterSrc.includes('"/features/match"'), "LandingFooter must link to /features/match");
      assert.ok(landingFooterSrc.includes('"/features/collab"'), "LandingFooter must link to /features/collab");
      assert.ok(landingFooterSrc.includes('"/features/feed"'), "LandingFooter must link to /features/feed");
      assert.ok(landingFooterSrc.includes('"/features/projects"'), "LandingFooter must link to /features/projects");
      assert.ok(landingFooterSrc.includes('"/pricing"'), "LandingFooter must link to /pricing");
      assert.ok(landingFooterSrc.includes('"/community"'), "LandingFooter must link to /community");
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SUITE 5: AC6 — In-App Authenticated & Standalone Routes Preservation
  // ───────────────────────────────────────────────────────────────────────────
  describe("AC6: In-App Authenticated & Standalone Routes Intact (Zero Regressions)", () => {
    it("App.jsx retains all authenticated in-app routes under <Route element={<Body />}>", () => {
      assert.ok(appSrc.includes("<Route element={<Body />}>"), "Must retain <Route element={<Body />}>");

      const authRoutes = [
        '<Route path="/feed" element={<Feed />} />',
        '<Route path="/discover" element={<Discover />} />',
        '<Route path="/network" element={<NetworkPage />} />',
        '<Route path="/connections" element={<ConnectionsPage />} />',
        '<Route path="/requests" element={<RequestPage />} />',
        '<Route path="/profile" element={<Profile />} />',
        '<Route path="/premium" element={<Premium />} />',
        '<Route path="/chat" element={<Chat />} />',
        '<Route path="/chat/:targetId" element={<Chat />} />',
        '<Route path="/projects" element={<MyProjects />} />',
        '<Route path="/user/:userId" element={<UserProfilePage />} />',
        '<Route path="/project/:postId/requests" element={<ProjectRequests />} />',
      ];

      for (const routeStr of authRoutes) {
        assert.ok(appSrc.includes(routeStr), `Authenticated route missing: ${routeStr}`);
      }
    });

    it("App.jsx retains standalone public, auth, and preview routes intact", () => {
      const standaloneRoutes = [
        '<Route path="/login" element={<Login />} />',
        '<Route path="/privacy" element={<PrivacyPage />} />',
        '<Route path="/terms" element={<TermsPage />} />',
        '<Route path="/onboarding" element={<Onboarding />} />',
        '<Route path="/sandbox/:roomId" element={<Sandbox />} />',
        '<Route path="/project/room/:roomId" element={<ProjectRoom />} />',
        '<Route path="/project/preview/:roomId" element={<FullscreenPreview />} />',
        '<Route path="*" element={<NotFoundPage />} />',
      ];

      for (const routeStr of standaloneRoutes) {
        assert.ok(appSrc.includes(routeStr), `Standalone route missing: ${routeStr}`);
      }
    });
  });
});
