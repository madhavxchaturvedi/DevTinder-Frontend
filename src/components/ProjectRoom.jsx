import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { addUser } from "../redux/userSlice";
import {
  FiFolder, FiSearch, FiSettings, FiPlay, FiSquare, FiGlobe,
  FiChevronUp, FiChevronDown, FiFile, FiRefreshCw, FiExternalLink,
  FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneOff, FiMonitor, FiSmile,
  FiArrowLeft, FiCode, FiSave, FiInfo, FiCheckSquare, FiMessageCircle,
  FiLogOut, FiTerminal, FiX, FiCheck, FiClock, FiWifi, FiWifiOff,
  FiChevronRight, FiCopy, FiDownload, FiZap, FiLayers
} from "react-icons/fi";
import { getSocket } from "../utils/socket";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import { useWebRTCContext } from "../context/WebRTCContext";
import TaskList from "./TaskList";
import TeamChat from "./TeamChat";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
  SandpackConsole,
  useSandpack
} from "@codesandbox/sandpack-react";

// ─── Splitter Hooks ─────────────────────────────────────────────
const useHorizontalSplitter = (initialWidth, minWidth = 150, maxWidth = 600) => {
  const [width, setWidth] = useState(initialWidth);
  const startDrag = useCallback((e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = width;
    const onMove = (ev) => setWidth(Math.max(minWidth, Math.min(maxWidth, startW + (ev.clientX - startX))));
    const onUp = () => {
      document.body.style.cursor = "default";
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.body.style.cursor = "col-resize";
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [width, minWidth, maxWidth]);
  return [width, startDrag, setWidth];
};

const useRightSplitter = (initialWidth, leftWidthRef) => {
  const [width, setWidth] = useState(initialWidth);
  const startDrag = useCallback((e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = width;
    const onMove = (ev) => {
      const delta = startX - ev.clientX;
      const lw = leftWidthRef?.current || 260;
      const maxW = window.innerWidth - lw - 150;
      setWidth(Math.max(280, Math.min(maxW, startW + delta)));
    };
    const onUp = () => {
      document.body.style.cursor = "default";
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.body.style.cursor = "col-resize";
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [width, leftWidthRef]);
  return [width, startDrag];
};

// ─── Session Timer Hook ─────────────────────────────────────────
const useSessionTimer = () => {
  const [elapsed, setElapsed] = useState(0);
  const startTime = useRef(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startTime.current) / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  const formatted = h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`;
  return formatted;
};

// ─── Default Files per Template ─────────────────────────────────
const DEFAULT_FILES = {
  react: {
    "/App.js": {
      code: `export default function App() {
  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", background: "#0d0d0e", minHeight: "100vh", color: "#e1e1e3" }}>
      <h1 style={{ color: "#a855f7", marginBottom: "0.5rem" }}>Hello, CodeSphere! 🚀</h1>
      <p style={{ color: "#a3a3a3" }}>Your collaborative environment is ready. Start coding!</p>
    </div>
  );
}`,
      active: true,
    },
  },
  vue: {
    "/src/App.vue": {
      code: `<template>
  <div class="app">
    <h1>Hello, CodeSphere! 🚀</h1>
    <p>Your collaborative Vue environment is ready.</p>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style scoped>
.app {
  padding: 2rem;
  font-family: sans-serif;
  background: #0d0d0e;
  min-height: 100vh;
  color: #e1e1e3;
}
h1 { color: #a855f7; }
p { color: #a3a3a3; }
</style>`,
      active: true,
    },
  },
  angular: {
    "/src/app/app.component.ts": {
      code: `import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  template: \`
    <div style="padding: 2rem; font-family: sans-serif; background: #0d0d0e; min-height: 100vh; color: #e1e1e3;">
      <h1 style="color: #a855f7;">Hello, CodeSphere! 🚀</h1>
      <p style="color: #a3a3a3;">Your collaborative Angular environment is ready.</p>
    </div>
  \`,
})
export class AppComponent {}`,
      active: true,
    },
  },
};

// ─── Sandpack Syncer (Fixed) ────────────────────────────────────
const SandpackSyncer = ({ roomId, onSaveStatusChange }) => {
  const { sandpack } = useSandpack();
  const isRemoteUpdateRef = useRef(new Set());
  const prevFileKeysRef = useRef("");
  const emitTimerRef = useRef(null);

  // Receive code changes from partner
  useEffect(() => {
    const sock = getSocket();
    if (!sock) return;

    const handleReceiveFiles = ({ files }) => {
      if (!files) return;
      Object.keys(files).forEach((path) => {
        if (sandpack.files[path]?.code !== files[path].code) {
          isRemoteUpdateRef.current.add(path);
          sandpack.updateFile(path, files[path].code);
        }
      });
    };

    const handleFileCreated = ({ path, code }) => {
      if (path && !sandpack.files[path]) {
        isRemoteUpdateRef.current.add(path);
        sandpack.addFile({ [path]: { code: code || "" } });
      }
    };

    const handleFileDeleted = ({ path }) => {
      if (path && sandpack.files[path]) {
        isRemoteUpdateRef.current.add(path);
        try { sandpack.deleteFile(path); } catch (e) { /* active file */ }
      }
    };

    sock.on("codeChange", handleReceiveFiles);
    sock.on("file:created", handleFileCreated);
    sock.on("file:deleted", handleFileDeleted);

    return () => {
      sock.off("codeChange", handleReceiveFiles);
      sock.off("file:created", handleFileCreated);
      sock.off("file:deleted", handleFileDeleted);
    };
  }, [sandpack.files]);

  // Emit code changes to partner (debounced 150ms)
  useEffect(() => {
    const sock = getSocket();
    if (!sock?.connected) return;

    const activeFile = sandpack.activeFile;
    if (!activeFile || !sandpack.files[activeFile]) return;

    if (isRemoteUpdateRef.current.has(activeFile)) {
      isRemoteUpdateRef.current.delete(activeFile);
      return;
    }

    const code = sandpack.files[activeFile].code;

    if (emitTimerRef.current) clearTimeout(emitTimerRef.current);
    emitTimerRef.current = setTimeout(() => {
      sock.emit("codeChange", { roomId, files: { [activeFile]: { code } } });
      localStorage.setItem(`sandpack_code_${roomId}`, code);
    }, 150);

    if (onSaveStatusChange) onSaveStatusChange("unsaved");
  }, [sandpack.files, sandpack.activeFile, roomId]);

  // Detect file creates/deletes by diffing keys
  useEffect(() => {
    const sock = getSocket();
    if (!sock?.connected) return;

    const currentKeys = Object.keys(sandpack.files).sort().join(",");
    const prevKeys = prevFileKeysRef.current;

    if (prevKeys && prevKeys !== currentKeys) {
      const currentSet = new Set(Object.keys(sandpack.files));
      const prevSet = new Set(prevKeys.split(",").filter(Boolean));

      currentSet.forEach((path) => {
        if (!prevSet.has(path) && !isRemoteUpdateRef.current.has(path)) {
          sock.emit("file:created", { roomId, path, code: sandpack.files[path]?.code || "" });
        }
      });

      prevSet.forEach((path) => {
        if (!currentSet.has(path) && !isRemoteUpdateRef.current.has(path)) {
          sock.emit("file:deleted", { roomId, path });
        }
      });
    }

    prevFileKeysRef.current = currentKeys;
    isRemoteUpdateRef.current.clear();
  }, [Object.keys(sandpack.files).sort().join(","), roomId]);

  // Auto-save ALL files every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const sock = getSocket();
      if (!sock?.connected) return;

      const allFiles = {};
      Object.keys(sandpack.files).forEach((path) => {
        allFiles[path] = { code: sandpack.files[path].code };
      });

      sock.emit("saveProjectFiles", { roomId, files: allFiles });
      if (onSaveStatusChange) onSaveStatusChange("saved");
    }, 15000);
    return () => clearInterval(interval);
  }, [sandpack.files, roomId]);

  return null;
};

