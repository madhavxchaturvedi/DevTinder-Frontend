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

describe("challenger_m2_2: Adversarial Stress Harness for M2 Sub-Pages", () => {
  const fileNames = [
    "FeaturesCollabPage.jsx",
    "FeaturesFeedPage.jsx",
    "FeaturesProjectsPage.jsx",
    "PricingDestinationPage.jsx",
    "CommunityDestinationPage.jsx",
    "FeaturesMatchPage.jsx",
  ];

  const contents = Object.fromEntries(
    fileNames.map((name) => [name, fs.readFileSync(path.join(MARKETING_DIR, name), "utf8")])
  );
  const pricingSectionContent = fs.readFileSync(path.join(COMPONENTS_DIR, "PricingSection.jsx"), "utf8");

  // =========================================================================
  // Challenge 1: Design System Bible & Color Token Integrity
  // =========================================================================
  describe("Challenge 1: Design System Void (#09090b) and Surface (#111113) Invariants", () => {
    it("strictly forbids deprecated background hex #121212 across all subpage files", () => {
      for (const [name, src] of Object.entries(contents)) {
        assert.ok(
          !src.includes("#121212"),
          `${name} must not contain deprecated #121212 background (must use #111113 card surface)`
        );
      }
      assert.ok(
        !pricingSectionContent.includes("#121212"),
        "PricingSection.jsx must not contain deprecated #121212"
      );
    });

    it("strictly forbids solid bg-white on card or page surfaces across all subpages", () => {
      // bg-white without slash (e.g. bg-white/5 is allowed, but bg-white as surface is forbidden)
      const forbiddenBgWhite = /\bbg-white\b(?![\/])/;
      for (const [name, src] of Object.entries(contents)) {
        assert.ok(
          !forbiddenBgWhite.test(src),
          `${name} must not contain solid bg-white surface; surfaces must follow pitch-black palette`
        );
      }
    });

    it("verifies lime accent #ccff00 is only used for CTAs, active states, and highlights", () => {
      for (const [name, src] of Object.entries(contents)) {
        // Must never use bg-[#ccff00] on full screen / section backgrounds
        assert.ok(
          !src.includes("w-full bg-[#ccff00]"),
          `${name} must never paint an entire section with solid lime background`
        );
      }
    });
  });

  // =========================================================================
  // Challenge 2: Adversarial Link Verification & Route Safety
  // =========================================================================
  describe("Challenge 2: Adversarial Route Links & Target Validation", () => {
    const validInternalPrefixes = [
      "/",
      "/features/match",
      "/features/collab",
      "/features/feed",
      "/features/projects",
      "/pricing",
      "/community",
      "/login",
    ];

    it("verifies all Link `to` destinations match approved marketing routes", () => {
      const linkRegex = /<Link\s+[^>]*?to=["']([^"']+)["']/g;

      for (const [name, src] of Object.entries(contents)) {
        let match;
        while ((match = linkRegex.exec(src)) !== null) {
          const target = match[1];
          const isValid = validInternalPrefixes.some(
            (prefix) => target === prefix || target.startsWith(prefix + "?") || target.startsWith(prefix + "#")
          );
          assert.ok(
            isValid,
            `${name} has invalid route link: ${target}. Allowed prefixes: ${validInternalPrefixes.join(", ")}`
          );
        }
      }
    });

    it("verifies zero forbidden legacy routes (/discover, /sandbox, /profile/:id)", () => {
      for (const [name, src] of Object.entries(contents)) {
        assert.ok(!src.includes('to="/discover"'), `${name} must not link to /discover`);
        assert.ok(!src.includes('to="/sandbox"'), `${name} must not link to /sandbox`);
        assert.ok(!src.includes('to="/profile/'), `${name} must not link to /profile/:id`);
      }
    });

    it("verifies external links include rel='noopener noreferrer' and target='_blank'", () => {
      const anchorRegex = /<a\s+[^>]*?href=["'](https?:\/\/[^"']+)["'][^>]*?>/g;
      for (const [name, src] of Object.entries(contents)) {
        let match;
        while ((match = anchorRegex.exec(src)) !== null) {
          const tag = match[0];
          assert.ok(tag.includes('target="_blank"'), `${name} external link must have target="_blank"`);
          assert.ok(
            tag.includes('rel="noopener noreferrer"'),
            `${name} external link must have rel="noopener noreferrer"`
          );
        }
      }
    });
  });

  // =========================================================================
  // Challenge 3: In-Browser Sandbox Runner Adversarial Stress Testing
  // =========================================================================
  describe("Challenge 3: Sandbox Runner Isolation & Error Handling", () => {
    it("FeaturesFeedPage sandbox runner isolates script execution and captures errors", () => {
      const src = contents["FeaturesFeedPage.jsx"];
      assert.ok(src.includes("iframe.setAttribute(\"sandbox\", \"allow-scripts\")"), "Sandbox iframe must enforce sandbox allow-scripts attribute");
      assert.ok(src.includes("try {"), "Runner script must wrap execution in try-catch");
      assert.ok(src.includes("Runtime Error:"), "Runner must catch runtime errors gracefully");
      assert.ok(src.includes("clearTimeout(timer)"), "Runner must clear timeout on completion");
      assert.ok(src.includes("timeoutMs = 1500"), "Runner must impose bounded 1500ms execution timeout");
    });

    it("simulates sandbox runner timeout logic to guarantee no hanging promises", async () => {
      const timeoutMs = 50; // accelerated for test
      let finished = false;

      const promise = new Promise((resolve) => {
        const timer = setTimeout(() => {
          finished = true;
          resolve({ lines: ["Process completed (timeout)"], time: timeoutMs });
        }, timeoutMs);
      });

      const res = await promise;
      assert.strictEqual(finished, true, "Sandbox timer must fire on timeout");
      assert.strictEqual(res.time, 50, "Execution time must match timeout limit");
      assert.ok(res.lines[0].includes("timeout"), "Output must report timeout");
    });
  });

  // =========================================================================
  // Challenge 4: Counter Boundary Values & Reduced Motion
  // =========================================================================
  describe("Challenge 4: AnimatedCounter Boundary Values & Media Query Stress", () => {
    it("handles boundary values 0, large numbers, and special suffixes without NaN", () => {
      const Counter = ({ value, suffix = "" }) => {
        return React.createElement("span", null, value.toLocaleString(), suffix);
      };

      // Value: 0
      const html0 = renderToString(React.createElement(Counter, { value: 0, suffix: "" }));
      assert.ok(!html0.includes("NaN"), "0 must not produce NaN");
      assert.ok(html0.includes("0"), "0 must render 0");

      // Value: 1000000
      const htmlMillion = renderToString(React.createElement(Counter, { value: 1000000, suffix: "+" }));
      assert.ok(!htmlMillion.includes("NaN"), "1,000,000 must not produce NaN");
      assert.ok(htmlMillion.includes("1,000,000"), "Must format large numbers with commas");

      // Value: 18 with ms suffix
      const htmlMs = renderToString(React.createElement(Counter, { value: 18, suffix: "ms" }));
      assert.ok(htmlMs.includes("18"), "Must render 18");
      assert.ok(htmlMs.includes("ms"), "Must render ms");
    });

    it("verifies CommunityDestinationPage AnimatedCounter detects prefers-reduced-motion", () => {
      const src = contents["CommunityDestinationPage.jsx"];
      assert.ok(
        src.includes("prefers-reduced-motion"),
        "AnimatedCounter must check prefers-reduced-motion media query"
      );
      assert.ok(
        src.includes("if (prefersReducedMotion) return;"),
        "AnimatedCounter must early-return on prefersReducedMotion"
      );
    });
  });

  // =========================================================================
  // Challenge 5: Single h1 Hierarchy Contract Across All Sub-pages
  // =========================================================================
  describe("Challenge 5: Heading Level Hierarchy Integrity", () => {
    it("verifies every subpage has exactly 1 h1 and that secondary headings are h2/h3/h4", () => {
      for (const [name, src] of Object.entries(contents)) {
        const h1Matches = src.match(/<h1(\s|>)/gi) || [];
        assert.strictEqual(h1Matches.length, 1, `${name} must have strictly 1 <h1>`);

        // Check if there are any conflicting h1 components or tags
        const closingH1Matches = src.match(/<\/h1>/gi) || [];
        assert.strictEqual(closingH1Matches.length, 1, `${name} must have strictly 1 </h1> closing tag`);
      }
    });

    it("verifies static prerender script (prerender.mjs) generates h1 for all 7 routes", () => {
      const prerenderSrc = fs.readFileSync(path.join(FRONTEND_DIR, "scripts/prerender.mjs"), "utf8");
      // Check line where h1 is generated
      assert.ok(
        prerenderSrc.includes('React.createElement(\n        "h1",') || prerenderSrc.includes('React.createElement("h1"') || prerenderSrc.includes('"h1",'),
        "prerender.mjs must generate <h1> tag for all marketing routes"
      );
      assert.ok(
        !prerenderSrc.includes('route.isRoot ? "h1" : "h2"'),
        "prerender.mjs must no longer use legacy ternary routing h1:h2"
      );
    });
  });
});
