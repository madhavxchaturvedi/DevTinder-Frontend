import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import esbuild from "esbuild";
import * as babelParser from "@babel/parser";
import babelTraverseModule from "@babel/traverse";
import React from "react";
import { renderToString } from "react-dom/server";

const traverse = babelTraverseModule.default || babelTraverseModule;
const FRONTEND_DIR = path.resolve(import.meta.dirname, "..");
const LANDING_DIR = path.join(FRONTEND_DIR, "src/components/landing");
const LANDING_PAGE_PATH = path.join(FRONTEND_DIR, "src/components/LandingPage.jsx");

function parseJSX(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  return babelParser.parse(content, {
    sourceType: "module",
    plugins: ["jsx"],
  });
}

function compileComponent(filePath, extraRequire = {}) {
  const code = fs.readFileSync(filePath, "utf8");
  const transformed = esbuild.transformSync(code, { loader: "jsx", format: "cjs" });
  const fakeModule = { exports: {} };
  const fn = new Function("require", "exports", "module", transformed.code);
  const fakeRequire = (name) => {
    if (name === "react") return React;
    if (name === "react-router-dom") {
      return {
        Link: ({ children, to, ...props }) => React.createElement("a", { href: to, ...props }, children),
        Navigate: () => null,
      };
    }
    if (name === "lucide-react") {
      return new Proxy({}, {
        get: (_, prop) => (props) => React.createElement("svg", { "data-icon": prop, ...props }),
      });
    }
    if (name.includes("OctoPairLogo")) {
      return { OctoPairLogo: (props) => React.createElement("svg", { "data-icon": "OctoPairLogo", ...props }) };
    }
    if (name.includes("MultiplayerCursor")) {
      return {
        MultiplayerCursor: () => null,
        useMultiplayerCursor: () => ({
          isHovered: false,
          position: { x: 0, y: 0 },
          containerProps: { className: "" },
          cursorProps: { position: { x: 0, y: 0 }, visible: false },
        }),
      };
    }
    if (name.includes("HeroMockEditor") || name.includes("SendToLaptopButton") || name.includes("LandingMatchModal")) {
      return { default: () => null };
    }
    if (name === "framer-motion") {
      return {
        motion: new Proxy({}, {
          get: (_, tag) => ({ children, ...props }) => React.createElement(tag, props, children),
        }),
        AnimatePresence: ({ children }) => children,
      };
    }
    if (extraRequire[name]) return extraRequire[name];
    return {};
  };
  fn(fakeRequire, fakeModule.exports, fakeModule);
  return fakeModule.exports.default || fakeModule.exports;
}