// ─── Manual Save Handler (Ctrl+S) ──────────────────────────────
const ManualSaveHandler = ({ roomId, onSaveStatusChange }) => {
  const { sandpack } = useSandpack();

  const doSave = useCallback(() => {
    const sock = getSocket();
    if (!sock?.connected) return;
    if (onSaveStatusChange) onSaveStatusChange("saving");

    const allFiles = {};
    Object.keys(sandpack.files).forEach((path) => {
      allFiles[path] = { code: sandpack.files[path].code };
    });

    sock.emit("saveProjectFiles", { roomId, files: allFiles });
    setTimeout(() => {
      if (onSaveStatusChange) onSaveStatusChange("saved");
    }, 500);
  }, [sandpack.files, roomId, onSaveStatusChange]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        doSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [doSave]);

  return null;
};

// ─── Custom File Creator ────────────────────────────────────────
const CustomFileCreator = () => {
  const { sandpack } = useSandpack();
  const [isCreating, setIsCreating] = useState(false);
  const [createType, setCreateType] = useState("file"); // 'file' | 'folder'
  const [filename, setFilename] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!filename.trim()) {
      setIsCreating(false);
      return;
    }
    
    let path = filename.startsWith("/") ? filename : `/${filename}`;
    
    if (createType === "folder") {
      // Sandpack relies on files to create folders, so we add a hidden .keep file
      path = `${path}/.keep`;
    }

    try {
      if (!sandpack.files[path]) {
        sandpack.addFile(path, "");
      }
      if (createType === "file") {
        sandpack.setActiveFile(path);
      }
    } catch (err) {
      console.error(err);
    }
    setFilename("");
    setIsCreating(false);
  };

  return (
    <div className="px-3 pb-2 pt-1 border-b border-white/[0.04] mb-1 flex flex-col gap-2 shrink-0">
      <div className="flex items-center justify-between group">
        <span className="text-[10px] font-bold text-[#525252] uppercase tracking-[0.1em] group-hover:text-[#737373] transition-colors">
          Files
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => { setCreateType("file"); setIsCreating(true); }}
            className="p-1 rounded hover:bg-white/10 text-[#737373] hover:text-[#e1e1e3] transition-colors relative"
            title="New File"
          >
            <FiFile size={12} />
            <span className="absolute top-0 right-0 text-[10px] font-bold leading-none bg-[#141415] rounded-full">+</span>
          </button>
          <button
            onClick={() => { setCreateType("folder"); setIsCreating(true); }}
            className="p-1 rounded hover:bg-white/10 text-[#737373] hover:text-[#e1e1e3] transition-colors relative"
            title="New Folder"
          >
            <FiFolder size={12} />
            <span className="absolute top-0 right-0 text-[10px] font-bold leading-none bg-[#141415] rounded-full">+</span>
          </button>
        </div>
      </div>
      
      {isCreating && (
        <form onSubmit={handleSubmit} className="flex items-center gap-1 mt-1">
          <div className="relative flex-1">
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder={createType === "file" ? "e.g. index.js" : "e.g. components"}
              className="w-full bg-[#0d0d0e] border border-[#a855f7]/50 rounded-md text-[11px] text-[#e1e1e3] pl-2 pr-2 py-1.5 outline-none focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7]/30 transition-all shadow-inner"
              autoFocus
              onBlur={() => {
                if (!filename.trim()) setIsCreating(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsCreating(false);
                  setFilename("");
                }
              }}
            />
          </div>
          <button type="submit" className="hidden" />
        </form>
      )}
    </div>
  );
};

