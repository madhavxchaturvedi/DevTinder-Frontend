/**
 * Challenger M1.2 Adversarial Stress Test Suite
 * Milestone 1: Navigation & Multi-Page Layout Shell
 *
 * Exhaustive empirical verification of:
 * 1. SSR / Prerender Safety (window, document, scrollTo, addEventListener guards)
 * 2. Responsive Layout & Mobile Drawer Breakpoints (md:hidden, hidden md:flex, overflow-x-hidden)
 * 3. Canonical Route Links & Hash Elimination in LandingFooter.jsx
 * 4. LandingNav Mega-Menu State Machine & Dismissal
 * 5. Design System Invariants (0 h1, 0 emojis, 0 Redux, 0 forbidden routes)
 * 6. Production Build & Prerender SSR Verification
 */

import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

const cwd = process.cwd();
const frontendDir = cwd.endsWith("Frontend") ? cwd : path.resolve(cwd, "Frontend");
const landingDir = path.resolve(frontendDir, "src/components/landing");

const shellPath = path.resolve(landingDir, "LandingShell.jsx");
const navPath = path.resolve(landingDir, "LandingNav.jsx");
const footerPath = path.resolve(landingDir, "LandingFooter.jsx");

const shellSrc = fs.readFileSync(shellPath, "utf8");
const navSrc = fs.readFileSync(navPath, "utf8");
const footerSrc = fs.readFileSync(footerPath, "utf8");

