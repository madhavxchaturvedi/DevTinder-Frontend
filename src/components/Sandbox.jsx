import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FiArrowLeft, FiCode, FiZap, FiCheck, FiStar, FiPlay, FiTerminal, FiMessageSquare, FiSend, FiTrash2, FiX } from "react-icons/fi";
import Editor from "@monaco-editor/react";
import { getSocket } from "../utils/socket";
import { BASE_URL } from "../utils/constants";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const BOILERPLATES = {
  javascript: "// Welcome to DevTinder Pro Sandbox\n// Start typing to collaborate in real-time...\n\nfunction helloWorld() {\n  console.log('Hello from DevTinder Pro!');\n}\n\nhelloWorld();\n",
  python: "# Welcome to DevTinder Pro Sandbox\n# Start typing to collaborate in real-time...\n\ndef hello_world():\n    print('Hello from DevTinder Pro!')\n\nhello_world()\n",
  java: "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello from DevTinder Pro!\");\n    }\n}\n",
  cpp: "#include <iostream>\n\nint main() {\n    std::cout << \"Hello from DevTinder Pro!\" << std::endl;\n    return 0;\n}\n",
  typescript: "// Welcome to DevTinder Pro Sandbox\n\nconst helloWorld = (): void => {\n  console.log('Hello from DevTinder Pro!');\n}\n\nhelloWorld();\n",
};

const JUDGE0_LANGUAGES = {
  javascript: 102, // Node.js 22.08.0
  python: 100,     // Python 3.12.5
  java: 91,        // Java JDK 17
  cpp: 105,        // C++ GCC 14.1.0
  typescript: 101  // TypeScript 5.6.2
};