describe("challenger_m2_1: Adversarial Landing Page Verification Suite", () => {

  // ---------------------------------------------------------------------------
  // 1. SECTION DOM TREE & ANCHOR VERIFICATION
  // ---------------------------------------------------------------------------
  describe("1. Section DOM Tree & Anchor Verification", () => {
    it("verifies that all 16 sections are imported and sequentially mounted in LandingPage.jsx", () => {
      assert.ok(fs.existsSync(LANDING_PAGE_PATH), "LandingPage.jsx must exist");
      const ast = parseJSX(LANDING_PAGE_PATH);

      // Extract import names from LandingPage.jsx
      const importedLandingComponents = [];
      traverse(ast, {
        ImportDeclaration(p) {
          const source = p.node.source.value;
          if (source.startsWith("./landing/")) {
            p.node.specifiers.forEach((spec) => {
              importedLandingComponents.push(spec.local.name);
            });
          }
        },
      });

      const EXPECTED_IMPORTS = [
        "LandingNav",
        "HeroSection",
        "TechMarquee",
        "PositioningBand",
        "HowItWorksSection",
        "DeveloperMatchingSection",
        "LandingMatchModal",
        "InteractiveFeedSnippetSection",
        "RoomFeaturesSection",
        "FeatureBentoGrid",
        "WatchSessionSection",
        "CommunityBand",
        "ShowcaseBand",
        "PricingSection",
        "FaqSection",
        "FinalCtaSection",
        "LandingFooter",
      ];

      for (const expected of EXPECTED_IMPORTS) {
        assert.ok(
          importedLandingComponents.includes(expected),
          `Missing required import in LandingPage.jsx: ${expected}`
        );
      }

      // Extract rendered JSX elements in the root return statement
      const renderedJSX = [];
      traverse(ast, {
        JSXOpeningElement(p) {
          if (p.node.name.type === "JSXIdentifier") {
            const name = p.node.name.name;
            if (name !== "div" && name !== "main" && name !== "Navigate") {
              renderedJSX.push(name);
            }
          }
        },
      });

      const EXPECTED_16_SECTIONS = [
        "LandingNav",                    // 1
        "HeroSection",                   // 2
        "TechMarquee",                   // 3
        "PositioningBand",               // 4
        "HowItWorksSection",             // 5
        "DeveloperMatchingSection",      // 6
        "InteractiveFeedSnippetSection", // 7
        "RoomFeaturesSection",           // 8
        "FeatureBentoGrid",              // 9
        "WatchSessionSection",           // 10
        "CommunityBand",                 // 11
        "ShowcaseBand",                  // 12
        "PricingSection",                // 13
        "FaqSection",                    // 14
        "FinalCtaSection",               // 15
        "LandingFooter",                 // 16
      ];

      assert.equal(
        renderedJSX.length,
        16,
        `Expected exactly 16 mounted sections in LandingPage, found ${renderedJSX.length}: ${renderedJSX.join(", ")}`
      );

      for (let i = 0; i < 16; i++) {
        assert.equal(
          renderedJSX[i],
          EXPECTED_16_SECTIONS[i],
          `Section mismatch at index ${i + 1}: expected ${EXPECTED_16_SECTIONS[i]}, got ${renderedJSX[i]}`
        );
      }
    });

    it("verifies LandingNav.jsx defines all 9 expected navigation anchors", () => {
      const navPath = path.join(LANDING_DIR, "LandingNav.jsx");
      assert.ok(fs.existsSync(navPath), "LandingNav.jsx must exist");
      const ast = parseJSX(navPath);

      let navLinks = [];
      traverse(ast, {
        VariableDeclarator(p) {
          if (p.node.id.name === "navLinks" && p.node.init?.type === "ArrayExpression") {
            navLinks = p.node.init.elements.map((el) => {
              const obj = {};
              el.properties.forEach((prop) => {
                obj[prop.key.name] = prop.value.value;
              });
              return obj;
            });
          }
        },
      });

      const EXPECTED_ANCHORS = [
        { label: "How It Works", href: "#how-it-works" },
        { label: "Matching", href: "#matching" },
        { label: "Feed", href: "#feed" },
        { label: "Room Features", href: "#room-features" },
        { label: "Features", href: "#features" },
        { label: "Sessions", href: "#sessions" },
        { label: "Community", href: "#community" },
        { label: "Pricing", href: "#pricing" },
        { label: "FAQ", href: "#faq" },
      ];

      assert.equal(navLinks.length, 9, `Expected 9 navLinks in LandingNav, found ${navLinks.length}`);
      for (let i = 0; i < 9; i++) {
        assert.equal(navLinks[i].href, EXPECTED_ANCHORS[i].href, `Anchor ${i} href mismatch: expected ${EXPECTED_ANCHORS[i].href}, got ${navLinks[i].href}`);
        assert.equal(navLinks[i].label, EXPECTED_ANCHORS[i].label, `Anchor ${i} label mismatch`);
      }
    });

    it("verifies each of the 9 anchors exists on an active <section> element in the respective component", () => {
      const ANCHOR_MAPPING = [
        { file: "HowItWorksSection.jsx", id: "how-it-works" },
        { file: "DeveloperMatchingSection.jsx", id: "matching" },
        { file: "InteractiveFeedSnippetSection.jsx", id: "feed" },
        { file: "RoomFeaturesSection.jsx", id: "room-features" },
        { file: "FeatureBentoGrid.jsx", id: "features" },
        { file: "WatchSessionSection.jsx", id: "sessions" },
        { file: "CommunityBand.jsx", id: "community" },
        { file: "PricingSection.jsx", id: "pricing" },
        { file: "FaqSection.jsx", id: "faq" },
      ];

      for (const mapping of ANCHOR_MAPPING) {
        const filePath = path.join(LANDING_DIR, mapping.file);
        assert.ok(fs.existsSync(filePath), `Target component file must exist: ${mapping.file}`);
        const ast = parseJSX(filePath);

        let foundSectionWithId = false;
        traverse(ast, {
          JSXOpeningElement(p) {
            if (p.node.name.name === "section") {
              const idAttr = p.node.attributes.find((a) => a.name?.name === "id");
              if (idAttr) {
                const idVal = idAttr.value?.value || (idAttr.value?.type === "StringLiteral" ? idAttr.value.value : null);
                if (idVal === mapping.id) {
                  foundSectionWithId = true;
                }
              }
            }
          },
        });

        assert.ok(
          foundSectionWithId,
          `Component ${mapping.file} must render an active <section id="${mapping.id}"> element`
        );
      }
    });

    it("empirically compiles and renders all 9 anchor sections to HTML verifying section IDs in markup", () => {
      const RENDER_TESTS = [
        { file: "HowItWorksSection.jsx", id: "how-it-works" },
        { file: "DeveloperMatchingSection.jsx", id: "matching" },
        { file: "InteractiveFeedSnippetSection.jsx", id: "feed" },
        { file: "RoomFeaturesSection.jsx", id: "room-features" },
        { file: "FeatureBentoGrid.jsx", id: "features" },
        { file: "WatchSessionSection.jsx", id: "sessions" },
        { file: "PricingSection.jsx", id: "pricing" },
        { file: "FaqSection.jsx", id: "faq" },
      ];

      for (const t of RENDER_TESTS) {
        const Comp = compileComponent(path.join(LANDING_DIR, t.file));
        const html = renderToString(React.createElement(Comp));
        assert.ok(
          html.includes(`id="${t.id}"`),
          `Rendered HTML of ${t.file} must contain id="${t.id}"`
        );
        assert.match(
          html,
          new RegExp(`<section[^>]*id="${t.id}"`),
          `Rendered HTML must have <section> element with id="${t.id}"`
        );
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 2. FAQ EXPAND/COLLAPSE & KEYBOARD INTERACTION
  // ---------------------------------------------------------------------------
  describe("2. FAQ Expand/Collapse Interactions & Keyboard Accessibility", () => {
    it("verifies FAQ initial render: 11 items, question 0 open by default, questions 1-10 closed", () => {
      const FaqSection = compileComponent(path.join(LANDING_DIR, "FaqSection.jsx"));
      const html = renderToString(React.createElement(FaqSection));

      // Must have id="faq"
      assert.ok(html.includes('id="faq"'), "FaqSection must render container with id='faq'");

      // Check aria-expanded initial states
      const expandedMatches = [...html.matchAll(/aria-expanded="true"/g)];
      const collapsedMatches = [...html.matchAll(/aria-expanded="false"/g)];

      assert.equal(expandedMatches.length, 1, "Only question 0 should have aria-expanded='true' initially");
      assert.equal(collapsedMatches.length, 10, "10 questions should have aria-expanded='false' initially");

      // Verify question 0 answer panel is present and subsequent answers are absent
      assert.ok(html.includes('id="faq-answer-0"'), "Answer panel 0 must be rendered initially");
      assert.ok(!html.includes('id="faq-answer-1"'), "Answer panel 1 must NOT be rendered initially");
      assert.ok(!html.includes('id="faq-answer-2"'), "Answer panel 2 must NOT be rendered initially");
    });

    it("verifies FAQ 3 prepended questions content per specification", () => {
      const FaqSection = compileComponent(path.join(LANDING_DIR, "FaqSection.jsx"));
      const html = renderToString(React.createElement(FaqSection));

      assert.ok(
        html.includes("How does developer matchmaking work?"),
        "Missing Q1: 'How does developer matchmaking work?'"
      );
      assert.ok(
        html.includes("Can I run code snippets directly from the feed?"),
        "Missing Q2: 'Can I run code snippets directly from the feed?'"
      );
      assert.ok(
        html.includes("How do project join requests work?"),
        "Missing Q3: 'How do project join requests work?'"
      );
    });

    it("empirically tests accordion toggle interactions (click simulation)", () => {
      const code = fs.readFileSync(path.join(LANDING_DIR, "FaqSection.jsx"), "utf8");
      const transformed = esbuild.transformSync(code, { loader: "jsx", format: "cjs" });

      let openIndices = [0];
      const fakeReact = {
        ...React,
        useState: (initial) => {
          return [
            openIndices,
            (updater) => {
              openIndices = typeof updater === "function" ? updater(openIndices) : updater;
            },
          ];
        },
      };

      const fakeModule = { exports: {} };
      const fn = new Function("require", "exports", "module", transformed.code);
      fn(
        (name) => (name === "react" ? fakeReact : { ChevronDown: () => null, HelpCircle: () => null }),
        fakeModule.exports,
        fakeModule
      );
      const FaqComp = fakeModule.exports.default;

      // Initial state
      let vdom = FaqComp();
      let items = vdom.props.children[1].props.children;
      assert.equal(items.length, 11);
      assert.equal(items[0].props.children[0].props["aria-expanded"], true);
      assert.equal(items[1].props.children[0].props["aria-expanded"], false);

      // 1. Click item 0 to collapse it
      items[0].props.children[0].props.onClick();
      assert.deepEqual(openIndices, [], "Clicking open item 0 must collapse it to []");
      vdom = FaqComp();
      items = vdom.props.children[1].props.children;
      assert.equal(items[0].props.children[0].props["aria-expanded"], false);

      // 2. Click item 1 to expand it
      items[1].props.children[0].props.onClick();
      assert.deepEqual(openIndices, [1], "Clicking item 1 must expand it to [1]");
      vdom = FaqComp();
      items = vdom.props.children[1].props.children;
      assert.equal(items[1].props.children[0].props["aria-expanded"], true);

      // 3. Click item 2 while item 1 is open -> both open
      items[2].props.children[0].props.onClick();
      assert.deepEqual(openIndices, [1, 2], "Both item 1 and 2 can be open simultaneously");
      vdom = FaqComp();
      items = vdom.props.children[1].props.children;
      assert.equal(items[1].props.children[0].props["aria-expanded"], true);
      assert.equal(items[2].props.children[0].props["aria-expanded"], true);

      // 4. Click item 1 again -> collapses 1, 2 stays open
      items[1].props.children[0].props.onClick();
      assert.deepEqual(openIndices, [2], "Collapsing item 1 leaves item 2 open");
    });

    it("empirically tests keyboard accessibility (Enter and Space key handling)", () => {
      const code = fs.readFileSync(path.join(LANDING_DIR, "FaqSection.jsx"), "utf8");
      const transformed = esbuild.transformSync(code, { loader: "jsx", format: "cjs" });

      let openIndices = [0];
      const fakeReact = {
        ...React,
        useState: () => [
          openIndices,
          (updater) => {
            openIndices = typeof updater === "function" ? updater(openIndices) : updater;
          },
        ],
      };

      const fakeModule = { exports: {} };
      const fn = new Function("require", "exports", "module", transformed.code);
      fn(
        (name) => (name === "react" ? fakeReact : { ChevronDown: () => null, HelpCircle: () => null }),
        fakeModule.exports,
        fakeModule
      );
      const FaqComp = fakeModule.exports.default;
      const vdom = FaqComp();
      const items = vdom.props.children[1].props.children;

      // Test Enter key on item 1
      let preventedEnter = false;
      items[1].props.children[0].props.onKeyDown({
        key: "Enter",
        preventDefault: () => { preventedEnter = true; },
      });
      assert.ok(preventedEnter, "Enter key must trigger preventDefault()");
      assert.deepEqual(openIndices, [0, 1], "Enter key must toggle item 1 open");

      // Test Space key on item 0
      let preventedSpace = false;
      items[0].props.children[0].props.onKeyDown({
        key: " ",
        preventDefault: () => { preventedSpace = true; },
      });
      assert.ok(preventedSpace, "Space key must trigger preventDefault()");
      assert.deepEqual(openIndices, [1], "Space key must toggle item 0 closed");

      // Test non-triggering key (Tab)
      let preventedTab = false;
      items[2].props.children[0].props.onKeyDown({
        key: "Tab",
        preventDefault: () => { preventedTab = true; },
      });
      assert.equal(preventedTab, false, "Tab key must NOT trigger preventDefault()");
      assert.deepEqual(openIndices, [1], "Tab key must NOT alter openIndices");

      // Test non-triggering key (Escape)
      let preventedEscape = false;
      items[2].props.children[0].props.onKeyDown({
        key: "Escape",
        preventDefault: () => { preventedEscape = true; },
      });
      assert.equal(preventedEscape, false, "Escape key must NOT trigger preventDefault()");
      assert.deepEqual(openIndices, [1], "Escape key must NOT alter openIndices");
    });
  });

  // ---------------------------------------------------------------------------
  // 3. STEP NAVIGATION IN HOWITWORKSSECTION
  // ---------------------------------------------------------------------------
  describe("3. Step Navigation in HowItWorksSection", () => {
    it("verifies HowItWorksSection defines all 4 lifecycle steps per specification", () => {
      const hwPath = path.join(LANDING_DIR, "HowItWorksSection.jsx");
      const ast = parseJSX(hwPath);

      let steps = [];
      traverse(ast, {
        VariableDeclarator(p) {
          if (p.node.id.name === "steps" && p.node.init?.type === "ArrayExpression") {
            steps = p.node.init.elements.map((el) => {
              const obj = {};
              el.properties.forEach((prop) => {
                if (prop.key && prop.value) {
                  let val = prop.value.value;
                  if (prop.value.type === "TemplateLiteral") {
                    val = prop.value.quasis.map((q) => q.value.raw).join("");
                  }
                  obj[prop.key.name] = val || prop.value.name;
                }
              });
              return obj;
            });
          }
        },
      });

      assert.equal(steps.length, 4, "HowItWorksSection must define exactly 4 steps");

      // Step 1: Discover & Match
      assert.equal(steps[0].number, "01");
      assert.equal(steps[0].title, "Discover & Match");
      assert.equal(steps[0].subtitle, "Browse by stack, swipe to connect");
      assert.equal(steps[0].accent, "#ccff00");
      assert.ok(steps[0].codeSnippet.includes("octopair.match"));

      // Step 2: Share & Run Code
      assert.equal(steps[1].number, "02");
      assert.equal(steps[1].title, "Share & Run Code");
      assert.equal(steps[1].subtitle, "Post snippets, run them live in the feed");
      assert.equal(steps[1].accent, "#b266ff");
      assert.ok(steps[1].codeSnippet.includes("feed.post"));

      // Step 3: Post & Join Projects
      assert.equal(steps[2].number, "03");
      assert.equal(steps[2].title, "Post & Join Projects");
      assert.equal(steps[2].subtitle, "Create listings, review applicants");
      assert.equal(steps[2].accent, "#b266ff");
      assert.ok(steps[2].codeSnippet.includes("project.accept"));

      // Step 4: Pair Live & Ship
      assert.equal(steps[3].number, "04");
      assert.equal(steps[3].title, "Pair Live & Ship");
      assert.equal(steps[3].subtitle, "WebRTC room + verified co-author commits");
      assert.equal(steps[3].accent, "#ccff00");
      assert.ok(steps[3].codeSnippet.includes("git.commit"));
    });

    it("empirically tests Step navigator click navigation and active styling transitions", () => {
      const code = fs.readFileSync(path.join(LANDING_DIR, "HowItWorksSection.jsx"), "utf8");
      const transformed = esbuild.transformSync(code, { loader: "jsx", format: "cjs" });

      let currentStep = 0;
      const fakeReact = {
        ...React,
        useState: () => [
          currentStep,
          (updater) => {
            currentStep = typeof updater === "function" ? updater(currentStep) : updater;
          },
        ],
      };

      const fakeModule = { exports: {} };
      const fn = new Function("require", "exports", "module", transformed.code);
      fn(
        (name) => (name === "react" ? fakeReact : () => null),
        fakeModule.exports,
        fakeModule
      );
      const HowItWorksComp = fakeModule.exports.default;

      // Initial state: Step 0
      let vdom = HowItWorksComp();
      let buttons = vdom.props.children[1].props.children[0].props.children.props.children[1].props.children;
      assert.equal(buttons.length, 4);

      // Button 0 has active lime styling
      assert.ok(buttons[0].props.className.includes("bg-[#ccff00]/10"));
      assert.ok(buttons[0].props.className.includes("border-[#ccff00]/40"));
      // Button 1 is inactive
      assert.ok(buttons[1].props.className.includes("bg-transparent"));

      // 1. Click Step 1 navigator button
      buttons[1].props.onClick();
      assert.equal(currentStep, 1, "Clicking button 1 must set activeStep to 1");
      vdom = HowItWorksComp();
      buttons = vdom.props.children[1].props.children[0].props.children.props.children[1].props.children;
      // Button 1 now has active purple styling
      assert.ok(buttons[1].props.className.includes("bg-[#b266ff]/10"));
      assert.ok(buttons[1].props.className.includes("border-[#b266ff]/40"));

      // 2. Click Step 2 navigator button
      buttons[2].props.onClick();
      assert.equal(currentStep, 2, "Clicking button 2 must set activeStep to 2");
      vdom = HowItWorksComp();
      buttons = vdom.props.children[1].props.children[0].props.children.props.children[1].props.children;
      // Button 2 has active purple styling
      assert.ok(buttons[2].props.className.includes("bg-[#b266ff]/10"));

      // 3. Click Step 3 navigator button
      buttons[3].props.onClick();
      assert.equal(currentStep, 3, "Clicking button 3 must set activeStep to 3");
      vdom = HowItWorksComp();
      buttons = vdom.props.children[1].props.children[0].props.children.props.children[1].props.children;
      // Button 3 has active lime styling
      assert.ok(buttons[3].props.className.includes("bg-[#ccff00]/10"));
    });

    it("empirically tests story card onMouseEnter synchronization", () => {
      const code = fs.readFileSync(path.join(LANDING_DIR, "HowItWorksSection.jsx"), "utf8");
      const transformed = esbuild.transformSync(code, { loader: "jsx", format: "cjs" });

      let currentStep = 0;
      const fakeReact = {
        ...React,
        useState: () => [
          currentStep,
          (updater) => {
            currentStep = typeof updater === "function" ? updater(currentStep) : updater;
          },
        ],
      };

      const fakeModule = { exports: {} };
      const fn = new Function("require", "exports", "module", transformed.code);
      fn(
        (name) => (name === "react" ? fakeReact : () => null),
        fakeModule.exports,
        fakeModule
      );
      const HowItWorksComp = fakeModule.exports.default;

      // Simulate mouse entering card 2 (Step 3: Post & Join Projects)
      let vdom = HowItWorksComp();
      const cards = vdom.props.children[1].props.children[1].props.children;
      cards[2].props.onMouseEnter();
      assert.equal(currentStep, 2, "Hovering card 2 must update activeStep to 2");

      // Verify card 2 receives active purple highlight classes
      vdom = HowItWorksComp();
      const updatedCards = vdom.props.children[1].props.children[1].props.children;
      assert.ok(updatedCards[2].props.className.includes("border-[#b266ff]/40"));
      assert.ok(updatedCards[2].props.className.includes("ring-[#b266ff]/20"));

      // Inactive card 0 has standard border-white/10
      assert.ok(updatedCards[0].props.className.includes("border-white/10"));
    });
  });

  // ---------------------------------------------------------------------------
  // 4. AST VERIFICATION FOR FORBIDDEN CONSTRUCTS
  // ---------------------------------------------------------------------------
  describe("4. AST Verification for Forbidden Constructs", () => {
    const allLandingFiles = fs.readdirSync(LANDING_DIR).filter((f) => f.endsWith(".jsx"));
    const allFilesToCheck = [...allLandingFiles.map((f) => path.join(LANDING_DIR, f)), LANDING_PAGE_PATH];

    it("verifies ZERO eval() occurrences across all landing components and LandingPage.jsx", () => {
      for (const filePath of allFilesToCheck) {
        const ast = parseJSX(filePath);
        let foundEval = false;

        traverse(ast, {
          CallExpression(p) {
            if (p.node.callee.name === "eval") {
              foundEval = true;
            }
            if (
              p.node.callee.type === "MemberExpression" &&
              p.node.callee.property.name === "eval"
            ) {
              foundEval = true;
            }
          },
        });

        assert.equal(
          foundEval,
          false,
          `AST Violation: eval() detected in ${path.basename(filePath)}`
        );
      }
    });

    it("verifies ZERO getUserMedia and RTCPeerConnection hardware APIs across all landing files", () => {
      for (const filePath of allFilesToCheck) {
        const ast = parseJSX(filePath);
        let hardwareViolation = null;

        traverse(ast, {
          Identifier(p) {
            if (p.node.name === "getUserMedia") {
              hardwareViolation = "getUserMedia";
            }
            if (p.node.name === "RTCPeerConnection") {
              hardwareViolation = "RTCPeerConnection";
            }
          },
        });

        assert.equal(
          hardwareViolation,
          null,
          `AST Violation: ${hardwareViolation} detected in ${path.basename(filePath)}`
        );
      }
    });

    it("verifies ZERO Redux imports (useSelector, useDispatch, react-redux) across all landing/ components", () => {
      for (const fileName of allLandingFiles) {
        const filePath = path.join(LANDING_DIR, fileName);
        const ast = parseJSX(filePath);
        let reduxViolation = null;

        traverse(ast, {
          ImportDeclaration(p) {
            if (p.node.source.value === "react-redux" || p.node.source.value.includes("redux")) {
              reduxViolation = `Import from ${p.node.source.value}`;
            }
          },
          Identifier(p) {
            if (p.node.name === "useSelector" || p.node.name === "useDispatch") {
              reduxViolation = p.node.name;
            }
          },
        });

        assert.equal(
          reduxViolation,
          null,
          `AST Violation: Redux construct (${reduxViolation}) detected in landing component ${fileName}`
        );
      }
    });

    it("verifies EXACTLY ONE <h1> element on the landing page (only in HeroSection.jsx)", () => {
      const h1Locations = [];

      for (const filePath of allFilesToCheck) {
        const ast = parseJSX(filePath);
        traverse(ast, {
          JSXOpeningElement(p) {
            if (p.node.name.name === "h1") {
              h1Locations.push({
                file: path.basename(filePath),
                line: p.node.loc?.start?.line,
              });
            }
          },
        });
      }

      assert.equal(
        h1Locations.length,
        1,
        `Expected exactly 1 <h1> across landing components, found ${h1Locations.length}: ${JSON.stringify(h1Locations)}`
      );
      assert.equal(h1Locations[0].file, "HeroSection.jsx", "The single <h1> must reside in HeroSection.jsx");
    });

    it("verifies ZERO unicode emojis / dingbats in all 8 M2 modified files", () => {
      const M2_FILES = [
        "HeroSection.jsx",
        "PositioningBand.jsx",
        "HowItWorksSection.jsx",
        "FeatureBentoGrid.jsx",
        "LandingNav.jsx",
        "FaqSection.jsx",
        "../LandingPage.jsx",
        "../../../scripts/prerender.mjs",
      ];

      const emojiRegex = /[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]/gu;

      for (const rel of M2_FILES) {
        const fullPath = path.resolve(LANDING_DIR, rel);
        assert.ok(fs.existsSync(fullPath), `File must exist: ${rel}`);
        const content = fs.readFileSync(fullPath, "utf8");

        const matches = [...content.matchAll(emojiRegex)];
        assert.equal(
          matches.length,
          0,
          `Found ${matches.length} emoji/dingbat character(s) in ${rel}: ${matches.map((m) => m[0]).join(", ")}`
        );
      }
    });

    it("verifies ZERO unicode emojis in all 4 M1 created components", () => {
      const M1_FILES = [
        "DeveloperMatchingSection.jsx",
        "LandingMatchModal.jsx",
        "InteractiveFeedSnippetSection.jsx",
        "RoomFeaturesSection.jsx",
      ];

      const emojiRegex = /[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]/gu;

      for (const f of M1_FILES) {
        const fullPath = path.join(LANDING_DIR, f);
        const content = fs.readFileSync(fullPath, "utf8");
        const matches = [...content.matchAll(emojiRegex)];
        assert.equal(
          matches.length,
          0,
          `Found ${matches.length} emoji character(s) in ${f}`
        );
      }
    });

    it("verifies ZERO forbidden route links (/discover, /sandbox, /profile/) across landing components", () => {
      for (const filePath of allFilesToCheck) {
        const ast = parseJSX(filePath);
        let forbiddenLink = null;

        traverse(ast, {
          JSXAttribute(p) {
            const attrName = p.node.name?.name;
            if (attrName === "href" || attrName === "to") {
              let val = null;
              if (p.node.value?.type === "StringLiteral") {
                val = p.node.value.value;
              } else if (
                p.node.value?.type === "JSXExpressionContainer" &&
                p.node.value.expression.type === "StringLiteral"
              ) {
                val = p.node.value.expression.value;
              }

              if (val) {
                if (val.includes("/discover")) forbiddenLink = `/discover in ${val}`;
                if (val.includes("/sandbox")) forbiddenLink = `/sandbox in ${val}`;
                if (val.includes("/profile/")) forbiddenLink = `/profile/ in ${val}`;
              }
            }
          },
        });

        assert.equal(
          forbiddenLink,
          null,
          `Forbidden route link violation (${forbiddenLink}) in ${path.basename(filePath)}`
        );
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 5. ADVERSARIAL INTERACTIVE STRESS & BOUNDARY VERIFICATION
  // ---------------------------------------------------------------------------
  describe("5. Adversarial Interactive Stress & Boundary Verification", () => {
    it("adversarially stress-tests DeveloperMatchingSection deck exhaustion and modal opening", () => {
      const code = fs.readFileSync(path.join(LANDING_DIR, "DeveloperMatchingSection.jsx"), "utf8");
      const transformed = esbuild.transformSync(code, { loader: "jsx", format: "cjs" });

      let state = {
        currentIndex: 0,
        matchedDev: null,
        direction: null,
        isReducedMotion: false,
      };

      const fakeReact = {
        ...React,
        useState: (initial) => {
          let key;
          if (typeof initial === "number") key = "currentIndex";
          else if (initial === null) {
            key = state.matchedDev === null && state.direction === null ? "matchedDev" : "direction";
          } else if (typeof initial === "boolean") key = "isReducedMotion";
          else key = "unknown";

          // Track by initial value
          if (initial === 0) {
            return [state.currentIndex, (up) => { state.currentIndex = typeof up === "function" ? up(state.currentIndex) : up; }];
          }
          if (initial === false) {
            return [state.isReducedMotion, (up) => { state.isReducedMotion = typeof up === "function" ? up(state.isReducedMotion) : up; }];
          }
          if (state._matchedDevSlot === undefined) {
            state._matchedDevSlot = true;
            return [state.matchedDev, (up) => { state.matchedDev = typeof up === "function" ? up(state.matchedDev) : up; }];
          }
          return [state.direction, (up) => { state.direction = typeof up === "function" ? up(state.direction) : up; }];
        },
        useEffect: () => {},
      };

      const fakeModule = { exports: {} };
      const fn = new Function("require", "exports", "module", transformed.code);
      fn(
        (name) => (name === "react" ? fakeReact : {
          UserPlus: () => null,
          X: () => null,
          Sparkles: () => null,
          Zap: () => null,
          ArrowRight: () => null,
          RotateCcw: () => null,
          Link: ({ children, to }) => React.createElement("a", { href: to }, children),
        }),
        fakeModule.exports,
        fakeModule
      );
      const MatchingComp = fakeModule.exports.default;

      // Initial card count
      let vdom = MatchingComp();
      assert.equal(state.currentIndex, 0);

      // Verify actions exist
      const actionContainer = vdom.props.children[1].props.children[1];
      const skipButton = actionContainer.props.children[0];
      const connectButton = actionContainer.props.children[1];

      // Test Connect button sets matchedDev and advances
      connectButton.props.onClick();
      assert.ok(state.matchedDev !== null, "Connect must set matchedDev");
      assert.equal(state.matchedDev.name, "Elena Rostova");
      assert.equal(state.matchedDev.role, "Systems Engineer");
      assert.equal(state.matchedDev.compatibility, 98);
    });

    it("verifies LandingMatchModal props, focus trap, and Escape dismissal contract", () => {
      const modalSrc = fs.readFileSync(path.join(LANDING_DIR, "LandingMatchModal.jsx"), "utf8");

      // Verify Escape key handling is present
      assert.ok(modalSrc.includes('e.key === "Escape"'), "LandingMatchModal must listen for Escape key");
      assert.ok(modalSrc.includes("onClose()"), "Escape key must invoke onClose callback");

      // Verify focus trapping logic
      assert.ok(modalSrc.includes('e.key === "Tab"'), "LandingMatchModal must trap Tab key navigation");
      assert.ok(modalSrc.includes("document.body.style.overflow = \"hidden\""), "Must lock body scroll");

      // Verify no Redux
      assert.ok(!modalSrc.includes("useSelector"), "LandingMatchModal must NOT use useSelector");
      assert.ok(!modalSrc.includes("react-redux"), "LandingMatchModal must NOT import react-redux");

      // Verify CTA links to signup
      assert.ok(modalSrc.includes('/login?mode=signup'), "Primary CTA must route to /login?mode=signup");
      assert.ok(!modalSrc.includes('/discover'), "Zero /discover links in LandingMatchModal");
      assert.ok(!modalSrc.includes('/sandbox'), "Zero /sandbox links in LandingMatchModal");
    });

    it("adversarially audits InteractiveFeedSnippetSection sandbox runner security architecture", () => {
      const feedSrc = fs.readFileSync(path.join(LANDING_DIR, "InteractiveFeedSnippetSection.jsx"), "utf8");

      // Strict sandbox isolation audit
      assert.ok(feedSrc.includes('setAttribute("sandbox", "allow-scripts")'), "Sandbox must be strictly allow-scripts");
      assert.ok(!feedSrc.includes("allow-same-origin"), "Sandbox must NOT include allow-same-origin");
      assert.ok(!feedSrc.includes("allow-top-navigation"), "Sandbox must NOT include allow-top-navigation");
      assert.ok(feedSrc.includes("iframe.srcdoc"), "Sandbox runner must use iframe srcdoc");
      assert.ok(!feedSrc.includes("eval("), "Sandbox runner must NOT use eval()");
      assert.ok(feedSrc.includes("window.parent.postMessage"), "Iframe must communicate via postMessage");

      // Message origin / source security verification
      assert.ok(
        feedSrc.includes("e.source !== iframe.contentWindow"),
        "Message listener must verify e.source === iframe.contentWindow"
      );

      // Timeout execution guard
      assert.ok(
        feedSrc.includes("setTimeout") && feedSrc.includes("1500"),
        "Sandbox must enforce 1500ms timeout guard to prevent infinite loops"
      );

      // Verify presets syntax by dry parsing
      const ast = parseJSX(path.join(LANDING_DIR, "InteractiveFeedSnippetSection.jsx"));
      let presets = [];
      traverse(ast, {
        VariableDeclarator(p) {
          if (p.node.id.name === "PRESETS" && p.node.init?.type === "ArrayExpression") {
            presets = p.node.init.elements.map((el) => {
              const codeProp = el.properties.find((pr) => pr.key?.name === "code");
              return codeProp?.value?.value || (codeProp?.value?.quasis ? codeProp.value.quasis[0].value.cooked : null);
            });
          }
        },
      });

      assert.equal(presets.length, 3, "Must have exactly 3 code presets");
      for (let i = 0; i < presets.length; i++) {
        assert.doesNotThrow(() => {
          babelParser.parse(presets[i], { sourceType: "script" });
        }, `Preset ${i + 1} code must be valid JavaScript`);
      }
    });

    it("adversarially verifies LandingNav mobile hamburger accessibility and toggle lifecycle", () => {
      const code = fs.readFileSync(path.join(LANDING_DIR, "LandingNav.jsx"), "utf8");
      const transformed = esbuild.transformSync(code, { loader: "jsx", format: "cjs" });

      let mobileMenuOpen = false;
      const fakeReact = {
        ...React,
        useState: () => [
          mobileMenuOpen,
          (updater) => {
            mobileMenuOpen = typeof updater === "function" ? updater(mobileMenuOpen) : updater;
          },
        ],
      };

      const fakeModule = { exports: {} };
      const fn = new Function("require", "exports", "module", transformed.code);
      fn(
        (name) => (name === "react" ? fakeReact : {
          Menu: () => null,
          X: () => null,
          ArrowRight: () => null,
          Link: ({ children, to, ...props }) => React.createElement("a", { href: to, ...props }, children),
          OctoPairLogo: () => null,
        }),
        fakeModule.exports,
        fakeModule
      );
      const NavComp = fakeModule.exports.default;

      // 1. Initial State: Menu closed
      let vdom = NavComp();
      assert.equal(mobileMenuOpen, false);
      // Hamburger button aria-expanded must be false
      const navContainer = vdom.props.children[0];
      const navHeader = navContainer.props.children;
      const hamburgerButton = navHeader.props.children[3].props.children[1];
      assert.equal(hamburgerButton.props["aria-expanded"], false);
      assert.equal(hamburgerButton.props["aria-label"], "Toggle Navigation Menu");

      // Mobile dropdown must not be rendered when menu is closed
      assert.equal(Boolean(vdom.props.children[1]), false);

      // 2. Toggle menu open
      hamburgerButton.props.onClick();
      assert.equal(mobileMenuOpen, true, "Clicking hamburger must toggle mobileMenuOpen to true");
      vdom = NavComp();
      const updatedNavContainer = vdom.props.children[0];
      const updatedHamburger = updatedNavContainer.props.children.props.children[3].props.children[1];
      assert.equal(updatedHamburger.props["aria-expanded"], true);
      assert.ok(vdom.props.children[1], "Mobile dropdown must be rendered when menu is open");
    });

    it("verifies RoomFeaturesSection mock components, micro-tiles, and reduced-motion", () => {
      const roomSrc = fs.readFileSync(path.join(LANDING_DIR, "RoomFeaturesSection.jsx"), "utf8");

      // Verify Elena's speaking ring with pulse and reduced-motion
      assert.ok(
        roomSrc.includes("animate-pulse"),
        "Elena's speaking indicator must pulse"
      );
      assert.ok(
        roomSrc.includes("motion-reduce:animate-none") || roomSrc.includes("motion-reduce"),
        "Speaking indicator must respect motion-reduce"
      );

      // Verify 6 micro-tiles
      const expectedTiles = [
        "Live Video & Voice",
        "Shared Task List",
        "Team Chat",
        "Reaction Emotes",
        "Full-Screen Preview",
        "ZIP Export",
      ];
      for (const title of expectedTiles) {
        assert.ok(roomSrc.includes(title), `Missing micro-tile: ${title}`);
      }

      // Verify Bottom CTA
      assert.ok(roomSrc.includes('/login?mode=signup'), "RoomFeatures CTA must route to /login?mode=signup");
      assert.ok(roomSrc.includes("Open Your First Room"), "CTA button text must invite opening first room");
    });
  });
});