// ─── Search Panel (Functional) ──────────────────────────────────
const SearchPanel = () => {
  const { sandpack } = useSandpack();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const q = query.toLowerCase();
    const found = [];
    Object.keys(sandpack.files).forEach((path) => {
      const code = sandpack.files[path]?.code || "";
      const lines = code.split("\n");
      lines.forEach((line, idx) => {
        if (line.toLowerCase().includes(q)) {
          found.push({ path, line: idx + 1, content: line.trim() });
        }
      });
    });
    setResults(found.slice(0, 50));
  }, [query, sandpack.files]);

  const fileGroups = useMemo(() => {
    const groups = {};
    results.forEach((r) => {
      if (!groups[r.path]) groups[r.path] = [];
      groups[r.path].push(r);
    });
    return groups;
  }, [results]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-4 py-3">
        <div className="bg-[#0d0d0e] border border-white/10 rounded-lg flex items-center px-3 py-2.5 focus-within:border-[#a855f7] focus-within:ring-1 focus-within:ring-[#a855f7]/30 transition-all">
          <FiSearch className="text-[#737373] mr-2.5 shrink-0" size={14} />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search across all files..." className="bg-transparent text-[#e1e1e3] text-xs outline-none w-full placeholder-[#525252]" autoFocus />
          {query && (
            <button onClick={() => setQuery("")} className="text-[#525252] hover:text-[#e1e1e3] ml-1 shrink-0"><FiX size={12} /></button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 custom-scrollbar">
        {query && results.length === 0 && (
          <div className="text-center py-8"><p className="text-[#525252] text-xs">No results for "{query}"</p></div>
        )}
        {!query && (
          <div className="text-center py-12 opacity-50">
            <FiSearch size={28} className="text-[#525252] mx-auto mb-3" />
            <p className="text-[#525252] text-[11px]">Type to search across<br />all project files</p>
          </div>
        )}
        {query && results.length > 0 && (
          <div className="mb-2">
            <span className="text-[9px] text-[#525252] uppercase tracking-widest font-bold px-2">
              {results.length} result{results.length !== 1 ? "s" : ""} in {Object.keys(fileGroups).length} file{Object.keys(fileGroups).length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
        {Object.entries(fileGroups).map(([path, matches]) => (
          <div key={path} className="mb-3">
            <div className="flex items-center gap-2 px-2 py-1.5 text-[11px] text-[#a3a3a3] font-semibold">
              <FiFile size={11} className="text-[#a855f7]" />
              <span className="truncate">{path.split("/").pop()}</span>
              <span className="text-[#525252] text-[9px] ml-auto">{path}</span>
            </div>
            {matches.map((m, i) => (
              <button key={i} onClick={() => { try { sandpack.setActiveFile(m.path); } catch (e) {} }} className="w-full text-left px-3 py-1.5 hover:bg-white/5 rounded-md transition-colors group">
                <span className="text-[10px] text-[#525252] font-mono mr-2">L{m.line}</span>
                <span className="text-[11px] text-[#a3a3a3] font-mono group-hover:text-white transition-colors">
                  {m.content.length > 60 ? m.content.slice(0, 60) + "…" : m.content}
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Settings Panel ─────────────────────────────────────────────
const SettingsPanel = ({ post, techStack, template, onTemplateChange, sessionTime }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 custom-scrollbar">
      {/* Template */}
      <div>
        <span className="text-[9px] font-bold text-[#525252] uppercase tracking-[0.15em] flex items-center gap-1.5 mb-2.5">
          <FiLayers size={10} /> Template
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {["react", "vue", "angular"].map((t) => (
            <button key={t} onClick={() => onTemplateChange(t)} className={`px-2.5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${template === t ? "bg-[#a855f7]/15 border-[#a855f7]/40 text-[#a855f7]" : "bg-[#0d0d0e] border-white/5 text-[#525252] hover:text-[#a3a3a3] hover:border-white/10"}`}>
              {t === "react" ? "⚛️" : t === "vue" ? "💚" : "🅰️"} {t}
            </button>
          ))}
        </div>
        <p className="text-[9px] text-[#3a3a3a] mt-1.5 italic">Changing template resets all files</p>
      </div>

      {/* Project Details */}
      <div>
        <span className="text-[9px] font-bold text-[#525252] uppercase tracking-[0.15em] flex items-center gap-1.5 mb-2.5">
          <FiInfo size={10} /> Project Details
        </span>
        <p className="text-[#737373] text-[11px] leading-relaxed bg-[#0d0d0e] rounded-lg p-3 border border-white/5">
          {post?.content || "No project description provided."}
        </p>
      </div>

      {post?.project?.roleNeeded && (
        <div>
          <span className="text-[9px] font-bold text-[#525252] uppercase tracking-[0.15em] block mb-2">Seeking Role</span>
          <span className="inline-block px-2.5 py-1.5 bg-[#ccff00]/10 border border-[#ccff00]/15 text-[#ccff00] text-[10px] font-mono rounded-md">{post.project.roleNeeded}</span>
        </div>
      )}

      {techStack.length > 0 && (
        <div>
          <span className="text-[9px] font-bold text-[#525252] uppercase tracking-[0.15em] block mb-2">Tech Stack</span>
          <div className="flex flex-wrap gap-1.5">
            {techStack.map((tech, idx) => (
              <span key={idx} className="px-2 py-1 bg-[#0d0d0e] border border-white/5 text-[#737373] text-[10px] rounded-md">{tech}</span>
            ))}
          </div>
        </div>
      )}

      <div>
        <span className="text-[9px] font-bold text-[#525252] uppercase tracking-[0.15em] flex items-center gap-1.5 mb-2"><FiClock size={10} /> Session</span>
        <div className="bg-[#0d0d0e] rounded-lg p-3 border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-[#525252] text-[10px]">Duration</span>
            <span className="text-[#a3a3a3] text-[11px] font-mono">{sessionTime}</span>
          </div>
        </div>
      </div>

      <div>
        <span className="text-[9px] font-bold text-[#525252] uppercase tracking-[0.15em] flex items-center gap-1.5 mb-2.5"><FiZap size={10} /> Shortcuts</span>
        <div className="space-y-1.5">
          {[["⌘/Ctrl + S", "Save project"], ["⌘/Ctrl + B", "Toggle sidebar"]].map(([keys, desc]) => (
            <div key={keys} className="flex items-center justify-between py-1.5 px-2 bg-[#0d0d0e] rounded-md border border-white/5">
              <span className="text-[10px] text-[#525252]">{desc}</span>
              <kbd className="text-[9px] text-[#a855f7] bg-[#a855f7]/8 px-1.5 py-0.5 rounded font-mono">{keys}</kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Custom Preview Controls ────────────────────────────────────
const PreviewControls = ({ roomId }) => {
  const { sandpack } = useSandpack();
  return (
    <div className="absolute top-2 right-2 z-50 flex items-center gap-1.5">
      <button
        onClick={() => {
          try {
            const files = { ...sandpack.files };
            sandpack.resetAllFiles();
            Object.keys(files).forEach((p) => sandpack.updateFile(p, files[p].code));
          } catch (e) { /* fallback */ }
        }}
        className="p-1.5 bg-[#1a1a1c]/90 hover:bg-[#ccff00] text-[#737373] hover:text-[#141415] rounded-md transition-all backdrop-blur-sm"
        title="Refresh Preview"
      >
        <FiRefreshCw size={12} />
      </button>
      <button
        onClick={() => {
          const allFiles = {};
          Object.keys(sandpack.files).forEach((p) => { allFiles[p] = { code: sandpack.files[p].code }; });
          localStorage.setItem(`sandpack_files_${roomId}`, JSON.stringify(allFiles));
          const activeFile = sandpack.activeFile;
          if (activeFile) localStorage.setItem(`sandpack_code_${roomId}`, sandpack.files[activeFile]?.code || "");
          window.open(`/project/preview/${roomId}`, "_blank");
        }}
        className="p-1.5 bg-[#1a1a1c]/90 hover:bg-[#a855f7] text-[#737373] hover:text-white rounded-md transition-all backdrop-blur-sm"
        title="Open in New Tab"
      >
        <FiExternalLink size={12} />
      </button>
    </div>
  );
};

// ─── Header Action Buttons ──────────────────────────────────────
const HeaderButtons = ({ openTabs, setOpenTabs, activeTab, setActiveTab }) => {
  const isRunning = openTabs.includes("preview");
  const isConsole = openTabs.includes("console");
  const isTasks = openTabs.includes("tasks");
  const isChat = openTabs.includes("chat");

  const toggleTab = (tabId) => {
    if (openTabs.includes(tabId)) {
      const newTabs = openTabs.filter((t) => t !== tabId);
      setOpenTabs(newTabs);
      if (activeTab === tabId) setActiveTab(newTabs.length > 0 ? newTabs[newTabs.length - 1] : null);
    } else {
      setOpenTabs([...openTabs, tabId]);
      setActiveTab(tabId);
    }
  };

  const btnCls = (active) => `flex items-center gap-1.5 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] rounded-md transition-all whitespace-nowrap border ${active ? "bg-white/10 text-white border-white/10 shadow-inner" : "bg-transparent hover:bg-white/5 text-[#525252] hover:text-[#a3a3a3] border-transparent"}`;

  return (
    <div className="flex items-center gap-1">
      <button onClick={() => toggleTab("tasks")} className={btnCls(isTasks)}><FiCheckSquare size={11} /> <span className="hidden xl:inline">Tasks</span></button>
      <button onClick={() => toggleTab("chat")} className={btnCls(isChat)}><FiMessageCircle size={11} /> <span className="hidden xl:inline">Chat</span></button>
      <button onClick={() => toggleTab("preview")} className={`flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] rounded-md transition-all whitespace-nowrap shadow-md ${isRunning ? "bg-red-500/90 hover:bg-red-500 text-white" : "bg-[#ccff00] hover:bg-[#d4ff33] text-[#0d0d0e]"}`}>
        {isRunning ? <FiSquare size={10} /> : <FiPlay size={10} />}
        <span className="hidden xl:inline">{isRunning ? "Stop" : "Run"}</span>
      </button>
      <button onClick={() => toggleTab("console")} className={btnCls(isConsole)}><FiTerminal size={11} /> <span className="hidden xl:inline">Console</span></button>
    </div>
  );
};


// ═════════════════════════════════════════════════════════════════
// ═══ MAIN COMPONENT ═════════════════════════════════════════════
// ═════════════════════════════════════════════════════════════════
const ProjectRoom = () => {
  const { roomId } = useParams();
  const user = useSelector((store) => store.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Core State
  const [isInitializing, setIsInitializing] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [roomData, setRoomData] = useState(null);
  const [initialFiles, setInitialFiles] = useState({});
  const [template, setTemplate] = useState("react");

  // UI State
  const [openTabs, setOpenTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState("explorer");
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isVideoExpanded, setIsVideoExpanded] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [saveStatus, setSaveStatus] = useState("saved");
  const [liveTasks, setLiveTasks] = useState([]);

  // Resizable Panels
  const leftWidthRef = useRef(260);
  const [leftWidth, startLeftDrag] = useHorizontalSplitter(260, 180, 500);
  useEffect(() => { leftWidthRef.current = leftWidth; }, [leftWidth]);
  const [rightWidth, startRightDrag] = useRightSplitter(380, leftWidthRef);

  // Session Timer
  const sessionTime = useSessionTimer();

  // Partner / Presence
  const targetId = user && roomData ? roomData.members.find((m) => String(m._id) !== String(user._id))?._id : null;
  const [isTargetUserInRoom, setIsTargetUserInRoom] = useState(false);

  // WebRTC
  const {
    localStream, remoteStream, isInCall, currentRoomId,
    joinCall, leaveCall, toggleMute, handleToggleVideo,
    isMuted, isVideoOff, isRemoteMuted, isRemoteVideoOff,
    isSpeaking, isRemoteSpeaking,
    localReactions, remoteReactions, sendReaction,
  } = useWebRTCContext();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const hasJoinedCallRef = useRef(false);
  const EMOJIS = ["👍", "🔥", "🚀", "💡", "😂"];

  // Keyboard: Ctrl+B toggle sidebar
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        setIsSidebarVisible((p) => !p);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // WebRTC auto-join & video binding
  useEffect(() => {
    if (socketConnected && !hasJoinedCallRef.current && !isInCall) {
      hasJoinedCallRef.current = true;
      const targetUser = roomData?.members?.find((m) => String(m._id) === String(targetId));
      joinCall(roomId, targetUser);
    }
  }, [socketConnected, isInCall, roomData, targetId, roomId, joinCall]);

  useEffect(() => {
    if (localStream && localVideoRef.current && !isVideoOff) localVideoRef.current.srcObject = localStream;
  }, [localStream, isInCall, isVideoOff]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current && !isRemoteVideoOff) remoteVideoRef.current.srcObject = remoteStream;
  }, [remoteStream, isInCall, isRemoteVideoOff]);

  // Fetch user & room data
  useEffect(() => {
    const fetchUserAndRoom = async () => {
      try {
        let currentUser = user;
        if (!currentUser) {
          const res = await axios.get(BASE_URL + "/profile/view", { withCredentials: true });
          dispatch(addUser(res.data));
          currentUser = res.data;
        }

        const roomRes = await axios.get(BASE_URL + "/project/room/" + roomId, { withCredentials: true });
        const data = roomRes.data.data;
        setRoomData(data);

        if (data.template) setTemplate(data.template);

        // Load files: prefer data.files (Mixed object), fall back to lastCode
        if (data.files && typeof data.files === "object" && Object.keys(data.files).length > 0) {
          setInitialFiles(data.files);
        } else if (data.lastCode) {
          try {
            const parsed = JSON.parse(data.lastCode);
            if (typeof parsed === "object" && !parsed.code) {
              setInitialFiles(parsed);
            } else {
              setInitialFiles({ "/App.js": { code: data.lastCode, active: true } });
            }
          } catch (e) {
            setInitialFiles({ "/App.js": { code: data.lastCode, active: true } });
          }
        }

        if (data.tasks) setLiveTasks(data.tasks);
      } catch (err) {
        console.error(err);
        if (err?.response?.status === 401 || err?.response?.status === 403) navigate("/feed");
      } finally {
        setIsInitializing(false);
      }
    };
    fetchUserAndRoom();
  }, [user, dispatch, navigate, roomId]);

  // Socket connection & presence
  useEffect(() => {
    if (isInitializing || !user || !roomId || !roomData) return;

    const sock = getSocket(BASE_URL);

    const onConnect = () => {
      setSocketConnected(true);
      sock.emit("enterProjectRoom", { roomId, projectTitle: roomData.projectPostId?.project?.title });
      sock.emit("projectRoom:ping", { roomId });
    };
    const onDisconnect = () => setSocketConnected(false);
    const onPartnerEntered = ({ userId }) => {
      if (String(userId) === String(targetId)) {
        setIsTargetUserInRoom(true);
        sock.emit("webrtc:media", { roomId, videoOff: isVideoOff, muted: isMuted });
      }
    };
    const onPartnerLeft = ({ userId }) => {
      if (String(userId) === String(targetId)) setIsTargetUserInRoom(false);
    };
    const onPing = ({ fromSocketId, userId }) => {
      sock.emit("projectRoom:pong", { targetSocketId: fromSocketId });
      if (String(userId) === String(targetId)) setIsTargetUserInRoom(true);
    };
    const onPong = ({ userId }) => {
      if (String(userId) === String(targetId)) setIsTargetUserInRoom(true);
    };

    sock.on("connect", onConnect);
    sock.on("disconnect", onDisconnect);
    sock.on("partnerEnteredRoom", onPartnerEntered);
    sock.on("partnerLeftRoom", onPartnerLeft);
    sock.on("projectRoom:ping", onPing);
    sock.on("projectRoom:pong", onPong);

    if (sock.connected) {
      setSocketConnected(true);
      sock.emit("enterProjectRoom", { roomId, projectTitle: roomData.projectPostId?.project?.title });
      sock.emit("projectRoom:ping", { roomId });
      sock.emit("webrtc:media", { roomId, videoOff: isVideoOff, muted: isMuted });
    }

    return () => {
      if (sock.connected) sock.emit("leaveProjectRoom", { roomId });
      sock.off("connect", onConnect);
      sock.off("disconnect", onDisconnect);
      sock.off("partnerEnteredRoom", onPartnerEntered);
      sock.off("partnerLeftRoom", onPartnerLeft);
      sock.off("projectRoom:ping", onPing);
      sock.off("projectRoom:pong", onPong);
    };
  }, [user, roomId, isInitializing, roomData, targetId]);

  // Exit handlers
  const handleExitRoom = () => setIsExiting(true);
  const handleConfirmExit = () => {
    const completedTasks = liveTasks.filter((t) => t.completed).length;
    const totalTasks = liveTasks.length;
    if (totalTasks > 0) {
      const summaryMessage = {
        _id: Math.random().toString(36).substring(7),
        senderId: { _id: "system" },
        text: `Session ended. ${completedTasks}/${totalTasks} tasks completed.`,
        type: "system",
        createdAt: new Date(),
      };
      getSocket()?.emit("room:chat_message", { roomId, message: summaryMessage });
    }
    leaveCall();
    navigate("/feed");
  };

  // Template change
  const handleTemplateChange = (newTemplate) => {
    if (newTemplate === template) return;
    setTemplate(newTemplate);
    const sock = getSocket();
    if (sock?.connected) {
      sock.emit("saveProjectFiles", { roomId, files: DEFAULT_FILES[newTemplate], template: newTemplate });
    }
  };

  // Loading
  if (isInitializing) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0d0d0e] gap-4">
        <div className="w-10 h-10 border-2 border-[#a855f7] border-t-transparent rounded-full animate-spin" />
        <span className="text-[#525252] text-xs font-mono uppercase tracking-widest">Loading workspace...</span>
      </div>
    );
  }

  // Derived data
  const post = roomData?.projectPostId;
  const partner = roomData?.members.find((m) => String(m._id) !== String(user._id));
  const techStack = post?.project?.techStack || [];
  const isCorrectRoom = isInCall && currentRoomId === roomId;
  const filesToLoad = Object.keys(initialFiles).length > 0 ? initialFiles : DEFAULT_FILES[template];

  const sandpackTheme = {
    colors: { surface1: "#141415", surface2: "#1a1a1c", surface3: "#222224", clickable: "#737373", base: "#e1e1e3", disabled: "#404040", hover: "#ffffff", accent: "#a855f7", error: "#ff7b72", errorSurface: "#ff7b721a" },
    syntax: { plain: "#e1e1e3", comment: { color: "#525252", fontStyle: "italic" }, keyword: "#a855f7", tag: "#ccff00", punctuation: "#525252", definition: "#79c0ff", property: "#d2a8ff", static: "#ff7b72", string: "#a5d6ff" },
    font: { body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', mono: '"JetBrains Mono", "Fira Code", "SF Mono", monospace', size: "13px", lineHeight: "22px" },
  };

  const saveIcons = {
    saved: { icon: <FiCheck size={10} />, text: "Saved", cls: "text-[#525252]" },
    saving: { icon: <FiRefreshCw size={10} className="animate-spin" />, text: "Saving...", cls: "text-[#a855f7]" },
    unsaved: { icon: <div className="w-1.5 h-1.5 rounded-full bg-[#ccff00]" />, text: "Unsaved", cls: "text-[#ccff00]" },
  };

  return (
    <SandpackProvider template={template} theme={sandpackTheme} files={filesToLoad} options={{ autorun: true, autoReload: true }}>
      <SandpackSyncer roomId={roomId} onSaveStatusChange={setSaveStatus} />
      <ManualSaveHandler roomId={roomId} onSaveStatusChange={setSaveStatus} />

      <div className="h-screen w-full flex flex-col bg-[#0d0d0e] text-[#e1e1e3] font-sans overflow-hidden select-none">

        {/* ═══ HEADER ═══ */}
        <header className="h-12 bg-[#141415] border-b border-white/[0.04] flex items-center justify-between px-3 z-20 shrink-0">
          {/* Left */}
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={handleExitRoom} className="p-1.5 hover:bg-white/5 rounded-md text-[#525252] hover:text-white transition-all shrink-0"><FiArrowLeft size={15} /></button>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#a855f7] to-[#7c3aed] flex items-center justify-center shrink-0"><FiCode className="text-white" size={10} /></div>
              <span className="text-white font-semibold text-[13px] tracking-tight truncate max-w-[160px]">{post?.project?.title || "CodeSphere"}</span>
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-[0.1em] shrink-0 ${template === "react" ? "bg-[#61dafb]/10 text-[#61dafb]" : template === "vue" ? "bg-[#42b883]/10 text-[#42b883]" : "bg-[#dd1b16]/10 text-[#dd1b16]"}`}>{template}</span>
            </div>
          </div>

          {/* Center */}
          <div className="hidden md:flex items-center gap-4">
            <div className={`flex items-center gap-1.5 text-[10px] ${saveIcons[saveStatus].cls} transition-colors`}>{saveIcons[saveStatus].icon}<span className="font-medium">{saveIcons[saveStatus].text}</span></div>
            <div className="w-px h-3 bg-white/[0.06]" />
            <div className="flex items-center gap-1.5 text-[10px] text-[#3a3a3a]"><FiClock size={10} /><span className="font-mono">{sessionTime}</span></div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.02]">
              <div className={`w-1.5 h-1.5 rounded-full ${socketConnected ? "bg-[#ccff00] shadow-[0_0_6px_rgba(204,255,0,0.4)]" : "bg-red-500 animate-pulse"}`} />
              <span className="text-[9px] font-mono text-[#3a3a3a] uppercase">{socketConnected ? "Live" : "..."}</span>
            </div>
            <div className="flex items-center -space-x-1.5">
              <div className="relative z-10">
                <img src={user?.photoUrl} alt="Me" className="w-6 h-6 rounded-full border border-[#a855f7]/50 object-cover" />
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-[#ccff00] rounded-full border border-[#141415]" />
              </div>
              {partner && (
                <div className="relative z-0">
                  <img src={partner.photoUrl} alt={partner.firstName} className={`w-6 h-6 rounded-full border object-cover transition-all ${isTargetUserInRoom ? "border-[#141415] opacity-100" : "border-transparent opacity-25 grayscale"}`} />
                  {isTargetUserInRoom && <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-[#ccff00] rounded-full border border-[#141415]" />}
                </div>
              )}
            </div>
            <div className="w-px h-4 bg-white/[0.06] mx-0.5" />
            <HeaderButtons openTabs={openTabs} setOpenTabs={setOpenTabs} activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="w-px h-4 bg-white/[0.06] mx-0.5 hidden xl:block" />
            <button onClick={handleExitRoom} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-500/8 hover:bg-red-500 text-red-400 hover:text-white text-[9px] font-bold uppercase tracking-[0.12em] rounded-md transition-all hidden xl:flex border border-red-500/10 hover:border-red-500"><FiLogOut size={11} /> Exit</button>
          </div>
        </header>

        {/* ═══ MAIN WORKSPACE ═══ */}
        <div className="flex-1 w-full flex overflow-hidden">

          {/* Activity Bar */}
          <div className="w-[46px] bg-[#141415] border-r border-white/[0.04] flex flex-col items-center py-3 gap-1 shrink-0 z-10">
            {[{ id: "explorer", icon: FiFolder }, { id: "search", icon: FiSearch }, { id: "settings", icon: FiSettings }].map(({ id, icon: Icon }) => (
              <button key={id} onClick={() => { if (activeLeftTab === id && isSidebarVisible) setIsSidebarVisible(false); else { setActiveLeftTab(id); setIsSidebarVisible(true); } }} className={`relative w-10 h-10 flex items-center justify-center rounded-lg transition-all ${activeLeftTab === id && isSidebarVisible ? "text-[#a855f7]" : "text-[#3a3a3a] hover:text-[#737373]"}`} title={id}>
                <Icon size={18} />
                {activeLeftTab === id && isSidebarVisible && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-[#a855f7] rounded-r-full" />}
              </button>
            ))}
          </div>

          {/* Left Sidebar */}
          {isSidebarVisible && (
            <div style={{ width: leftWidth }} className="bg-[#141415] flex flex-col shrink-0 relative border-r border-white/[0.04]">
              <div onMouseDown={startLeftDrag} className="absolute top-0 right-0 w-[3px] h-full cursor-col-resize hover:bg-[#a855f7] z-50 transition-colors" />
              <div className="px-4 py-3 flex items-center justify-between shrink-0">
                <span className="text-[9px] font-bold text-[#3a3a3a] uppercase tracking-[0.15em]">{activeLeftTab === "explorer" ? "Explorer" : activeLeftTab === "search" ? "Search" : "Settings"}</span>
              </div>

              {activeLeftTab === "explorer" && (
                <>
                  <div className="mx-3 mb-2 px-3 py-2.5 bg-[#0d0d0e] rounded-lg border border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#a855f7] to-[#7c3aed] flex items-center justify-center shrink-0"><FiCode className="text-white" size={9} /></div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-[#a3a3a3] font-semibold truncate">{post?.project?.title || "Workspace"}</p>
                        <p className="text-[9px] text-[#3a3a3a]">{Object.keys(filesToLoad).length} files</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col flex-1 min-h-0">
                    <CustomFileCreator />
                    <div className="flex-1 overflow-y-auto pl-1 custom-scrollbar"><SandpackFileExplorer /></div>
                  </div>
                </>
              )}
              {activeLeftTab === "search" && <SearchPanel />}
              {activeLeftTab === "settings" && <SettingsPanel post={post} techStack={techStack} template={template} onTemplateChange={handleTemplateChange} sessionTime={sessionTime} />}
            </div>
          )}

          {/* Sandpack Workspace */}
          <div className="flex-1 h-full relative flex min-w-0">
            <div style={{ display: "flex", width: "100%", height: "100%", minWidth: 0 }}>

              {/* Code Editor */}
              <div className="flex-1 flex flex-col relative min-w-0 bg-[#141415]">
                <SandpackCodeEditor showLineNumbers showTabs closableTabs={true} showInlineErrors={true} showRunButton={false} style={{ flex: 1, height: "100%", minWidth: 0 }} />
              </div>

              {/* Right Panel */}
              <div style={{ width: rightWidth, maxWidth: `calc(100vw - ${(isSidebarVisible ? leftWidth : 0) + 150}px)`, height: "100%", display: "flex", flexDirection: "column", flexShrink: 0, position: "relative", background: "#141415" }}>
                <div onMouseDown={startRightDrag} className="absolute top-0 left-0 w-[3px] h-full cursor-col-resize hover:bg-[#ccff00] z-50 transition-colors" />

                {/* Camera Feed */}
                {isCorrectRoom ? (
                  <div style={{ flex: "0 0 auto", height: isVideoExpanded ? (openTabs.length > 0 ? "240px" : "280px") : "36px", borderBottom: "1px solid rgba(255,255,255,0.04)", overflow: "hidden", background: "#0d0d0e", display: "flex", flexDirection: "column", transition: "height 0.3s ease" }}>
                    <div className="px-3 py-2 border-b border-white/[0.04] bg-[#141415] flex items-center justify-between shrink-0 cursor-pointer hover:bg-white/[0.02] transition-colors" onClick={() => setIsVideoExpanded(!isVideoExpanded)}>
                      <span className="text-[9px] font-bold text-[#3a3a3a] uppercase tracking-[0.15em] flex items-center gap-2"><FiVideo size={10} className="text-[#525252]" /> Camera</span>
                      {isVideoExpanded ? <FiChevronUp className="text-[#3a3a3a]" size={12} /> : <FiChevronDown className="text-[#3a3a3a]" size={12} />}
                    </div>
                    {isVideoExpanded && (
                      <div className={`flex-1 w-full p-2 flex gap-2 ${openTabs.length > 0 ? "flex-row" : "flex-col"} items-stretch justify-center`}>
                        {remoteStream && (
                          <div className={`relative flex-1 bg-[#0a0a0b] rounded-xl overflow-hidden border transition-all duration-300 ${isRemoteSpeaking ? "border-[#ccff00]/50" : "border-white/[0.04]"}`} style={{ minHeight: "80px" }}>
                            {!isRemoteVideoOff ? <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><img src={partner?.photoUrl || "https://geographyandyou.com/images/user-profile.png"} alt="Partner" className="w-12 h-12 rounded-full object-cover border border-white/10" /></div>}
                            {isRemoteSpeaking && <div className="absolute bottom-1.5 right-1.5 pointer-events-none flex items-center gap-[2px] h-4 opacity-60">{[40, 100, 60, 80, 50].map((h, i) => <div key={i} className="w-[2px] bg-[#ccff00] rounded-full animate-[waveform_1s_infinite_ease-in-out]" style={{ height: `${h}%`, animationDelay: `${i * 0.15}s` }} />)}</div>}
                            {remoteReactions?.length > 0 && <div className="absolute top-2 right-2 text-2xl animate-[fadeInOut_2s_ease-out_forwards] pointer-events-none">{remoteReactions[remoteReactions.length - 1].emoji}</div>}
                            <div className="absolute bottom-1.5 left-1.5 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded-md flex items-center gap-1.5"><span className="text-white text-[9px] font-medium truncate">{partner?.firstName}</span>{isRemoteMuted && <FiMicOff size={8} className="text-red-400 shrink-0" />}</div>
                          </div>
                        )}
                        {localStream && (
                          <div className={`relative flex-1 bg-[#0a0a0b] rounded-xl overflow-hidden border group transition-all duration-300 ${isSpeaking ? "border-[#ccff00]/50" : "border-white/[0.04]"}`} style={{ minHeight: "80px" }}>
                            {!isVideoOff ? <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" /> : <div className="w-full h-full flex items-center justify-center"><img src={user?.photoUrl || "https://geographyandyou.com/images/user-profile.png"} alt="You" className="w-12 h-12 rounded-full object-cover border border-[#a855f7]/30" /></div>}
                            {isSpeaking && <div className="absolute bottom-1.5 right-1.5 pointer-events-none flex items-center gap-[2px] h-4 opacity-60">{[40, 100, 60, 80, 50].map((h, i) => <div key={i} className="w-[2px] bg-[#ccff00] rounded-full animate-[waveform_1s_infinite_ease-in-out]" style={{ height: `${h}%`, animationDelay: `${i * 0.15}s` }} />)}</div>}
                            {localReactions?.length > 0 && <div className="absolute top-2 right-2 text-2xl animate-[fadeInOut_2s_ease-out_forwards] pointer-events-none">{localReactions[localReactions.length - 1].emoji}</div>}
                            <div className="absolute bottom-1.5 left-1.5 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded-md flex items-center gap-1.5 group-hover:opacity-0 transition-opacity"><span className="text-white text-[9px] font-medium truncate">{user?.firstName} (You)</span>{isMuted && <FiMicOff size={8} className="text-red-400 shrink-0" />}</div>
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              {showReactions && <div className="absolute bottom-[calc(50%+24px)] flex items-center gap-1.5 bg-[#1a1a1c]/95 backdrop-blur-md p-2 rounded-full border border-white/10 shadow-2xl">{EMOJIS.map((emoji) => <button key={emoji} onClick={() => { sendReaction(emoji); setShowReactions(false); }} className="text-base hover:scale-125 transition-transform">{emoji}</button>)}</div>}
                              <div className="flex items-center gap-1.5 bg-[#1a1a1c]/90 backdrop-blur-xl px-2.5 py-1.5 rounded-full border border-white/10 shadow-2xl">
                                <button onClick={toggleMute} className={`p-1.5 rounded-full transition-colors ${isMuted ? "bg-red-500 text-white" : "bg-white/5 hover:bg-[#a855f7] text-white"}`}>{isMuted ? <FiMicOff size={12} /> : <FiMic size={12} />}</button>
                                <button onClick={handleToggleVideo} className={`p-1.5 rounded-full transition-colors ${isVideoOff ? "bg-red-500 text-white" : "bg-white/5 hover:bg-[#a855f7] text-white"}`}>{isVideoOff ? <FiVideoOff size={12} /> : <FiVideo size={12} />}</button>
                                <button className="p-1.5 rounded-full bg-white/5 text-white/30 cursor-not-allowed" title="Screenshare (Soon)"><FiMonitor size={12} /></button>
                                <button onClick={() => setShowReactions(!showReactions)} className="p-1.5 rounded-full bg-white/5 hover:bg-[#a855f7] text-white transition-colors"><FiSmile size={12} /></button>
                                <button onClick={leaveCall} className="p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"><FiPhoneOff size={12} /></button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full shrink-0 p-3 border-b border-white/[0.04] bg-[#0d0d0e]">
                    <div className="bg-[#141415] border border-[#a855f7]/20 rounded-xl p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#a855f7]/10 rounded-lg flex items-center justify-center shrink-0"><FiVideoOff className="text-[#a855f7]" size={16} /></div>
                        <div><h4 className="text-white font-semibold text-xs">Camera Disconnected</h4><p className="text-[#3a3a3a] text-[10px]">Voice call ended</p></div>
                      </div>
                      <button onClick={() => { const tu = roomData?.members?.find((m) => String(m._id) === String(targetId)); joinCall(roomId, tu); }} className="bg-[#a855f7] hover:bg-[#9333ea] text-white px-4 py-2 rounded-lg font-bold text-[10px] transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(168,85,247,0.3)] shrink-0"><FiPhoneOff size={12} className="rotate-[135deg]" /> Rejoin</button>
                    </div>
                  </div>
                )}

                {/* Tab Content Area */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, backgroundColor: openTabs.length === 0 ? "#0d0d0e" : "transparent" }}>
                  {openTabs.length > 0 ? (
                    <>
                      <div className="flex items-center border-b border-white/[0.04] bg-[#141415] shrink-0 overflow-x-auto custom-scrollbar">
                        {openTabs.map((tabId) => (
                          <div key={tabId} onClick={() => setActiveTab(tabId)} className={`group flex items-center gap-1.5 px-3 py-2 cursor-pointer border-b-2 transition-all text-[10px] ${activeTab === tabId ? "border-b-[#a855f7] text-white" : "border-b-transparent text-[#3a3a3a] hover:text-[#737373] hover:bg-white/[0.02]"}`}>
                            {tabId === "preview" && <FiGlobe size={10} className={activeTab === tabId ? "text-[#ccff00]" : ""} />}
                            {tabId === "console" && <FiTerminal size={10} className={activeTab === tabId ? "text-[#10b981]" : ""} />}
                            {tabId === "tasks" && <FiCheckSquare size={10} className={activeTab === tabId ? "text-[#a855f7]" : ""} />}
                            {tabId === "chat" && <FiMessageCircle size={10} className={activeTab === tabId ? "text-[#3b82f6]" : ""} />}
                            <span className="font-semibold uppercase tracking-[0.1em]">{tabId === "preview" ? "Preview" : tabId === "console" ? "Console" : tabId === "tasks" ? "Tasks" : "Chat"}</span>
                            <button onClick={(e) => { e.stopPropagation(); const nt = openTabs.filter((t) => t !== tabId); setOpenTabs(nt); if (activeTab === tabId) setActiveTab(nt.length > 0 ? nt[nt.length - 1] : null); }} className="p-0.5 rounded hover:bg-white/10 text-[#3a3a3a] hover:text-white transition-colors opacity-0 group-hover:opacity-100 ml-1"><FiX size={9} /></button>
                          </div>
                        ))}
                      </div>
                      <div style={{ flex: 1, position: "relative", minHeight: 0, background: "#0d0d0e" }}>
                        {openTabs.includes("preview") && <div style={{ display: activeTab === "preview" ? "block" : "none", width: "100%", height: "100%" }}><PreviewControls roomId={roomId} /><SandpackPreview showOpenInCodeSandbox={false} showRefreshButton={false} style={{ width: "100%", height: "100%" }} /></div>}
                        {openTabs.includes("console") && <div style={{ display: activeTab === "console" ? "block" : "none", width: "100%", height: "100%" }}><SandpackConsole showHeader={false} resetOnPreviewRestart={false} style={{ width: "100%", height: "100%" }} /></div>}
                        {openTabs.includes("tasks") && <div style={{ display: activeTab === "tasks" ? "block" : "none", width: "100%", height: "100%" }}><TaskList roomId={roomId} initialTasks={roomData?.tasks || []} onTasksChange={setLiveTasks} /></div>}
                        {openTabs.includes("chat") && <div style={{ display: activeTab === "chat" ? "block" : "none", width: "100%", height: "100%" }}><TeamChat roomId={roomId} initialChats={roomData?.chats || []} /></div>}
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-0">
                      <div className="w-full max-w-sm flex flex-col items-center text-center">
                        <div className="w-11 h-11 bg-white/[0.03] rounded-2xl flex items-center justify-center mb-4 border border-white/[0.04]"><FiTerminal className="text-[#3a3a3a]" size={18} /></div>
                        <h3 className="text-white font-semibold text-sm mb-1">Open a panel</h3>
                        <p className="text-[#3a3a3a] text-[11px] mb-5">Select a tool to launch</p>
                        <div className="grid grid-cols-2 gap-2 w-full">
                          {[{ id: "preview", icon: FiGlobe, label: "Preview", color: "#ccff00" }, { id: "console", icon: FiTerminal, label: "Console", color: "#10b981" }, { id: "tasks", icon: FiCheckSquare, label: "Tasks", color: "#a855f7" }, { id: "chat", icon: FiMessageCircle, label: "Chat", color: "#3b82f6" }].map(({ id, icon: Icon, label, color }) => (
                            <button key={id} onClick={() => { if (!openTabs.includes(id)) setOpenTabs((p) => [...p, id]); setActiveTab(id); }} className="flex items-center gap-2.5 bg-[#141415] hover:bg-white/[0.03] p-3 rounded-xl border border-white/[0.04] transition-all hover:border-white/[0.08] group text-left">
                              <div className="p-1.5 rounded-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: `${color}10` }}><Icon style={{ color }} size={14} /></div>
                              <span className="text-[#a3a3a3] font-semibold text-[11px]">{label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ STATUS BAR ═══ */}
        <div className="h-6 bg-[#141415] border-t border-white/[0.04] flex items-center justify-between px-3 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <span className={`text-[9px] font-bold uppercase tracking-[0.1em] px-1.5 py-0.5 rounded ${template === "react" ? "bg-[#61dafb]/8 text-[#61dafb]" : template === "vue" ? "bg-[#42b883]/8 text-[#42b883]" : "bg-[#dd1b16]/8 text-[#dd1b16]"}`}>{template}</span>
            <span className="text-[9px] text-[#3a3a3a] font-mono">{post?.project?.title || "CodeSphere"}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[9px] text-[#3a3a3a] flex items-center gap-1"><FiClock size={9} /> {sessionTime}</span>
            <div className="flex items-center gap-1.5">
              {socketConnected ? <FiWifi size={9} className="text-[#ccff00]" /> : <FiWifiOff size={9} className="text-red-500" />}
              <span className="text-[9px] text-[#3a3a3a]">{socketConnected ? "Connected" : "Offline"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ EXIT MODAL ═══ */}
      {isExiting && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141415] border border-white/[0.06] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-[fadeInUp_0.2s_ease-out]">
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-[#a855f7]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#a855f7]/15"><FiLogOut className="text-[#a855f7] ml-0.5" size={22} /></div>
              <h2 className="text-white text-lg font-bold mb-1.5">End Session?</h2>
              <p className="text-[#525252] text-xs mb-5">Your work is auto-saved. You can rejoin anytime.</p>
              <div className="bg-[#0d0d0e] rounded-xl p-4 border border-white/[0.04] mb-5 text-left">
                <div className="flex flex-col mb-3">
                  <span className="text-[#3a3a3a] text-[9px] font-bold uppercase tracking-[0.15em] mb-0.5">Project</span>
                  <span className="text-white font-semibold text-sm truncate">{post?.project?.title || "Project Room"}</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#141415] rounded-lg p-2.5 border border-white/[0.04]">
                    <span className="block text-[#3a3a3a] text-[8px] font-bold uppercase tracking-[0.15em] mb-1">Tasks</span>
                    <span className="text-white font-bold text-base leading-none">{liveTasks.filter((t) => t.completed).length}</span>
                    <span className="text-[#3a3a3a] text-[10px] font-medium">/{liveTasks.length}</span>
                  </div>
                  <div className="bg-[#141415] rounded-lg p-2.5 border border-white/[0.04]">
                    <span className="block text-[#3a3a3a] text-[8px] font-bold uppercase tracking-[0.15em] mb-1">Duration</span>
                    <span className="text-white font-bold text-xs leading-none font-mono">{sessionTime}</span>
                  </div>
                  <div className="bg-[#141415] rounded-lg p-2.5 border border-white/[0.04]">
                    <span className="block text-[#3a3a3a] text-[8px] font-bold uppercase tracking-[0.15em] mb-1">Members</span>
                    <span className="text-white font-bold text-base leading-none">{roomData?.members?.length || 1}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2.5">
                <button onClick={() => setIsExiting(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-white/[0.06] text-white font-semibold text-xs hover:bg-white/[0.03] transition-colors">Cancel</button>
                <button onClick={handleConfirmExit} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-xs transition-colors shadow-lg">Exit Room</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SandpackProvider>
  );
};

export default ProjectRoom;