const Sandbox = () => {
  const { roomId } = useParams();
  const user = useSelector((store) => store.user);
  const navigate = useNavigate();
  
  const [socketConnected, setSocketConnected] = useState(false);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(BOILERPLATES["javascript"]);
  
  // Execution state
  const [output, setOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  
  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const chatEndRef = useRef(null);

  // Editor refs
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef(null);
  const remoteCursorsRef = useRef({}); // Store cursor data by userId

  const isPremium = user?.isPremium;

  useEffect(() => {
    if (!isPremium || !user || !roomId) return;

    const sock = getSocket(BASE_URL);

    sock.on("connect", () => {
      setSocketConnected(true);
      sock.emit("joinSandbox", { roomId });
    });

    sock.on("disconnect", () => {
      setSocketConnected(false);
    });

    sock.on("receiveCodeChange", ({ code: newCode, language: newLang }) => {
      setCode(newCode);
      if (newLang !== language) setLanguage(newLang);
    });

    sock.on("receiveCursorMove", ({ userId, userName, position }) => {
      remoteCursorsRef.current[userId] = { position, userName };
      updateRemoteCursors();
    });

    sock.on("receiveExecutionState", ({ isExecuting }) => {
      setIsExecuting(isExecuting);
    });

    sock.on("receiveOutput", ({ output: syncedOutput }) => {
      setOutput(syncedOutput);
    });

    sock.on("receiveSandboxMessage", (msg) => {
      setChatMessages((prev) => [...prev, msg]);
      if (!isChatOpen) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    if (sock.connected) {
      setSocketConnected(true);
      sock.emit("joinSandbox", { roomId });
    }

    return () => {
      sock.off("connect");
      sock.off("disconnect");
      sock.off("receiveCodeChange");
      sock.off("receiveCursorMove");
      sock.off("receiveExecutionState");
      sock.off("receiveOutput");
      sock.off("receiveSandboxMessage");
    };
  }, [user, roomId, isPremium, language, isChatOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatOpen]);

  const updateRemoteCursors = () => {
    if (!editorRef.current || !monacoRef.current) return;
    
    const newDecorations = [];
    Object.keys(remoteCursorsRef.current).forEach(userId => {
      const { position, userName } = remoteCursorsRef.current[userId];
      
      // Inject dynamic CSS class for this user to display their name tag
      const className = `remote-cursor-${userId}`;
      let styleEl = document.getElementById(`style-${className}`);
      
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = `style-${className}`;
        styleEl.innerHTML = `
          .${className} {
            border-left: 2px solid #a855f7;
            position: absolute;
            z-index: 99;
          }
          .${className}::after {
            content: '${userName}';
            position: absolute;
            top: -18px;
            left: 0;
            background: #a855f7;
            color: #fff;
            font-size: 10px;
            font-family: sans-serif;
            font-weight: bold;
            padding: 2px 6px;
            border-radius: 4px 4px 4px 0px;
            white-space: nowrap;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            pointer-events: none;
          }
        `;
        document.head.appendChild(styleEl);
      }

      newDecorations.push({
        range: new monacoRef.current.Range(position.lineNumber, position.column, position.lineNumber, position.column),
        options: {
          className: className,
          stickiness: monacoRef.current.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
        }
      });
    });

    if (decorationsRef.current) {
      decorationsRef.current.set(newDecorations);
    } else {
      decorationsRef.current = editorRef.current.createDecorationsCollection(newDecorations);
    }
  };

  const handleEditorChange = (value) => {
    setCode(value || "");
    const sock = getSocket();
    if (sock?.connected) {
      sock.emit("codeChange", { roomId, code: value || "", language });
    }
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    
    // Only overwrite with boilerplate if editor is empty or matches an existing boilerplate
    const isBoilerplate = Object.values(BOILERPLATES).includes(code) || code.trim() === "";
    if (isBoilerplate) {
      const newCode = BOILERPLATES[newLang] || "";
      setCode(newCode);
      const sock = getSocket();
      if (sock?.connected) {
        sock.emit("codeChange", { roomId, code: newCode, language: newLang });
      }
    }
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    editor.onDidChangeCursorPosition((e) => {
      const sock = getSocket();
      if (sock?.connected) {
        sock.emit("cursorMove", { roomId, position: e.position, userName: user?.firstName || "Dev" });
      }
    });
  };

  const executeCode = async () => {
    const languageId = JUDGE0_LANGUAGES[language];
    if (!languageId) {
      const errorMsg = `Execution for ${language} is not supported yet.`;
      setOutput(errorMsg);
      return;
    }

    setIsExecuting(true);
    const startMsg = `> Running code...\n`;
    setOutput(startMsg);
    
    const sock = getSocket();
    if (sock?.connected) {
      sock.emit("syncExecutionState", { roomId, isExecuting: true });
      sock.emit("syncOutput", { roomId, output: startMsg });
    }

    try {
      const res = await axios.post("https://ce.judge0.com/submissions?base64_encoded=false&wait=true", {
        language_id: languageId,
        source_code: code
      });

      let finalOutput = "";
      if (res.data.stdout) finalOutput = res.data.stdout;
      else if (res.data.stderr) finalOutput = res.data.stderr;
      else if (res.data.compile_output) finalOutput = res.data.compile_output;
      else finalOutput = "Execution finished with no output.";

      setOutput(finalOutput);
      if (sock?.connected) {
        sock.emit("syncOutput", { roomId, output: finalOutput });
      }
    } catch (err) {
      const errorMsg = `Error connecting to execution engine:\n${err.message}`;
      setOutput(errorMsg);
      if (sock?.connected) sock.emit("syncOutput", { roomId, output: errorMsg });
    } finally {
      setIsExecuting(false);
      if (sock?.connected) sock.emit("syncExecutionState", { roomId, isExecuting: false });
    }
  };

  const clearTerminal = () => {
    setOutput("");
    const sock = getSocket();
    if (sock?.connected) {
      sock.emit("syncOutput", { roomId, output: "" });
    }
  };

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
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) setUnreadCount(0);
  };

  const upgradeToPro = async () => {
    try {
      const order = await axios.post(BASE_URL + "/payment/create", { membershipType: "gold" }, { withCredentials: true });
      const { amount, currency, orderId, keyId, notes } = order.data;
      const options = {
        key: keyId, amount, currency, name: "DevTinder Pro", description: "Upgrade to Premium",
        order_id: orderId,
        prefill: { name: notes.firstName + " " + notes.lastName, email: notes.emailId, contact: "9999999999" },
        theme: { color: "#ccff00" },
        handler: () => { window.location.reload(); },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isPremium) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0a0a0a] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ccff00]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#a855f7]/10 rounded-full blur-[80px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="bg-[#121212]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-12 max-w-2xl w-full text-center relative z-10 shadow-2xl overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#ccff00] to-transparent opacity-50" />
          <button onClick={() => navigate(-1)} className="absolute top-6 left-6 text-[#a3a3a3] hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors">
            <FiArrowLeft size={24} />
          </button>
          
          <div className="w-24 h-24 bg-[#ccff00]/10 border border-[#ccff00]/30 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(204,255,0,0.15)] relative group">
            <div className="absolute inset-0 bg-[#ccff00] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full" />
            <FiCode className="text-4xl text-[#ccff00] relative z-10" />
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#0a0a0a] rounded-full border border-white/10 flex items-center justify-center">
              <FiStar className="text-[#ccff00] fill-[#ccff00] text-sm" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Live Collaborative <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ccff00] to-[#a855f7]">Sandbox</span>
          </h1>
          
          <p className="text-[#a3a3a3] text-lg mb-10 max-w-lg mx-auto leading-relaxed">
            Code together in real-time. Pair program, conduct technical interviews, or build the next big thing instantly with your connections.
          </p>

          <button onClick={upgradeToPro} className="w-full max-w-sm mx-auto py-4 rounded-xl font-black text-[#0a0a0a] bg-[#ccff00] hover:bg-[#bbf000] hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(204,255,0,0.3)] flex items-center justify-center gap-2 text-lg">
            <FiZap className="text-xl" /> Unlock Pro Access
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-[#0a0a0a] overflow-hidden relative">
      {/* ── Sandbox Header ────────────────────────────────────────── */}
      <div className="h-14 border-b border-white/5 bg-[#121212] flex items-center justify-between px-4 z-20 flex-shrink-0 shadow-sm relative">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-[#a3a3a3] hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors">
            <FiArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <FiCode className="text-[#ccff00] text-xl" />
            <span className="text-white font-bold tracking-tight">Pro Sandbox</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-1.5 hidden sm:flex">
            <div className={`w-2 h-2 rounded-full ${socketConnected ? "bg-[#ccff00]" : "bg-red-500 animate-pulse"}`} />
            <span className="text-xs font-mono text-[#a3a3a3]">
              {socketConnected ? "Connected" : "Connecting..."}
            </span>
          </div>

          <select 
            value={language}
            onChange={handleLanguageChange}
            className="bg-[#0a0a0a] text-[#e5e5e5] border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono outline-none focus:border-[#ccff00]/50"
          >
            {Object.keys(JUDGE0_LANGUAGES).map(lang => (
              <option key={lang} value={lang}>{lang.toUpperCase()}</option>
            ))}
          </select>
          
          <button 
            onClick={executeCode}
            disabled={isExecuting}
            className="flex items-center gap-2 bg-[#ccff00] text-[#0a0a0a] px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-[#bbf000] disabled:opacity-50 transition-colors shadow-[0_0_15px_rgba(204,255,0,0.2)]"
          >
            <FiPlay size={14} className={isExecuting ? "animate-pulse" : ""} /> {isExecuting ? "Running..." : "Run"}
          </button>

          <button 
            onClick={toggleChat}
            className={`relative p-2 rounded-lg transition-colors ${isChatOpen ? 'bg-[#a855f7]/20 text-[#a855f7]' : 'text-[#a3a3a3] hover:text-white hover:bg-white/5'}`}
          >
            <FiMessageSquare size={18} />
            {unreadCount > 0 && !isChatOpen && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#121212]" />
            )}
          </button>
        </div>
      </div>

      {/* ── Main Workspace ──────────────────────────────────────── */}
      <div className="flex-1 w-full flex overflow-hidden relative">
        
        {/* Editor & Terminal Column (100% width, under chat if open) */}
        <div className="flex flex-col w-full">
          {/* Editor */}
          <div className="flex-1 relative border-b border-white/5">
            <Editor
              height="100%"
              language={language === "cpp" ? "cpp" : language}
              theme="vs-dark"
              value={code}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "JetBrains Mono, 'Fira Code', monospace",
                wordWrap: "on",
                padding: { top: 20, bottom: 20 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
              }}
            />
          </div>
          
          {/* Terminal */}
          <div className="h-64 bg-[#000000] flex flex-col flex-shrink-0 z-10">
            <div className="flex items-center justify-between px-4 py-2 bg-[#121212] border-b border-t border-white/5">
              <div className="flex items-center">
                <FiTerminal className="text-[#a3a3a3] mr-2" size={14} />
                <span className="text-xs font-mono text-[#a3a3a3]">Terminal Output</span>
              </div>
              <button onClick={clearTerminal} className="text-[#a3a3a3] hover:text-white transition-colors" title="Clear Terminal">
                <FiTrash2 size={14} />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <pre className="text-xs font-mono text-[#e5e5e5] whitespace-pre-wrap leading-relaxed">
                {output || "> Ready for execution..."}
              </pre>
            </div>
          </div>
        </div>

        {/* ── Meet-style Chat Overlay ────────────────────────────── */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-4 right-4 bottom-4 w-80 bg-[#121212]/95 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col shadow-2xl z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-black/20">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#a855f7]/20 flex items-center justify-center">
                    <FiMessageSquare className="text-[#a855f7]" size={12} />
                  </div>
                  <span className="text-sm font-bold text-white tracking-wide">Team Chat</span>
                </div>
                <button onClick={toggleChat} className="text-[#a3a3a3] hover:text-white p-1 rounded-md hover:bg-white/10 transition">
                  <FiX size={16} />
                </button>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-hide">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-4">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
                      <span className="text-xl">👋</span>
                    </div>
                    <p className="text-xs font-medium text-[#a3a3a3]">No messages yet. Say hello to your partner!</p>
                  </div>
                ) : (
                  chatMessages.map((msg, i) => {
                    const isMe = msg.user?._id === user?._id;
                    return (
                      <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-[11px] font-bold text-[#a3a3a3]">
                            {isMe ? "You" : msg.user?.firstName || "User"}
                          </span>
                          <span className="text-[9px] font-mono text-[#a3a3a3]/60">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className={`text-[13px] px-3 py-2 rounded-2xl max-w-[90%] leading-relaxed shadow-sm ${
                          isMe 
                            ? "bg-[#a855f7] text-white rounded-tr-sm" 
                            : "bg-[#1a1a1a] text-[#e5e5e5] border border-white/5 rounded-tl-sm"
                        }`}>
                          {msg.message}
                        </p>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={sendChatMessage} className="p-3 border-t border-white/5 bg-black/20">
                <div className="flex items-end bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden focus-within:border-[#a855f7]/50 focus-within:ring-1 focus-within:ring-[#a855f7]/50 transition-all shadow-inner">
                  <textarea
                    rows={1}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendChatMessage(e);
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent px-3 py-2.5 text-[13px] text-white outline-none placeholder:text-[#a3a3a3] resize-none max-h-24 min-h-[40px]"
                  />
                  <button 
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="h-10 w-10 flex-shrink-0 flex items-center justify-center text-[#a855f7] hover:bg-[#a855f7]/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors m-0.5 rounded-lg"
                  >
                    <FiSend size={14} className="ml-0.5" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Sandbox;
