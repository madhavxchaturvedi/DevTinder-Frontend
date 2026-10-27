import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { addUser } from "../redux/userSlice";
import {
  ArrowLeft,
  Code2,
  Play,
  Terminal,
  MessageSquare,
  Send,
  Trash2,
  X,
  Copy,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Check,
  Zap,
  Loader2,
  Maximize2,
  Minimize2,
} from "lucide-react";
import Editor from "@monaco-editor/react";
import { getSocket } from "../utils/socket";
import { BASE_URL, DEFAULT_AVATAR } from "../utils/constants";
import { motion as Motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";

// Boilerplate Templates
const BOILERPLATES = {
  javascript: `// OctoPair Collaborative Sandbox
// Real-time multi-language execution engine

function helloWorld() {
  console.log("Hello from OctoPair Pro!");
}

helloWorld();
`,
  typescript: `// OctoPair Collaborative Sandbox

const helloWorld = (): void => {
  console.log("Hello from TypeScript on OctoPair Pro!");
};

helloWorld();
`,
  python: `# OctoPair Collaborative Sandbox

def hello_world():
    print("Hello from Python 3 on OctoPair Pro!")

hello_world()
`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java 17 on OctoPair Pro!");
    }
}
`,
  cpp: `#include <iostream>

int main() {
    std::cout << "Hello from C++ 14 on OctoPair Pro!" << std::endl;
    return 0;
}
`,
  c: `#include <stdio.h>

int main() {
    printf("Hello from C on OctoPair Pro!\\n");
    return 0;
}
`,
  rust: `fn main() {
    println!("Hello from Rust on OctoPair Pro!");
}
`,
  go: `package main

import "fmt"