describe("Challenger M1.2 Adversarial Suite: Shell, Nav & Footer", () => {
  // ── 1. SSR / Prerender Safety ──────────────────────────────────────────
  describe("1. SSR & Prerender Safety", () => {
    it("LandingShell strictly guards window.scrollTo inside useEffect with typeof window check", () => {
      // Must contain typeof window !== 'undefined'
      assert.ok(
        shellSrc.includes('typeof window !== "undefined"'),
        "LandingShell must guard window with typeof window !== 'undefined'"
      );
      assert.ok(
        shellSrc.includes("window.scrollTo"),
        "LandingShell must contain window.scrollTo"
      );

      // Verify window.scrollTo is enclosed inside useEffect
      const useEffectIndex = shellSrc.indexOf("useEffect(");
      const scrollToIndex = shellSrc.indexOf("window.scrollTo");
      assert.ok(useEffectIndex !== -1, "LandingShell must use useEffect");
      assert.ok(
        scrollToIndex > useEffectIndex,
        "window.scrollTo must be called inside useEffect body"
      );

      // Ensure no unguarded window calls exist in LandingShell
      const windowMatches = [...shellSrc.matchAll(/\bwindow\b/g)];
      for (const m of windowMatches) {
        const line = shellSrc.slice(Math.max(0, m.index - 50), m.index + 50);
        const isGuarded =
          line.includes('typeof window !== "undefined"') ||
          line.includes("window.scrollTo");
        assert.ok(
          isGuarded,
          `Unguarded window access found in LandingShell: ${line.trim()}`
        );
      }
    });

    it("LandingNav strictly guards document and window listeners inside useEffect", () => {
      assert.ok(
        navSrc.includes('typeof window === "undefined" || typeof document === "undefined"'),
        "LandingNav must guard document/window listeners with undefined check"
      );

      // Verify addEventListener is called strictly inside useEffect
      const addListenerMatches = [...navSrc.matchAll(/document\.addEventListener\(([^)]+)\)/g)];
      assert.ok(addListenerMatches.length >= 3, "LandingNav must attach mousedown, touchstart, and keydown listeners");

      // Verify removeEventListener matches every addEventListener type
      const removeListenerMatches = [...navSrc.matchAll(/document\.removeEventListener\(([^)]+)\)/g)];
      assert.equal(
        removeListenerMatches.length,
        addListenerMatches.length,
        "LandingNav must clean up every attached document event listener"
      );

      // Ensure no raw window.* or document.* calls occur outside useEffect
      const outsideEffectNav = navSrc
        .replace(/useEffect\(\(\) => \{[\s\S]*?\}, \[[^\]]*\]\);/g, "/* useEffect replaced */");
      assert.ok(
        !outsideEffectNav.includes("window."),
        "LandingNav must not access window outside useEffect"
      );
      assert.ok(
        !outsideEffectNav.includes("document."),
        "LandingNav must not access document outside useEffect"
      );
    });

    it("LandingFooter has zero window or document references", () => {
      assert.ok(
        !footerSrc.includes("window."),
        "LandingFooter must have zero window references"
      );
      assert.ok(
        !footerSrc.includes("document."),
        "LandingFooter must have zero document references"
      );
    });
  });

  // ── 2. Responsive Layout & Mobile Drawer Breakpoints ──────────────────
  describe("2. Responsive Layout & Mobile Drawer Breakpoints", () => {
    it("LandingNav implements proper responsive breakpoint classes", () => {
      // Desktop nav links must be hidden on mobile (< 768px) and flex on md+
      assert.ok(
        navSrc.includes("hidden md:flex"),
        "Desktop navigation links must use 'hidden md:flex'"
      );

      // Desktop action CTAs must hide on xs screens (< 640px)
      assert.ok(
        navSrc.includes("hidden sm:flex"),
        "Desktop action CTAs must use 'hidden sm:flex'"
      );

      // Mobile controls (hamburger) must be flex on mobile and hidden on md+
      assert.ok(
        navSrc.includes("flex md:hidden"),
        "Mobile hamburger trigger must use 'flex md:hidden'"
      );

      // Mobile drawer must be hidden on md+ screens
      assert.ok(
        navSrc.includes("md:hidden"),
        "Mobile drawer container must be hidden on desktop (md:hidden)"
      );

      // Mobile drawer must handle scroll constraint for short mobile viewports
      assert.ok(
        navSrc.includes("max-h-[85vh]") && navSrc.includes("overflow-y-auto"),
        "Mobile drawer must have max-h-[85vh] and overflow-y-auto to prevent mobile cutoff"
      );
    });

    it("LandingNav mobile drawer contains full feature list, top links, and auth CTAs", () => {
      // Must map all 4 FEATURE_DROPDOWN_ITEMS inside mobile drawer
      assert.ok(
        navSrc.includes("FEATURE_DROPDOWN_ITEMS.map"),
        "Mobile drawer must map over FEATURE_DROPDOWN_ITEMS"
      );

      // Must include direct mobile links to pricing and community
      assert.ok(
        navSrc.includes('to="/pricing"') && navSrc.includes("Pricing Plans"),
        "Mobile drawer must include direct link to /pricing"
      );
      assert.ok(
        navSrc.includes('to="/community"') && navSrc.includes("Community Telemetry"),
        "Mobile drawer must include direct link to /community"
      );

      // Must include mobile auth CTAs
      assert.ok(
        navSrc.includes('to="/login"') && navSrc.includes("Sign In"),
        "Mobile drawer must include Sign In link"
      );
      assert.ok(
        navSrc.includes('to="/login?mode=signup"') && navSrc.includes("Start Pairing Now"),
        "Mobile drawer must include Start Pairing Now link"
      );
    });

    it("LandingShell and LandingFooter strictly enforce horizontal overflow containment", () => {
      assert.ok(
        shellSrc.includes("overflow-x-hidden"),
        "LandingShell root element must enforce 'overflow-x-hidden'"
      );
      assert.ok(
        footerSrc.includes("overflow-hidden"),
        "LandingFooter root container must enforce 'overflow-hidden'"
      );

      // Clipped code line container must enforce overflow-hidden
      const artTagIndex = footerSrc.indexOf("&lt;OctoPair /&gt;");
      assert.ok(artTagIndex !== -1, "Footer must contain &lt;OctoPair /&gt;");
      const parentOverflowIndex = footerSrc.lastIndexOf("overflow-hidden", artTagIndex);
      assert.ok(
        parentOverflowIndex !== -1 && parentOverflowIndex > footerSrc.indexOf("footer"),
        "Clipped <OctoPair /> code art parent container must enforce overflow-hidden"
      );
      assert.ok(
        footerSrc.includes("translate-y-[20%]"),
        "Clipped code art must apply translate-y-[20%] vertical clip"
      );
    });
  });

  // ── 3. Canonical Route Links & Hash Elimination ───────────────────────
  describe("3. Canonical Route Links & Hash Elimination", () => {
    it("LandingFooter has migrated all in-page product hashes to canonical routes", () => {
      const forbiddenHashes = [
        'href="#matching"',
        'to="#matching"',
        'href="#feed"',
        'to="#feed"',
        'href="#collab"',
        'to="#collab"',
        'href="#projects"',
        'to="#projects"',
        'href="#features"',
        'to="#features"',
        'href="#how-it-works"',
        'to="#how-it-works"',
        'href="#sessions"',
        'to="#sessions"',
        'href="#community"',
        'to="#community"',
      ];

      for (const hash of forbiddenHashes) {
        assert.ok(
          !footerSrc.includes(hash),
          `LandingFooter must not contain deprecated hash link: ${hash}`
        );
      }

      // Verify canonical multi-page paths
      assert.ok(footerSrc.includes('to="/features/match"'), "Footer must link to /features/match");
      assert.ok(footerSrc.includes('to="/features/collab"'), "Footer must link to /features/collab");
      assert.ok(footerSrc.includes('to="/features/feed"'), "Footer must link to /features/feed");
      assert.ok(footerSrc.includes('to="/features/projects"'), "Footer must link to /features/projects");
      assert.ok(footerSrc.includes('to="/pricing"'), "Footer must link to /pricing");
      assert.ok(footerSrc.includes('to="/pricing#faq"'), "Footer must link to /pricing#faq");
      assert.ok(footerSrc.includes('to="/community"'), "Footer must link to /community");
    });

    it("LandingFooter retains all external socials and brand assets", () => {
      // Social links
      assert.ok(footerSrc.includes('href="https://github.com"'), "Footer must retain GitHub URL");
      assert.ok(footerSrc.includes('href="https://x.com"'), "Footer must retain X URL");
      assert.ok(footerSrc.includes('href="https://discord.com"'), "Footer must retain Discord URL");

      // Verify security attributes on external links
      const externalLinkMatches = [...footerSrc.matchAll(/<a\s+[^>]*href="https:[^"]*"[^>]*>/g)];
      for (const [match] of externalLinkMatches) {
        assert.ok(match.includes('target="_blank"'), `External link must have target="_blank": ${match}`);
        assert.ok(match.includes('rel="noreferrer"'), `External link must have rel="noreferrer": ${match}`);
      }

      // Brand Logo
      assert.ok(footerSrc.includes("<OctoPairLogo"), "Footer must render OctoPairLogo");

      // Drifting cursors
      assert.ok(footerSrc.includes("Alex"), "Footer must retain Alex cursor");
      assert.ok(footerSrc.includes("Elena"), "Footer must retain Elena cursor");
      assert.ok(footerSrc.includes("#ccff00"), "Alex cursor must use lime accent #ccff00");
      assert.ok(footerSrc.includes("#b266ff"), "Elena cursor must use purple accent #b266ff");
    });
  });

  // ── 4. LandingNav Mega-Menu Specification & Catalog ───────────────────
  describe("4. LandingNav Mega-Menu Specification & Catalog", () => {
    it("exports FEATURE_DROPDOWN_ITEMS with exactly 4 rich cards", () => {
      assert.ok(
        navSrc.includes("export const FEATURE_DROPDOWN_ITEMS ="),
        "LandingNav must export FEATURE_DROPDOWN_ITEMS"
      );

      // Verify items
      const expectedItems = [
        { title: "Swipe & Match", path: "/features/match", accent: "#b266ff" },
        { title: "Live Room", path: "/features/collab", accent: "#ccff00" },
        { title: "Developer Feed", path: "/features/feed", accent: "#ccff00" },
        { title: "Open Projects", path: "/features/projects", accent: "#b266ff" },
      ];

      for (const item of expectedItems) {
        assert.ok(navSrc.includes(item.title), `Feature dropdown must include ${item.title}`);
        assert.ok(navSrc.includes(item.path), `Feature dropdown must link to ${item.path}`);
        assert.ok(navSrc.includes(item.accent), `Feature dropdown item ${item.title} must have accent ${item.accent}`);
      }
    });

    it("implements full accessibility and keyboard/outside click dismissal", () => {
      // ARIA semantics
      assert.ok(navSrc.includes('aria-haspopup="true"'), "Button must declare aria-haspopup");
      assert.ok(navSrc.includes("aria-expanded={featuresOpen}"), "Button must bind aria-expanded to state");
      assert.ok(navSrc.includes('aria-controls="features-dropdown"'), "Button must reference aria-controls");
      assert.ok(navSrc.includes('id="features-dropdown"'), "Dropdown popover must have id matching aria-controls");
      assert.ok(navSrc.includes('role="region"'), "Dropdown popover must declare role='region'");

      // Keyboard & Click dismissal
      assert.ok(navSrc.includes('event.key === "Escape"'), "Must handle Escape key to dismiss dropdown");
      assert.ok(navSrc.includes("handleClickOutside"), "Must implement outside click listener");
      assert.ok(navSrc.includes("dropdownRef.current"), "Must use ref to check outside clicks");

      // Auto-dismiss on navigation
      assert.ok(
        navSrc.includes("setFeaturesOpen(false)") && navSrc.includes("setMobileMenuOpen(false)"),
        "Must reset menu states on pathname change"
      );
    });

    it("highlights active section accurately for /features sub-paths", () => {
      assert.ok(
        navSrc.includes('pathname.startsWith("/features")'),
        "Must check pathname.startsWith('/features') for active section highlighting"
      );
      assert.ok(
        navSrc.includes("text-[#ccff00] font-semibold"),
        "Must highlight active feature nav item with lime text and semibold weight"
      );
    });
  });

  // ── 5. Design System Invariants ───────────────────────────────────────
  describe("5. Design System Invariants", () => {
    const components = [
      { name: "LandingShell.jsx", src: shellSrc },
      { name: "LandingNav.jsx", src: navSrc },
      { name: "LandingFooter.jsx", src: footerSrc },
    ];

    it("Strict Invariant: Exactly zero <h1> elements across all M1 components", () => {
      for (const { name, src } of components) {
        const h1Matches = src.match(/<h1[^>]*>/gi);
        assert.equal(
          h1Matches,
          null,
          `${name} must not contain any <h1> tags (single <h1> belongs strictly to HeroSection)`
        );
      }
    });

    it("Strict Invariant: Exactly zero emojis in all M1 components", () => {
      const emojiRegex = /[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]/gu;
      for (const { name, src } of components) {
        assert.ok(!emojiRegex.test(src), `${name} must contain zero emojis`);
      }
    });

    it("Strict Invariant: Zero Redux dependencies in all M1 components", () => {
      for (const { name, src } of components) {
        assert.ok(!src.includes("useSelector"), `${name} must not import useSelector`);
        assert.ok(!src.includes("useDispatch"), `${name} must not import useDispatch`);
        assert.ok(!src.includes("react-redux"), `${name} must not import from react-redux`);
      }
    });

    it("Strict Invariant: Zero forbidden links (/discover, /sandbox, /profile/:id)", () => {
      for (const { name, src } of components) {
        assert.ok(!src.includes('"/discover"'), `${name} must not link to /discover`);
        assert.ok(!src.includes('"/sandbox"'), `${name} must not link to /sandbox`);
        assert.ok(!src.includes('"/profile/'), `${name} must not link to /profile/:id`);
      }
    });

    it("Strict Invariant: All CTA buttons route to /login?mode=signup", () => {
      assert.ok(navSrc.includes('to="/login?mode=signup"'), "Nav desktop CTA must link to /login?mode=signup");
      assert.ok(footerSrc.includes('to="/login?mode=signup"'), "Footer CTA must link to /login?mode=signup");
    });

    it("Strict Invariant: Void theme #09090b and hairline borders border-white/10", () => {
      assert.ok(shellSrc.includes("bg-[#09090b]"), "LandingShell must use #09090b void background");
      assert.ok(footerSrc.includes("bg-[#09090b]"), "LandingFooter must use #09090b void background");
      assert.ok(navSrc.includes("bg-[#09090b]"), "LandingNav must use #09090b void background");
      assert.ok(navSrc.includes("border-white/10"), "LandingNav must use border-white/10");
      assert.ok(footerSrc.includes("border-white/10"), "LandingFooter must use border-white/10");
    });
  });

  // ── 6. Production Build & Prerender SSR Verification ──────────────────
  describe("6. Production Build & Prerender SSR Verification", () => {
    it("dist/index.html contains prerendered SSR markup with exactly one <h1>", () => {
      const distIndex = path.resolve(frontendDir, "dist/index.html");
      assert.ok(fs.existsSync(distIndex), "dist/index.html must exist from build");

      const html = fs.readFileSync(distIndex, "utf8");
      assert.ok(html.includes('<div id="root">'), "dist/index.html must contain root div");
      assert.ok(!html.includes('<div id="root"></div>'), "dist/index.html root div must not be empty");

      const h1Matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
      assert.equal(
        h1Matches.length,
        1,
        `Prerendered index.html must contain exactly 1 <h1>, found ${h1Matches.length}`
      );
    });

    it("dist/index.html does not preload Monaco or Sandpack chunks", () => {
      const distIndex = path.resolve(frontendDir, "dist/index.html");
      const html = fs.readFileSync(distIndex, "utf8");

      const preloads = [...html.matchAll(/<link rel="modulepreload"[^>]*href="([^"]+)"/g)].map(m => m[1]);
      for (const p of preloads) {
        assert.ok(!p.includes("vendor-monaco"), `Initial preload must not include monaco: ${p}`);
        assert.ok(!p.includes("vendor-sandpack"), `Initial preload must not include sandpack: ${p}`);
      }
    });
  });
});
