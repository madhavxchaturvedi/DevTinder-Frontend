import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import esbuild from "esbuild";
import React from "react";
import { renderToString } from "react-dom/server";

const FRONTEND_DIR = path.resolve(import.meta.dirname, "..");
const MARKETING_DIR = path.join(FRONTEND_DIR, "src/pages/marketing");
const LANDING_DIR = path.join(FRONTEND_DIR, "src/components/landing");

const SUBPAGE_FILES = [
  "FeaturesMatchPage.jsx",
  "FeaturesCollabPage.jsx",
  "FeaturesFeedPage.jsx",
  "FeaturesProjectsPage.jsx",
  "PricingDestinationPage.jsx",
  "CommunityDestinationPage.jsx",
];

const ASSEMBLED_LANDING_COMPONENTS = [
  "PositioningBand.jsx",
  "HowItWorksSection.jsx",
  "DeveloperMatchingSection.jsx",
  "ProfileShowcaseBand.jsx",
  "RoomFeaturesSection.jsx",
  "FeatureBentoGrid.jsx",
  "WatchSessionSection.jsx",
  "InteractiveFeedSnippetSection.jsx",
  "ShowcaseBand.jsx",
  "PricingSection.jsx",
  "FaqSection.jsx",
  "CommunityBand.jsx",
  "FinalCtaSection.jsx",
  "LandingMatchModal.jsx",
];

const readMarketingFile = (file) => fs.readFileSync(path.join(MARKETING_DIR, file), "utf-8");
const readLandingFile = (file) => fs.readFileSync(path.join(LANDING_DIR, file), "utf-8");

// Helper: dynamic component loader using esbuild
const loadMarketingComponent = (filename) => {
  const filePath = path.join(MARKETING_DIR, filename);
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
        Outlet: () => React.createElement("div", { "data-testid": "outlet" }, "Outlet"),
        useLocation: () => ({ pathname: "/" }),
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
    // Child landing components mocked for container SSR testing
    if (name.includes("/components/landing/")) {
      const compName = path.basename(name);
      const MockComp = (props) =>
        React.createElement("div", { "data-component": compName, ...props }, compName);
      MockComp.displayName = compName;
      return {
        __esModule: true,
        default: MockComp,
      };
    }
    throw new Error(`Unexpected import in test loader: ${name}`);
  };

  const moduleExports = {};
  const fakeModule = { exports: moduleExports };
  const fn = new Function("require", "exports", "module", transformed.code);
  fn(fakeRequire, moduleExports, fakeModule);
  return fakeModule.exports?.default || fakeModule.exports;
};

