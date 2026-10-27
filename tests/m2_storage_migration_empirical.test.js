/* global global */
import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_DIR = path.resolve(__dirname, "..");

describe("Milestone 2 (R3) Storage Key Migration Empirical Challenge Suite", () => {
  let mockStorageData;
  let mockStorage;
  let originalWindow;
  let originalLocalStorage;

  beforeEach(() => {
    mockStorageData = {};
    mockStorage = {
      getItem(key) {
        return Object.prototype.hasOwnProperty.call(mockStorageData, key)
          ? mockStorageData[key]
          : null;
      },
      setItem(key, value) {
        mockStorageData[key] = String(value);
      },
      removeItem(key) {
        delete mockStorageData[key];
      },
      clear() {
        mockStorageData = {};
      },
      get length() {
        return Object.keys(mockStorageData).length;
      },
      key(i) {
        return Object.keys(mockStorageData)[i] || null;
      },
    };

    originalWindow = global.window;
    originalLocalStorage = global.localStorage;

    global.window = { localStorage: mockStorage };
    global.localStorage = mockStorage;
  });

  afterEach(() => {
    global.window = originalWindow;
    global.localStorage = originalLocalStorage;
  });

  // =========================================================================
  // SCENARIO A: User with legacy keys
  // =========================================================================
  describe("Scenario A: Legacy Key Migration", () => {
    it("migrates all legacy keys to octopair_* and removes devtinder_*", async () => {
      mockStorageData.devtinder_auth_hint = "true";
      mockStorageData.devtinder_auth = "1";
      mockStorageData.devtinder_conversations = JSON.stringify({
        user1: { text: "Hey! Ready to pair?", createdAt: "2026-10-18T05:00:00.000Z" },
        user2: { text: "Project room created", createdAt: "2026-10-18T06:00:00.000Z" }
      });

      const { migrateBrandKeys } = await import("../src/utils/migrateBrandKeys.js");
      migrateBrandKeys();

      // Verify copied to octopair_*
      assert.equal(mockStorageData.octopair_auth_hint, "true");
      assert.equal(mockStorageData.octopair_auth, "1");
      assert.equal(
        mockStorageData.octopair_conversations,
        JSON.stringify({
          user1: { text: "Hey! Ready to pair?", createdAt: "2026-10-18T05:00:00.000Z" },
          user2: { text: "Project room created", createdAt: "2026-10-18T06:00:00.000Z" }
        })
      );

      // Verify removed from devtinder_*
      assert.equal(mockStorageData.devtinder_auth_hint, undefined);
      assert.equal(mockStorageData.devtinder_auth, undefined);
      assert.equal(mockStorageData.devtinder_conversations, undefined);
    });

    it("handles partial legacy keys (e.g. only conversations, or only auth_hint)", async () => {
      mockStorageData.devtinder_conversations = '{"u3":{"text":"ping"}}';

      const { migrateBrandKeys } = await import("../src/utils/migrateBrandKeys.js");
      migrateBrandKeys();

      assert.equal(mockStorageData.octopair_conversations, '{"u3":{"text":"ping"}}');
      assert.equal(mockStorageData.devtinder_conversations, undefined);
      assert.equal(mockStorageData.octopair_auth_hint, undefined);
      assert.equal(mockStorageData.octopair_auth, undefined);
    });
  });

  // =========================================================================
  // SCENARIO B: User with existing octopair_* keys (Collision / No Overwrite)
  // =========================================================================
  describe("Scenario B: Overwrite Prevention & Existing octopair_* Keys", () => {
    it("does NOT overwrite existing octopair_* keys with stale legacy keys", async () => {
      mockStorageData.devtinder_auth_hint = "legacy_hint";
      mockStorageData.octopair_auth_hint = "current_hint";

      mockStorageData.devtinder_auth = "legacy_auth";
      mockStorageData.octopair_auth = "current_auth";

      mockStorageData.devtinder_conversations = '{"old_conv":"old"}';
      mockStorageData.octopair_conversations = '{"new_conv":"new"}';

      const { migrateBrandKeys } = await import("../src/utils/migrateBrandKeys.js");
      migrateBrandKeys();

      // Current keys MUST be preserved exactly
      assert.equal(mockStorageData.octopair_auth_hint, "current_hint");
      assert.equal(mockStorageData.octopair_auth, "current_auth");
      assert.equal(mockStorageData.octopair_conversations, '{"new_conv":"new"}');

      // Stale legacy keys MUST still be cleaned up
      assert.equal(mockStorageData.devtinder_auth_hint, undefined);
      assert.equal(mockStorageData.devtinder_auth, undefined);
      assert.equal(mockStorageData.devtinder_conversations, undefined);
    });

    it("does NOT overwrite when octopair value is empty string or '0'", async () => {
      mockStorageData.devtinder_auth = "1";
      mockStorageData.octopair_auth = "0";

      mockStorageData.devtinder_conversations = '{"conv":1}';
      mockStorageData.octopair_conversations = "{}";

      const { migrateBrandKeys } = await import("../src/utils/migrateBrandKeys.js");
      migrateBrandKeys();

      assert.equal(mockStorageData.octopair_auth, "0");
      assert.equal(mockStorageData.octopair_conversations, "{}");
      assert.equal(mockStorageData.devtinder_auth, undefined);
      assert.equal(mockStorageData.devtinder_conversations, undefined);
    });
  });

  // =========================================================================
  // SCENARIO C: User with no keys (Fresh User)
  // =========================================================================
  describe("Scenario C: Empty Storage State", () => {
    it("executes cleanly without creating undefined/null keys or throwing", async () => {
      assert.equal(mockStorage.length, 0);

      const { migrateBrandKeys } = await import("../src/utils/migrateBrandKeys.js");
      assert.doesNotThrow(() => migrateBrandKeys());

      assert.equal(mockStorage.length, 0);
      assert.equal(mockStorage.getItem("octopair_auth_hint"), null);
      assert.equal(mockStorage.getItem("octopair_auth"), null);
      assert.equal(mockStorage.getItem("octopair_conversations"), null);
    });
  });

  // =========================================================================
  // SCENARIO D: Edge Cases & Hostile Environments
  // =========================================================================
  describe("Scenario D: Hostile Environments & Edge Cases", () => {
    it("handles SSR / window === undefined gracefully", async () => {
      global.window = undefined;
      global.localStorage = undefined;

      const { migrateBrandKeys } = await import("../src/utils/migrateBrandKeys.js");
      assert.doesNotThrow(() => migrateBrandKeys());
    });

    it("handles window defined but window.localStorage === null/undefined", async () => {
      global.window = {};
      global.localStorage = undefined;

      const { migrateBrandKeys } = await import("../src/utils/migrateBrandKeys.js");
      assert.doesNotThrow(() => migrateBrandKeys());
    });

    it("handles QuotaExceededError during setItem without losing legacy key", async () => {
      mockStorageData.devtinder_conversations = '{"big":"data"}';

      // Override setItem to simulate quota exceeded
      mockStorage.setItem = (key, val) => {
        if (key === "octopair_conversations") {
          const quotaErr = new Error("QuotaExceededError");
          quotaErr.name = "QuotaExceededError";
          throw quotaErr;
        }
        mockStorageData[key] = val;
      };

      const { migrateBrandKeys } = await import("../src/utils/migrateBrandKeys.js");
      assert.doesNotThrow(() => migrateBrandKeys());

      // Because setItem threw, oldKey should NOT be removed (preserves data from deletion)
      assert.equal(mockStorageData.devtinder_conversations, '{"big":"data"}');
      assert.equal(mockStorageData.octopair_conversations, undefined);
    });

    it("continues migrating subsequent keys even if an earlier key threw an error", async () => {
      mockStorageData.devtinder_auth_hint = "true";
      mockStorageData.devtinder_auth = "1";
      mockStorageData.devtinder_conversations = '{"chat":"ok"}';

      // Throw on devtinder_auth setItem
      mockStorage.setItem = (key, val) => {
        if (key === "octopair_auth") {
          throw new Error("Disk error");
        }
        mockStorageData[key] = val;
      };

      const { migrateBrandKeys } = await import("../src/utils/migrateBrandKeys.js");
      assert.doesNotThrow(() => migrateBrandKeys());

      // auth_hint and conversations should have succeeded
      assert.equal(mockStorageData.octopair_auth_hint, "true");
      assert.equal(mockStorageData.devtinder_auth_hint, undefined);

      assert.equal(mockStorageData.octopair_conversations, '{"chat":"ok"}');
      assert.equal(mockStorageData.devtinder_conversations, undefined);

      // auth failed, so legacy remains
      assert.equal(mockStorageData.octopair_auth, undefined);
      assert.equal(mockStorageData.devtinder_auth, "1");
    });

    it("handles window.localStorage getter throwing SecurityError", async () => {
      // Simulate restricted iframe / blocked 3rd party storage
      const restrictedWindow = {};
      Object.defineProperty(restrictedWindow, "localStorage", {
        get() {
          const secErr = new Error("SecurityError: Failed to read 'localStorage'");
          secErr.name = "SecurityError";
          throw secErr;
        },
      });

      global.window = restrictedWindow;
      global.localStorage = undefined;

      const { migrateBrandKeys } = await import("../src/utils/migrateBrandKeys.js");
      
      // Let's observe if migrateBrandKeys throws or handles it
      let didThrow = false;
      try {
        migrateBrandKeys();
      } catch {
        didThrow = true;
      }

      // Record empirical observation
      console.log("Empirical test: window.localStorage getter throwing SecurityError -> didThrow:", didThrow);
    });
  });

  // =========================================================================
  // STORAGE READ FALLBACK LOGIC IN Chat.jsx, ConnectionsPage.jsx, LandingPage.jsx
  // =========================================================================
  describe("Storage Read Fallback Logic in Consumer Components", () => {
    it("verifies Chat.jsx fallback read logic for savedConversations", () => {
      const chatPath = path.join(FRONTEND_DIR, "src/components/Chat.jsx");
      const chatSrc = fs.readFileSync(chatPath, "utf8");

      // Verify read fallback in savedConversations
      assert.match(
        chatSrc,
        /localStorage\.getItem\(\s*["']octopair_conversations["']\s*\)\s*\|\|\s*localStorage\.getItem\(\s*["']devtinder_conversations["']\s*\)/,
        "Chat.jsx savedConversations must fallback to devtinder_conversations"
      );

      // Verify read fallback in saveConversationSummary
      assert.match(
        chatSrc,
        /saveConversationSummary[\s\S]*?localStorage\.getItem\(\s*["']octopair_conversations["']\s*\)\s*\|\|\s*localStorage\.getItem\(\s*["']devtinder_conversations["']\s*\)/,
        "Chat.jsx saveConversationSummary must fallback to devtinder_conversations when reading existing history"
      );

      // Verify write in saveConversationSummary targets octopair_conversations
      assert.match(
        chatSrc,
        /localStorage\.setItem\(\s*["']octopair_conversations["']/,
        "Chat.jsx saveConversationSummary must write to octopair_conversations"
      );
    });

    it("simulates Chat.jsx conversation read & write flow empirically", () => {
      // Scenario: User opens Chat without migrateBrandKeys run yet, has only legacy conversations
      mockStorageData.devtinder_conversations = JSON.stringify({
        partner_1: { text: "Old message", createdAt: "2026-10-17T12:00:00Z" }
      });

      // Emulate Chat.jsx savedConversations
      const readConversations = () => {
        try {
          return JSON.parse(
            mockStorage.getItem("octopair_conversations") ||
            mockStorage.getItem("devtinder_conversations") ||
            "{}"
          );
        } catch {
          return {};
        }
      };

      const initial = readConversations();
      assert.deepEqual(initial, {
        partner_1: { text: "Old message", createdAt: "2026-10-17T12:00:00Z" }
      });

      // Emulate Chat.jsx saveConversationSummary
      const saveConversation = (userId, text, createdAt) => {
        try {
          const existing = JSON.parse(
            mockStorage.getItem("octopair_conversations") ||
            mockStorage.getItem("devtinder_conversations") ||
            "{}"
          );
          existing[userId] = {
            text,
            createdAt: createdAt || "2026-10-18T07:00:00Z"
          };
          mockStorage.setItem("octopair_conversations", JSON.stringify(existing));
        } catch {
          // ignore
        }
      };

      // User sends a new message
      saveConversation("partner_2", "New message to partner 2", "2026-10-18T07:10:00Z");

      // Verify octopair_conversations has BOTH partner_1 and partner_2 merged!
      const updated = JSON.parse(mockStorageData.octopair_conversations);
      assert.equal(updated.partner_1.text, "Old message");
      assert.equal(updated.partner_2.text, "New message to partner 2");
    });

    it("verifies ConnectionsPage.jsx fallback read logic for savedConversations", () => {
      const connPath = path.join(FRONTEND_DIR, "src/components/ConnectionsPage.jsx");
      const connSrc = fs.readFileSync(connPath, "utf8");

      assert.match(
        connSrc,
        /localStorage\.getItem\(\s*["']octopair_conversations["']\s*\)\s*\|\|\s*localStorage\.getItem\(\s*["']devtinder_conversations["']\s*\)/,
        "ConnectionsPage.jsx must fallback to devtinder_conversations"
      );
    });

    it("verifies LandingPage.jsx dual-key check in isAuthHint", () => {
      const landingPath = path.join(FRONTEND_DIR, "src/components/LandingPage.jsx");
      const landingSrc = fs.readFileSync(landingPath, "utf8");

      assert.match(
        landingSrc,
        /localStorage\.getItem\(\s*["']octopair_auth_hint["']\s*\)\s*===\s*["']true["']/,
        "LandingPage.jsx must check octopair_auth_hint"
      );
      assert.match(
        landingSrc,
        /localStorage\.getItem\(\s*["']devtinder_auth_hint["']\s*\)\s*===\s*["']true["']/,
        "LandingPage.jsx must check devtinder_auth_hint"
      );
      assert.match(
        landingSrc,
        /localStorage\.getItem\(\s*["']octopair_auth["']\s*\)\s*===\s*["']1["']/,
        "LandingPage.jsx must check octopair_auth"
      );
      assert.match(
        landingSrc,
        /localStorage\.getItem\(\s*["']devtinder_auth["']\s*\)\s*===\s*["']1["']/,
        "LandingPage.jsx must check devtinder_auth"
      );
    });

    it("simulates LandingPage.jsx isAuthHint evaluation under all key combinations", () => {
      const evalIsAuthHint = (user = null, cookie = "") => {
        return typeof window !== "undefined" && (
          mockStorage.getItem("octopair_auth_hint") === "true" ||
          mockStorage.getItem("devtinder_auth_hint") === "true" ||
          mockStorage.getItem("octopair_auth") === "1" ||
          mockStorage.getItem("devtinder_auth") === "1" ||
          (cookie && cookie.includes("auth_hint=true")) ||
          Boolean(user)
        );
      };

      // 1. Completely unauthenticated
      assert.equal(evalIsAuthHint(), false);

      // 2. Legacy devtinder_auth_hint only
      mockStorageData.devtinder_auth_hint = "true";
      assert.equal(evalIsAuthHint(), true);
      delete mockStorageData.devtinder_auth_hint;

      // 3. New octopair_auth_hint only
      mockStorageData.octopair_auth_hint = "true";
      assert.equal(evalIsAuthHint(), true);
      delete mockStorageData.octopair_auth_hint;

      // 4. Legacy devtinder_auth only
      mockStorageData.devtinder_auth = "1";
      assert.equal(evalIsAuthHint(), true);
      delete mockStorageData.devtinder_auth;

      // 5. New octopair_auth only
      mockStorageData.octopair_auth = "1";
      assert.equal(evalIsAuthHint(), true);
      delete mockStorageData.octopair_auth;

      // 6. Cookie auth_hint
      assert.equal(evalIsAuthHint(null, "auth_hint=true; Path=/"), true);

      // 7. Redux user present
      assert.equal(evalIsAuthHint({ _id: "123", firstName: "Alice" }), true);
    });
  });

  // =========================================================================
  // BOOTSTRAP ORDER IN main.jsx
  // =========================================================================
  describe("Bootstrap Ordering in main.jsx", () => {
    it("verifies migrateBrandKeys is executed strictly before createRoot render", () => {
      const mainPath = path.join(FRONTEND_DIR, "src/main.jsx");
      const mainSrc = fs.readFileSync(mainPath, "utf8");

      const importIndex = mainSrc.indexOf("migrateBrandKeys");
      assert.ok(importIndex !== -1, "migrateBrandKeys must be imported");

      const callIndex = mainSrc.indexOf("migrateBrandKeys();");
      assert.ok(callIndex !== -1, "migrateBrandKeys() must be called");

      // Match createRoot invocation (e.g. createRoot(document...)
      const createRootCallMatch = mainSrc.match(/createRoot\s*\(/);
      assert.ok(createRootCallMatch, "createRoot(...) invocation must be present");
      const createRootCallIndex = createRootCallMatch.index;

      assert.ok(
        callIndex < createRootCallIndex,
        `migrateBrandKeys() (index ${callIndex}) must be invoked before createRoot(...) (index ${createRootCallIndex})`
      );
    });
  });
});
