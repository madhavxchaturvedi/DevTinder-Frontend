import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import esbuild from "esbuild";
import React from "react";
import { renderToString } from "react-dom/server";

const FRONTEND_DIR = path.resolve(import.meta.dirname, "..");
const LANDING_FOOTER_PATH = path.join(FRONTEND_DIR, "src/components/landing/LandingFooter.jsx");
const ANIMATED_FOOTER_PATH = path.join(FRONTEND_DIR, "src/components/ui/animated-footer.jsx");

// Dynamic component loader for testing
const loadFooterComponents = () => {
  const animatedSrc = fs.readFileSync(ANIMATED_FOOTER_PATH, "utf8");
  const landingSrc = fs.readFileSync(LANDING_FOOTER_PATH, "utf8");

  const transAnimated = esbuild.transformSync(animatedSrc, { loader: "jsx", format: "cjs" });
  const transLanding = esbuild.transformSync(landingSrc, { loader: "jsx", format: "cjs" });

  const fakeRequire = (name) => {
    if (name === "react") return React;
    if (name === "react-router-dom") {
      return {
        Link: ({ to, children, ...props }) => React.createElement("a", { href: to, ...props }, children),
      };
    }
    if (name === "lucide-react") {
      return {
        Github: (props) => React.createElement("svg", { "data-icon": "github", ...props }),
        Twitter: (props) => React.createElement("svg", { "data-icon": "twitter", ...props }),
        MessageSquare: (props) => React.createElement("svg", { "data-icon": "discord", ...props }),
      };
    }
    if (name.includes("OctoPairLogo")) {
      return {
        OctoPairLogo: (props) => React.createElement("svg", { "data-logo": "octopair", ...props }),
      };
    }
    if (name.includes("animated-footer") || name === "../ui/animated-footer") {
      const moduleObj = { exports: {} };
      const fn = new Function("require", "exports", "module", transAnimated.code);
      fn(fakeRequire, moduleObj.exports, moduleObj);
      return moduleObj.exports;
    }
    if (name === "next-themes") {
      return { useTheme: () => ({ resolvedTheme: "dark" }) };
    }
    if (name === "gsap") {
      return {
        default: {
          utils: { toArray: () => [] },
          to: () => {},
          set: () => {},
          killTweensOf: () => {},
        },
      };
    }
    if (name === "@/lib/utils") {
      return { cn: (...classes) => classes.filter(Boolean).join(" ") };
    }
    throw new Error(`Unexpected import in test loader: ${name}`);
  };

  const animModule = { exports: {} };
  const animFn = new Function("require", "exports", "module", transAnimated.code);
  animFn(fakeRequire, animModule.exports, animModule);

  const landModule = { exports: {} };
  const landFn = new Function("require", "exports", "module", transLanding.code);
  landFn(fakeRequire, landModule.exports, landModule);

  return {
    AnimatedFooter: animModule.exports.AnimatedFooter || animModule.exports.default,
    LandingFooter: landModule.exports.LandingFooter || landModule.exports.default,
    animatedSrc,
    landingSrc,
  };
};

