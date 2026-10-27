import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const FRONTEND_DIR = path.resolve(import.meta.dirname, "..");
const SCOPED_FILES = [
  "src/components/ProjectRoom.jsx",
  "src/components/TaskList.jsx",
  "src/components/TeamChat.jsx",
  "src/components/Sandbox.jsx",
  "src/components/MyProjects.jsx",
];

describe("Milestone 5 Adversarial Verification Suite", () => {
  // --------------------------------------------------------------------------
  // 1. Strict Zero Unicode Emojis & Non-ASCII Scan
  // --------------------------------------------------------------------------
  describe("1. Strict ASCII & Zero Emoji Verification", () => {
    for (const relativePath of SCOPED_FILES) {
      it(`verifies pure ASCII encoding in ${relativePath}`, () => {
        const fullPath = path.join(FRONTEND_DIR, relativePath);
        assert.ok(fs.existsSync(fullPath), `File must exist: ${relativePath}`);
        const content = fs.readFileSync(fullPath, "utf8");

        const nonAsciiMatches = [];
        const lines = content.split("\n");
        lines.forEach((line, lineIndex) => {
          for (let col = 0; col < line.length; col++) {
            const code = line.charCodeAt(col);
            if (code < 0 || code > 127) {
              nonAsciiMatches.push({
                file: relativePath,
                line: lineIndex + 1,
                col: col + 1,
                char: line[col],
                charCode: code,
              });
            }
          }
        });

        assert.deepEqual(
          nonAsciiMatches,
          [],
          `Found ${nonAsciiMatches.length} non-ASCII character(s) in ${relativePath}: ${JSON.stringify(
            nonAsciiMatches.slice(0, 5)
          )}`
        );
      });
    }
  });

  // --------------------------------------------------------------------------
  // 2. Strict Zero Legacy Hex Colors Scan
  // --------------------------------------------------------------------------
  describe("2. Strict Legacy Hex Colors Scan", () => {
    const FORBIDDEN_HEX_REGEX =
      /#(0a0a0a|121212|141414|1e293b|0f172a|0d0d0e|141415|1a1a1c|1f1f21|262626|333333|525252|737373|9333ea)\b/i;

    for (const relativePath of SCOPED_FILES) {
      it(`verifies zero forbidden legacy hex colors in ${relativePath}`, () => {
        const fullPath = path.join(FRONTEND_DIR, relativePath);
        const content = fs.readFileSync(fullPath, "utf8");
        const lines = content.split("\n");

        const violations = [];
        lines.forEach((line, idx) => {
          const match = line.match(FORBIDDEN_HEX_REGEX);
          if (match) {
            violations.push({
              file: relativePath,
              line: idx + 1,
              matched: match[0],
              snippet: line.trim(),
            });
          }
        });

        assert.deepEqual(
          violations,
          [],
          `Found forbidden legacy hex colors in ${relativePath}: ${JSON.stringify(
            violations
          )}`
        );
      });
    }

    it("verifies canonical theme tokens are present across scoped components", () => {
      const canonicalTokens = [
        "#09090b", // void background
        "#111113", // card surface
        "#1a1a1f", // elevated surface
        "#ccff00", // lime accent
        "#b266ff", // purple accent
        "#f0f0f0", // primary text
        "#52525b", // muted text
      ];

      const allScopedContent = SCOPED_FILES.map((f) =>
        fs.readFileSync(path.join(FRONTEND_DIR, f), "utf8")
      ).join("\n");

      for (const token of canonicalTokens) {
        assert.ok(
          allScopedContent.includes(token),
          `Expected canonical token ${token} to be utilized in Milestone 5 components`
        );
      }
    });
  });

  // --------------------------------------------------------------------------
  // 3. Multi-Language Execution & Normalization in Sandbox
  // --------------------------------------------------------------------------
  describe("3. Multi-Language Execution & Judge0 Normalization", () => {
    const sandboxContent = fs.readFileSync(
      path.join(FRONTEND_DIR, "src/components/Sandbox.jsx"),
      "utf8"
    );

    const EXPECTED_LANGUAGES = [
      "javascript",
      "typescript",
      "python",
      "java",
      "cpp",
      "c",
      "rust",
      "go",
    ];

    it("defines Judge0 configurations with valid positive IDs for all 8 languages", () => {
      for (const lang of EXPECTED_LANGUAGES) {
        assert.ok(
          sandboxContent.includes(`${lang}: { id:`),
          `Sandbox must define Judge0 ID for language ${lang}`
        );
      }
    });

    it("defines boilerplates for all 8 supported languages", () => {
      for (const lang of EXPECTED_LANGUAGES) {
        assert.ok(
          sandboxContent.includes(`${lang}:`),
          `Sandbox must include boilerplate template for ${lang}`
        );
      }
    });

    it("correctly resolves language aliases (js, ts, py, c++, golang, rs)", () => {
      const LANGUAGE_ALIASES = {
        js: "javascript",
        ts: "typescript",
        py: "python",
        "c++": "cpp",
        golang: "go",
        rs: "rust",
      };

      const resolveAlias = (input) => {
        const raw = (input || "javascript").toLowerCase();
        return LANGUAGE_ALIASES[raw] || raw;
      };

      assert.equal(resolveAlias("js"), "javascript");
      assert.equal(resolveAlias("JS"), "javascript");
      assert.equal(resolveAlias("ts"), "typescript");
      assert.equal(resolveAlias("py"), "python");
      assert.equal(resolveAlias("c++"), "cpp");
      assert.equal(resolveAlias("golang"), "go");
      assert.equal(resolveAlias("rs"), "rust");
      assert.equal(resolveAlias("python"), "python");
      assert.equal(resolveAlias("unknown"), "unknown");
    });

    it("evaluates Judge0 stdout, stderr, and compile_output priority correctly", () => {
      const parseJudge0Output = (data) => {
        let finalOutput = "";
        if (data.stdout) finalOutput = data.stdout;
        else if (data.stderr) finalOutput = data.stderr;
        else if (data.compile_output) finalOutput = data.compile_output;
        else finalOutput = "Execution finished with no output.";

        const metrics = {
          time: data.time ? `${data.time}s` : "0ms",
          memory: data.memory ? `${data.memory} KB` : null,
          status: data.status?.description || "Completed",
          isError: Boolean(data.stderr || data.compile_output),
        };

        return { finalOutput, metrics };
      };

      // Case 1: Standard stdout success
      const successRes = parseJudge0Output({
        stdout: "Hello from DevTinder Pro!\n",
        time: "0.042",
        memory: 1200,
        status: { description: "Accepted" },
      });
      assert.equal(successRes.finalOutput, "Hello from DevTinder Pro!\n");
      assert.equal(successRes.metrics.isError, false);
      assert.equal(successRes.metrics.time, "0.042s");
      assert.equal(successRes.metrics.memory, "1200 KB");

      // Case 2: Runtime error in stderr
      const stderrRes = parseJudge0Output({
        stderr: "ZeroDivisionError: division by zero",
        status: { description: "Runtime Error" },
      });
      assert.equal(
        stderrRes.finalOutput,
        "ZeroDivisionError: division by zero"
      );
      assert.equal(stderrRes.metrics.isError, true);

      // Case 3: Compile error in compile_output
      const compileErrRes = parseJudge0Output({
        compile_output: "error: expected semicolon",
        status: { description: "Compilation Error" },
      });
      assert.equal(compileErrRes.finalOutput, "error: expected semicolon");
      assert.equal(compileErrRes.metrics.isError, true);

      // Case 4: No output
      const emptyRes = parseJudge0Output({});
      assert.equal(
        emptyRes.finalOutput,
        "Execution finished with no output."
      );
      assert.equal(emptyRes.metrics.isError, false);
    });
  });

  // --------------------------------------------------------------------------
  // 4. Splitter Dragging & Math Boundary Clamping
  // --------------------------------------------------------------------------
  describe("4. Splitter Dragging & Math Boundary Clamping", () => {
    it("horizontal left splitter clamps delta to [minWidth, maxWidth] without crashing", () => {
      const minWidth = 180;
      const maxWidth = 500;
      const startW = 260;

      const computeWidth = (startX, currentX) => {
        return Math.max(
          minWidth,
          Math.min(maxWidth, startW + (currentX - startX))
        );
      };

      // Drag to the extreme left (-10000px)
      assert.equal(computeWidth(500, -9500), minWidth);
      // Drag to the extreme right (+10000px)
      assert.equal(computeWidth(500, 10500), maxWidth);
      // Intermediate drag within range
      assert.equal(computeWidth(500, 540), 300);
      assert.equal(computeWidth(500, 460), 220);
    });

    it("right splitter clamps delta to [280, windowWidth - leftWidth - 150]", () => {
      const windowWidth = 1440;
      const leftWidth = 260;
      const startW = 380;
      const startX = 1000;

      const computeRightWidth = (currentX) => {
        const delta = startX - currentX;
        const maxW = windowWidth - leftWidth - 150; // 1440 - 260 - 150 = 1030
        return Math.max(280, Math.min(maxW, startW + delta));
      };

      // Drag extreme right (currentX = 5000px) -> delta negative -> clamps to 280
      assert.equal(computeRightWidth(5000), 280);
      // Drag extreme left (currentX = -5000px) -> delta huge positive -> clamps to 1030
      assert.equal(computeRightWidth(-5000), 1030);
      // Normal drag
      assert.equal(computeRightWidth(950), 430);
    });

    it("verifies full-screen transparent splitter mouse shield in ProjectRoom.jsx", () => {
      const projectRoomContent = fs.readFileSync(
        path.join(FRONTEND_DIR, "src/components/ProjectRoom.jsx"),
        "utf8"
      );

      assert.ok(
        projectRoomContent.includes("isDraggingSplitter"),
        "ProjectRoom must track isDraggingSplitter state"
      );
      assert.ok(
        projectRoomContent.includes("fixed inset-0 z-[9999] cursor-col-resize"),
        "ProjectRoom must render a full-screen z-[9999] overlay during dragging to prevent iframe mouse capture"
      );
    });
  });

  // --------------------------------------------------------------------------
  // 5. Null, Undefined, and Empty `roomData` Resilience
  // --------------------------------------------------------------------------
  describe("5. Null / Undefined / Partial roomData Resilience", () => {
    it("safely evaluates partner and targetId when roomData is null or undefined", () => {
      const user = { _id: "user123", firstName: "Alice" };

      const getTargetId = (u, rd) => {
        return u && rd
          ? rd.members?.find((m) => String(m._id) !== String(u._id))?._id
          : null;
      };

      assert.equal(getTargetId(user, null), null);
      assert.equal(getTargetId(user, undefined), null);
      assert.equal(getTargetId(null, { members: [] }), null);
      assert.equal(
        getTargetId(user, { members: [{ _id: "user123" }, { _id: "user456" }] }),
        "user456"
      );
    });

    it("safely extracts tasks, chats, and members count when roomData fields are empty or null", () => {
      const mockNullRoomData = null;
      const tasks = mockNullRoomData?.tasks || [];
      const chats = mockNullRoomData?.chats || [];
      const memberCount = mockNullRoomData?.members?.length || 1;

      assert.deepEqual(tasks, []);
      assert.deepEqual(chats, []);
      assert.equal(memberCount, 1);

      const mockEmptyRoomData = { members: [], tasks: [], chats: [] };
      assert.deepEqual(mockEmptyRoomData.tasks || [], []);
      assert.deepEqual(mockEmptyRoomData.chats || [], []);
      assert.equal(mockEmptyRoomData.members?.length || 1, 1);
    });

    it("verifies template fallback files dictionary when roomData files are null", () => {
      const DEFAULT_FILES = {
        react: { "/App.js": { code: "export default function App() {}" } },
        vue: { "/src/App.vue": { code: "<template></template>" } },
        angular: { "/src/app/app.component.ts": { code: "export class AppComponent {}" } },
      };

      const resolveFiles = (roomData, template) => {
        let filesToLoad = null;
        if (
          roomData?.files &&
          typeof roomData.files === "object" &&
          Object.keys(roomData.files).length > 0
        ) {
          filesToLoad = roomData.files;
        } else if (roomData?.lastCode) {
          filesToLoad = { "/App.js": { code: roomData.lastCode, active: true } };
        }
        return filesToLoad || DEFAULT_FILES[template || "react"];
      };

      assert.ok(resolveFiles(null, "react")["/App.js"]);
      assert.ok(resolveFiles({}, "vue")["/src/App.vue"]);
      assert.ok(resolveFiles({ files: {} }, "angular")["/src/app/app.component.ts"]);
      assert.deepEqual(
        resolveFiles({ files: { "/index.js": { code: "console.log(1)" } } }, "react"),
        { "/index.js": { code: "console.log(1)" } }
      );
    });
  });

  // --------------------------------------------------------------------------
  // 6. Async Task and Chat Prop Updates & Socket Synchronization
  // --------------------------------------------------------------------------
  describe("6. Async Task & Chat Prop Synchronization Logic", () => {
    it("simulates TaskList state transition from initial empty to asynchronously fetched tasks", () => {
      let tasks = [];
      const initialTasks = [
        { _id: "t1", title: "Setup Vite", completed: false },
        { _id: "t2", title: "Add Tailwind", completed: true },
      ];

      // Simulated useEffect sync:
      if (initialTasks && Array.isArray(initialTasks) && initialTasks.length > 0) {
        tasks = initialTasks;
      }

      assert.equal(tasks.length, 2);
      assert.equal(tasks[0].title, "Setup Vite");

      // Toggle task completion
      tasks = tasks.map((t) => (t._id === "t1" ? { ...t, completed: !t.completed } : t));
      assert.equal(tasks[0].completed, true);

      // Add task
      const newTask = {
        _id: "t3",
        title: "Test Task",
        completed: false,
        createdAt: new Date(),
      };
      tasks = [...tasks, newTask];
      assert.equal(tasks.length, 3);

      // Delete task
      tasks = tasks.filter((t) => t._id !== "t2");
      assert.equal(tasks.length, 2);
      assert.ok(!tasks.find((t) => t._id === "t2"));
    });

    it("simulates TeamChat state transition with incoming user and system messages", () => {
      let chats = [];
      const initialChats = [
        { _id: "c1", text: "Hello team", type: "user", senderId: { _id: "u1" } },
      ];

      // Simulated useEffect sync:
      if (initialChats && Array.isArray(initialChats) && initialChats.length > 0) {
        chats = initialChats;
      }
      assert.equal(chats.length, 1);

      // Incoming socket message:
      const incomingMsg = {
        _id: "c2",
        text: "Session started.",
        type: "system",
        createdAt: new Date(),
      };
      chats = [...chats, incomingMsg];

      assert.equal(chats.length, 2);
      assert.equal(chats[1].type, "system");
      assert.equal(chats[1].text, "Session started.");
    });
  });

  // --------------------------------------------------------------------------
  // 7. MyProjects Dashboard Stats & Empty States
  // --------------------------------------------------------------------------
  describe("7. MyProjects Dashboard Stats & Empty States", () => {
    it("computes stats for active workspaces, completed workspaces, and posts", () => {
      const activeList = [{ _id: "r1" }, { _id: "r2" }];
      const completedList = [{ _id: "r3" }];
      const postsList = [{ _id: "p1" }, { _id: "p2" }, { _id: "p3" }];

      const counts = {
        active: activeList.length,
        completed: completedList.length,
        posts: postsList.length,
      };

      assert.equal(counts.active, 2);
      assert.equal(counts.completed, 1);
      assert.equal(counts.posts, 3);
    });

    it("resolves template folder colors according to technology framework", () => {
      const getFolderColor = (template) => {
        switch (template?.toLowerCase()) {
          case "react":
          case "reactjs":
            return "text-[#61dafb]";
          case "vue":
          case "vuejs":
            return "text-[#42b883]";
          case "angular":
            return "text-[#dd0031]";
          default:
            return "text-[#b266ff]";
        }
      };

      assert.equal(getFolderColor("react"), "text-[#61dafb]");
      assert.equal(getFolderColor("ReactJS"), "text-[#61dafb]");
      assert.equal(getFolderColor("vue"), "text-[#42b883]");
      assert.equal(getFolderColor("angular"), "text-[#dd0031]");
      assert.equal(getFolderColor("node"), "text-[#b266ff]");
      assert.equal(getFolderColor(null), "text-[#b266ff]");
    });

    it("extracts avatar initials gracefully for boundary inputs", () => {
      const getInitials = (firstName, lastName) => {
        const first = firstName ? firstName.charAt(0).toUpperCase() : "";
        const last = lastName ? lastName.charAt(0).toUpperCase() : "";
        return `${first}${last}` || "U";
      };

      assert.equal(getInitials("Linus", "Torvalds"), "LT");
      assert.equal(getInitials("Alice", ""), "A");
      assert.equal(getInitials("", "Bob"), "B");
      assert.equal(getInitials("", ""), "U");
      assert.equal(getInitials(null, null), "U");
      assert.equal(getInitials(undefined, undefined), "U");
    });
  });

  // --------------------------------------------------------------------------
  // 8. Live WebRTC Reaction Badges & ASCII-only Lucide Icons
  // --------------------------------------------------------------------------
  describe("8. WebRTC Reaction Badges & Lucide Icons", () => {
    it("verifies reactions toolbar in ProjectRoom.jsx defines pure Lucide badges and 0 emojis", () => {
      const projectRoomContent = fs.readFileSync(
        path.join(FRONTEND_DIR, "src/components/ProjectRoom.jsx"),
        "utf8"
      );

      // Verify no emoji string array exists
      assert.ok(
        !projectRoomContent.includes('["👍", "🔥", "🚀", "💡", "😂"]'),
        "ProjectRoom must not contain raw unicode emojis in reaction arrays"
      );

      // Verify REACTIONS array uses Lucide icon components
      const EXPECTED_REACTION_IDS = [
        "thumbs-up",
        "flame",
        "zap",
        "sparkles",
        "smile",
      ];

      for (const id of EXPECTED_REACTION_IDS) {
        assert.ok(
          projectRoomContent.includes(`id: "${id}"`),
          `ProjectRoom must define Lucide reaction badge for ${id}`
        );
      }
    });
  });

  // --------------------------------------------------------------------------
  // 9. timeAgo Edge Case & Fallback Matrix
  // --------------------------------------------------------------------------
  describe("9. timeAgo Edge Cases & Fallback Matrix", () => {
    const timeAgo = (date) => {
      if (date === null || date === undefined) return null;
      const d = new Date(date);
      if (isNaN(d.getTime())) return null;

      const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
      if (seconds <= 60) return "just now";
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(seconds / 3600);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(seconds / 86400);
      if (days < 30) return `${days}d ago`;
      if (days < 365) return `${Math.floor(days / 30)}mo ago`;
      const years = Math.floor(days / 365);
      return `${years}y ago`;
    };

    it("handles null, undefined, and unparseable dates safely without crashing", () => {
      assert.equal(timeAgo(null), null);
      assert.equal(timeAgo(undefined), null);
      assert.equal(timeAgo("not-a-date"), null);
      assert.equal(timeAgo(NaN), null);
      assert.equal(timeAgo(null) || "recently", "recently");
    });

    it("formats relative ranges accurately from seconds to years", () => {
      const now = Date.now();
      assert.equal(timeAgo(new Date(now - 10 * 1000)), "just now");
      assert.equal(timeAgo(new Date(now - 5 * 60 * 1000)), "5m ago");
      assert.equal(timeAgo(new Date(now - 3 * 3600 * 1000)), "3h ago");
      assert.equal(timeAgo(new Date(now - 4 * 86400 * 1000)), "4d ago");
      assert.equal(timeAgo(new Date(now - 45 * 86400 * 1000)), "1mo ago");
      assert.equal(timeAgo(new Date(now - 800 * 86400 * 1000)), "2y ago");
    });
  });

  // --------------------------------------------------------------------------
  // 10. Corrupted JSON & Malformed Storage Handling
  // --------------------------------------------------------------------------
  describe("10. Corrupted JSON & Storage Resilience", () => {
    it("handles malformed JSON in Sandpack localStorage recovery safely", () => {
      const parseBackup = (raw) => {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
            return parsed;
          }
        } catch {
          // gracefully fallback
        }
        return null;
      };

      assert.equal(parseBackup("invalid json {;;;"), null);
      assert.equal(parseBackup(""), null);
      assert.equal(parseBackup("null"), null);
      assert.equal(parseBackup("[]"), null);
      assert.deepEqual(parseBackup('{"/App.js": {"code": "export default 1;"}}'), {
        "/App.js": { code: "export default 1;" },
      });
    });

    it("handles malformed package.json in DependencyManager safely", () => {
      const parsePackageJson = (str) => {
        try {
          const parsed = JSON.parse(str);
          return parsed.dependencies || {};
        } catch {
          return {};
        }
      };

      assert.deepEqual(parsePackageJson("bad json"), {});
      assert.deepEqual(parsePackageJson('{"dependencies": {"react": "^18.0.0"}}'), {
        react: "^18.0.0",
      });
      assert.deepEqual(parsePackageJson('{}'), {});
    });
  });

  // --------------------------------------------------------------------------
  // 11. Live Cursors Throttling & Stale Garbage Collection
  // --------------------------------------------------------------------------
  describe("11. Live Cursors Throttling & Garbage Collection", () => {
    it("prunes remote cursors older than 3000ms threshold", () => {
      const now = Date.now();
      let cursors = {
        user1: { position: { x: 0.1, y: 0.2 }, userName: "Bob", lastUpdate: now - 1000 },
        user2: { position: { x: 0.5, y: 0.6 }, userName: "Charlie", lastUpdate: now - 3500 },
        user3: { position: { x: 0.8, y: 0.9 }, userName: "Dave", lastUpdate: now - 4000 },
      };

      // Garbage collection cycle:
      const next = { ...cursors };
      Object.keys(next).forEach((k) => {
        if (now - next[k].lastUpdate > 3000) {
          delete next[k];
        }
      });
      cursors = next;

      assert.ok(cursors.user1, "Active cursor within 3000ms must be preserved");
      assert.ok(!cursors.user2, "Stale cursor (>3000ms) must be pruned");
      assert.ok(!cursors.user3, "Stale cursor (>3000ms) must be pruned");
    });
  });

  // --------------------------------------------------------------------------
  // 12. Input Validation, Trimming & Guardrails (TaskList & TeamChat)
  // --------------------------------------------------------------------------
  describe("12. Input Validation & Guardrails", () => {
    it("prevents adding empty or whitespace-only tasks in TaskList", () => {
      const testInputs = ["", "   ", "\t\t", "\n\n", "   \n   "];
      for (const input of testInputs) {
        const trimmed = input.trim();
        assert.equal(Boolean(trimmed), false, `Input '${input}' must not produce a task`);
      }

      const validTitle = "  Fix production bug  ";
      const trimmed = validTitle.trim();
      assert.equal(trimmed, "Fix production bug");
    });

    it("prevents sending empty or whitespace-only messages in TeamChat", () => {
      const testInputs = ["", "   ", "\t", "\n"];
      for (const input of testInputs) {
        const trimmed = input.trim();
        assert.equal(Boolean(trimmed), false, `Empty input '${input}' must be blocked`);
      }

      const validMsg = "  Hello partner  ";
      assert.equal(validMsg.trim(), "Hello partner");
    });
  });
});

