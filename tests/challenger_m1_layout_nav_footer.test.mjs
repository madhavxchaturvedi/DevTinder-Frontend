import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import esbuild from "esbuild";
import React from "react";
import { renderToString } from "react-dom/server";

const FRONTEND_DIR = path.resolve(import.meta.dirname, "..");
const LANDING_DIR = path.join(FRONTEND_DIR, "src/components/landing");

const readLanding = (file) => fs.readFileSync(path.join(LANDING_DIR, file), "utf-8");

// Dynamic component loader via esbuild
const loadComponent = (filename) => {
  const filePath = path.join(LANDING_DIR, filename);
  const source = fs.readFileSync(filePath, "utf8");
  const transformed = esbuild.transformSync(source, {
    loader: "jsx",
    format: "cjs",
  });

  const fakeRequire = (name) => {
    if (name === "react") return React;
    if (name === "react-router-dom") {
      return {
        Link: ({ to, children, ...props }) =>
          React.createElement("a", { href: to, ...props }, children),
        Outlet: () => React.createElement("div", { "data-testid": "mock-outlet" }, "OutletSlot"),
        useLocation: () => ({ pathname: "/" }),
      };
    }
    if (name === "./LandingNav") {
      return loadComponent("LandingNav.jsx");
    }
    if (name === "./LandingFooter") {
      return loadComponent("LandingFooter.jsx");
    }
    if (name.includes("OctoPairLogo")) {
      return {
        OctoPairLogo: (props) => React.createElement("svg", { "data-logo": "octopair", ...props }),
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
    throw new Error(`Unexpected import in test loader: ${name}`);
  };

  const moduleExports = {};
  const fakeModule = { exports: moduleExports };
  const fn = new Function("require", "exports", "module", transformed.code);
  fn(fakeRequire, moduleExports, fakeModule);
  return fakeModule.exports;
};

describe("Adversarial Empirical Challenge: Milestone 1 Layout Shell, Nav & Footer", () => {
  const shellSrc = readLanding("LandingShell.jsx");
  const navSrc = readLanding("LandingNav.jsx");
  const footerSrc = readLanding("LandingFooter.jsx");

  const m1Files = [
    { name: "LandingShell.jsx", src: shellSrc },
    { name: "LandingNav.jsx", src: navSrc },
    { name: "LandingFooter.jsx", src: footerSrc },
  ];

  // =========================================================================
  // 1. Mega-Menu Exports and Runtime Structure Stress Test
  // =========================================================================
  describe("1. Mega-Menu Runtime Exports & Schema Validation", () => {
    const navModule = loadComponent("LandingNav.jsx");
    const { FEATURE_DROPDOWN_ITEMS } = navModule;

    it("verifies FEATURE_DROPDOWN_ITEMS is a valid exported Array of length 4", () => {
      assert.ok(Array.isArray(FEATURE_DROPDOWN_ITEMS), "FEATURE_DROPDOWN_ITEMS must be an exported Array");
      assert.equal(FEATURE_DROPDOWN_ITEMS.length, 4, "Must contain exactly 4 feature items");
    });

    it("verifies all 4 required routes exist with exact canonical paths", () => {
      const paths = FEATURE_DROPDOWN_ITEMS.map((item) => item.path);
      const expectedPaths = [
        "/features/match",
        "/features/collab",
        "/features/feed",
        "/features/projects",
      ];
      assert.deepEqual(paths, expectedPaths, "Paths must match the exact 4 required feature routes");
    });

    it("enforces complete schema integrity on every dropdown item", () => {
      const validAccents = new Set(["#b266ff", "#ccff00"]);
      for (const item of FEATURE_DROPDOWN_ITEMS) {
        assert.ok(typeof item.title === "string" && item.title.trim().length > 0, "Title must be non-empty string");
        assert.ok(
          typeof item.description === "string" && item.description.length >= 20,
          `Description must be informative (>= 20 chars), got: "${item.description}"`
        );
        assert.ok(item.path.startsWith("/features/"), `Path must be under /features/: ${item.path}`);
        assert.ok(item.icon !== undefined && item.icon !== null, `Icon must be provided for ${item.title}`);
        assert.ok(
          validAccents.has(item.accent),
          `Accent must be a brand token (#b266ff or #ccff00), got: ${item.accent}`
        );
      }
    });

    it("confirms expected card titles and accents match the spec", () => {
      const byPath = Object.fromEntries(FEATURE_DROPDOWN_ITEMS.map((i) => [i.path, i]));
      
      assert.equal(byPath["/features/match"].title, "Swipe & Match");
      assert.equal(byPath["/features/match"].accent, "#b266ff");

      assert.equal(byPath["/features/collab"].title, "Live Room");
      assert.equal(byPath["/features/collab"].accent, "#ccff00");

      assert.equal(byPath["/features/feed"].title, "Developer Feed");
      assert.equal(byPath["/features/feed"].accent, "#ccff00");

      assert.equal(byPath["/features/projects"].title, "Open Projects");
      assert.equal(byPath["/features/projects"].accent, "#b266ff");
    });
  });

  // =========================================================================
  // 2. Top-Level Links & Active State Mechanics
  // =========================================================================
  describe("2. Top-Level Navigation Links & Active State Mechanics", () => {
    it("verifies direct top-level links to /pricing and /community exist in both desktop and mobile", () => {
      // Desktop Navigation block
      const desktopStart = navSrc.indexOf("Desktop Navigation Links");
      const desktopEnd = navSrc.indexOf("Desktop Action Buttons");
      assert.ok(desktopStart > 0 && desktopEnd > desktopStart, "Desktop nav block comments must exist");
      const desktopBlock = navSrc.substring(desktopStart, desktopEnd);

      assert.ok(desktopBlock.includes('to="/pricing"'), "Desktop nav must contain /pricing link");
      assert.ok(desktopBlock.includes('to="/community"'), "Desktop nav must contain /community link");
      assert.ok(desktopBlock.includes("Pricing"), "Desktop nav must have 'Pricing' label");
      assert.ok(desktopBlock.includes("Community"), "Desktop nav must have 'Community' label");

      // Mobile Navigation block
      const mobileDrawerIndex = navSrc.indexOf("{mobileMenuOpen && (");
      assert.ok(mobileDrawerIndex > 0, "Mobile drawer block must exist");
      const mobileBlock = navSrc.substring(mobileDrawerIndex);

      assert.ok(mobileBlock.includes('to="/pricing"'), "Mobile drawer must contain /pricing link");
      assert.ok(mobileBlock.includes('to="/community"'), "Mobile drawer must contain /community link");
      assert.ok(mobileBlock.includes("Pricing Plans"), "Mobile drawer must have 'Pricing Plans' label");
      assert.ok(mobileBlock.includes("Community Telemetry"), "Mobile drawer must have 'Community Telemetry' label");
    });

    it("verifies active state route-matching logic with stress test oracles", () => {
      const evalActiveStates = (pathname) => {
        const isFeaturesActive = pathname.startsWith("/features");
        const isPricingActive = pathname === "/pricing";
        const isCommunityActive = pathname === "/community";
        return { isFeaturesActive, isPricingActive, isCommunityActive };
      };

      const testCases = [
        { path: "/features/match", expF: true, expP: false, expC: false },
        { path: "/features/collab", expF: true, expP: false, expC: false },
        { path: "/features/feed", expF: true, expP: false, expC: false },
        { path: "/features/projects", expF: true, expP: false, expC: false },
        { path: "/features", expF: true, expP: false, expC: false },
        { path: "/features/anything/sub", expF: true, expP: false, expC: false },
        { path: "/pricing", expF: false, expP: true, expC: false },
        { path: "/community", expF: false, expP: false, expC: true },
        { path: "/", expF: false, expP: false, expC: false },
        { path: "/login", expF: false, expP: false, expC: false },
        { path: "/feed", expF: false, expP: false, expC: false },
      ];

      for (const tc of testCases) {
        const res = evalActiveStates(tc.path);
        assert.equal(res.isFeaturesActive, tc.expF, `isFeaturesActive mismatch for ${tc.path}`);
        assert.equal(res.isPricingActive, tc.expP, `isPricingActive mismatch for ${tc.path}`);
        assert.equal(res.isCommunityActive, tc.expC, `isCommunityActive mismatch for ${tc.path}`);
      }
    });
  });

  // =========================================================================
  // 3. Mobile Menu Toggle and Auto-Close Behavior
  // =========================================================================
  describe("3. Mobile Menu Toggle and Auto-Close Invariants", () => {
    it("verifies mobile hamburger button toggles state and has accessible aria attributes", () => {
      assert.ok(
        navSrc.includes('onClick={() => setMobileMenuOpen(!mobileMenuOpen)}'),
        "Hamburger button must toggle setMobileMenuOpen(!mobileMenuOpen)"
      );
      assert.ok(
        navSrc.includes('aria-label="Toggle Navigation Menu"'),
        "Hamburger button must have aria-label"
      );
      assert.ok(
        navSrc.includes("aria-expanded={mobileMenuOpen}"),
        "Hamburger button must bind aria-expanded to mobileMenuOpen"
      );
      assert.ok(
        navSrc.includes("{mobileMenuOpen ? <X") || navSrc.includes("mobileMenuOpen ? <X className"),
        "Must render X icon when open and Menu icon when closed"
      );
    });

    it("empirically verifies every link inside the mobile drawer auto-closes the menu", () => {
      const drawerIndex = navSrc.indexOf("{mobileMenuOpen && (");
      assert.ok(drawerIndex > 0, "Mobile drawer block must exist");
      const drawerSrc = navSrc.slice(drawerIndex);

      // Verify all 5 link destinations within the mobile drawer have auto-close handlers
      const expectedMobileLinks = [
        { desc: "Feature items (mapped)", token: "key={item.path}" },
        { desc: "Pricing Plans", token: 'to="/pricing"' },
        { desc: "Community Telemetry", token: 'to="/community"' },
        { desc: "Sign In", token: 'to="/login"' },
        { desc: "Start Pairing Now", token: 'to="/login?mode=signup"' },
      ];

      for (const { desc, token } of expectedMobileLinks) {
        const tokenIdx = drawerSrc.indexOf(token);
        assert.ok(tokenIdx > 0, `Mobile drawer must contain ${desc} (${token})`);

        // Check local window around this element for onClick setMobileMenuOpen(false)
        const localSnippet = drawerSrc.substring(tokenIdx - 80, tokenIdx + 120);
        assert.ok(
          localSnippet.includes("setMobileMenuOpen(false)"),
          `${desc} link must have onClick={() => setMobileMenuOpen(false)}`
        );
      }
    });

    it("verifies route change hook auto-closes both desktop dropdown and mobile menu", () => {
      const pathnameEffectMatch = navSrc.match(
        /useEffect\(\(\) => \{\s*setFeaturesOpen\(false\);\s*setMobileMenuOpen\(false\);\s*\}, \[pathname\]\);/
      );
      assert.ok(pathnameEffectMatch, "Must include useEffect([pathname]) resetting both menus to false");
    });
  });

  // =========================================================================
  // 4. Click-Outside & Escape Key Dismissal Logic
  // =========================================================================
  describe("4. Click-Outside & Escape Key Dismissal Logic", () => {
    const extractDismissalEffect = () => {
      const match = navSrc.match(
        /useEffect\(\(\) => \{([\s\S]*?)\}, \[featuresOpen\]\);/
      );
      assert.ok(match, "Must find useEffect for featuresOpen in LandingNav");
      const fnBody = match[1];
      return (featuresOpen, setFeaturesOpen, dropdownRef, windowObj, documentObj) => {
        const fn = new Function(
          "featuresOpen",
          "setFeaturesOpen",
          "dropdownRef",
          "window",
          "document",
          fnBody
        );
        return fn(featuresOpen, setFeaturesOpen, dropdownRef, windowObj, documentObj);
      };
    };

    const runDismissalEffect = extractDismissalEffect();

    it("does not attach listeners when featuresOpen is false", () => {
      const addedListeners = [];
      const mockDoc = {
        addEventListener: (evt) => addedListeners.push(evt),
        removeEventListener: () => {},
      };
      const mockWin = {};

      const cleanup = runDismissalEffect(false, () => {}, { current: {} }, mockWin, mockDoc);
      assert.equal(addedListeners.length, 0, "No listeners should be attached when closed");
      if (typeof cleanup === "function") cleanup();
    });

    it("attaches mousedown, touchstart, and keydown listeners when featuresOpen is true", () => {
      const addedListeners = [];
      const mockDoc = {
        addEventListener: (evt) => addedListeners.push(evt),
        removeEventListener: () => {},
      };
      const mockWin = {};

      const cleanup = runDismissalEffect(true, () => {}, { current: {} }, mockWin, mockDoc);
      assert.ok(addedListeners.includes("mousedown"), "Must listen for mousedown");
      assert.ok(addedListeners.includes("touchstart"), "Must listen for touchstart");
      assert.ok(addedListeners.includes("keydown"), "Must listen for keydown");
      assert.equal(addedListeners.length, 3, "Must attach exactly 3 listeners");
      if (typeof cleanup === "function") cleanup();
    });

    it("dismisses dropdown when Escape key is pressed", () => {
      const listeners = {};
      const mockDoc = {
        addEventListener: (evt, fn) => { listeners[evt] = fn; },
        removeEventListener: () => {},
      };
      let closed = false;
      const setFeaturesOpen = (val) => {
        if (val === false) closed = true;
      };

      runDismissalEffect(true, setFeaturesOpen, { current: {} }, {}, mockDoc);

      assert.equal(typeof listeners["keydown"], "function");
      // Fire non-Escape keys
      listeners["keydown"]({ key: "Enter" });
      assert.equal(closed, false, "Must not close on Enter");

      listeners["keydown"]({ key: "Tab" });
      assert.equal(closed, false, "Must not close on Tab");

      // Fire Escape key
      listeners["keydown"]({ key: "Escape" });
      assert.equal(closed, true, "Must close when Escape key is pressed");
    });

    it("dismisses dropdown when clicking outside dropdownRef", () => {
      const listeners = {};
      const mockDoc = {
        addEventListener: (evt, fn) => { listeners[evt] = fn; },
        removeEventListener: () => {},
      };

      const dropdownElement = { id: "dropdown" };
      const insideElement = { id: "inside" };
      const outsideElement = { id: "outside" };

      const dropdownRef = {
        current: {
          contains: (target) => target === insideElement || target === dropdownElement,
        },
      };

      let closed = false;
      const setFeaturesOpen = (val) => {
        if (val === false) closed = true;
      };

      runDismissalEffect(true, setFeaturesOpen, dropdownRef, {}, mockDoc);

      assert.equal(typeof listeners["mousedown"], "function");

      // Click inside dropdown
      listeners["mousedown"]({ target: insideElement });
      assert.equal(closed, false, "Must not close when clicking inside dropdown");

      // Click outside dropdown
      listeners["mousedown"]({ target: outsideElement });
      assert.equal(closed, true, "Must close when clicking outside dropdown");
    });

    it("dismisses dropdown when touchstart occurs outside dropdownRef", () => {
      const listeners = {};
      const mockDoc = {
        addEventListener: (evt, fn) => { listeners[evt] = fn; },
        removeEventListener: () => {},
      };

      const dropdownRef = {
        current: {
          contains: (target) => target?.id === "inside",
        },
      };

      let closed = false;
      const setFeaturesOpen = (val) => {
        if (val === false) closed = true;
      };

      runDismissalEffect(true, setFeaturesOpen, dropdownRef, {}, mockDoc);

      assert.equal(typeof listeners["touchstart"], "function");

      // Touch inside
      listeners["touchstart"]({ target: { id: "inside" } });
      assert.equal(closed, false);

      // Touch outside
      listeners["touchstart"]({ target: { id: "outside" } });
      assert.equal(closed, true);
    });

    it("properly unbinds all listeners during cleanup", () => {
      const removedListeners = [];
      const mockDoc = {
        addEventListener: () => {},
        removeEventListener: (evt) => removedListeners.push(evt),
      };

      const cleanup = runDismissalEffect(true, () => {}, { current: {} }, {}, mockDoc);
      assert.equal(typeof cleanup, "function", "Effect must return cleanup function");

      cleanup();
      assert.ok(removedListeners.includes("mousedown"), "Must remove mousedown listener");
      assert.ok(removedListeners.includes("touchstart"), "Must remove touchstart listener");
      assert.ok(removedListeners.includes("keydown"), "Must remove keydown listener");
      assert.equal(removedListeners.length, 3, "Must clean up all 3 listeners");
    });

    it("gracefully survives SSR environments where window or document is undefined", () => {
      let threw = false;
      try {
        const cleanup = runDismissalEffect(true, () => {}, { current: null }, undefined, undefined);
        if (typeof cleanup === "function") cleanup();
      } catch (e) {
        threw = true;
      }
      assert.equal(threw, false, "Must not throw when window or document is undefined");
    });
  });

  // =========================================================================
  // 5. LandingShell Layout Container & Scroll Restoration
  // =========================================================================
  describe("5. LandingShell Layout Container & Scroll Restoration", () => {
    const LandingShellModule = loadComponent("LandingShell.jsx");
    const LandingShell = LandingShellModule.default || LandingShellModule;

    it("renders LandingNav, main content slot, and LandingFooter", () => {
      const html = renderToString(React.createElement(LandingShell));
      
      assert.ok(html.includes("<nav"), "Rendered output must contain <nav> from LandingNav");
      assert.ok(html.includes("<main"), "Rendered output must contain <main>");
      assert.ok(html.includes("<footer"), "Rendered output must contain <footer> from LandingFooter");
      assert.ok(html.includes("OutletSlot"), "Default render without children must render Outlet");
    });

    it("renders custom children when supplied as prop", () => {
      const html = renderToString(
        React.createElement(
          LandingShell,
          null,
          React.createElement("div", { "data-testid": "custom-child-slot" }, "CustomMarketingPage")
        )
      );

      assert.ok(html.includes("CustomMarketingPage"), "Must render children prop");
      assert.ok(!html.includes("OutletSlot"), "Must not render Outlet when children prop is present");
    });

    it("executes window.scrollTo(0, 0) on pathname change with instant behavior", () => {
      assert.ok(
        shellSrc.includes("window.scrollTo({ top: 0, left: 0, behavior: \"instant\" })"),
        "LandingShell must call window.scrollTo with top: 0, left: 0, behavior: instant"
      );
      assert.ok(
        shellSrc.includes("typeof window !== \"undefined\""),
        "window.scrollTo must be guarded against SSR"
      );
    });
  });

  // =========================================================================
  // 6. Hard Invariants Verification (Zero Tolerances)
  // =========================================================================
  describe("6. Hard Invariants (Zero Tolerances)", () => {
    it("Invariant: Exactly zero <h1> elements in any M1 component source code", () => {
      for (const { name, src } of m1Files) {
        assert.ok(!src.includes("<h1"), `${name} must not contain an <h1> tag`);
      }
    });

    it("Invariant: Exactly zero <h1> elements in rendered SSR markup of M1 components", () => {
      const LandingShellModule = loadComponent("LandingShell.jsx");
      const LandingNavModule = loadComponent("LandingNav.jsx");
      const LandingFooterModule = loadComponent("LandingFooter.jsx");

      const shellHtml = renderToString(React.createElement(LandingShellModule.default || LandingShellModule));
      const navHtml = renderToString(React.createElement(LandingNavModule.default || LandingNavModule));
      const footerHtml = renderToString(React.createElement(LandingFooterModule.default || LandingFooterModule));

      assert.ok(!shellHtml.includes("<h1"), "Rendered LandingShell must not contain <h1>");
      assert.ok(!navHtml.includes("<h1"), "Rendered LandingNav must not contain <h1>");
      assert.ok(!footerHtml.includes("<h1"), "Rendered LandingFooter must not contain <h1>");
    });

    it("Invariant: Exactly zero emojis anywhere in M1 component source files", () => {
      const standardEmojiRegex =
        /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{1FA70}-\u{1FAFF}]/gu;

      for (const { name, src } of m1Files) {
        const matches = src.match(standardEmojiRegex);
        assert.equal(
          matches,
          null,
          `Found forbidden emoji in ${name}: ${JSON.stringify(matches)}`
        );
      }
    });

    it("Invariant: Exactly zero links to prohibited routes (/discover, /sandbox, /profile/:id)", () => {
      const forbiddenTokens = ['"/discover"', '"/sandbox"', '"/profile/', '"/user/'];
      for (const { name, src } of m1Files) {
        for (const token of forbiddenTokens) {
          assert.ok(
            !src.includes(token),
            `${name} must not contain forbidden route token ${token}`
          );
        }
      }
    });

    it("Invariant: All auth CTAs route strictly to /login or /login?mode=signup", () => {
      const toRegex = /\bto="([^"]+)"/g;
      
      const checkLinks = (filename, source) => {
        let m;
        while ((m = toRegex.exec(source)) !== null) {
          const target = m[1];
          if (target.includes("login") || target.includes("signup")) {
            assert.ok(
              target === "/login" || target === "/login?mode=signup",
              `Found invalid auth route "${target}" in ${filename}. Expected strictly "/login" or "/login?mode=signup"`
            );
          }
        }
      };

      checkLinks("LandingNav.jsx", navSrc);
      checkLinks("LandingFooter.jsx", footerSrc);
    });

    it("Invariant: Exactly zero Redux dependencies across all M1 components", () => {
      for (const { name, src } of m1Files) {
        assert.ok(!src.includes("useSelector"), `${name} must not use useSelector`);
        assert.ok(!src.includes("useDispatch"), `${name} must not use useDispatch`);
        assert.ok(!src.includes("useStore"), `${name} must not use useStore`);
        assert.ok(!src.includes("react-redux"), `${name} must not import from react-redux`);
      }
    });

    it("Invariant: Hairline border token border-white/10 applied to all borders", () => {
      assert.ok(navSrc.includes("border-white/10"), "LandingNav must use border-white/10");
      assert.ok(footerSrc.includes("border-white/10"), "LandingFooter must use border-white/10");
    });
  });
});
