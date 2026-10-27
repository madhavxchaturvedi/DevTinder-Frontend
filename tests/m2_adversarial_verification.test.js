import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import * as babelParser from "@babel/parser";
import babelTraverseModule from "@babel/traverse";
const traverse = babelTraverseModule.default || babelTraverseModule;

const FRONTEND_DIR = path.resolve(import.meta.dirname, "..");

const TARGET_FILES = [
  "src/components/Header.jsx",
  "src/components/LeftSidebar.jsx",
  "src/components/Login.jsx",
  "src/components/landing/LandingNav.jsx",
  "src/components/landing/LandingFooter.jsx",
];

function parseJSX(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  return babelParser.parse(content, {
    sourceType: "module",
    plugins: ["jsx"],
  });
}

function extractJSXAttributeValue(attr) {
  if (!attr) return null;
  if (!attr.value) return true; // boolean attr like `disabled`
  if (attr.value.type === "StringLiteral") {
    return attr.value.value;
  }
  if (attr.value.type === "JSXExpressionContainer") {
    if (attr.value.expression.type === "StringLiteral") {
      return attr.value.expression.value;
    }
  }
  return null;
}

describe("Milestone 2 (R4): Brand Logo & Shell Replacement Adversarial Verification", () => {
  // -------------------------------------------------------------------------
  // 1. Strict AST Verification: Zero Code2 Occurrences in Target 5 Files
  // -------------------------------------------------------------------------
  describe("1. Zero Code2 Occurrences in Navigation Files", () => {
    for (const relPath of TARGET_FILES) {
      it(`verifies 0 Code2 imports or JSX nodes in ${relPath}`, () => {
        const fullPath = path.join(FRONTEND_DIR, relPath);
        assert.ok(fs.existsSync(fullPath), `File must exist: ${relPath}`);
        const source = fs.readFileSync(fullPath, "utf8");

        // Raw text search
        const code2Matches = [...source.matchAll(/\bCode2\b/g)];
        assert.equal(
          code2Matches.length,
          0,
          `Found ${code2Matches.length} raw occurrence(s) of "Code2" in ${relPath}`
        );

        // AST verification
        const ast = parseJSX(fullPath);
        let importedCode2 = false;
        let jsxCode2Count = 0;

        traverse(ast, {
          ImportSpecifier(nodePath) {
            if (nodePath.node.imported?.name === "Code2") {
              importedCode2 = true;
            }
          },
          JSXIdentifier(nodePath) {
            if (nodePath.node.name === "Code2") {
              jsxCode2Count++;
            }
          },
        });

        assert.equal(
          importedCode2,
          false,
          `AST error: Code2 is still imported in ${relPath}`
        );
        assert.equal(
          jsxCode2Count,
          0,
          `AST error: Code2 JSX element used ${jsxCode2Count} time(s) in ${relPath}`
        );
      });
    }
  });

  // -------------------------------------------------------------------------
  // 2. Strict AST Verification: OctoPairLogo Structure, Floating Unboxed Layout, and Parent Link
  // -------------------------------------------------------------------------
  describe("2. OctoPairLogo AST Structure & Unboxed Floating Layout", () => {
    for (const relPath of TARGET_FILES) {
      it(`verifies OctoPairLogo rendering, direct parent link, and group class in ${relPath}`, () => {
        const fullPath = path.join(FRONTEND_DIR, relPath);
        const ast = parseJSX(fullPath);

        let octoPairLogoImports = 0;
        const logoUsages = [];

        traverse(ast, {
          ImportDeclaration(nodePath) {
            const specifiers = nodePath.node.specifiers || [];
            for (const spec of specifiers) {
              if (
                spec.local?.name === "OctoPairLogo" ||
                spec.imported?.name === "OctoPairLogo"
              ) {
                octoPairLogoImports++;
              }
            }
          },
          JSXElement(nodePath) {
            const opening = nodePath.node.openingElement;
            if (
              opening.name.type === "JSXIdentifier" &&
              opening.name.name === "OctoPairLogo"
            ) {
              // Extract className on <OctoPairLogo />
              const classAttr = opening.attributes.find(
                (a) => a.type === "JSXAttribute" && a.name.name === "className"
              );
              const logoClass = extractJSXAttributeValue(classAttr) || "";

              // Inspect parent JSX element
              const parentElement = nodePath.parentPath.isJSXElement()
                ? nodePath.parentPath.node
                : null;

              const parentTag =
                parentElement?.openingElement?.name?.name || "unknown";

              const parentClassAttr =
                parentElement?.openingElement?.attributes.find(
                  (a) =>
                    a.type === "JSXAttribute" && a.name.name === "className"
                );
              const parentClass =
                extractJSXAttributeValue(parentClassAttr) || "";

              logoUsages.push({
                logoClass,
                parentTag,
                parentClass,
              });
            }
          },
        });

        assert.ok(
          octoPairLogoImports > 0,
          `OctoPairLogo must be imported in ${relPath}`
        );
        assert.equal(
          logoUsages.length,
          1,
          `Expected exactly 1 <OctoPairLogo /> JSX invocation in ${relPath}, found ${logoUsages.length}`
        );

        const usage = logoUsages[0];

        // 1. Parent MUST be Link or a
        assert.ok(
          usage.parentTag === "Link" || usage.parentTag === "a",
          `Direct parent of <OctoPairLogo /> in ${relPath} must be a <Link> or <a>, found <${usage.parentTag}>`
        );

        // 2. Parent link MUST contain the "group" class
        const parentClassTokens = usage.parentClass.split(/\s+/);
        assert.ok(
          parentClassTokens.includes("group"),
          `Parent <${usage.parentTag}> in ${relPath} must contain the "group" class. Actual: "${usage.parentClass}"`
        );

        // 3. Parent link must NOT have bounding-box styling (e.g. background container)
        assert.doesNotMatch(
          usage.parentClass,
          /bg-\[#ccff00\]\/15|border-\[#ccff00\]\/25/,
          `Parent link in ${relPath} must not have legacy bounding box classes`
        );

        // 4. Logo itself must NOT have bounding box classes
        assert.doesNotMatch(
          usage.logoClass,
          /bg-\[#ccff00\]\/15|border-\[#ccff00\]\/25|rounded-lg|bg-\[#111113\]/,
          `OctoPairLogo in ${relPath} must not have bounding box classes: "${usage.logoClass}"`
        );

        // 5. Logo MUST have vector sizing classes (h-7, h-8, or h-12 with w-auto)
        assert.match(
          usage.logoClass,
          /h-(7|8|12)\s+w-auto/,
          `OctoPairLogo in ${relPath} must have proportional height and w-auto: "${usage.logoClass}"`
        );
      });
    }
  });

  // -------------------------------------------------------------------------
  // 3. Strict Verification: Zero Drop-Shadow Glow on Brand Logo
  // -------------------------------------------------------------------------
  describe("3. Zero Drop-Shadow Glow on Brand Logo", () => {
    for (const relPath of TARGET_FILES) {
      it(`verifies no drop-shadow or lime glow on brand logo in ${relPath}`, () => {
        const fullPath = path.join(FRONTEND_DIR, relPath);
        const source = fs.readFileSync(fullPath, "utf8");

        // Find lines surrounding OctoPairLogo
        const lines = source.split("\n");
        lines.forEach((line, idx) => {
          if (line.includes("OctoPairLogo") || line.includes("OctoPair")) {
            // Check this line and adjacent 3 lines for drop shadow
            const slice = lines.slice(Math.max(0, idx - 3), idx + 4).join(" ");
            assert.doesNotMatch(
              slice,
              /shadow-\[0_0_15px|drop-shadow|filter|shadow-.*rgba\(204,\s*255,\s*0/,
              `Detected forbidden drop-shadow glow near OctoPairLogo at ${relPath}:${idx + 1}`
            );
          }
        });
      });
    }
  });

  // -------------------------------------------------------------------------
  // 4. Strict AST & Component Verification: OctoPairLogo Component Invariants
  // -------------------------------------------------------------------------
  describe("4. OctoPairLogo Component Invariants", () => {
    const logoPath = path.join(
      FRONTEND_DIR,
      "src/components/brand/OctoPairLogo.jsx"
    );

    it("verifies OctoPairLogo.jsx exists with strict vector attributes", () => {
      assert.ok(fs.existsSync(logoPath), "OctoPairLogo.jsx must exist");
      const content = fs.readFileSync(logoPath, "utf8");

      // Verify exact viewBox
      assert.match(
        content,
        /viewBox="3 6 60 60"/,
        'viewBox must be exactly "3 6 60 60"'
      );

      // Verify strokeWidth 6.5
      assert.match(
        content,
        /strokeWidth="6\.5"/,
        'Default strokeWidth must be "6.5"'
      );

      // Verify currentColor
      assert.match(
        content,
        /stroke="currentColor"/,
        'stroke must be "currentColor"'
      );

      // Verify stroke-linecap and join
      assert.match(
        content,
        /strokeLinecap="round"/,
        'strokeLinecap must be "round"'
      );
      assert.match(
        content,
        /strokeLinejoin="round"/,
        'strokeLinejoin must be "round"'
      );

      // Verify no drop shadow or filters
      assert.doesNotMatch(
        content,
        /drop-shadow|filter|shadow-/,
        "OctoPairLogo.jsx must not have any internal filters or drop shadows"
      );

      // Verify geometric vectors: circle, arc path, and tentacle path
      assert.match(
        content,
        /<circle\s+cx="24"\s+cy="28"\s+r="14"\s*\/>/,
        'Contains circle cx="24" cy="28" r="14"'
      );
      assert.match(
        content,
        /<path\s+d="M 29\.5 19 A 14 14 0 1 1 29\.5 37"\s*\/>/,
        'Contains arc path d="M 29.5 19 A 14 14 0 1 1 29.5 37"'
      );
      assert.match(
        content,
        /d="M 40 42 v 5\.5 c 0 6 6 10 12 7\.5 c 2\.5 -1\.2 3\.2 -4 0 -4\.5"\s+strokeWidth="6"/,
        "Contains tentacle path with strokeWidth 6"
      );
    });
  });

  // -------------------------------------------------------------------------
  // 5. Empirical Verification: Storage Key Migration (R3) Logic
  // -------------------------------------------------------------------------
  describe("5. Storage Key Migration (R3) Empirical Logic", () => {
    it("safely migrates legacy keys without overwriting existing octopair keys", async () => {
      const mockStorageData = {
        devtinder_auth_hint: "true",
        devtinder_auth: "1",
        devtinder_conversations: '{"c1":"hello"}',
      };

      const mockStorage = {
        getItem: (k) => mockStorageData[k] ?? null,
        setItem: (k, v) => {
          mockStorageData[k] = String(v);
        },
        removeItem: (k) => {
          delete mockStorageData[k];
        },
      };

      // Create isolated global mock
      const originalWindow = globalThis.window;
      const originalLocalStorage = globalThis.localStorage;
      globalThis.window = { localStorage: mockStorage };
      globalThis.localStorage = mockStorage;

      try {
        const { migrateBrandKeys } = await import(
          "../src/utils/migrateBrandKeys.js"
        );

        migrateBrandKeys();

        // Check new keys created
        assert.equal(mockStorageData.octopair_auth_hint, "true");
        assert.equal(mockStorageData.octopair_auth, "1");
        assert.equal(
          mockStorageData.octopair_conversations,
          '{"c1":"hello"}'
        );

        // Check old keys removed
        assert.equal(mockStorageData.devtinder_auth_hint, undefined);
        assert.equal(mockStorageData.devtinder_auth, undefined);
        assert.equal(mockStorageData.devtinder_conversations, undefined);

        // Second run with collision (octopair key already exists with newer data)
        mockStorageData.devtinder_auth_hint = "legacy_hint";
        mockStorageData.octopair_auth_hint = "new_hint";
        migrateBrandKeys();

        // Must NOT overwrite newer key
        assert.equal(mockStorageData.octopair_auth_hint, "new_hint");
        assert.equal(mockStorageData.devtinder_auth_hint, undefined);
      } finally {
        globalThis.window = originalWindow;
        globalThis.localStorage = originalLocalStorage;
      }
    });

    it("verifies main.jsx invokes migrateBrandKeys before root render", () => {
      const mainPath = path.join(FRONTEND_DIR, "src/main.jsx");
      const mainSource = fs.readFileSync(mainPath, "utf8");

      assert.match(
        mainSource,
        /import\s*\{\s*migrateBrandKeys\s*\}\s*from\s*["']\.\/utils\/migrateBrandKeys(\.js)?["']/,
        "main.jsx must import migrateBrandKeys"
      );
      assert.match(
        mainSource,
        /migrateBrandKeys\(\);[\s\S]*createRoot/,
        "main.jsx must call migrateBrandKeys() before createRoot"
      );
    });
  });

  // -------------------------------------------------------------------------
  // 6. Empirical Verification: Wordmarks & Brand Copy in Navigation
  // -------------------------------------------------------------------------
  describe("6. Wordmarks & Brand Text in Navigation", () => {
    it("verifies 'OctoPair' wordmark in Header.jsx", () => {
      const source = fs.readFileSync(
        path.join(FRONTEND_DIR, "src/components/Header.jsx"),
        "utf8"
      );
      assert.match(source, /<span[^>]*>\s*OctoPair\s*<\/span>/);
      assert.doesNotMatch(source, /DevTinder/);
    });

    it("verifies 'OctoPair' wordmark in LeftSidebar.jsx", () => {
      const source = fs.readFileSync(
        path.join(FRONTEND_DIR, "src/components/LeftSidebar.jsx"),
        "utf8"
      );
      assert.match(source, /<span[^>]*>\s*OctoPair\s*<\/span>/);
      assert.doesNotMatch(source, /DevTinder/);
    });

    it("verifies 'OctoPair' wordmark and 'New to OctoPair?' copy in Login.jsx", () => {
      const source = fs.readFileSync(
        path.join(FRONTEND_DIR, "src/components/Login.jsx"),
        "utf8"
      );
      assert.match(source, /<span[^>]*>\s*OctoPair\s*<\/span>/);
      assert.match(source, /New to OctoPair\?/);
      assert.doesNotMatch(source, /New to DevTinder/);
    });

    it("verifies 'OctoPair' wordmark in LandingNav.jsx", () => {
      const source = fs.readFileSync(
        path.join(FRONTEND_DIR, "src/components/landing/LandingNav.jsx"),
        "utf8"
      );
      assert.match(source, /<span[^>]*>\s*OctoPair\s*<\/span>/);
      assert.doesNotMatch(source, /DevTinder/);
    });

    it("verifies 'OctoPair' wordmark in LandingFooter.jsx", () => {
      const source = fs.readFileSync(
        path.join(FRONTEND_DIR, "src/components/landing/LandingFooter.jsx"),
        "utf8"
      );
      assert.match(source, /<span[^>]*>\s*OctoPair\s*<\/span>/);
      assert.doesNotMatch(source, /DevTinder/);
    });
  });
});
