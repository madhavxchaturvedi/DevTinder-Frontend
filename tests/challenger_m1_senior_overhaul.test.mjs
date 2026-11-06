/**
 * challenger_m1_senior_overhaul.test.mjs
 *
 * EMPIRICAL CHALLENGER TEST SUITE: Milestone 1 Senior UI/UX & Motion Overhaul
 *
 * Verifies:
 * 1. Sticky Sidebar Styling: overflow-x-clip across LandingShell, FeaturesMatchPage, LandingPage.
 * 2. Hover Intent Timing & Ergonomics: 150ms timeout, useRef, unmount cleanup, and pointer bridge.
 * 3. Prerender Title Injection: dist/index.html title, meta tags, and all 7 static routes.
 * 4. Double Shell Elimination: exactly 1 <nav> and 1 <footer> in dist/index.html.
 * 5. Favicon & App Icons: SVG mark alignment with OctoPairLogo, raster pixel dimensions.
 * 6. Mobile Drawer Sanitization & Hash Navigation: clean header and retry scroll logic.
 * 7. Brand Mark Badge & Metallic Footer Watermark.
 */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const FRONTEND_DIR = path.resolve(process.cwd().endsWith("Frontend") ? process.cwd() : path.join(process.cwd(), "Frontend"));

test("CHALLENGER M1: Sticky Sidebar Styling & CSS Overflow-Clip Verification", async (t) => {
  const landingShellPath = path.join(FRONTEND_DIR, "src/components/landing/LandingShell.jsx");
  const matchPagePath = path.join(FRONTEND_DIR, "src/pages/marketing/FeaturesMatchPage.jsx");
  const landingPagePath = path.join(FRONTEND_DIR, "src/components/LandingPage.jsx");
  const howItWorksPath = path.join(FRONTEND_DIR, "src/components/landing/HowItWorksSection.jsx");

  const landingShellSrc = fs.readFileSync(landingShellPath, "utf8");
  const matchPageSrc = fs.readFileSync(matchPagePath, "utf8");
  const landingPageSrc = fs.readFileSync(landingPagePath, "utf8");
  const howItWorksSrc = fs.readFileSync(howItWorksPath, "utf8");

  await t.test("LandingShell.jsx uses overflow-x-clip on outer wrapper", () => {
    assert.match(
      landingShellSrc,
      /className="[^"]*overflow-x-clip[^"]*"/,
      "LandingShell root element must use overflow-x-clip"
    );
    // Ensure className does NOT contain active overflow-x-hidden
    const match = landingShellSrc.match(/<div className="([^"]*)"/);
    assert.ok(match, "Outer div in LandingShell must have className");
    assert.ok(
      !match[1].includes("overflow-x-hidden"),
      "LandingShell root className must NOT contain overflow-x-hidden"
    );
  });

  await t.test("FeaturesMatchPage.jsx uses overflow-x-clip on outer wrapper", () => {
    assert.match(
      matchPageSrc,
      /className="[^"]*overflow-x-clip[^"]*"/,
      "FeaturesMatchPage root element must use overflow-x-clip"
    );
    const match = matchPageSrc.match(/<div className="([^"]*)"/);
    assert.ok(match, "Outer div in FeaturesMatchPage must have className");
    assert.ok(
      !match[1].includes("overflow-x-hidden"),
      "FeaturesMatchPage root className must NOT contain overflow-x-hidden"
    );
  });

  await t.test("LandingPage.jsx uses overflow-x-clip on outer wrapper", () => {
    assert.match(
      landingPageSrc,
      /className="[^"]*overflow-x-clip[^"]*"/,
      "LandingPage root element must use overflow-x-clip"
    );
    const match = landingPageSrc.match(/<div className="([^"]*)"/);
    assert.ok(match, "Outer div in LandingPage must have className");
    assert.ok(
      !match[1].includes("overflow-x-hidden"),
      "LandingPage root className must NOT contain overflow-x-hidden"
    );
  });

  await t.test("HowItWorksSection.jsx contains sticky navigator without intervening scroll containers", () => {
    assert.ok(
      howItWorksSrc.includes("lg:sticky lg:top-28"),
      "HowItWorksSection must define sticky sidebar element at lg:top-28"
    );
    // Ensure no ancestor element inside HowItWorksSection traps the sticky context
    assert.ok(
      !howItWorksSrc.includes("overflow-hidden lg:sticky"),
      "Sticky container must not have overflow-hidden"
    );
  });
});