func main() {
    fmt.Println("Hello from Go on OctoPair Pro!")
}
`,
};

// Judge0 CE Language IDs
const JUDGE0_LANGUAGES = {
  javascript: { id: 102, label: "JavaScript (Node 22)" },
  typescript: { id: 101, label: "TypeScript (5.6)" },
  python: { id: 100, label: "Python (3.12)" },
  java: { id: 91, label: "Java (JDK 17)" },
  cpp: { id: 105, label: "C++ (GCC 14)" },
  c: { id: 104, label: "C (GCC 14)" },
  rust: { id: 108, label: "Rust (1.80)" },
  go: { id: 107, label: "Go (1.23)" },
};

const LANGUAGE_ALIASES = {
  js: "javascript",
  ts: "typescript",
  py: "python",
  "c++": "cpp",
  golang: "go",
  rs: "rust",
};

const Sandbox = () => {
  const { roomId: rawRoomId } = useParams();
  const user = useSelector((store) => store.user);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Route fallback: ensure a solid roomId exists
  const roomId = useMemo(() => {
    if (rawRoomId) return rawRoomId;
    return `solo_${user?._id || Math.random().toString(36).substring(2, 9)}`;
  }, [rawRoomId, user?._id]);

  const [isInitializing, setIsInitializing] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);

  // Ingest initial code and language from router location.state
  const initialLanguageRaw = location.state?.initialLanguage || "javascript";
  const initialLanguage =
    LANGUAGE_ALIASES[initialLanguageRaw?.toLowerCase()] ||
    initialLanguageRaw?.toLowerCase() ||
    "javascript";
  const initialCode = location.state?.initialCode;

  const [language, setLanguage] = useState(initialLanguage);
  const [code, setCode] = useState(
    initialCode || BOILERPLATES[initialLanguage] || BOILERPLATES.javascript
  );

  const isSnippetRoom = roomId?.startsWith("snippet_");
  const targetId =
    user && !isSnippetRoom
      ? roomId?.split("_").find((id) => id !== String(user._id))
      : null;
  const [targetUser, setTargetUser] = useState(null);
  const [isTargetUserInRoom, setIsTargetUserInRoom] = useState(false);

  // Execution state
  const [output, setOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [execMetrics, setExecMetrics] = useState(null);
  const [isTerminalExpanded, setIsTerminalExpanded] = useState(false);

  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const chatEndRef = useRef(null);

  // Cursor position in status bar
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  const isChatOpenRef = useRef(isChatOpen);
  useEffect(() => {
    isChatOpenRef.current = isChatOpen;
  }, [isChatOpen]);

  // Editor refs
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef(null);
  const remoteCursorsRef = useRef({});
  const codeRef = useRef(code);
  const languageRef = useRef(language);

  const isPremium = user?.isPremium;

  // Authentication Check
  useEffect(() => {
    const fetchUser = async () => {
      if (user) {
        setIsInitializing(false);
        return;
      }
      try {
        const res = await axios.get(BASE_URL + "/profile/view", {
          withCredentials: true,
        });
        dispatch(addUser(res.data));
      } catch (err) {
        if (err?.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setIsInitializing(false);
      }
    };
    fetchUser();
  }, [user, dispatch, navigate]);

  // Fetch Collaborator Profile
  useEffect(() => {
    if (targetId) {
      axios
        .get(BASE_URL + "/user/" + targetId, { withCredentials: true })
        .then((res) => setTargetUser(res.data.user))
        .catch(console.error);
    }
  }, [targetId]);

  // Socket Synchronization
  useEffect(() => {
    if (isInitializing || !isPremium || !user || !roomId) return;

    const sock = getSocket();

    sock.on("connect", () => {
      setSocketConnected(true);
      sock.emit("joinSandbox", { roomId, userId: user._id });
    });

    sock.on("disconnect", () => {
      setSocketConnected(false);
    });

    sock.on("receiveCodeChange", ({ code: newCode, language: newLang }) => {
      setCode(newCode);
      codeRef.current = newCode;
      if (newLang && newLang !== languageRef.current) {
        setLanguage(newLang);
        languageRef.current = newLang;
      }
    });

    sock.on("receiveCursorMove", ({ userId, userName, position }) => {
      remoteCursorsRef.current[userId] = { position, userName };
      updateRemoteCursors();
    });

    sock.on("receiveExecutionState", ({ isExecuting: remoteExecuting }) => {
      setIsExecuting(remoteExecuting);
    });

    sock.on("receiveOutput", ({ output: syncedOutput, metrics }) => {
      setOutput(syncedOutput);
      if (metrics) setExecMetrics(metrics);
    });

    sock.on("provideSandboxSync", ({ targetSocketId }) => {
      sock.emit("sendSandboxSync", {
        targetSocketId,
        code: codeRef.current,
        language: languageRef.current,
      });
    });

    sock.on("receiveSandboxMessage", (msg) => {
      setChatMessages((prev) => [...prev, msg]);
      if (!isChatOpenRef.current) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    sock.on("userJoinedSandbox", ({ userId }) => {
      if (String(userId) === String(targetId)) setIsTargetUserInRoom(true);
      sock.emit("acknowledgeSandboxJoin", { roomId, userId: user._id });
    });

    sock.on("userAlreadyInSandbox", ({ userId }) => {
      if (String(userId) === String(targetId)) setIsTargetUserInRoom(true);
    });

    sock.on("userLeftSandbox", ({ userId }) => {
      if (String(userId) === String(targetId)) setIsTargetUserInRoom(false);
    });

    sock.on("sandboxPresencePing", ({ requesterId }) => {
      sock.emit("pongSandboxPresence", {
        targetSocketId: requesterId,
        userId: user._id,
      });
    });

    if (sock.connected) {
      setSocketConnected(true);
      sock.emit("joinSandbox", { roomId, userId: user._id });
      sock.emit("requestSandboxSync", { roomId });
    }

    return () => {
      if (sock.connected) {
        sock.emit("leaveSandbox", { roomId, userId: user._id });
      }
      sock.off("connect");
      sock.off("disconnect");
      sock.off("receiveCodeChange");
      sock.off("receiveCursorMove");
      sock.off("receiveExecutionState");
      sock.off("receiveOutput");
      sock.off("provideSandboxSync");
      sock.off("receiveSandboxMessage");
      sock.off("userJoinedSandbox");
      sock.off("userAlreadyInSandbox");
      sock.off("userLeftSandbox");
      sock.off("sandboxPresencePing");
    };
  }, [user, roomId, isPremium, isInitializing, targetId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatOpen]);

  // Remote Cursor Decoration Rendering
  const updateRemoteCursors = () => {
    if (!editorRef.current || !monacoRef.current) return;

    const newDecorations = [];
    Object.keys(remoteCursorsRef.current).forEach((userId) => {
      const { position, userName } = remoteCursorsRef.current[userId];
      const className = `remote-cursor-${userId}`;
      let styleEl = document.getElementById(`style-${className}`);

      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = `style-${className}`;
        styleEl.innerHTML = `
          .${className} {
            border-left: 2px solid #b266ff !important;
            position: absolute;
            z-index: 99;
          }
          .${className}::after {
            content: '${userName}';
            position: absolute;
            top: -18px;
            left: 0;
            background: #b266ff;
            color: #09090b;
            font-size: 10px;
            font-family: 'JetBrains Mono', monospace;
            font-weight: 700;
            padding: 1px 6px;
            border-radius: 4px 4px 4px 0px;
            white-space: nowrap;
            box-shadow: 0 0 10px rgba(178, 102, 255, 0.4);
            pointer-events: none;
          }
        `;
        document.head.appendChild(styleEl);
      }

      newDecorations.push({
        range: new monacoRef.current.Range(
          position.lineNumber,
          position.column,
          position.lineNumber,
          position.column
        ),
        options: {
          className: className,
          stickiness:
            monacoRef.current.editor.TrackedRangeStickiness
              .NeverGrowsWhenTypingAtEdges,
        },
      });
    });

    if (decorationsRef.current) {
      decorationsRef.current.set(newDecorations);
    } else {
      decorationsRef.current =
        editorRef.current.createDecorationsCollection(newDecorations);
    }
  };

  // Editor Handlers
  const handleEditorChange = (value) => {
    const newCode = value || "";
    setCode(newCode);
    codeRef.current = newCode;
    const sock = getSocket();
    if (sock?.connected) {
      sock.emit("codeChange", {
        roomId,
        code: newCode,
        language: languageRef.current,
      });
    }
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    languageRef.current = newLang;

    const isBoilerplate =
      Object.values(BOILERPLATES).includes(codeRef.current) ||
      codeRef.current.trim() === "";
    if (isBoilerplate) {
      const newCode = BOILERPLATES[newLang] || "";
      setCode(newCode);
      codeRef.current = newCode;
      const sock = getSocket();
      if (sock?.connected) {
        sock.emit("codeChange", { roomId, code: newCode, language: newLang });
      }
    }
  };

  const resetBoilerplate = () => {
    const newCode = BOILERPLATES[language] || "";
    setCode(newCode);
    codeRef.current = newCode;
    const sock = getSocket();
    if (sock?.connected) {
      sock.emit("codeChange", { roomId, code: newCode, language });
    }
    toast.success("Editor reset to default template");
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Define Pitch-Black VS Code Theme
    monaco.editor.defineTheme("octopair-pitch-black", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "52525b", fontStyle: "italic" },
        { token: "keyword", foreground: "ccff00", fontStyle: "bold" },
        { token: "identifier", foreground: "f0f0f0" },
        { token: "string", foreground: "a3e635" },
        { token: "number", foreground: "b266ff" },
        { token: "type", foreground: "38bdf8" },
        { token: "function", foreground: "60a5fa" },
      ],
      colors: {
        "editor.background": "#09090b",
        "editor.foreground": "#f0f0f0",
        "editor.lineHighlightBackground": "#ffffff05",
        "editorLineNumber.foreground": "#52525b",
        "editorLineNumber.activeForeground": "#ccff00",
        "editorCursor.foreground": "#ccff00",
        "editor.selectionBackground": "#ccff0022",
        "editor.inactiveSelectionBackground": "#ffffff0c",
        "editorIndentGuide.background1": "#ffffff0a",
        "editorIndentGuide.activeBackground1": "#ccff0040",
      },
    });
    monaco.editor.setTheme("octopair-pitch-black");

    // Track Cursor & Status Bar
    editor.onDidChangeCursorPosition((e) => {
      setCursorPos({ line: e.position.lineNumber, col: e.position.column });
      const sock = getSocket();
      if (sock?.connected) {
        sock.emit("cursorMove", {
          roomId,
          position: e.position,
          userName: user?.firstName || "Dev",
        });
      }
    });

    // Keyboard shortcut: Cmd+Enter or Ctrl+Enter to execute
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      executeCode();
    });
  };

  // Code Execution via Judge0
  const executeCode = async () => {
    const langConfig = JUDGE0_LANGUAGES[language];
    if (!langConfig) {
      const errorMsg = `Execution for ${language} is not currently supported.`;
      setOutput(errorMsg);
      return;
    }

    setIsExecuting(true);
    setExecMetrics(null);
    const startMsg = `> Compiling and running with ${langConfig.label}...\n`;
    setOutput(startMsg);

    const sock = getSocket();
    if (sock?.connected) {
      sock.emit("syncExecutionState", { roomId, isExecuting: true });
      sock.emit("syncOutput", { roomId, output: startMsg });
    }

    const startTime = performance.now();

    try {
      const res = await axios.post(
        "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
        {
          language_id: langConfig.id,
          source_code: code,
        }
      );

      const durationMs = Math.round(performance.now() - startTime);

      let finalOutput = "";
      if (res.data.stdout) finalOutput = res.data.stdout;
      else if (res.data.stderr) finalOutput = res.data.stderr;
      else if (res.data.compile_output) finalOutput = res.data.compile_output;
      else finalOutput = "Execution finished with no output.";

      const metrics = {
        time: res.data.time ? `${res.data.time}s` : `${durationMs}ms`,
        memory: res.data.memory ? `${res.data.memory} KB` : null,
        status: res.data.status?.description || "Completed",
        isError: Boolean(res.data.stderr || res.data.compile_output),
      };

      setOutput(finalOutput);
      setExecMetrics(metrics);

      if (sock?.connected) {
        sock.emit("syncOutput", { roomId, output: finalOutput, metrics });
      }
    } catch (err) {
      const errorMsg = `Error connecting to execution engine:\n${err.message}`;
      setOutput(errorMsg);
      if (sock?.connected) sock.emit("syncOutput", { roomId, output: errorMsg });
    } finally {
      setIsExecuting(false);
      if (sock?.connected) {
        sock.emit("syncExecutionState", { roomId, isExecuting: false });
      }
    }
  };

  const clearTerminal = () => {
    setOutput("");
    setExecMetrics(null);
    const sock = getSocket();
    if (sock?.connected) {
      sock.emit("syncOutput", { roomId, output: "" });
    }
  };

  const copyTerminalOutput = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    toast.success("Output copied to clipboard");
  };

  const copyRoomInvite = () => {
    const inviteUrl = window.location.href;
    navigator.clipboard.writeText(inviteUrl);
    toast.success("Room invite link copied to clipboard");
  };

  // Chat Functions
  const sendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const sock = getSocket();
    if (sock?.connected) {
      sock.emit("sandboxMessage", { roomId, message: chatInput.trim(), user });
      setChatInput("");
    }
  };

  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
    if (!isChatOpen) setUnreadCount(0);
  };

  // Upgrade to Pro Handler
  const upgradeToPro = async () => {
    try {
      const order = await axios.post(
        BASE_URL + "/payment/create",
        { membershipType: "gold" },
        { withCredentials: true }
      );
      const { amount, currency, orderId, keyId, notes } = order.data;
      const options = {
        key: keyId,
        amount,
        currency,
        name: "OctoPair Pro",
        description: "Unlock Collaborative Sandbox & IDE Workspaces",
        order_id: orderId,
        prefill: {
          name: `${notes.firstName} ${notes.lastName}`,
          email: notes.emailId,
          contact: "9999999999",
        },
        theme: { color: "#ccff00" },
        handler: () => {
          window.location.reload();
        },
      };
      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        toast.error("Payment SDK not loaded. Please try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not initiate upgrade. Please try again.");
    }
  };

  // Loading Screen
  if (isInitializing) {
    return (
      <div className="h-dvh w-full flex flex-col items-center justify-center bg-[#09090b] text-[#f0f0f0] gap-4">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-[#ccff00] border-t-transparent animate-spin" />
          <Code2 className="w-5 h-5 text-[#ccff00] absolute" />
        </div>
        <span className="text-xs font-mono text-[#52525b] tracking-wider uppercase">
          Initializing Sandbox Environment...
        </span>
      </div>
    );
  }

  // Premium Gate Screen
  if (!isPremium) {
    return (
      <div className="flex justify-center items-center h-dvh bg-[#09090b] relative overflow-hidden px-4">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ccff00]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#b266ff]/5 rounded-full blur-[100px] pointer-events-none" />

        <Motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-[#111113] border border-white/[0.07] rounded-2xl p-8 md:p-12 max-w-xl w-full text-center relative z-10 shadow-2xl"
        >
          <button
            onClick={() => navigate(-1)}
            className="absolute top-5 left-5 text-[#52525b] hover:text-[#f0f0f0] p-2 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-20 h-20 bg-[#ccff00]/10 border border-[#ccff00]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(204,255,0,0.12)] relative">
            <Code2 className="w-9 h-9 text-[#ccff00]" />
            <div className="absolute -top-2 -right-2 w-7 h-7 bg-[#09090b] rounded-full border border-white/[0.07] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-[#ccff00]" />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-[#f0f0f0] tracking-tight mb-3">
            Collaborative{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ccff00] to-[#b266ff]">
              Sandbox
            </span>
          </h1>

          <p className="text-[#52525b] text-sm md:text-base mb-8 max-w-md mx-auto leading-relaxed">
            Pair-program with real-time remote cursor sync, compile code across 8
            native languages in the cloud, and chat with partners.
          </p>

          <div className="grid grid-cols-1 gap-2.5 text-left max-w-md mx-auto mb-8 font-mono text-xs text-[#f0f0f0]">
            <div className="flex items-center gap-2.5 bg-[#1a1a1f] border border-white/[0.07] px-3.5 py-2.5 rounded-lg">
              <Check className="w-4 h-4 text-[#ccff00] shrink-0" />
              <span>Real-time dual-cursor collaboration</span>
            </div>
            <div className="flex items-center gap-2.5 bg-[#1a1a1f] border border-white/[0.07] px-3.5 py-2.5 rounded-lg">
              <Check className="w-4 h-4 text-[#ccff00] shrink-0" />
              <span>Cloud execution: JS, TS, Python, Java, C++, Rust, Go</span>
            </div>
            <div className="flex items-center gap-2.5 bg-[#1a1a1f] border border-white/[0.07] px-3.5 py-2.5 rounded-lg">
              <Check className="w-4 h-4 text-[#ccff00] shrink-0" />
              <span>Built-in synchronized team chat & terminal output</span>
            </div>
          </div>

          <button
            onClick={upgradeToPro}
            className="w-full max-w-sm mx-auto py-3.5 rounded-lg font-bold text-black bg-[#ccff00] hover:bg-[#d9ff33] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(204,255,0,0.25)] flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-black" /> Unlock Pro Access
          </button>
        </Motion.div>
      </div>
    );
  }

  // Main VS Code Pitch-Black IDE Workspace
  return (
    <div className="h-dvh w-full flex flex-col bg-[#09090b] text-[#f0f0f0] overflow-hidden select-none">
      {/* IDE Top Header Bar (Height 52px) */}
      <header className="h-[52px] border-b border-white/[0.07] bg-[#111113] flex items-center justify-between px-4 z-20 flex-shrink-0">
        {/* Left Side: Back, Logo, Room ID, Live Indicator */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-[#52525b] hover:text-[#f0f0f0] p-1.5 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer"
            title="Leave Sandbox"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 pr-3 border-r border-white/[0.07]">
            <Code2 className="w-4 h-4 text-[#ccff00]" />
            <span className="text-xs font-bold tracking-tight text-[#f0f0f0]">
              OctoPair
            </span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#b266ff]/10 text-[#b266ff] border border-[#b266ff]/20">
              PRO
            </span>
          </div>

          {/* Room Badge with Copy Button */}
          <div className="hidden sm:flex items-center gap-1.5 bg-[#09090b] border border-white/[0.07] px-2.5 py-1 rounded-md">
            <span className="text-[11px] font-mono text-[#52525b]">Room:</span>
            <span className="text-[11px] font-mono text-[#f0f0f0] font-medium max-w-[140px] truncate">
              {roomId}
            </span>
            <button
              onClick={copyRoomInvite}
              className="text-[#52525b] hover:text-[#ccff00] p-0.5 transition-colors cursor-pointer"
              title="Copy Room Link"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>

          {/* Connection Status Indicator */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono">
            <div
              className={`w-2 h-2 rounded-full ${
                socketConnected ? "bg-[#ccff00] animate-pulse" : "bg-red-500"
              }`}
            />
            <span className="text-[#52525b] hidden md:inline">
              {socketConnected ? "Live Sync" : "Reconnecting"}
            </span>
          </div>
        </div>

        {/* Center: Collaborators Stack */}
        <div className="flex items-center gap-2">
          {/* Current User */}
          <div className="relative group cursor-default">
            <img
              src={user?.photoUrl || DEFAULT_AVATAR}
              alt="You"
              className="w-7 h-7 rounded-full border-2 border-[#ccff00] object-cover"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-[#09090b]" />
            <div className="absolute top-9 left-1/2 -translate-x-1/2 bg-[#1a1a1f] border border-white/[0.07] text-[#f0f0f0] text-[10px] py-0.5 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 font-mono shadow-lg">
              You (Active)
            </div>
          </div>

          {/* Partner User */}
          {targetUser && (
            <div className="relative group cursor-default">
              <img
                src={targetUser.photoUrl || DEFAULT_AVATAR}
                alt={targetUser.firstName || "Partner"}
                className="w-7 h-7 rounded-full border-2 border-[#b266ff] object-cover"
              />
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#09090b] ${
                  isTargetUserInRoom ? "bg-green-500" : "bg-[#52525b]"
                }`}
              />
              <div className="absolute top-9 left-1/2 -translate-x-1/2 bg-[#1a1a1f] border border-white/[0.07] text-[#f0f0f0] text-[10px] py-0.5 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 font-mono shadow-lg">
                {targetUser.firstName || "Dev"}{" "}
                {isTargetUserInRoom ? "(Active)" : "(Offline)"}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Language Select, Reset, Run CTA, Chat Toggle */}
        <div className="flex items-center gap-2.5">
          {/* Language Selector */}
          <div className="relative">
            <select
              value={language}
              onChange={handleLanguageChange}
              className="bg-[#09090b] text-[#f0f0f0] border border-white/[0.07] rounded-lg px-2.5 py-1.5 text-xs font-mono outline-none focus:border-[#ccff00]/50 transition-colors cursor-pointer appearance-none pr-7"
            >
              {Object.entries(JUDGE0_LANGUAGES).map(([key, val]) => (
                <option key={key} value={key} className="bg-[#111113] text-[#f0f0f0]">
                  {val.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#52525b] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Reset Boilerplate */}
          <button
            onClick={resetBoilerplate}
            className="text-[#52525b] hover:text-[#f0f0f0] p-1.5 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer"
            title="Reset to Language Boilerplate"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Primary Run Action */}
          <button
            onClick={executeCode}
            disabled={isExecuting}
            className="flex items-center gap-1.5 bg-[#ccff00] text-black px-3.5 py-1.5 rounded-lg text-xs font-bold hover:bg-[#d9ff33] disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(204,255,0,0.25)] cursor-pointer"
            title="Run Code (Cmd+Enter)"
          >
            {isExecuting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-black" />
            )}
            <span>{isExecuting ? "Running..." : "Run"}</span>
            <span className="hidden md:inline text-[9px] bg-black/20 text-black px-1.5 py-0.5 rounded font-mono font-medium ml-1">
              Ctrl+Enter
            </span>
          </button>

          {/* Chat Toggle Button */}
          <button
            onClick={toggleChat}
            className={`relative p-2 rounded-lg transition-colors cursor-pointer ${
              isChatOpen
                ? "bg-[#b266ff]/20 text-[#b266ff] border border-[#b266ff]/30"
                : "text-[#52525b] hover:text-[#f0f0f0] hover:bg-white/[0.04]"
            }`}
            title="Toggle Team Chat"
          >
            <MessageSquare className="w-4 h-4" />
            {unreadCount > 0 && !isChatOpen && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 bg-[#b266ff] text-[#09090b] text-[10px] font-mono font-bold rounded-full px-1 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main IDE Split Layout */}
      <div className="flex-1 w-full flex overflow-hidden relative">
        {/* Code Editor and Terminal Column */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Monaco Code Editor */}
          <div className="flex-1 relative bg-[#09090b]">
            <Editor
              height="100%"
              language={language === "cpp" ? "cpp" : language}
              theme="vs-dark"
              value={code}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "JetBrains Mono, 'Fira Code', monospace",
                lineHeight: 22,
                wordWrap: "on",
                padding: { top: 16, bottom: 16 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                renderLineHighlight: "all",
                formatOnPaste: true,
                bracketPairColorization: { enabled: true },
              }}
            />
          </div>

          {/* Terminal Output Panel */}
          <div
            className={`transition-all duration-200 border-t border-white/[0.07] bg-[#09090b] flex flex-col flex-shrink-0 z-10 ${
              isTerminalExpanded ? "h-80" : "h-56"
            }`}
          >
            {/* Terminal Header */}
            <div className="h-9 px-4 bg-[#111113] border-b border-white/[0.07] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-mono text-[#f0f0f0]">
                  <Terminal className="w-3.5 h-3.5 text-[#ccff00]" />
                  <span className="font-semibold uppercase tracking-wider text-[11px]">
                    Terminal Output
                  </span>
                </div>

                {execMetrics && (
                  <div className="flex items-center gap-2 text-[10px] font-mono text-[#52525b]">
                    <span>|</span>
                    <span
                      className={
                        execMetrics.isError ? "text-red-400" : "text-[#ccff00]"
                      }
                    >
                      {execMetrics.status}
                    </span>
                    <span>({execMetrics.time})</span>
                    {execMetrics.memory && <span>[{execMetrics.memory}]</span>}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyTerminalOutput}
                  className="text-[#52525b] hover:text-[#f0f0f0] p-1 rounded transition-colors cursor-pointer"
                  title="Copy Output"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={clearTerminal}
                  className="text-[#52525b] hover:text-[#f0f0f0] p-1 rounded transition-colors cursor-pointer"
                  title="Clear Output"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsTerminalExpanded(!isTerminalExpanded)}
                  className="text-[#52525b] hover:text-[#f0f0f0] p-1 rounded transition-colors cursor-pointer"
                  title={isTerminalExpanded ? "Collapse" : "Expand"}
                >
                  {isTerminalExpanded ? (
                    <Minimize2 className="w-3.5 h-3.5" />
                  ) : (
                    <Maximize2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar font-mono text-xs select-text">
              <pre className="text-[#f0f0f0] whitespace-pre-wrap leading-relaxed">
                {output || (
                  <span className="text-[#52525b]">
                    {"> Ready for execution. Click 'Run' or press Ctrl+Enter to execute code."}
                  </span>
                )}
              </pre>
            </div>
          </div>
        </div>

        {/* Docked / Sliding Collaborative Chat Sidebar */}
        <AnimatePresence>
          {isChatOpen && (
            <Motion.aside
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
              className="w-80 h-full bg-[#111113] border-l border-white/[0.07] flex flex-col shadow-2xl z-30 flex-shrink-0"
            >
              {/* Chat Header */}
              <div className="h-12 px-4 border-b border-white/[0.07] flex items-center justify-between bg-[#111113]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#b266ff]/10 flex items-center justify-center">
                    <MessageSquare className="w-3.5 h-3.5 text-[#b266ff]" />
                  </div>
                  <span className="text-xs font-bold text-[#f0f0f0] tracking-tight">
                    Team Chat
                  </span>
                </div>
                <button
                  onClick={toggleChat}
                  className="text-[#52525b] hover:text-[#f0f0f0] p-1 rounded-md hover:bg-white/[0.04] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Messages Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-4">
                    <div className="w-10 h-10 bg-[#1a1a1f] border border-white/[0.07] rounded-xl flex items-center justify-center mb-3">
                      <MessageSquare className="w-5 h-5 text-[#b266ff]" />
                    </div>
                    <p className="text-xs text-[#52525b] leading-relaxed">
                      No messages yet. Chat in real-time with your pair partner.
                    </p>
                  </div>
                ) : (
                  chatMessages.map((msg, i) => {
                    const isMe = msg.user?._id === user?._id;
                    return (
                      <div
                        key={i}
                        className={`flex flex-col ${
                          isMe ? "items-end" : "items-start"
                        }`}
                      >
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-[10px] font-bold text-[#52525b]">
                            {isMe ? "You" : msg.user?.firstName || "Dev"}
                          </span>
                          <span className="text-[9px] font-mono text-[#52525b]/70">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p
                          className={`text-xs px-3.5 py-2 rounded-2xl max-w-[90%] leading-relaxed break-words select-text ${
                            isMe
                              ? "bg-[#ccff00]/10 border border-[#ccff00]/20 text-[#f0f0f0] rounded-tr-sm"
                              : "bg-[#1a1a1f] border border-white/[0.07] text-[#f0f0f0] rounded-tl-sm"
                          }`}
                        >
                          {msg.message}
                        </p>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Form */}
              <form
                onSubmit={sendChatMessage}
                className="p-3 border-t border-white/[0.07] bg-[#111113]"
              >
                <div className="flex items-center bg-[#09090b] border border-white/10 rounded-xl overflow-hidden focus-within:border-[#ccff00]/50 focus-within:ring-1 focus-within:ring-[#ccff00]/30 transition-all">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent px-3 py-2 text-xs text-[#f0f0f0] outline-none placeholder:text-[#52525b]"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="h-8 w-8 flex-shrink-0 flex items-center justify-center text-[#ccff00] hover:bg-[#ccff00]/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors mr-1 rounded-lg cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </Motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* IDE Status Bar (Height 24px) */}
      <footer className="h-6 bg-[#111113] border-t border-white/[0.07] px-3 flex items-center justify-between text-[11px] font-mono text-[#52525b] z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[#f0f0f0]">{roomId}</span>
          </div>
          <span>|</span>
          <div className="flex items-center gap-1">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                socketConnected ? "bg-[#ccff00]" : "bg-red-500"
              }`}
            />
            <span>{socketConnected ? "Synced" : "Offline"}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span>
            Ln {cursorPos.line}, Col {cursorPos.col}
          </span>
          <span>Spaces: 2</span>
          <span>UTF-8</span>
          <span className="text-[#f0f0f0] font-medium uppercase">
            {language}
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Sandbox;
