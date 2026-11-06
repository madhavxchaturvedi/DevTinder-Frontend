import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import esbuild from "esbuild";
import React from "react";
import { renderToString } from "react-dom/server";

const FRONTEND_DIR = path.resolve(import.meta.dirname, "..");
const SRC_DIR = path.join(FRONTEND_DIR, "src");
const PUBLIC_DIR = path.join(FRONTEND_DIR, "public");
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
    matchMedia: () => ({ matches: false, addListener: () => {}, removeListener: () => {} }),
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
        Link: ({ to, children, ...props }) =>
          React.createElement("a", { href: to, ...props }, children),
        Outlet: () =>
          mocks.OutletSlot
            ? mocks.OutletSlot()
            : React.createElement("div", { "data-testid": "outlet" }, "OutletSlot"),
        useLocation: () => ({
          pathname: mocks.pathname || "/",
          hash: mocks.hash || "",
        }),
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

    // Default mock for any section component
    const base = path.basename(name).replace(/\.[^/.]+$/, "");
    const MockChild = (props) =>
      React.createElement("section", { "data-mock": base, id: props.id || base.toLowerCase(), ...props }, base);
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

describe("Adversarial Empirical Challenge — Milestone 1 Senior UI/UX & Chrome Defect Elimination", () => {

  // =========================================================================
  // Challenge 1: Single Shell on Root / (Strictly 1 Nav and 1 Footer)
  // =========================================================================
  describe("1. Single Shell Layout & Chrome Duplication Elimination", () => {
    it("LandingPage defaults wrapInShell=false, preventing duplicate shell when rendered under LandingShell", () => {
      const landingPageSrc = fs.readFileSync(path.join(SRC_DIR, "components/LandingPage.jsx"), "utf8");
      assert.match(
        landingPageSrc,
        /wrapInShell\s*=\s*false/,
        "LandingPage default prop must specify wrapInShell = false"
      );
    });

    it("App.jsx wraps LandingPage inside <Route element={<LandingShell />}>", () => {
      const appSrc = fs.readFileSync(path.join(SRC_DIR, "App.jsx"), "utf8");
      assert.ok(appSrc.includes("<Route element={<LandingShell />}>"), "App.jsx must declare LandingShell route wrapper");
      assert.ok(appSrc.includes('<Route path="/" element={<LandingPage />} />'), "App.jsx must register LandingPage on root /");
    });

    it("Empirical SSR render of LandingShell + LandingPage (default props) produces strictly 1 <nav> and 1 <footer>", () => {
      const LandingShell = loadTranspiled("components/landing/LandingShell.jsx").default;
      const LandingPage = loadTranspiled("components/LandingPage.jsx").default;

      // In React Router, LandingShell renders LandingPage through its Outlet or direct child
      const rendered = renderToString(
        React.createElement(LandingShell, null, React.createElement(LandingPage))
      );

      const navCount = (rendered.match(/<nav\b/g) || []).length;
      const footerCount = (rendered.match(/<footer\b/g) || []).length;

      assert.equal(navCount, 1, `Expected strictly 1 <nav>, but rendered: ${navCount}`);
      assert.equal(footerCount, 1, `Expected strictly 1 <footer>, but rendered: ${footerCount}`);
    });

    it("Empirical SSR render with explicit wrapInShell=true reproduces legacy 2 <nav> and 2 <footer> defect", () => {
      const LandingShell = loadTranspiled("components/landing/LandingShell.jsx").default;
      const LandingPage = loadTranspiled("components/LandingPage.jsx").default;

      const renderedDouble = renderToString(
        React.createElement(LandingShell, null, React.createElement(LandingPage, { wrapInShell: true }))
      );

      const navCount = (renderedDouble.match(/<nav\b/g) || []).length;
      const footerCount = (renderedDouble.match(/<footer\b/g) || []).length;

      assert.equal(navCount, 2, "wrapInShell=true accurately recreates the double nav defect");
      assert.equal(footerCount, 2, "wrapInShell=true accurately recreates the double footer defect");
    });

    it("dist/index.html (production prerender) strictly contains exactly 1 <nav> and 1 <footer>", () => {
      const distIndex = path.join(DIST_DIR, "index.html");
      assert.ok(fs.existsSync(distIndex), "dist/index.html must exist");
      const html = fs.readFileSync(distIndex, "utf8");

      const navCount = (html.match(/<nav\b/g) || []).length;
      const footerCount = (html.match(/<footer\b/g) || []).length;

      assert.equal(navCount, 1, `dist/index.html must contain exactly 1 <nav>, got ${navCount}`);
      assert.equal(footerCount, 1, `dist/index.html must contain exactly 1 <footer>, got ${footerCount}`);
    });

    it("All 6 sub-page prerender outputs in dist/ strictly contain exactly 1 <nav> and 1 <footer>", () => {
      const subRoutes = [
        "features/match",
        "features/collab",
        "features/feed",
        "features/projects",
        "pricing",
        "community",
      ];

      for (const route of subRoutes) {
        const filePath = path.join(DIST_DIR, route, "index.html");
        assert.ok(fs.existsSync(filePath), `dist/${route}/index.html must exist`);
        const html = fs.readFileSync(filePath, "utf8");

        const navMatches = (html.match(/<nav\b/g) || []).length;
        const footerMatches = (html.match(/<footer\b/g) || []).length;

        assert.equal(navMatches, 1, `dist/${route}/index.html must have 1 <nav>, got ${navMatches}`);
        assert.equal(footerMatches, 1, `dist/${route}/index.html must have 1 <footer>, got ${footerMatches}`);
      }
    });
  });

  // =========================================================================
  // Challenge 2: Favicon SVG Definition and Raster App Icon Dimensions
  // =========================================================================
  describe("2. Favicon SVG Specification & Raster Icon Dimensions", () => {
    const faviconSvgPath = path.join(PUBLIC_DIR, "favicon.svg");
    const favicon32Path = path.join(PUBLIC_DIR, "favicon-32.png");
    const appleTouchPath = path.join(PUBLIC_DIR, "apple-touch-icon.png");

    it("favicon.svg exists and defines the official OctoPair open node arc mark", () => {
      assert.ok(fs.existsSync(faviconSvgPath), "Frontend/public/favicon.svg must exist");
      const svg = fs.readFileSync(faviconSvgPath, "utf8");

      // Official arc definition
      assert.ok(svg.includes('M 29.5 19 A 14 14 0 1 1 29.5 37'), "Must include connected node arc path");
      assert.ok(svg.includes('circle cx="24" cy="28" r="14"'), "Must include left node circle");
      assert.ok(svg.includes('stroke="#09090b"'), "Stroke color must be void black #09090b");
      assert.ok(svg.includes('fill="#ccff00"'), "Background rounded tile must be #ccff00");
      assert.ok(svg.includes('rx="15"'), "Tile must have rx=15 corner radius");
      assert.ok(!svg.includes('circle cx="40"'), "Must eliminate obsolete closed circle cx=40");
    });

    it("favicon-32.png exists, has valid PNG header and exactly 32x32 dimensions", () => {
      assert.ok(fs.existsSync(favicon32Path), "favicon-32.png must exist");
      const buffer = fs.readFileSync(favicon32Path);

      // Verify PNG magic signature: 89 50 4E 47 0D 0A 1A 0A
      assert.equal(buffer[0], 0x89);
      assert.equal(buffer[1], 0x50);
      assert.equal(buffer[2], 0x4e);
      assert.equal(buffer[3], 0x47);

      // Verify IHDR chunk width and height at bytes 16-24 (Big Endian)
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);

      assert.equal(width, 32, `favicon-32 width must be 32, got ${width}`);
      assert.equal(height, 32, `favicon-32 height must be 32, got ${height}`);
    });

    it("apple-touch-icon.png exists, has valid PNG header and exactly 180x180 dimensions", () => {
      assert.ok(fs.existsSync(appleTouchPath), "apple-touch-icon.png must exist");
      const buffer = fs.readFileSync(appleTouchPath);

      // Verify PNG magic signature
      assert.equal(buffer[0], 0x89);
      assert.equal(buffer[1], 0x50);
      assert.equal(buffer[2], 0x4e);
      assert.equal(buffer[3], 0x47);

      // Verify IHDR width and height
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);

      assert.equal(width, 180, `apple-touch-icon width must be 180, got ${width}`);
      assert.equal(height, 180, `apple-touch-icon height must be 180, got ${height}`);
    });

    it("sips CLI tool confirms exact pixel dimensions for both raster icons", () => {
      const sipsOutput = execSync(
        `sips -g pixelWidth -g pixelHeight "${favicon32Path}" "${appleTouchPath}"`,
        { encoding: "utf8" }
      );

      assert.match(sipsOutput, /favicon-32\.png[\s\S]*?pixelWidth: 32[\s\S]*?pixelHeight: 32/);
      assert.match(sipsOutput, /apple-touch-icon\.png[\s\S]*?pixelWidth: 180[\s\S]*?pixelHeight: 180/);
    });

    it("index.html references all brand icons and sets correct theme-color and titles", () => {
      const indexHtml = fs.readFileSync(path.join(FRONTEND_DIR, "index.html"), "utf8");

      assert.ok(indexHtml.includes('<link rel="icon" type="image/svg+xml" href="/favicon.svg" />'));
      assert.ok(indexHtml.includes('<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />'));
      assert.ok(indexHtml.includes('<link rel="apple-touch-icon" href="/apple-touch-icon.png" />'));
      assert.ok(indexHtml.includes('<meta name="theme-color" content="#09090b" />'));
      assert.ok(indexHtml.includes("<title>OctoPair — The Multiplayer IDE for Builders</title>"));
      assert.ok(indexHtml.includes('<meta property="og:title" content="OctoPair — The Multiplayer IDE for Builders" />'));
      assert.ok(indexHtml.includes('<meta name="twitter:title" content="OctoPair — The Multiplayer IDE for Builders" />'));
    });
  });

  // =========================================================================
  // Challenge 3: Deep Hash Navigation & Target Anchors
  // =========================================================================
  describe("3. Deep Hash Navigation Support & Scroll Target Anchors", () => {
    it("<section id=\"sessions\"> exists in WatchSessionSection.jsx and is rendered in FeaturesCollabPage.jsx", () => {
      const watchSessionSrc = fs.readFileSync(path.join(SRC_DIR, "components/landing/WatchSessionSection.jsx"), "utf8");
      assert.match(watchSessionSrc, /<section[^>]*id=["']sessions["']/);

      const collabSrc = fs.readFileSync(path.join(SRC_DIR, "pages/marketing/FeaturesCollabPage.jsx"), "utf8");
      assert.ok(collabSrc.includes("<WatchSessionSection"), "FeaturesCollabPage must render WatchSessionSection");
    });

    it("<section id=\"faq\"> exists in FaqSection.jsx and is rendered in PricingDestinationPage.jsx", () => {
      const faqSrc = fs.readFileSync(path.join(SRC_DIR, "components/landing/FaqSection.jsx"), "utf8");
      assert.match(faqSrc, /<section[^>]*id=["']faq["']/);

      const pricingSrc = fs.readFileSync(path.join(SRC_DIR, "pages/marketing/PricingDestinationPage.jsx"), "utf8");
      assert.ok(pricingSrc.includes("<FaqSection"), "PricingDestinationPage must render FaqSection");
    });

    it("LandingShell.jsx implements hash change observer with smooth scrollIntoView and polling retry", () => {
      const shellSrc = fs.readFileSync(path.join(SRC_DIR, "components/landing/LandingShell.jsx"), "utf8");

      assert.ok(shellSrc.includes("location?.hash"), "Must observe location.hash");
      assert.ok(shellSrc.includes('location.hash.replace(/^#/, "")'), "Must extract clean target ID");
      assert.ok(shellSrc.includes("scrollIntoView({ behavior: \"smooth\", block: \"start\" })"), "Must call smooth scrollIntoView");
      assert.ok(shellSrc.includes("maxAttempts"), "Must have retry loop for lazy / Suspense route commit");
      assert.ok(shellSrc.includes("clearTimeout"), "Must clean up timers on unmount");
    });
  });

  // =========================================================================
  // Challenge 4: LandingNav Brand Badge, Hover Intent & Mobile Drawer Cleanliness
  // =========================================================================
  describe("4. LandingNav Brand Badge, Hover Intent & Clean Mobile Controls", () => {
    const navSrc = fs.readFileSync(path.join(SRC_DIR, "components/landing/LandingNav.jsx"), "utf8");

    it("wraps OctoPairLogo in an illuminated lime badge with glow shadow", () => {
      assert.ok(navSrc.includes("bg-[#ccff00]/10"), "Badge must have lime background tint");
      assert.ok(navSrc.includes("border-[#ccff00]/30"), "Badge must have hairline lime border");
      assert.ok(navSrc.includes("shadow-[0_0_12px_rgba(204,255,0,0.25)]"), "Badge must feature glowing shadow");
      assert.ok(navSrc.includes("<OctoPairLogo"), "Must render OctoPairLogo inside badge");
    });

    it("implements 150ms hover intent delay with clearTimeout on enter, leave and unmount", () => {
      assert.ok(navSrc.includes("hoverTimeoutRef = useRef(null)"), "Must use ref for hover timer");
      assert.match(navSrc, /setTimeout\(\s*\(\)\s*=>\s*\{\s*setFeaturesOpen\(true\);\s*\},?\s*150\)/, "150ms hover delay on open");
      assert.match(navSrc, /setTimeout\(\s*\(\)\s*=>\s*\{\s*setFeaturesOpen\(false\);\s*\},?\s*150\)/, "150ms hover delay on close");
      assert.ok(navSrc.includes("clearTimeout(hoverTimeoutRef.current)"), "Must cancel pending timer on leave/unmount");
    });

    it("adds invisible bridging pseudo-element to mega-menu to bridge the 12px dropdown gap", () => {
      assert.ok(
        navSrc.includes("before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']"),
        "features-dropdown must include pointer bridge pseudo-element"
      );
    });

    it("eliminates redundant Sign In link from mobile header bar", () => {
      // Mobile header block is under: {/* ── Mobile Controls (Clean Hamburger Toggle) ────────────── */}
      const mobileControlsStart = navSrc.indexOf("Mobile Controls (Clean Hamburger Toggle)");
      const mobileDrawerStart = navSrc.indexOf("Mobile Navigation Drawer", mobileControlsStart);
      const mobileHeaderBlock = navSrc.substring(mobileControlsStart, mobileDrawerStart);

      assert.ok(!mobileHeaderBlock.includes("Sign In"), "Mobile top header must not have redundant Sign In button");
      assert.ok(mobileHeaderBlock.includes("Toggle Navigation Menu"), "Mobile top header must retain hamburger toggle");
    });

    it("retains complete auth CTAs (/login and /login?mode=signup) inside mobile navigation drawer", () => {
      const mobileDrawerStart = navSrc.indexOf("Mobile Navigation Drawer");
      const mobileDrawerBlock = navSrc.substring(mobileDrawerStart);

      assert.ok(mobileDrawerBlock.includes('to="/login"'), "Mobile drawer must contain Sign In link");
      assert.ok(mobileDrawerBlock.includes('to="/login?mode=signup"'), "Mobile drawer must contain Start Pairing CTA");
    });
  });

  // =========================================================================
  // Challenge 5: LandingFooter Watermark & Jargon Cleansing
  // =========================================================================
  describe("5. LandingFooter Metallic Watermark & Jargon Elimination", () => {
    const footerSrc = fs.readFileSync(path.join(SRC_DIR, "components/landing/LandingFooter.jsx"), "utf8");

    it("upgrades <OctoPair /> giant code art to illuminated metallic gradient clipped 20%", () => {
      assert.ok(
        footerSrc.includes("bg-gradient-to-b from-white/25 via-white/10 to-white/[0.02] bg-clip-text text-transparent"),
        "Watermark must use vertical metallic gradient"
      );
      assert.ok(footerSrc.includes("translate-y-[20%]"), "Watermark must be clipped 20% at footer bottom");
      assert.ok(footerSrc.includes("&lt;OctoPair /&gt;"), "Must render <OctoPair /> text code art");
    });

    it("replaces robotic 'sub-50ms peer operational transform' with human developer benefit", () => {
      assert.ok(
        !footerSrc.includes("sub-50ms peer operational transform"),
        "Robotic OT phrase must be eliminated from LandingFooter"
      );
      assert.ok(
        footerSrc.includes("Instant, real-time code synchronization."),
        "Human benefit phrase must be present in LandingFooter"
      );
    });
  });

  // =========================================================================
  // Challenge 6: Sticky Sidebar Overflow-Clip Fix
  // =========================================================================
  describe("6. Sticky Sidebar Overflow-Clip Upgrade", () => {
    it("LandingShell.jsx uses overflow-x-clip instead of overflow-x-hidden", () => {
      const shellSrc = fs.readFileSync(path.join(SRC_DIR, "components/landing/LandingShell.jsx"), "utf8");
      assert.ok(shellSrc.includes("overflow-x-clip"), "LandingShell must use overflow-x-clip");
      assert.ok(
        !shellSrc.match(/className=["'][^"']*overflow-x-hidden/),
        "LandingShell root element must not have overflow-x-hidden"
      );
    });

    it("LandingPage.jsx uses overflow-x-clip instead of overflow-x-hidden", () => {
      const pageSrc = fs.readFileSync(path.join(SRC_DIR, "components/LandingPage.jsx"), "utf8");
      assert.ok(pageSrc.includes("overflow-x-clip"), "LandingPage root div must use overflow-x-clip");
      assert.ok(
        !pageSrc.match(/className=["'][^"']*overflow-x-hidden/),
        "LandingPage root div must not have overflow-x-hidden"
      );
    });

    it("FeaturesMatchPage.jsx uses overflow-x-clip instead of overflow-x-hidden for sticky HowItWorksSection", () => {
      const matchSrc = fs.readFileSync(path.join(SRC_DIR, "pages/marketing/FeaturesMatchPage.jsx"), "utf8");
      assert.ok(matchSrc.includes("overflow-x-clip"), "FeaturesMatchPage root div must use overflow-x-clip");
      assert.ok(
        !matchSrc.match(/className=["'][^"']*overflow-x-hidden/),
        "FeaturesMatchPage root div must not have overflow-x-hidden"
      );
    });
  });
});