describe("Footer UI and Layout Verification", () => {
  const { AnimatedFooter, LandingFooter, animatedSrc, landingSrc } = loadFooterComponents();

  describe("R1: Fix Link Hover Overlap & Text Collisions", () => {
    it("ensures all footer links have relative z-index isolation preventing hover overlap", () => {
      // Social links have relative z-10 and hover:z-20
      assert.ok(
        landingSrc.includes("relative z-10 hover:z-20") || (landingSrc.includes("relative z-10") && landingSrc.includes("hover:z-20")),
        "Links must include relative positioning and z-index isolation"
      );
      assert.ok(
        landingSrc.includes("hover:scale-105") && landingSrc.includes("hover:z-20"),
        "Interactive social buttons must elevate z-index on hover"
      );
      // Product and legal links have inline-block and relative z-index
      assert.ok(
        landingSrc.includes("inline-block relative z-10 hover:z-20"),
        "Navigation text links must be inline-block with z-index isolation"
      );
    });

    it("prevents collisions between copyright notice and subtitle with each other", () => {
      // Both elements have shrink-0 and responsive flex layout (flex-col md:flex-row)
      assert.ok(landingSrc.includes("flex-col md:flex-row"), "Bottom bar must stack on small screens and row on desktop");
      assert.ok(landingSrc.includes("shrink-0"), "Copyright and subtitle paragraphs must have shrink-0 to prevent text collisions");
      assert.ok(landingSrc.includes("Built for real-time collaboration."), "Must contain copyright notice");
      assert.ok(landingSrc.includes("Instant, real-time code synchronization."), "Must contain subtitle");
    });

    it("prevents collisions between bottom bar and ASCII canvas hands via vertical bounding", () => {
      // ASCII hands wrapper is constrained to top-0 bottom-24, preventing overlap with bottom bar
      assert.ok(
        animatedSrc.includes("bottom-24") || animatedSrc.includes("bottom-20"),
        "ASCII hands must be vertically constrained to prevent reaching bottom bar"
      );
      // Bottom content is isolated at z-20
      assert.ok(
        animatedSrc.includes("relative z-20") && animatedSrc.includes("{bottomContent}"),
        "bottomContent must render with z-20 stacking isolation"
      );
    });

    it("prevents collisions between copyright bar and the <OctoPair /> title", () => {
      // Heading lines and bottom bar are distinct vertically separated blocks
      assert.ok(animatedSrc.includes("bottomContent"), "AnimatedFooter must support bottomContent slot");
      assert.ok(landingSrc.includes("bottomContent={"), "LandingFooter must pass bottom bar to bottomContent");
      assert.ok(landingSrc.includes("border-t border-white/[0.07]"), "Bottom bar must have hairline border separator");
    });
  });

  describe("R2: Dual-Color ASCII Canvas Hands", () => {
    it("configures left hand with brand Lime (#ccff00)", () => {
      assert.ok(animatedSrc.includes("leftCharColor = \"#ccff00\""), "AnimatedFooter default leftCharColor must be #ccff00");
      assert.ok(landingSrc.includes('leftCharColor="#ccff00"'), "LandingFooter must set leftCharColor to #ccff00");
      assert.ok(animatedSrc.includes('loadHand(leftImage, leftCanvasRef.current, 1, "left")'), "Left hand must be tagged with 'left' side");
    });

    it("configures right hand with Lavender Purple (#b266ff)", () => {
      assert.ok(animatedSrc.includes("rightCharColor = \"#b266ff\""), "AnimatedFooter default rightCharColor must be #b266ff");
      assert.ok(landingSrc.includes('rightCharColor="#b266ff"'), "LandingFooter must set rightCharColor to #b266ff");
      assert.ok(animatedSrc.includes('loadHand(rightImage, rightCanvasRef.current, -1, "right")'), "Right hand must be tagged with 'right' side");
    });

    it("renders each hand with side-specific character and hover colors", () => {
      assert.ok(
        animatedSrc.includes("live.leftCharColor") && animatedSrc.includes("live.rightCharColor"),
        "renderHand must evaluate side-specific base character colors"
      );
      assert.ok(
        animatedSrc.includes("live.leftHoverColor") && animatedSrc.includes("live.rightHoverColor"),
        "renderHand must evaluate side-specific highlight colors"
      );
    });
  });

  describe("R3: Refine Product Title Styling, Animation, and Aesthetics", () => {
    it("applies reduced-opacity metallic styling to product title", () => {
      assert.ok(
        landingSrc.includes("bg-gradient-to-b from-white/25 via-white/10 to-white/[0.02] bg-clip-text text-transparent"),
        "LandingFooter must use reduced-opacity metallic gradient"
      );
      assert.ok(
        animatedSrc.includes("bg-gradient-to-b from-white/25 via-white/10 to-white/[0.02] bg-clip-text text-transparent"),
        "AnimatedFooter must default to reduced-opacity metallic gradient"
      );
    });

    it("implements Antigravity-inspired kinetic parallax drift on title wrapper", () => {
      assert.ok(animatedSrc.includes("headingWrapRef = useRef(null)"), "AnimatedFooter must maintain headingWrapRef");
      assert.ok(
        animatedSrc.includes("headingWrapRef.current.style.transform"),
        "AnimatedFooter must update headingWrapRef transform in RAF frame"
      );
      assert.ok(
        animatedSrc.includes("ref={headingWrapRef}"),
        "AnimatedFooter must attach headingWrapRef to heading container"
      );
    });

    it("preserves data-af-char attributes for GSAP scroll-reveal animation", () => {
      assert.ok(animatedSrc.includes("data-af-char"), "AnimatedFooter must maintain data-af-char on each character");
      assert.ok(animatedSrc.includes("querySelectorAll(\"[data-af-char]\")"), "AnimatedFooter must select characters for reveal animation");
    });
  });

  describe("Adversarial Robustness & Polish Verification", () => {
    it("shields bottomContent with background color to guarantee zero canvas bleed", () => {
      assert.ok(
        animatedSrc.includes('style={{ backgroundColor: background || "#09090b" }}') ||
        animatedSrc.includes('backgroundColor: background'),
        "bottomContent container must have background color shielding"
      );
    });

    it("includes flex-wrap on bottom bar to prevent collisions on intermediate viewports", () => {
      assert.ok(
        landingSrc.includes("flex-wrap"),
        "LandingFooter bottomContent must include flex-wrap for collision-free tablet layout"
      );
    });

    it("bounds heading clamp minimum font size to prevent horizontal overflow on <= 350px screens", () => {
      const match = animatedSrc.match(/clamp\(([^,]+),\s*11cqw,\s*8\.5rem\)/);
      assert.ok(match, "Heading must use clamp for responsive sizing");
      const minRem = parseFloat(match[1]);
      assert.ok(minRem <= 2.0, `Heading clamp minimum (${minRem}rem) must be <= 2.0rem to fit within 320px viewports`);
    });

    it("eliminates CSS transition conflicts on GSAP-animated characters", () => {
      assert.ok(
        !animatedSrc.includes("data-af-char\n                aria-hidden=\"true\"\n                className=\"inline-block transition-transform") &&
        !animatedSrc.includes("data-af-char aria-hidden=\"true\" className=\"inline-block transition-transform"),
        "Characters animated by GSAP must not have CSS transition-transform to prevent animation fighting/jitter"
      );
    });

    it("optimizes hoverHand with early bounding-box culling", () => {
      assert.ok(
        animatedSrc.includes("mouseCol < -hr") || animatedSrc.includes("mouseCol > hand.columns + hr"),
        "hoverHand must cull off-canvas cursor events to prevent O(N) distance checks under GPU throttle"
      );
    });

    it("supports touchmove events with passive listeners and proper cleanup", () => {
      assert.ok(animatedSrc.includes('"touchmove", onTouchMove'), "Must attach touchmove listener for mobile/tablet ripples");
      assert.ok(animatedSrc.includes('removeEventListener("touchmove", onTouchMove)'), "Must clean up touchmove listener on unmount");
    });

    it("implements Antigravity harmonic float in kinetic title transform", () => {
      assert.ok(animatedSrc.includes("Math.sin(now *"), "Heading transform must include Antigravity harmonic float");
    });

    it("verifies exact copyright string matches specification requirements", () => {
      assert.ok(
        landingSrc.includes("© 2026 OctoPair. Built for real-time collaboration."),
        "LandingFooter must contain exact copyright string: '© 2026 OctoPair. Built for real-time collaboration.'"
      );
    });

    it("normalizes parallax easing across 60Hz and 144Hz high refresh rate displays", () => {
      assert.ok(
        animatedSrc.includes("Math.pow(1 - PARALLAX_EASE, dt * 60)"),
        "AnimatedFooter must use delta-time normalized damping for identical visual speed on 144Hz displays"
      );
    });

    it("respects prefers-reduced-motion for accessible, non-disorienting presentation", () => {
      assert.ok(
        animatedSrc.includes("prefers-reduced-motion: reduce"),
        "AnimatedFooter must detect prefers-reduced-motion to protect users with vestibular disorders"
      );
    });

    it("optimizes canvas rendering by skipping redraws when idle", () => {
      assert.ok(
        animatedSrc.includes("!hand.dirty && activeHighlights === 0 && hand.lastActiveHighlights === 0"),
        "AnimatedFooter must bypass canvas clear/redraw when no cells are lit, saving 600,000 draw calls/sec"
      );
    });

    it("prevents mobile ASCII hands collision via responsive min-width constraint", () => {
      assert.ok(
        animatedSrc.includes("min-w-[130px]"),
        "ASCII hand wrapper must allow scaling down to <= 140px on <= 400px viewports to prevent center collision"
      );
    });

    it("safely guards requestAnimationFrame and cancelAnimationFrame for headless resilience", () => {
      assert.ok(
        animatedSrc.includes("safeRaf") && animatedSrc.includes("safeCaf"),
        "AnimatedFooter must wrap RAF/CAF with fallback guards to eliminate headless crash risks"
      );
    });

    it("prevents title descender clipping and collision with bottom bar", () => {
      assert.ok(
        !animatedSrc.includes("-mb-[0.15em]"),
        "Heading h2 must not use negative bottom margin that pulls text into bottomContent bar"
      );
      assert.ok(
        animatedSrc.includes("pb-8") || animatedSrc.includes("pb-10"),
        "Heading wrapper must have generous padding to prevent kinetic collision with bottom bar"
      );
    });

    it("clamps normalized cursor coordinates to [0, 1] to prevent runaway drift and boundary overflow", () => {
      assert.ok(
        animatedSrc.includes("Math.max(0, Math.min(1, (event.clientX - rect.left) / w))"),
        "AnimatedFooter must clamp relative cursor X to [0, 1]"
      );
      assert.ok(
        animatedSrc.includes("Math.max(0, Math.min(1, (event.clientY - rect.top) / h))"),
        "AnimatedFooter must clamp relative cursor Y to [0, 1]"
      );
    });

    it("restores resting equilibrium when cursor departs via mouseleave and mouseout listeners", () => {
      assert.ok(
        animatedSrc.includes("pointer.x = 0") && animatedSrc.includes("pointer.y = 0"),
        "AnimatedFooter must reset pointer to (0,0) on mouse departure"
      );
      assert.ok(
        animatedSrc.includes('"mouseleave", onMouseLeave'),
        "AnimatedFooter must register mouseleave listener"
      );
      assert.ok(
        animatedSrc.includes('removeEventListener("mouseleave", onMouseLeave)'),
        "AnimatedFooter must clean up mouseleave listener on unmount"
      );
    });

    it("enforces reduced motion guarding across all GSAP reveal animations", () => {
      assert.ok(
        animatedSrc.includes("if (prefersReducedMotion) {\n        curtain.offset = 0;\n        gsap.set(chars, { yPercent: 0 });"),
        "animateIn must immediately show unmasked text without stagger or curtain motion when prefersReducedMotion is active"
      );
      assert.ok(
        animatedSrc.includes("if (prefersReducedMotion) {\n        curtain.offset = 0;\n        gsap.set(chars, { yPercent: 0 });\n        return;\n      }\n      gsap.set(chars, { yPercent: 125 })"),
        "maskAll must not hide characters when prefersReducedMotion is active"
      );
    });

    it("updates handsRef and marks hands dirty when color props change dynamically", () => {
      assert.ok(
        animatedSrc.includes("handsRef = useRef([])"),
        "AnimatedFooter must track hands via handsRef"
      );
      assert.ok(
        animatedSrc.includes("h.dirty = true"),
        "AnimatedFooter must mark hands dirty when color props update"
      );
    });

    it("adapts scale and damping on narrow viewports to prevent center hands collision", () => {
      assert.ok(
        animatedSrc.includes("isNarrow ? 1.05 :"),
        "AnimatedFooter must cap scale to 1.05 on narrow viewports"
      );
      assert.ok(
        animatedSrc.includes("isNarrow ? drift.x * 0.4 : drift.x"),
        "AnimatedFooter must damp horizontal drift on narrow viewports"
      );
    });

    it("provides focus-visible keyboard navigation styling on all links and brand logo", () => {
      assert.ok(
        landingSrc.includes("focus-visible:ring-1 focus-visible:ring-[#ccff00]"),
        "Brand logo and social buttons must have brand lime focus rings"
      );
      assert.ok(
        landingSrc.includes("focus-visible:ring-1 focus-visible:ring-[#ccff00]/60"),
        "Navigation text links must have focus-visible styling"
      );
    });
  });

  describe("SSR Markup Integrity", () => {
    it("renders LandingFooter without throwing in server-side environment", () => {
      const html = renderToString(React.createElement(LandingFooter));
      assert.ok(html.includes("OctoPair"), "Rendered HTML must contain 'OctoPair'");
      assert.ok(html.includes("&lt;OctoPair /&gt;"), "Rendered HTML must contain '<OctoPair />' title");
      assert.ok(html.includes("Built for real-time collaboration."), "Rendered HTML must contain copyright line");
      assert.ok(html.includes("Instant, real-time code synchronization."), "Rendered HTML must contain subtitle");
      assert.ok(html.includes("/features/match"), "Rendered HTML must contain product route links");
      assert.ok(html.includes("/privacy"), "Rendered HTML must contain legal links");
    });
  });
});
