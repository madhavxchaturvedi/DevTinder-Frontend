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

// Polyfill window, localStorage & document for Node.js test environment
const mockStorage = {
  _store: {},
  getItem(key) { return this._store[key] || null; },
  setItem(key, val) { this._store[key] = String(val); },
  removeItem(key) { delete this._store[key]; },
  clear() { this._store = {}; },
};

if (typeof globalThis.window === "undefined") {
  globalThis.window = {
    location: { pathname: "/", search: "", href: "https://octopair.dev/" },
    matchMedia: () => ({ matches: false, addListener: () => {}, removeListener: () => {} }),
    localStorage: mockStorage,
    sessionStorage: mockStorage,
    addEventListener: () => {},
    removeEventListener: () => {},
  };
}

globalThis.localStorage = globalThis.window.localStorage || mockStorage;
globalThis.sessionStorage = globalThis.window.sessionStorage || mockStorage;

if (typeof globalThis.document === "undefined") {
  globalThis.document = {
    cookie: "",
    addEventListener: () => {},
    removeEventListener: () => {},
  };
}

// Component loader with configurable mocks
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
        Link: ({ to, children, ...props }) =>
          React.createElement("a", { href: to, ...props }, children),
        Outlet: () =>
          mocks.OutletSlot
            ? mocks.OutletSlot()
            : React.createElement("div", { "data-testid": "outlet" }, "Outlet"),
        useLocation: () => ({ pathname: mocks.pathname || "/" }),
        Navigate: ({ to }) =>
          React.createElement("div", { "data-navigate-to": to }, null),
      };
    }
    if (name === "react-redux") {
      return {
        useSelector: (fn) => (mocks.reduxStore ? fn(mocks.reduxStore) : null),
        useDispatch: () => () => {},
      };
    }
    if (name.includes("OctoPairLogo")) {
      return {
        OctoPairLogo: (props) =>
          React.createElement("svg", { "data-logo": "octopair", ...props }),
      };
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
    if (name.endsWith("/LandingShell") || name === "./LandingShell" || name === "./landing/LandingShell") {
      return loadTranspiled("components/landing/LandingShell.jsx", mocks);
    }
    if (name.endsWith("/LandingNav") || name === "./LandingNav" || name === "./landing/LandingNav") {
      return loadTranspiled("components/landing/LandingNav.jsx", mocks);
    }
    if (name.endsWith("/LandingFooter") || name === "./LandingFooter" || name === "./landing/LandingFooter") {
      return loadTranspiled("components/landing/LandingFooter.jsx", mocks);
    }
    // Mock child landing sections
    const base = path.basename(name).replace(/\.[^/.]+$/, "");
    const MockChild = (props) =>
      React.createElement("section", { "data-mock": base, ...props }, base);
    MockChild.displayName = base;
    return {
      __esModule: true,
      default: MockChild,
    };
  };

  const moduleExports = {};
  const fakeModule = { exports: moduleExports };
  const fn = new Function("require", "exports", "module", transformed.code);
  fn(fakeRequire, moduleExports, fakeModule);
  return fakeModule.exports;
};