describe("Adversarial Challenge: Milestone 2 Marketing Sub-Pages", () => {
  const pageSources = SUBPAGE_FILES.map((filename) => ({
    filename,
    src: readMarketingFile(filename),
  }));

  // ──────────────────────────────────────────────────────────────────────────
  // 1. Single <h1> Invariant Verification
  // ──────────────────────────────────────────────────────────────────────────
  describe("Suite 1: Single <h1> Invariant Verification", () => {
    for (const { filename, src } of pageSources) {
      it(`[${filename}] contains exactly zero <h1> tags (hero headlines must use semantic <h2>)`, () => {
        const h1TagRegex = /<\s*h1(\s|>)/gi;
        const h1Matches = src.match(h1TagRegex);
        assert.equal(
          h1Matches,
          null,
          `Adversarial Failure: ${filename} contains ${h1Matches?.length} <h1> tags! Violates single <h1> on root / rule.`
        );
      });

      it(`[${filename}] uses semantic <h2> for primary hero headline`, () => {
        const h2TagRegex = /<\s*h2(\s|>)/gi;
        assert.ok(
          h2TagRegex.test(src),
          `Adversarial Failure: ${filename} does not contain a semantic <h2> hero header.`
        );
      });
    }

    it("verifies all 14 assembled landing subcomponents contain zero <h1> tags", () => {
      for (const compFile of ASSEMBLED_LANDING_COMPONENTS) {
        const src = readLandingFile(compFile);
        const h1Matches = src.match(/<\s*h1(\s|>)/gi);
        assert.equal(
          h1Matches,
          null,
          `Adversarial Failure: Assembled subcomponent ${compFile} contains <h1> tag, which would leak into sub-pages!`
        );
      }
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Zero Unicode Emojis Verification
  // ──────────────────────────────────────────────────────────────────────────
  describe("Suite 2: Zero Unicode Emojis Verification", () => {
    // Comprehensive Unicode emoji regex covering emoji pictographs, dingbats, symbols, variation selectors
    const emojiRegex =
      /([\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F1E6}-\u{1F1FF}]|[\u{FE00}-\u{FE0F}]|\p{Extended_Pictographic})/gu;

    for (const { filename, src } of pageSources) {
      it(`[${filename}] contains exactly zero unicode emojis`, () => {
        const matches = src.match(emojiRegex);
        assert.equal(
          matches,
          null,
          `Adversarial Failure: ${filename} contains forbidden emojis: ${JSON.stringify(matches)}`
        );
      });

      it(`[${filename}] imports iconography strictly from lucide-react`, () => {
        const importMatches = src.match(/import\s+\{([^}]+)\}\s+from\s+["']lucide-react["']/);
        assert.ok(
          importMatches,
          `Adversarial Failure: ${filename} must import icons from 'lucide-react'`
        );
        assert.ok(
          !src.includes("react-icons"),
          `Adversarial Failure: ${filename} should not use react-icons for marketing pages`
        );
      });
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Zero Redux Dependencies
  // ──────────────────────────────────────────────────────────────────────────
  describe("Suite 3: Zero Redux Dependencies", () => {
    for (const { filename, src } of pageSources) {
      it(`[${filename}] is strictly decoupled from Redux (zero useSelector, useDispatch, react-redux)`, () => {
        assert.ok(!src.includes("useSelector"), `${filename} must not contain useSelector`);
        assert.ok(!src.includes("useDispatch"), `${filename} must not contain useDispatch`);
        assert.ok(!src.includes("react-redux"), `${filename} must not import from react-redux`);
        assert.ok(!src.includes("@reduxjs/toolkit"), `${filename} must not import from @reduxjs/toolkit`);
        assert.ok(!src.includes("useStore"), `${filename} must not use useStore`);
      });
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Zero Forbidden Route Links
  // ──────────────────────────────────────────────────────────────────────────
  describe("Suite 4: Zero Forbidden Route Links", () => {
    const forbiddenPatterns = [
      /\/discover/i,
      /\/sandbox/i,
      /\/profile(\/|$)/i,
      /profile\/:id/i,
    ];

    for (const { filename, src } of pageSources) {
      it(`[${filename}] does not link to any forbidden authenticated routes (/discover, /sandbox, /profile)`, () => {
        // Extract all to="..." or href="..."
        const linkMatches = [...src.matchAll(/(?:to|href)\s*=\s*["']([^"']+)["']/g)].map(
          (m) => m[1]
        );

        for (const link of linkMatches) {
          for (const pattern of forbiddenPatterns) {
            assert.ok(
              !pattern.test(link),
              `Adversarial Failure: ${filename} contains forbidden link: "${link}" matching ${pattern}`
            );
          }
        }
      });
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 5. Conversion CTAs Route Strictly to /login
  // ──────────────────────────────────────────────────────────────────────────
  describe("Suite 5: Conversion CTAs Route Strictly to /login", () => {
    for (const { filename, src } of pageSources) {
      it(`[${filename}] has primary conversion CTAs routing strictly to /login with query params`, () => {
        const linkMatches = [...src.matchAll(/(?:to|href)\s*=\s*["']([^"']+)["']/g)].map(
          (m) => m[1]
        );

        // Partition links into conversion auth links and internal navigation
        const authLinks = linkMatches.filter((l) => l.startsWith("/login"));
        assert.ok(
          authLinks.length > 0,
          `Adversarial Failure: ${filename} must include at least one CTA routing to /login`
        );

        for (const authLink of authLinks) {
          assert.ok(
            authLink.startsWith("/login?"),
            `Adversarial Failure: CTA "${authLink}" in ${filename} must include query parameters (e.g. mode=signup, redirect=...)`
          );
        }
      });
    }

    it("verifies FeaturesProjectsPage fallback card CTA routes to /login?redirect=project", () => {
      const src = readMarketingFile("FeaturesProjectsPage.jsx");
      assert.ok(
        src.includes('/login?redirect=project'),
        "FeaturesProjectsPage fallback card must route to /login?redirect=project"
      );
    });

    it("verifies FinalCtaSection routes to /login?mode=signup", () => {
      const src = readLandingFile("FinalCtaSection.jsx");
      assert.ok(
        src.includes('/login?mode=signup'),
        "FinalCtaSection must route to /login?mode=signup"
      );
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 6. Continuous Navigation Loop (Hamiltonian Cycle)
  // ──────────────────────────────────────────────────────────────────────────
  describe("Suite 6: Continuous Navigation Loop (Hamiltonian Cycle)", () => {
    const EXPECTED_EDGES = {
      "/features/match": "/features/collab",
      "/features/collab": "/features/feed",
      "/features/feed": "/features/projects",
      "/features/projects": "/pricing",
      "/pricing": "/community",
      "/community": "/features/match",
    };

    const PAGE_ROUTE_MAP = {
      "FeaturesMatchPage.jsx": "/features/match",
      "FeaturesCollabPage.jsx": "/features/collab",
      "FeaturesFeedPage.jsx": "/features/feed",
      "FeaturesProjectsPage.jsx": "/features/projects",
      "PricingDestinationPage.jsx": "/pricing",
      "CommunityDestinationPage.jsx": "/community",
    };

    it("verifies each page links forward to the next capability in the loop", () => {
      for (const [file, route] of Object.entries(PAGE_ROUTE_MAP)) {
        const src = readMarketingFile(file);
        const expectedNext = EXPECTED_EDGES[route];
        assert.ok(
          src.includes(`to="${expectedNext}"`) || src.includes(`to='${expectedNext}'`),
          `Adversarial Failure: ${file} (${route}) does NOT link to next destination "${expectedNext}"!`
        );
      }
    });

    it("verifies continuous closed loop forms an unbroken Hamiltonian cycle across all 6 sub-pages", () => {
      const startRoute = "/features/match";
      let current = startRoute;
      const visited = [];

      for (let i = 0; i < 6; i++) {
        visited.push(current);
        current = EXPECTED_EDGES[current];
      }

      assert.equal(current, startRoute, "Cycle must return to start route");
      assert.equal(visited.length, 6, "Must visit all 6 pages");
      assert.deepEqual(
        new Set(visited).size,
        6,
        "All 6 sub-page routes must be distinct nodes in the loop"
      );
    });

    it("verifies all 6 sub-pages render a back-link to / with 'Back to Overview'", () => {
      for (const { filename, src } of pageSources) {
        assert.ok(
          src.includes('to="/"') || src.includes("to='/'"),
          `Adversarial Failure: ${filename} missing back link to root "/"`
        );
        assert.ok(
          src.includes("Back to Overview"),
          `Adversarial Failure: ${filename} missing "Back to Overview" text`
        );
      }
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 7. Component Assembly & Graceful Fallbacks
  // ──────────────────────────────────────────────────────────────────────────
  describe("Suite 7: Component Assembly & Graceful Fallbacks", () => {
    it("FeaturesMatchPage assembles all required subcomponents", () => {
      const src = readMarketingFile("FeaturesMatchPage.jsx");
      assert.ok(src.includes("<PositioningBand"), "Missing PositioningBand");
      assert.ok(src.includes("<HowItWorksSection"), "Missing HowItWorksSection");
      assert.ok(src.includes("<DeveloperMatchingSection"), "Missing DeveloperMatchingSection");
      assert.ok(src.includes("<ProfileShowcaseBand"), "Missing ProfileShowcaseBand");
      assert.ok(src.includes("<FinalCtaSection"), "Missing FinalCtaSection");
    });

    it("FeaturesCollabPage assembles all required subcomponents", () => {
      const src = readMarketingFile("FeaturesCollabPage.jsx");
      assert.ok(src.includes("<RoomFeaturesSection"), "Missing RoomFeaturesSection");
      assert.ok(src.includes("<FeatureBentoGrid"), "Missing FeatureBentoGrid");
      assert.ok(src.includes("<WatchSessionSection"), "Missing WatchSessionSection");
      assert.ok(src.includes("<FinalCtaSection"), "Missing FinalCtaSection");
    });

    it("FeaturesFeedPage assembles InteractiveFeedSnippetSection", () => {
      const src = readMarketingFile("FeaturesFeedPage.jsx");
      assert.ok(src.includes("<InteractiveFeedSnippetSection"), "Missing InteractiveFeedSnippetSection");
      assert.ok(src.includes("<FinalCtaSection"), "Missing FinalCtaSection");
    });

    it("FeaturesProjectsPage provides ShowcaseBand and graceful fallback showcase", () => {
      const src = readMarketingFile("FeaturesProjectsPage.jsx");
      assert.ok(src.includes("<ShowcaseBand"), "Missing ShowcaseBand");
      assert.ok(src.includes("FALLBACK_SHOWCASE_PROJECTS"), "Missing FALLBACK_SHOWCASE_PROJECTS");
      assert.ok(src.includes("OctoMesh"), "Missing curated OctoMesh project");
      assert.ok(src.includes("HyperGraph"), "Missing curated HyperGraph project");
      assert.ok(src.includes("KubePulse"), "Missing curated KubePulse project");
    });

    it("PricingDestinationPage assembles PricingSection and FaqSection", () => {
      const src = readMarketingFile("PricingDestinationPage.jsx");
      assert.ok(src.includes("<PricingSection"), "Missing PricingSection");
      assert.ok(src.includes("<FaqSection"), "Missing FaqSection");
      assert.ok(src.includes("<FinalCtaSection"), "Missing FinalCtaSection");
    });

    it("CommunityDestinationPage assembles CommunityBand and provides telemetry fallbacks", () => {
      const src = readMarketingFile("CommunityDestinationPage.jsx");
      assert.ok(src.includes("<CommunityBand"), "Missing CommunityBand");
      assert.ok(src.includes("FALLBACK_TELEMETRY_STATS"), "Missing FALLBACK_TELEMETRY_STATS");
      assert.ok(src.includes("Sub-50ms Global P2P Mesh"), "Missing P2P mesh card");
      assert.ok(src.includes("Verified Proof of Work"), "Missing proof of work card");
      assert.ok(src.includes("24/7 Builder Timezones"), "Missing 24/7 builder timezones card");
      assert.ok(src.includes("<FinalCtaSection"), "Missing FinalCtaSection");
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 8. Clean Module Exports in index.js
  // ──────────────────────────────────────────────────────────────────────────
  describe("Suite 8: Clean Module Exports in index.js", () => {
    const indexSrc = readMarketingFile("index.js");

    it("exports all 6 marketing sub-pages as named exports", () => {
      const expectedExports = [
        "FeaturesMatchPage",
        "FeaturesCollabPage",
        "FeaturesFeedPage",
        "FeaturesProjectsPage",
        "PricingDestinationPage",
        "CommunityDestinationPage",
      ];

      for (const exp of expectedExports) {
        assert.ok(
          indexSrc.includes(`export { default as ${exp} } from "./${exp}"`),
          `index.js missing named export for ${exp}`
        );
      }
    });

    it("exports a default dictionary with dynamic imports for all 6 pages", () => {
      assert.ok(indexSrc.includes("export default marketingPages"));
      assert.ok(indexSrc.includes('import("./FeaturesMatchPage")'));
      assert.ok(indexSrc.includes('import("./FeaturesCollabPage")'));
      assert.ok(indexSrc.includes('import("./FeaturesFeedPage")'));
      assert.ok(indexSrc.includes('import("./FeaturesProjectsPage")'));
      assert.ok(indexSrc.includes('import("./PricingDestinationPage")'));
      assert.ok(indexSrc.includes('import("./CommunityDestinationPage")'));
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 9. SSR Rendering & DOM Invariants Verification
  // ──────────────────────────────────────────────────────────────────────────
  describe("Suite 9: SSR Rendering & DOM Invariants Verification", () => {
    for (const filename of SUBPAGE_FILES) {
      it(`[${filename}] renders to string without error and produces zero <h1> in HTML`, () => {
        const Component = loadMarketingComponent(filename);
        assert.equal(typeof Component, "function", `${filename} must export a React component function`);

        const html = renderToString(React.createElement(Component));
        assert.ok(html.length > 100, `${filename} rendered HTML must be non-empty`);
        assert.equal(
          html.includes("<h1"),
          false,
          `Adversarial Failure: Rendered HTML of ${filename} contains <h1!`
        );
        assert.ok(
          html.includes("<h2"),
          `Rendered HTML of ${filename} must contain <h2> hero title`
        );
        assert.ok(
          html.includes('href="/"'),
          `Rendered HTML of ${filename} must contain breadcrumb link to /`
        );
      });
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 10. Design Token Adherence
  // ──────────────────────────────────────────────────────────────────────────
  describe("Suite 10: Design Token Adherence", () => {
    for (const { filename, src } of pageSources) {
      it(`[${filename}] adheres to core background void #09090b`, () => {
        assert.ok(
          src.includes("#09090b") || src.includes("bg-[#09090b]"),
          `${filename} must use void background #09090b`
        );
      });

      it(`[${filename}] adheres to hairline border tokens (border-white/10)`, () => {
        assert.ok(
          src.includes("border-white/10"),
          `${filename} must use hairline border tokens border-white/10`
        );
      });

      it(`[${filename}] uses monospace typography for badges and metrics`, () => {
        assert.ok(
          src.includes("font-mono"),
          `${filename} must use font-mono for badges and labels`
        );
      });
    }
  });
});