test("CHALLENGER M1: Hover Intent Timing & Ergonomics in LandingNav.jsx", async (t) => {
  const landingNavPath = path.join(FRONTEND_DIR, "src/components/landing/LandingNav.jsx");
  const navSrc = fs.readFileSync(landingNavPath, "utf8");

  await t.test("LandingNav.jsx implements 150ms hover intent with useRef and timeouts", () => {
    assert.ok(navSrc.includes("useRef"), "LandingNav must import and use useRef");
    assert.match(
      navSrc,
      /hoverTimeoutRef\s*=\s*useRef\(null\)/,
      "LandingNav must initialize hoverTimeoutRef with useRef(null)"
    );
    assert.match(
      navSrc,
      /setTimeout\(\s*\(\)\s*=>\s*\{\s*setFeaturesOpen\(true\);\s*\},?\s*150\)/,
      "handleMouseEnter must use 150ms setTimeout to open features"
    );
    assert.match(
      navSrc,
      /setTimeout\(\s*\(\)\s*=>\s*\{\s*setFeaturesOpen\(false\);\s*\},?\s*150\)/,
      "handleMouseLeave must use 150ms setTimeout to close features"
    );
    assert.match(
      navSrc,
      /clearTimeout\(hoverTimeoutRef\.current\)/,
      "hoverTimeoutRef must be cleared before starting new timer"
    );
  });

  await t.test("LandingNav.jsx cleans up hover timeout on unmount", () => {
    // Check for cleanup effect
    const unmountCleanupMatch = navSrc.match(
      /useEffect\(\(\)\s*=>\s*\{\s*return\s*\(\)\s*=>\s*\{\s*if\s*\(hoverTimeoutRef\.current\)\s*\{\s*clearTimeout\(hoverTimeoutRef\.current\);/
    );
    assert.ok(
      unmountCleanupMatch,
      "LandingNav must register an unmount cleanup effect that cancels hoverTimeoutRef"
    );
  });

  await t.test("LandingNav.jsx includes invisible pointer bridge on dropdown popover", () => {
    assert.ok(
      navSrc.includes("before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']"),
      "Dropdown popover must have invisible pointer bridge to prevent mouse leaving during 12px gap traversal"
    );
  });

  await t.test("Simulated Hover Intent State Machine Behavior", async () => {
    // Empirical simulation of the hover intent state machine
    class HoverIntentSimulator {
      constructor(delay = 150) {
        this.delay = delay;
        this.isOpen = false;
        this.timeoutId = null;
      }
      mouseEnter() {
        if (this.timeoutId) clearTimeout(this.timeoutId);
        this.timeoutId = setTimeout(() => {
          this.isOpen = true;
        }, this.delay);
      }
      mouseLeave() {
        if (this.timeoutId) clearTimeout(this.timeoutId);
        this.timeoutId = setTimeout(() => {
          this.isOpen = false;
        }, this.delay);
      }
      unmount() {
        if (this.timeoutId) clearTimeout(this.timeoutId);
      }
    }

    const sim = new HoverIntentSimulator(150);

    // Scenario A: Fast glance (< 150ms)
    sim.mouseEnter();
    await new Promise((r) => setTimeout(r, 60));
    sim.mouseLeave();
    await new Promise((r) => setTimeout(r, 160));
    assert.equal(sim.isOpen, false, "Menu must NOT open during fast mouse glance (<150ms)");

    // Scenario B: Intentional hover (>= 150ms)
    sim.mouseEnter();
    await new Promise((r) => setTimeout(r, 160));
    assert.equal(sim.isOpen, true, "Menu MUST open after 150ms hover dwell time");

    // Scenario C: Brief gap jitter (pointer traverses gap, mouseLeave + mouseEnter within 80ms)
    sim.mouseLeave();
    await new Promise((r) => setTimeout(r, 70));
    sim.mouseEnter(); // re-entered dropdown before 150ms elapsed
    await new Promise((r) => setTimeout(r, 160));
    assert.equal(sim.isOpen, true, "Menu must remain OPEN if pointer quickly re-enters within 150ms window");

    // Scenario D: Intentional departure
    sim.mouseLeave();
    await new Promise((r) => setTimeout(r, 160));
    assert.equal(sim.isOpen, false, "Menu MUST close after pointer leaves for >150ms");

    // Scenario E: Unmount cleanup
    sim.mouseEnter();
    sim.unmount();
    await new Promise((r) => setTimeout(r, 160));
    assert.equal(sim.isOpen, false, "Menu must NOT transition after unmount");
  });
});

test("CHALLENGER M1: Title & Prerender Injection Verification", async (t) => {
  const distIndexPath = path.join(FRONTEND_DIR, "dist/index.html");
  const html = fs.readFileSync(distIndexPath, "utf8");

  await t.test("dist/index.html title tag matches canonical title", () => {
    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
    assert.ok(titleMatch, "dist/index.html must have a <title> tag");
    assert.equal(
      titleMatch[1].trim(),
      "OctoPair — The Multiplayer IDE for Builders",
      "Title tag must be exactly 'OctoPair — The Multiplayer IDE for Builders'"
    );
  });

  await t.test("dist/index.html OpenGraph & Twitter title tags match canonical title", () => {
    assert.match(
      html,
      /<meta property="og:title" content="OctoPair — The Multiplayer IDE for Builders" \/>/,
      "og:title must match canonical title"
    );
    assert.match(
      html,
      /<meta name="twitter:title" content="OctoPair — The Multiplayer IDE for Builders" \/>/,
      "twitter:title must match canonical title"
    );
  });

  await t.test("All 7 prerendered marketing route HTML files exist and contain non-empty markup", () => {
    const routes = [
      "index.html",
      "features/match/index.html",
      "features/collab/index.html",
      "features/feed/index.html",
      "features/projects/index.html",
      "pricing/index.html",
      "community/index.html",
    ];

    for (const relPath of routes) {
      const fullPath = path.join(FRONTEND_DIR, "dist", relPath);
      assert.ok(fs.existsSync(fullPath), `Prerendered file must exist: ${relPath}`);
      const fileHtml = fs.readFileSync(fullPath, "utf8");
      assert.ok(fileHtml.length > 500, `Prerendered file ${relPath} must have content > 500 bytes`);
      assert.ok(fileHtml.includes('<div id="root">'), `${relPath} must contain root container`);
      const rootMatch = fileHtml.match(/<div id="root">([\s\S]*?)<\/div>/);
      assert.ok(rootMatch && rootMatch[1].length > 50, `${relPath} must contain injected SSR markup inside #root`);
    }
  });
});

test("CHALLENGER M1: Double Shell Elimination on Root /", async (t) => {
  const distIndexPath = path.join(FRONTEND_DIR, "dist/index.html");
  const html = fs.readFileSync(distIndexPath, "utf8");

  await t.test("dist/index.html renders exactly 1 <nav> element", () => {
    const navMatches = html.match(/<nav\b[^>]*>/gi) || [];
    assert.equal(
      navMatches.length,
      1,
      `dist/index.html must render exactly 1 <nav> element, found ${navMatches.length}`
    );
  });

  await t.test("dist/index.html renders exactly 1 <footer> element", () => {
    const footerMatches = html.match(/<footer\b[^>]*>/gi) || [];
    assert.equal(
      footerMatches.length,
      1,
      `dist/index.html must render exactly 1 <footer> element, found ${footerMatches.length}`
    );
  });

  await t.test("LandingPage.jsx defaults wrapInShell to false", () => {
    const landingPagePath = path.join(FRONTEND_DIR, "src/components/LandingPage.jsx");
    const src = fs.readFileSync(landingPagePath, "utf8");
    assert.match(
      src,
      /wrapInShell\s*=\s*false/,
      "LandingPage component definition must default wrapInShell = false"
    );
  });
});

test("CHALLENGER M1: Favicon & App Icons Integrity", async (t) => {
  const faviconSvgPath = path.join(FRONTEND_DIR, "public/favicon.svg");
  const favicon32Path = path.join(FRONTEND_DIR, "public/favicon-32.png");
  const appleTouchIconPath = path.join(FRONTEND_DIR, "public/apple-touch-icon.png");

  await t.test("favicon.svg matches OctoPairLogo mark specifications", () => {
    assert.ok(fs.existsSync(faviconSvgPath), "public/favicon.svg must exist");
    const svg = fs.readFileSync(faviconSvgPath, "utf8");
    assert.ok(svg.includes('fill="#ccff00"'), "favicon background must be lime #ccff00");
    assert.ok(svg.includes('stroke="#09090b"'), "favicon mark stroke must be void black #09090b");
    assert.ok(
      svg.includes('d="M 29.5 19 A 14 14 0 1 1 29.5 37"'),
      "favicon must feature canonical open connection arc from OctoPairLogo"
    );
    assert.ok(!svg.includes('<circle cx="40"'), "old closed circle must not exist in favicon.svg");
  });

  await t.test("Raster icons exist and have exact required pixel dimensions", () => {
    assert.ok(fs.existsSync(favicon32Path), "public/favicon-32.png must exist");
    assert.ok(fs.existsSync(appleTouchIconPath), "public/apple-touch-icon.png must exist");

    // Check pixel dimensions using sips
    const sips32 = execSync(`sips -g pixelWidth -g pixelHeight "${favicon32Path}"`, { encoding: "utf8" });
    assert.ok(sips32.includes("pixelWidth: 32"), "favicon-32.png width must be 32");
    assert.ok(sips32.includes("pixelHeight: 32"), "favicon-32.png height must be 32");

    const sips180 = execSync(`sips -g pixelWidth -g pixelHeight "${appleTouchIconPath}"`, { encoding: "utf8" });
    assert.ok(sips180.includes("pixelWidth: 180"), "apple-touch-icon.png width must be 180");
    assert.ok(sips180.includes("pixelHeight: 180"), "apple-touch-icon.png height must be 180");
  });
});

test("CHALLENGER M1: Mobile Drawer Sanitization & Hash Navigation", async (t) => {
  const landingNavPath = path.join(FRONTEND_DIR, "src/components/landing/LandingNav.jsx");
  const landingShellPath = path.join(FRONTEND_DIR, "src/components/landing/LandingShell.jsx");

  const navSrc = fs.readFileSync(landingNavPath, "utf8");
  const shellSrc = fs.readFileSync(landingShellPath, "utf8");

  await t.test("LandingNav.jsx mobile top-bar has clean toggle without duplicate sign-in", () => {
    // In mobile section (flex md:hidden), ensure no top-bar Sign In link exists outside drawer
    const mobileHeaderSection = navSrc.slice(
      navSrc.indexOf("Mobile Controls"),
      navSrc.lastIndexOf("Mobile Navigation Drawer")
    );
    assert.ok(
      !mobileHeaderSection.includes("Sign In"),
      "Mobile top-bar must not render duplicate Sign In link"
    );
    assert.ok(
      mobileHeaderSection.includes("Toggle Navigation Menu"),
      "Mobile top-bar must render hamburger button"
    );
  });

  await t.test("LandingNav.jsx mobile drawer contains auth CTAs and scroll containment", () => {
    const mobileDrawerSection = navSrc.slice(navSrc.indexOf("Mobile Navigation Drawer"));
    assert.ok(
      mobileDrawerSection.includes("Sign In"),
      "Mobile drawer must include Sign In CTA"
    );
    assert.ok(
      mobileDrawerSection.includes("Start Pairing Now"),
      "Mobile drawer must include Start Pairing Now primary CTA"
    );
    assert.ok(
      mobileDrawerSection.includes("max-h-[85vh] overflow-y-auto"),
      "Mobile drawer must include max-h-[85vh] and overflow-y-auto for viewport safety"
    );
  });

  await t.test("LandingShell.jsx implements hash navigation with polling retry", () => {
    assert.ok(
      shellSrc.includes("location.hash.replace(/^#/, \"\")"),
      "LandingShell must extract clean targetId from location.hash"
    );
    assert.ok(
      shellSrc.includes("scrollIntoView({ behavior: \"smooth\", block: \"start\" })"),
      "LandingShell must scroll smoothly to target element"
    );
    assert.ok(
      shellSrc.includes("maxAttempts = 8"),
      "LandingShell must use retry attempts to accommodate async React.lazy() mounts"
    );
  });
});

test("CHALLENGER M1: Brand Mark Badge & Metallic Footer Watermark", async (t) => {
  const landingNavPath = path.join(FRONTEND_DIR, "src/components/landing/LandingNav.jsx");
  const landingFooterPath = path.join(FRONTEND_DIR, "src/components/landing/LandingFooter.jsx");

  const navSrc = fs.readFileSync(landingNavPath, "utf8");
  const footerSrc = fs.readFileSync(landingFooterPath, "utf8");

  await t.test("LandingNav.jsx wraps OctoPairLogo in illuminated lime badge", () => {
    assert.ok(
      navSrc.includes("bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] p-1.5 rounded-lg shadow-[0_0_12px_rgba(204,255,0,0.25)]"),
      "LandingNav must style OctoPairLogo in illuminated lime badge"
    );
  });

  await t.test("LandingFooter.jsx renders giant metallic gradient watermark", () => {
    assert.ok(
      footerSrc.includes("bg-gradient-to-b from-white/25 via-white/10 to-white/[0.02] bg-clip-text text-transparent"),
      "LandingFooter watermark must use metallic gradient"
    );
  });
});