describe("Adversarial Empirical Verification Suite: Milestone 4 Antigravity Architecture", () => {
  const appSrc = fs.readFileSync(path.join(SRC_DIR, "App.jsx"), "utf-8");
  const landingPageSrc = fs.readFileSync(path.join(SRC_DIR, "components/LandingPage.jsx"), "utf-8");
  const landingNavSrc = fs.readFileSync(path.join(SRC_DIR, "components/landing/LandingNav.jsx"), "utf-8");
  const landingShellSrc = fs.readFileSync(path.join(SRC_DIR, "components/landing/LandingShell.jsx"), "utf-8");

  // =========================================================================
  // Challenge 1: The Double LandingShell / Redundant Navbar & Footer Defect
  // =========================================================================
  describe("Challenge 1: Layout Shell Nesting & Duplicate Chrome Rendering", () => {
    it("EMPIRICAL DEFECT: LandingPage defaults wrapInShell=true while App.jsx wraps it under Route element={<LandingShell />}", () => {
      const LandingShell = loadTranspiled("components/landing/LandingShell.jsx").default;
      const LandingPage = loadTranspiled("components/LandingPage.jsx").default;

      // App.jsx specifies:
      // <Route element={<LandingShell />}>
      //   <Route path="/" element={<LandingPage />} />
      // </Route>
      //
      // In React Router, the parent Route renders LandingShell with Outlet rendering LandingPage.
      // Since App.jsx passes no wrapInShell prop, LandingPage({ wrapInShell = true }) defaults to true.
      const renderedAppRoute = renderToString(
        React.createElement(LandingShell, null, React.createElement(LandingPage))
      );

      const navCount = (renderedAppRoute.match(/<nav /g) || []).length;
      const footerCount = (renderedAppRoute.match(/<footer /g) || []).length;

      console.log(`[Empirical Evidence] Root / under LandingShell renders ${navCount} <nav> and ${footerCount} <footer>`);

      // Both should be 1 in a correct application. The duplicate shell defect causes 2 of each!
      assert.equal(navCount, 2, "Confirms bug: root / renders 2 <nav> elements due to nested LandingShell");
      assert.equal(footerCount, 2, "Confirms bug: root / renders 2 <footer> elements due to nested LandingShell");
    });

    it("Sub-pages do NOT suffer from double LandingShell because they omit wrapInShell and return plain divs", () => {
      const LandingShell = loadTranspiled("components/landing/LandingShell.jsx").default;
      const FeaturesMatchPage = loadTranspiled("pages/marketing/FeaturesMatchPage.jsx").default;

      const renderedSubpage = renderToString(
        React.createElement(LandingShell, null, React.createElement(FeaturesMatchPage))
      );

      const navCount = (renderedSubpage.match(/<nav /g) || []).length;
      const footerCount = (renderedSubpage.match(/<footer /g) || []).length;

      assert.equal(navCount, 1, "Sub-page correctly renders exactly 1 <nav>");
      assert.equal(footerCount, 1, "Sub-page correctly renders exactly 1 <footer>");
    });

    it("App.jsx fix validation: passing wrapInShell={false} to LandingPage resolves the duplicate chrome", () => {
      const LandingShell = loadTranspiled("components/landing/LandingShell.jsx").default;
      const LandingPage = loadTranspiled("components/LandingPage.jsx").default;

      const fixedRender = renderToString(
        React.createElement(LandingShell, null, React.createElement(LandingPage, { wrapInShell: false }))
      );

      const navCount = (fixedRender.match(/<nav /g) || []).length;
      const footerCount = (fixedRender.match(/<footer /g) || []).length;

      assert.equal(navCount, 1, "Passing wrapInShell={false} yields exactly 1 <nav>");
      assert.equal(footerCount, 1, "Passing wrapInShell={false} yields exactly 1 <footer>");
    });
  });

  // =========================================================================
  // Challenge 2: Desktop Mega-Menu Dropdown & Sub-Route Wiring
  // =========================================================================
  describe("Challenge 2: Desktop Navbar Mega-Menu & Interactions", () => {
    const rawNavModule = loadTranspiled("components/landing/LandingNav.jsx");
    const { FEATURE_DROPDOWN_ITEMS } = rawNavModule;

    it("FEATURE_DROPDOWN_ITEMS exports exactly 4 catalog items with valid routes and accents", () => {
      assert.ok(Array.isArray(FEATURE_DROPDOWN_ITEMS), "FEATURE_DROPDOWN_ITEMS must be an array");
      assert.equal(FEATURE_DROPDOWN_ITEMS.length, 4, "Must define exactly 4 dropdown items");
      
      const expectedPaths = [
        "/features/match",
        "/features/collab",
        "/features/feed",
        "/features/projects",
      ];

      for (const expected of expectedPaths) {
        const item = FEATURE_DROPDOWN_ITEMS.find((i) => i.path === expected);
        assert.ok(item, `Dropdown item missing for route: ${expected}`);
        assert.ok(item.title && item.title.length > 0, `Item ${expected} must have title`);
        assert.ok(item.description && item.description.length > 0, `Item ${expected} must have description`);
        assert.ok(item.accent === "#ccff00" || item.accent === "#b266ff", `Item ${expected} must use theme accent`);
        assert.ok(item.icon, `Item ${expected} must have icon`);
      }
    });

    it("renders top-level links for /pricing and /community with active route awareness", () => {
      const LandingNavPricing = loadTranspiled("components/landing/LandingNav.jsx", {
        pathname: "/pricing",
      }).default;
      const pricingHtml = renderToString(React.createElement(LandingNavPricing));
      assert.ok(pricingHtml.includes('href="/pricing"'), "Must include href /pricing");
      assert.ok(pricingHtml.includes('text-[#ccff00]'), "Active /pricing link must be highlighted in lime");

      const LandingNavCommunity = loadTranspiled("components/landing/LandingNav.jsx", {
        pathname: "/community",
      }).default;
      const communityHtml = renderToString(React.createElement(LandingNavCommunity));
      assert.ok(communityHtml.includes('href="/community"'), "Must include href /community");
      assert.ok(communityHtml.includes('text-[#ccff00]'), "Active /community link must be highlighted in lime");
    });

    it("LandingNav incorporates Escape key listener and outside click dismiss logic in source", () => {
      assert.ok(landingNavSrc.includes('event.key === "Escape"'), "Must listen for Escape key");
      assert.ok(landingNavSrc.includes("handleClickOutside"), "Must handle click outside");
      assert.ok(landingNavSrc.includes("featuresOpen"), "Must track featuresOpen state");
      assert.ok(landingNavSrc.includes('id="features-dropdown"'), "Must have id='features-dropdown'");
    });
  });

  // =========================================================================
  // Challenge 3: Root Hub (/) Streamlining & Composition
  // =========================================================================
  describe("Challenge 3: Root Hub (/) Streamlining & Composition", () => {
    it("LandingPage mounts exactly 5 core sections in ordered pipeline", () => {
      const expectedOrder = [
        "<HeroSection",
        "<TechMarquee",
        "<FeatureTeasersSection",
        "<PositioningBand",
        "<FinalCtaSection",
      ];

      let lastIndex = -1;
      for (const comp of expectedOrder) {
        const index = landingPageSrc.indexOf(comp);
        assert.ok(index > -1, `LandingPage must render ${comp}`);
        assert.ok(index > lastIndex, `${comp} is out of sequence`);
        lastIndex = index;
      }
    });

    it("completely purges the 11/12 buried sections from LandingPage", () => {
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
          `Buried section ${section} must NOT be rendered on root /`
        );
        assert.ok(
          !landingPageSrc.includes(`import ${section}`),
          `Buried section import ${section} must NOT exist in LandingPage.jsx`
        );
      }
    });

    it("retains auth hint fast-redirect to /feed for returning users", () => {
      const LandingPageWithAuth = loadTranspiled("components/LandingPage.jsx", {
        reduxStore: { user: { _id: "u123", firstName: "Alice" } },
      }).default;
      const html = renderToString(React.createElement(LandingPageWithAuth));
      assert.ok(html.includes('data-navigate-to="/feed"'), "Must redirect authenticated user to /feed");
    });
  });

  // =========================================================================
  // Challenge 4: All 6 Marketing Sub-Pages Contract & SSR
  // =========================================================================
  describe("Challenge 4: Dedicated Marketing Sub-Pages & Destination Routes", () => {
    const subPages = [
      { file: "pages/marketing/FeaturesMatchPage.jsx", path: "/features/match", eyebrow: "SKILL-BASED MATCHMAKING" },
      { file: "pages/marketing/FeaturesCollabPage.jsx", path: "/features/collab", eyebrow: "REAL-TIME MULTIPLAYER IDE" },
      { file: "pages/marketing/FeaturesFeedPage.jsx", path: "/features/feed", eyebrow: "SOCIAL CODE FEED" },
      { file: "pages/marketing/FeaturesProjectsPage.jsx", path: "/features/projects", eyebrow: "CURATED CODEBASES" },
      { file: "pages/marketing/PricingDestinationPage.jsx", path: "/pricing", eyebrow: "TRANSPARENT PRICING" },
      { file: "pages/marketing/CommunityDestinationPage.jsx", path: "/community", eyebrow: "BUILDER NETWORK" },
    ];

    for (const { file, path: routePath, eyebrow } of subPages) {
      it(`renders ${routePath} with semantic <h2>, back link, and eyebrow '${eyebrow}'`, () => {
        const Comp = loadTranspiled(file, { pathname: routePath }).default;
        const html = renderToString(React.createElement(Comp));

        // Semantic heading invariant: single h1 is reserved for root /; sub-pages must use h2
        assert.ok(!html.includes("<h1"), `${file} must NOT contain <h1>`);
        assert.ok(html.includes("<h2"), `${file} must contain semantic <h2>`);

        // Eyebrow badge
        assert.ok(html.includes(eyebrow), `${file} must render eyebrow ${eyebrow}`);

        // Breadcrumb back to overview
        assert.ok(html.includes('href="/"'), `${file} must link back to root /`);
        assert.ok(html.includes("Back to Overview"), `${file} must include 'Back to Overview' breadcrumb`);

        // Signup CTA
        assert.ok(html.includes('href="/login?mode=signup"'), `${file} must include CTA to /login?mode=signup`);
      });
    }
  });

  // =========================================================================
  // Challenge 5: In-App Authenticated Routes Integrity in App.jsx
  // =========================================================================
  describe("Challenge 5: Preservation of Authenticated & Internal Routes", () => {
    it("retains all 12 authenticated routes under <Route element={<Body />}>", () => {
      const requiredAuthRoutes = [
        "/feed",
        "/discover",
        "/network",
        "/connections",
        "/requests",
        "/profile",
        "/premium",
        "/chat",
        "/chat/:targetId",
        "/projects",
        "/user/:userId",
        "/project/:postId/requests",
      ];

      assert.ok(appSrc.includes("<Route element={<Body />}>"), "Must maintain Body wrapper route");

      for (const route of requiredAuthRoutes) {
        assert.ok(
          appSrc.includes(`path="${route}"`),
          `App.jsx must retain authenticated route path="${route}"`
        );
      }
    });

    it("retains standalone public routes and 404 fallback", () => {
      const standaloneRoutes = [
        "/login",
        "/privacy",
        "/terms",
        "/onboarding",
        "/sandbox/:roomId",
        "/project/room/:roomId",
        "/project/preview/:roomId",
        "*",
      ];

      for (const route of standaloneRoutes) {
        assert.ok(
          appSrc.includes(`path="${route}"`),
          `App.jsx must retain standalone route path="${route}"`
        );
      }
    });

    it("validates lazy imports exist on filesystem for all registered routes", () => {
      const lazyRegex = /import\("([^"]+)"\)/g;
      let match;
      const importedPaths = [];
      while ((match = lazyRegex.exec(appSrc)) !== null) {
        importedPaths.push(match[1]);
      }

      assert.ok(importedPaths.length >= 20, "Should have 20+ lazy imported modules");

      for (const rel of importedPaths) {
        // Resolve relative to src/
        let resolved = path.resolve(SRC_DIR, rel);
        if (!fs.existsSync(resolved) && fs.existsSync(resolved + ".jsx")) {
          resolved += ".jsx";
        } else if (!fs.existsSync(resolved) && fs.existsSync(resolved + ".js")) {
          resolved += ".js";
        }
        assert.ok(fs.existsSync(resolved), `Lazy imported file does not exist on disk: ${rel}`);
      }
    });
  });

  // =========================================================================
  // Challenge 6: Multi-Route Static Prerendering Output in dist/
  // =========================================================================
  describe("Challenge 6: Production Build & Static Prerendering Verification", () => {
    const staticRoutes = [
      { path: "index.html", title: "OctoPair — Collaborative Developer IDE & Pair Programming", isRoot: true },
      { path: "features/match/index.html", title: "Developer Matching & Discovery — OctoPair", isRoot: false },
      { path: "features/collab/index.html", title: "Live Multiplayer Collaboration — OctoPair", isRoot: false },
      { path: "features/feed/index.html", title: "Developer Feed & Interactive Snippets — OctoPair", isRoot: false },
      { path: "features/projects/index.html", title: "Open Developer Projects & Sprints — OctoPair", isRoot: false },
      { path: "pricing/index.html", title: "Transparent Pricing Plans — OctoPair", isRoot: false },
      { path: "community/index.html", title: "Global Developer Community & Telemetry — OctoPair", isRoot: false },
    ];

    for (const { path: relPath, title, isRoot } of staticRoutes) {
      it(`verifies static prerender file dist/${relPath}`, () => {
        const fullPath = path.join(DIST_DIR, relPath);
        assert.ok(fs.existsSync(fullPath), `dist/${relPath} must exist`);

        const html = fs.readFileSync(fullPath, "utf-8");
        assert.ok(html.includes(`<title>${title}</title>`), `dist/${relPath} title mismatch`);

        if (isRoot) {
          const h1Count = (html.match(/<h1/g) || []).length;
          assert.equal(h1Count, 1, "Root index.html must have exactly 1 <h1>");
        } else {
          const h1Count = (html.match(/<h1/g) || []).length;
          assert.equal(h1Count, 0, `dist/${relPath} must have 0 <h1>`);
          assert.ok(html.includes("<h2"), `dist/${relPath} must have semantic <h2>`);
        }
      });
    }
  });
});
