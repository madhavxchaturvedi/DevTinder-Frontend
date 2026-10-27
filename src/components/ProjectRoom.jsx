import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import JSZip from "jszip";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { addUser } from "../redux/userSlice";
import {
  Folder,
  Search,
  Settings,
  Play,
  Square,
  Globe,
  ChevronUp,
  ChevronDown,
  File,
  RefreshCw,
  ExternalLink,
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Smile,
  ArrowLeft,
  Code2,
  CheckSquare,
  MessageSquare,
  LogOut,
  Terminal,
  X,
  Check,
  Clock,
  Wifi,
  WifiOff,
  ChevronRight,
  Copy,
  Download,
  Zap,
  Layers,
  Edit2,
  Trash2,
  MousePointer,
  ThumbsUp,
  Flame,
  Sparkles,
  FileCode2,
  Plus,
} from "lucide-react";
import { getSocket } from "../utils/socket";
import { BASE_URL, DEFAULT_AVATAR } from "../utils/constants";
import axios from "axios";
import { useWebRTCContext } from "../context/WebRTCContext";
import TaskList from "./TaskList";
import TeamChat from "./TeamChat";
import {
  SandpackProvider,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackConsole,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { toast } from "sonner";

// --------- Splitter Hooks ---------------------------------------------------------------------------------------------------------------------------------------
const useHorizontalSplitter = (
  initialWidth,
  minWidth = 150,
  maxWidth = 600,
  onDragStateChange
) => {
  const [width, setWidth] = useState(initialWidth);
  const startDrag = useCallback(
    (e) => {
      e.preventDefault();
      if (onDragStateChange) onDragStateChange(true);
      const startX = e.clientX;
      const startW = width;
      const onMove = (ev) =>
        setWidth(
          Math.max(minWidth, Math.min(maxWidth, startW + (ev.clientX - startX)))
        );
      const onUp = () => {
        document.body.style.cursor = "default";
        if (onDragStateChange) onDragStateChange(false);
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };
      document.body.style.cursor = "col-resize";
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [width, minWidth, maxWidth, onDragStateChange]
  );
  return [width, startDrag, setWidth];
};

const useRightSplitter = (initialWidth, leftWidthRef, onDragStateChange) => {
  const [width, setWidth] = useState(initialWidth);
  const startDrag = useCallback(
    (e) => {
      e.preventDefault();
      if (onDragStateChange) onDragStateChange(true);
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
        if (onDragStateChange) onDragStateChange(false);
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };
      document.body.style.cursor = "col-resize";
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [width, leftWidthRef, onDragStateChange]
  );
  return [width, startDrag];
};

// --------- Session Timer Hook ---------------------------------------------------------------------------------------------------------------------------
const useSessionTimer = () => {
  const [elapsed, setElapsed] = useState(0);
  const startTime = useRef(Date.now());
  useEffect(() => {
    const timer = setInterval(
      () => setElapsed(Math.floor((Date.now() - startTime.current) / 1000)),
      1000
    );
    return () => clearInterval(timer);
  }, []);
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  return h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`;
};

// --------- Default Files per Template ---------------------------------------------------------------------------------------------------
const DEFAULT_FILES = {
  react: {
    "/App.js": {
      code: `export default function App() {
  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", background: "#09090b", minHeight: "100vh", color: "#f0f0f0" }}>
      <h1 style={{ color: "#ccff00", marginBottom: "0.5rem" }}>OctoPair Workspace</h1>
      <p style={{ color: "#52525b" }}>Your collaborative environment is ready. Start coding!</p>
    </div>
  );
}`,
      active: true,
    },
    "/package.json": {
      code: `{\n  "dependencies": {\n    "react": "^18.0.0",\n    "react-dom": "^18.0.0"\n  }\n}`,
    },
  },
  vue: {
    "/src/App.vue": {
      code: `<template>
  <div class="app">
    <h1>OctoPair Workspace</h1>
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
  background: "#09090b";
  min-height: 100vh;
  color: #f0f0f0;
}
h1 { color: #ccff00; }
p { color: #52525b; }
</style>`,
      active: true,
    },
    "/package.json": {
      code: `{\n  "dependencies": {\n    "vue": "^3.0.0"\n  }\n}`,
    },
  },
  angular: {
    "/src/app/app.component.ts": {
      code: `import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  template: \`
    <div style="padding: 2rem; font-family: sans-serif; background: #09090b; min-height: 100vh; color: #f0f0f0;">
      <h1 style="color: #ccff00;">OctoPair Workspace</h1>
      <p style="color: #52525b;">Your collaborative Angular environment is ready.</p>
    </div>
  \`,
})
export class AppComponent {}`,
      active: true,
    },
    "/package.json": {
      code: `{\n  "dependencies": {\n    "@angular/core": "^15.0.0"\n  }\n}`,
    },
  },
};

// --------- WebRTC Reactions ---------------------------------------------------------------------------------------------------------------------------------
const REACTIONS = [
  { id: "thumbs-up", label: "Approve", icon: ThumbsUp },
  { id: "flame", label: "Fire", icon: Flame },
  { id: "zap", label: "Fast", icon: Zap },
  { id: "sparkles", label: "Clean", icon: Sparkles },
  { id: "smile", label: "Nice", icon: Smile },
];

const renderReactionBadge = (reactionId) => {
  const match = REACTIONS.find((r) => r.id === reactionId);
  const IconComponent = match ? match.icon : Sparkles;
  return (
    <div className="w-8 h-8 rounded-full bg-[#111113]/90 border border-[#ccff00]/40 flex items-center justify-center shadow-[0_0_12px_rgba(204,255,0,0.3)]">
      <IconComponent className="w-4 h-4 text-[#ccff00]" />
    </div>
  );
};

// --------- Sandpack Syncer ------------------------------------------------------------------------------------------------------------------------------------
const SandpackSyncer = ({ roomId, onSaveStatusChange }) => {
  const { sandpack } = useSandpack();
  const isRemoteUpdateRef = useRef(new Set());
  const prevFileKeysRef = useRef("");
  const emitTimerRef = useRef(null);

  const filesRef = useRef(sandpack.files);
  const activeFileRef = useRef(sandpack.activeFile);

  useEffect(() => {
    filesRef.current = sandpack.files;
    activeFileRef.current = sandpack.activeFile;
  }, [sandpack.files, sandpack.activeFile]);

  // Receive code changes from partner
  useEffect(() => {
    const sock = getSocket();
    if (!sock) return;

    const handleReceiveFiles = ({ files }) => {
      if (!files) return;
      Object.keys(files).forEach((path) => {
        if (filesRef.current[path]?.code !== files[path].code) {
          isRemoteUpdateRef.current.add(path);
          sandpack.updateFile(path, files[path].code);
        }
      });
    };

    const handleFileCreated = ({ path, code }) => {
      if (path && !filesRef.current[path]) {
        isRemoteUpdateRef.current.add(path);
        sandpack.addFile({ [path]: { code: code || "" } });
      }
    };

    const handleFileDeleted = ({ path }) => {
      if (path && filesRef.current[path]) {
        isRemoteUpdateRef.current.add(path);
        try {
          sandpack.deleteFile(path);
        } catch {
          // ignore delete collision
        }
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
  }, [sandpack]);

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
      localStorage.setItem(
        `sandpack_code_${roomId}`,
        JSON.stringify(sandpack.files)
      );
    }, 150);

    if (onSaveStatusChange) onSaveStatusChange("unsaved");
  }, [sandpack.files, sandpack.activeFile, roomId, onSaveStatusChange]);

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
          sock.emit("file:created", {
            roomId,
            path,
            code: sandpack.files[path]?.code || "",
          });
        }
      });

      prevSet.forEach((path) => {
        if (!currentSet.has(path) && !isRemoteUpdateRef.current.has(path)) {
          sock.emit("file:deleted", { roomId, path });
        }
      });

      isRemoteUpdateRef.current.clear();
    }

    prevFileKeysRef.current = currentKeys;
  }, [sandpack.files, roomId]);

  // Auto-save ALL files every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const sock = getSocket();
      if (!sock?.connected) return;

      const allFiles = {};
      Object.keys(filesRef.current).forEach((path) => {
        allFiles[path] = { code: filesRef.current[path].code };
      });

      sock.emit("saveProjectFiles", { roomId, files: allFiles });
      if (onSaveStatusChange) onSaveStatusChange("saved");
    }, 15000);
    return () => clearInterval(interval);
  }, [roomId, onSaveStatusChange]);

  return null;
};

// --------- Manual Save Handler (Ctrl+S) ------------------------------------------------------------------------------------------
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

// --------- NPM Dependency Manager ------------------------------------------------------------------------------------------------------------------
const DependencyManager = ({ roomId }) => {
  const { sandpack } = useSandpack();
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [installingPkg, setInstallingPkg] = useState(null);

  const packageJsonStr =
    sandpack.files["/package.json"]?.code || '{\n  "dependencies": {}\n}';
  let currentDeps = {};
  try {
    const parsed = JSON.parse(packageJsonStr);
    currentDeps = parsed.dependencies || {};
  } catch (e) {
    console.error("Failed to parse package.json", e);
  }

  // Debounced Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(
            searchQuery
          )}&size=5`
        );
        const data = await res.json();
        setSearchResults(data.objects || []);
      } catch (err) {
        console.error("NPM Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const addDependency = (pkgName, version) => {
    setInstallingPkg(pkgName);

    const latestPackageStr =
      sandpack.files["/package.json"]?.code || '{\n  "dependencies": {}\n}';
    let parsed = { dependencies: {} };
    try {
      parsed = JSON.parse(latestPackageStr);
      if (!parsed.dependencies) parsed.dependencies = {};
    } catch {
      parsed = { dependencies: {} };
    }

    parsed.dependencies[pkgName] = `^${version}`;

    const newCode = JSON.stringify(parsed, null, 2);
    if (!sandpack.files["/package.json"]) {
      sandpack.addFile("/package.json", newCode);
    } else {
      sandpack.updateFile("/package.json", newCode);
    }

    if (roomId) {
      const sock = getSocket();
      if (sock?.connected) {
        sock.emit("codeChange", {
          roomId,
          files: { "/package.json": { code: newCode } },
        });
      }
    }

    setSearchQuery("");
    setTimeout(() => setInstallingPkg(null), 500);
  };

  const removeDependency = (pkgName) => {
    const latestPackageStr =
      sandpack.files["/package.json"]?.code || '{\n  "dependencies": {}\n}';
    let parsed = { dependencies: {} };
    try {
      parsed = JSON.parse(latestPackageStr);
      if (!parsed.dependencies) parsed.dependencies = {};
    } catch {
      parsed = { dependencies: {} };
    }

    delete parsed.dependencies[pkgName];

    const newCode = JSON.stringify(parsed, null, 2);
    sandpack.updateFile("/package.json", newCode);

    if (roomId) {
      const sock = getSocket();
      if (sock?.connected) {
        sock.emit("codeChange", {
          roomId,
          files: { "/package.json": { code: newCode } },
        });
      }
    }
  };

  return (
    <div className="flex flex-col shrink-0 border-t border-white/[0.07]">
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="text-[10px] font-bold text-[#52525b] uppercase tracking-[0.1em] group-hover:text-[#f0f0f0] transition-colors">
          Dependencies
        </span>
        <span className="text-[#52525b] group-hover:text-[#f0f0f0] transition-colors">
          {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </span>
      </div>

      {isExpanded && (
        <div className="px-3 pb-3 flex flex-col gap-2">
          {Object.keys(currentDeps).length > 0 && (
            <div className="flex flex-col gap-1 mb-1">
              {Object.entries(currentDeps).map(([name, version]) => (
                <div
                  key={name}
                  className="flex items-center justify-between group/dep py-0.5"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Layers size={10} className="text-[#52525b] shrink-0" />
                    <span className="text-[11px] text-[#f0f0f0] truncate">
                      {name}
                    </span>
                    <span className="text-[9px] text-[#52525b] font-mono">
                      {version}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDependency(name)}
                    className="opacity-0 group-hover/dep:opacity-100 p-0.5 text-[#52525b] hover:text-red-400 transition-all shrink-0 cursor-pointer"
                    title="Remove Package"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="relative">
            <Search
              className="absolute left-2 top-1/2 -translate-y-1/2 text-[#52525b]"
              size={10}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Add npm package..."
              className="w-full bg-[#09090b] border border-white/10 rounded-md text-[11px] text-[#f0f0f0] pl-6 pr-2 py-1.5 outline-none focus:border-[#ccff00]/60 focus:ring-1 focus:ring-[#ccff00]/30 transition-all placeholder:text-[#52525b]"
            />
          </div>

          {searchQuery && (
            <div className="flex flex-col gap-1 mt-1 max-h-[150px] overflow-y-auto custom-scrollbar">
              {isSearching ? (
                <div className="text-[10px] text-[#52525b] py-1 text-center flex items-center justify-center gap-1">
                  <RefreshCw className="animate-spin" size={10} /> Searching...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map(({ package: pkg }) => (
                  <div
                    key={pkg.name}
                    className="flex items-center justify-between py-1 px-1.5 hover:bg-white/[0.04] rounded-md group/res"
                  >
                    <div className="flex flex-col min-w-0 flex-1 pr-2">
                      <span className="text-[11px] text-[#f0f0f0] font-medium truncate">
                        {pkg.name}
                      </span>
                      <span className="text-[9px] text-[#52525b] truncate">
                        {pkg.version}
                      </span>
                    </div>
                    {installingPkg === pkg.name ? (
                      <RefreshCw
                        className="animate-spin text-[#ccff00] shrink-0"
                        size={12}
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => addDependency(pkg.name, pkg.version)}
                        className="opacity-0 group-hover/res:opacity-100 text-[#ccff00] hover:text-[#d9ff33] shrink-0 cursor-pointer"
                        title="Add Package"
                      >
                        <Download size={12} />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-[10px] text-[#52525b] py-1 text-center">
                  No package found
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --------- Custom File Explorer Tree ------------------------------------------------------------------------------------------------------
const buildFileTree = (files) => {
  const root = {
    name: "root",
    path: "/",
    type: "folder",
    children: {},
    isExpanded: true,
  };

  Object.keys(files).forEach((filePath) => {
    const parts = filePath.split("/").filter(Boolean);
    let current = root;
    let currentPath = "";

    parts.forEach((part, index) => {
      currentPath += `/${part}`;
      if (index === parts.length - 1) {
        if (part !== ".keep") {
          current.children[part] = {
            name: part,
            path: currentPath,
            type: "file",
          };
        }
      } else {
        if (!current.children[part]) {
          current.children[part] = {
            name: part,
            path: currentPath,
            type: "folder",
            children: {},
          };
        }
        current = current.children[part];
      }
    });
  });

  return root;
};

// --------- Live Mouse Cursors ------------------------------------------------------------------------------------------------------------------------------
const LiveCursors = ({ roomId }) => {
  const user = useSelector((s) => s.user);
  const [cursors, setCursors] = useState({});

  useEffect(() => {
    const sock = getSocket();
    if (!sock) return;

    let lastEmit = 0;
    const handleMouseMove = (e) => {
      const now = Date.now();
      if (now - lastEmit < 50) return;
      lastEmit = now;
      sock.emit("cursorMove", {
        roomId,
        position: {
          x: e.clientX / window.innerWidth,
          y: e.clientY / window.innerHeight,
        },
        userName: user?.firstName || "Anonymous",
      });
    };

    const handleRemoteCursor = ({ userId, userName, position }) => {
      setCursors((prev) => ({
        ...prev,
        [userId]: { position, userName, lastUpdate: Date.now() },
      }));
    };

    window.addEventListener("mousemove", handleMouseMove);
    sock.on("receiveCursorMove", handleRemoteCursor);

    const cleanup = setInterval(() => {
      const now = Date.now();
      setCursors((prev) => {
        const next = { ...prev };
        let changed = false;
        Object.keys(next).forEach((k) => {
          if (now - next[k].lastUpdate > 3000) {
            delete next[k];
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 1000);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      sock.off("receiveCursorMove", handleRemoteCursor);
      clearInterval(cleanup);
    };
  }, [roomId, user]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {Object.entries(cursors).map(([id, cursor]) => (
        <div
          key={id}
          className="absolute flex flex-col items-start transition-all duration-75 ease-out"
          style={{
            transform: `translate(${cursor.position.x * window.innerWidth}px, ${
              cursor.position.y * window.innerHeight
            }px)`,
          }}
        >
          <MousePointer
            size={18}
            className="text-[#b266ff]"
            style={{ filter: "drop-shadow(0px 2px 2px rgba(0,0,0,0.5))" }}
            fill="#b266ff"
          />
          <div className="bg-[#b266ff] text-[#09090b] text-[10px] px-2 py-0.5 rounded-full font-bold ml-3 -mt-1 shadow-md font-mono">
            {cursor.userName}
          </div>
        </div>
      ))}
    </div>
  );
};

const CustomFileExplorer = ({ projectName }) => {
  const { sandpack } = useSandpack();
  const [expandedFolders, setExpandedFolders] = useState(new Set(["/"]));
  const [selectedPath, setSelectedPath] = useState("/");
  const [creating, setCreating] = useState(null);
  const [newItemName, setNewItemName] = useState("");
  const [renaming, setRenaming] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const tree = useMemo(() => buildFileTree(sandpack.files), [sandpack.files]);

  const toggleFolder = (path, e) => {
    e?.stopPropagation();
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) newExpanded.delete(path);
    else newExpanded.add(path);
    setExpandedFolders(newExpanded);
    setSelectedPath(path);
  };

  const handleSelect = (path, type, e) => {
    e?.stopPropagation();
    setSelectedPath(path);
    if (type === "file") {
      sandpack.setActiveFile(path);
    }
  };

  const startCreating = (type) => {
    let targetPath = selectedPath;
    if (targetPath !== "/" && sandpack.files[targetPath]) {
      targetPath = targetPath.substring(0, targetPath.lastIndexOf("/")) || "/";
    }

    if (targetPath !== "/") {
      setExpandedFolders((prev) => new Set(prev).add(targetPath));
    }

    setCreating({ type, path: targetPath });
    setNewItemName("");
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newItemName.trim() || !creating) {
      setCreating(null);
      return;
    }

    const parentPath = creating.path === "/" ? "" : creating.path;
    let newPath = `${parentPath}/${newItemName}`;

    if (creating.type === "folder") {
      newPath = `${newPath}/.keep`;
    }

    try {
      if (!sandpack.files[newPath]) {
        sandpack.addFile(newPath, "");
      }
      if (creating.type === "file") {
        sandpack.setActiveFile(newPath);
      }
      setExpandedFolders((prev) =>
        new Set(prev).add(
          creating.type === "folder"
            ? `${parentPath}/${newItemName}`
            : parentPath === ""
            ? "/"
            : parentPath
        )
      );
    } catch (err) {
      console.error(err);
    }

    setCreating(null);
    setNewItemName("");
  };

  const handleDelete = (path, type, e) => {
    e.stopPropagation();
    if (type === "file") {
      sandpack.deleteFile(path);
    } else {
      const filesToDelete = Object.keys(sandpack.files).filter(
        (f) => f.startsWith(path + "/") || f === path + "/.keep"
      );
      filesToDelete.forEach((f) => sandpack.deleteFile(f));
    }
    toast.success(`Removed ${path}`);
  };

  const startRenaming = (path, name, e) => {
    e.stopPropagation();
    setRenaming(path);
    setRenameValue(name);
  };

  const handleRenameSubmit = (e, path, type, oldName) => {
    e.preventDefault();
    if (!renameValue.trim() || renameValue === oldName) {
      setRenaming(null);
      return;
    }

    const parentPath = path.substring(0, path.lastIndexOf("/"));
    const newPath =
      parentPath === "" ? `/${renameValue}` : `${parentPath}/${renameValue}`;

    if (type === "file") {
      const code = sandpack.files[path]?.code || "";
      sandpack.addFile(newPath, code);
      sandpack.deleteFile(path);
      if (sandpack.activeFile === path) sandpack.setActiveFile(newPath);
    } else {
      const filesToMove = Object.keys(sandpack.files).filter(
        (f) => f.startsWith(path + "/") || f === path + "/.keep"
      );
      filesToMove.forEach((f) => {
        const relative = f.substring(path.length);
        const code = sandpack.files[f]?.code || "";
        sandpack.addFile(newPath + relative, code);
        sandpack.deleteFile(f);
        if (sandpack.activeFile === f)
          sandpack.setActiveFile(newPath + relative);
      });
      setExpandedFolders((prev) => {
        const next = new Set(prev);
        if (next.has(path)) {
          next.delete(path);
          next.add(newPath);
        }
        return next;
      });
    }
    setRenaming(null);
  };

  const renderNode = (node, level = 0) => {
    const isExpanded = expandedFolders.has(node.path) || node.path === "/";
    const isSelected = selectedPath === node.path;
    const isActiveFile = sandpack.activeFile === node.path;
    const isRoot = node.path === "/";

    const isCreatingHere = creating && creating.path === node.path;
    const isRenamingThis = renaming === node.path;

    const children = Object.values(node.children || {}).sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === "folder" ? -1 : 1;
    });

    return (
      <div key={node.path}>
        {!isRoot && (
          <div
            onClick={(e) =>
              node.type === "folder"
                ? toggleFolder(node.path, e)
                : handleSelect(node.path, node.type, e)
            }
            className={`flex items-center gap-1.5 py-1 px-2 cursor-pointer select-none group transition-colors ${
              isSelected || isActiveFile
                ? "bg-[#1a1a1f] text-[#f0f0f0]"
                : "text-[#d4d4d8] hover:bg-white/[0.04]"
            }`}
            style={{ paddingLeft: `${level * 12 + 8}px` }}
          >
            {node.type === "folder" ? (
              <span className="text-[#52525b] w-4 flex justify-center shrink-0">
                {isExpanded ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </span>
            ) : (
              <span className="w-4 flex justify-center shrink-0">
                {node.name.endsWith(".js") || node.name.endsWith(".jsx") ? (
                  <span className="text-[#ccff00] text-[10px] font-bold font-mono">
                    JS
                  </span>
                ) : node.name.endsWith(".css") ? (
                  <span className="text-[#38bdf8] text-[10px] font-bold font-mono">
                    #
                  </span>
                ) : node.name.endsWith(".json") ? (
                  <span className="text-[#b266ff] text-[10px] font-bold font-mono">
                    {"{}"}
                  </span>
                ) : (
                  <File size={12} className="text-[#52525b]" />
                )}
              </span>
            )}

            {isRenamingThis ? (
              <form
                onSubmit={(e) =>
                  handleRenameSubmit(e, node.path, node.type, node.name)
                }
                className="flex-1 min-w-0"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  className="w-full bg-[#09090b] border border-[#ccff00]/60 rounded-sm text-[12px] text-[#f0f0f0] px-1 py-0.5 outline-none font-mono"
                  autoFocus
                  onBlur={() => setRenaming(null)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setRenaming(null);
                  }}
                />
              </form>
            ) : (
              <span
                className={`text-[12px] truncate flex-1 ${
                  isActiveFile ? "text-[#ccff00] font-semibold" : ""
                }`}
              >
                {node.name}
              </span>
            )}

            {!isRenamingThis && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  type="button"
                  onClick={(e) => startRenaming(node.path, node.name, e)}
                  className="p-1 rounded hover:bg-white/[0.06] text-[#52525b] hover:text-[#f0f0f0] transition-colors cursor-pointer"
                  title="Rename"
                >
                  <Edit2 size={10} />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDelete(node.path, node.type, e)}
                  className="p-1 rounded hover:bg-red-500/20 text-[#52525b] hover:text-red-400 transition-colors cursor-pointer"
                  title="Delete"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            )}
          </div>
        )}

        {(isExpanded || isRoot) && (
          <div>
            {isCreatingHere && (
              <div
                className="flex items-center gap-1.5 py-1 pr-2"
                style={{
                  paddingLeft: `${(level + (isRoot ? 0 : 1)) * 12 + 8}px`,
                }}
              >
                <span className="w-4 flex justify-center text-[#52525b] shrink-0">
                  {creating.type === "folder" ? (
                    <ChevronRight size={14} />
                  ) : (
                    <File size={12} />
                  )}
                </span>
                <form onSubmit={handleCreateSubmit} className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#ccff00]/60 rounded-sm text-[12px] text-[#f0f0f0] px-1 py-0.5 outline-none font-mono"
                    autoFocus
                    onBlur={() => setCreating(null)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setCreating(null);
                    }}
                  />
                </form>
              </div>
            )}
            {children.map((child) =>
              renderNode(child, isRoot ? 0 : level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#111113] text-[#d4d4d8] font-sans">
      <div className="flex items-center justify-between px-3 pb-2 pt-1 border-b border-white/[0.07] mb-1 group shrink-0">
        <span
          className="text-[10px] font-bold text-[#52525b] uppercase tracking-[0.1em] cursor-pointer group-hover:text-[#f0f0f0] transition-colors"
          onClick={() => setSelectedPath("/")}
        >
          {projectName ? `${projectName} / Files` : "Files"}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => startCreating("file")}
            className="p-1 rounded hover:bg-white/[0.06] text-[#52525b] hover:text-[#f0f0f0] transition-colors relative cursor-pointer"
            title="New File"
          >
            <File size={12} />
            <span className="absolute top-0 right-0 text-[10px] font-bold leading-none bg-[#111113] rounded-full">
              +
            </span>
          </button>
          <button
            type="button"
            onClick={() => startCreating("folder")}
            className="p-1 rounded hover:bg-white/[0.06] text-[#52525b] hover:text-[#f0f0f0] transition-colors relative cursor-pointer"
            title="New Folder"
          >
            <Folder size={12} />
            <span className="absolute top-0 right-0 text-[10px] font-bold leading-none bg-[#111113] rounded-full">
              +
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setExpandedFolders(new Set(["/"]));
              setSelectedPath("/");
            }}
            className="p-1 rounded hover:bg-white/[0.06] text-[#52525b] hover:text-[#f0f0f0] transition-colors cursor-pointer"
            title="Collapse All"
          >
            <ChevronUp size={12} />
          </button>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto custom-scrollbar"
        onClick={() => setSelectedPath("/")}
      >
        {renderNode(tree)}
      </div>
    </div>
  );
};

// --------- Search Panel ---------------------------------------------------------------------------------------------------------------------------------------------
const SearchPanel = () => {
  const { sandpack } = useSandpack();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
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
        <div className="bg-[#09090b] border border-white/[0.07] rounded-lg flex items-center px-3 py-2.5 focus-within:border-[#ccff00]/60 focus-within:ring-1 focus-within:ring-[#ccff00]/30 transition-all">
          <Search className="text-[#52525b] mr-2.5 shrink-0" size={14} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across all files..."
            className="bg-transparent text-[#f0f0f0] text-xs outline-none w-full placeholder:text-[#52525b]"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-[#52525b] hover:text-[#f0f0f0] ml-1 shrink-0 cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 custom-scrollbar">
        {query && results.length === 0 && (
          <div className="text-center py-8">
            <p className="text-[#52525b] text-xs">No results for "{query}"</p>
          </div>
        )}
        {!query && (
          <div className="text-center py-12 opacity-50">
            <Search size={28} className="text-[#52525b] mx-auto mb-3" />
            <p className="text-[#52525b] text-[11px]">
              Type to search across
              <br />
              all project files
            </p>
          </div>
        )}
        {query && results.length > 0 && (
          <div className="mb-2">
            <span className="text-[9px] text-[#52525b] uppercase tracking-widest font-bold px-2 font-mono">
              {results.length} result{results.length !== 1 ? "s" : ""} in{" "}
              {Object.keys(fileGroups).length} file
              {Object.keys(fileGroups).length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
        {Object.entries(fileGroups).map(([path, matches]) => (
          <div key={path} className="mb-3">
            <div className="flex items-center gap-2 px-2 py-1.5 text-[11px] text-[#f0f0f0] font-semibold">
              <File size={11} className="text-[#ccff00]" />
              <span className="truncate">{path.split("/").pop()}</span>
              <span className="text-[#52525b] text-[9px] ml-auto font-mono">
                {path}
              </span>
            </div>
            {matches.map((m, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  try {
                    sandpack.setActiveFile(m.path);
                  } catch {
                    // ignore navigation error
                  }
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-white/[0.04] rounded-md transition-colors group cursor-pointer"
              >
                <span className="text-[10px] text-[#52525b] font-mono mr-2">
                  L{m.line}
                </span>
                <span className="text-[11px] text-[#d4d4d8] font-mono group-hover:text-[#f0f0f0] transition-colors">
                  {m.content.length > 60
                    ? `${m.content.slice(0, 60)}...`
                    : m.content}
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// --------- Settings Panel ---------------------------------------------------------------------------------------------------------------------------------------
const SettingsPanel = ({
  post,
  techStack,
  template,
  onTemplateChange,
  sessionTime,
  roomId,
  roomData,
  user,
  navigate,
  setRoomData,
}) => {
  const { sandpack } = useSandpack();
  const [confirmAction, setConfirmAction] = useState(null);

  const handleDownloadZip = async () => {
    const zip = new JSZip();
    Object.entries(sandpack.files).forEach(([path, file]) => {
      const zipPath = path.startsWith("/") ? path.substring(1) : path;
      zip.file(zipPath, file.code || "");
    });
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${post?.project?.title || "project"}.zip`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Project ZIP downloaded");
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar p-4">
      <div className="mb-6">
        <h3 className="text-[11px] font-bold text-[#52525b] uppercase tracking-wider mb-3 font-mono">
          Project Metadata
        </h3>
        <div className="bg-[#111113] border border-white/[0.07] rounded-xl p-3">
          <p className="text-[13px] font-medium text-[#f0f0f0] mb-1">
            {post?.project?.title || "Untitled Project"}
          </p>
          <p className="text-[11px] text-[#52525b] line-clamp-2">
            {post?.content || "No description provided."}
          </p>
          {sessionTime && (
            <p className="text-[10px] text-[#52525b] font-mono mt-2">
              Session: {sessionTime}
            </p>
          )}
          {techStack && techStack.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {techStack.map((t) => (
                <span
                  key={t}
                  className="text-[9px] bg-white/[0.04] text-[#d4d4d8] border border-white/[0.06] px-1.5 py-0.5 rounded font-mono"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          {onTemplateChange && (
            <div className="mt-3">
              <label className="text-[10px] text-[#52525b] block mb-1 font-mono">
                Template
              </label>
              <select
                value={template || "react"}
                onChange={(e) => onTemplateChange(e.target.value)}
                className="w-full bg-[#09090b] border border-white/[0.07] rounded px-2 py-1 text-[11px] text-[#f0f0f0] font-mono outline-none cursor-pointer"
              >
                <option value="react">React</option>
                <option value="vue">Vue</option>
                <option value="angular">Angular</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1">
        <h3 className="text-[11px] font-bold text-[#52525b] uppercase tracking-wider mb-3 flex items-center justify-between font-mono">
          <span>Members ({roomData?.members?.length || 0})</span>
        </h3>

        <section className="bg-white/[0.02] border border-white/[0.07] rounded-xl overflow-hidden mb-6">
          <div className="flex flex-col">
            {roomData?.members?.map((member) => (
              <div
                key={member._id}
                className="flex items-center justify-between p-3 border-b border-white/[0.07] last:border-0 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={member.photoUrl || DEFAULT_AVATAR}
                    alt={member.firstName}
                    className="w-7 h-7 rounded-full object-cover border border-white/[0.08]"
                  />
                  <div className="flex flex-col">
                    <span className="text-[12px] font-semibold text-[#f0f0f0] leading-tight">
                      {member.firstName} {member.lastName}
                    </span>
                    <span className="text-[10px] text-[#52525b]">
                      {member._id === roomData?.ownerId
                        ? "Project Owner"
                        : "Collaborator"}
                    </span>
                  </div>
                </div>
                {member._id === user?._id && (
                  <span className="text-[9px] uppercase tracking-wider font-bold text-black bg-[#ccff00] px-1.5 py-0.5 rounded font-mono">
                    You
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-auto pt-4 border-t border-white/[0.07]">
        <h3 className="text-[11px] font-bold text-[#52525b] uppercase tracking-wider mb-3 flex items-center gap-2 font-mono">
          <Settings size={14} /> Project Actions
        </h3>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleDownloadZip}
            className="w-full flex items-center gap-2 px-3 py-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] rounded-lg text-[12px] text-[#f0f0f0] transition-all cursor-pointer"
          >
            <Download size={14} /> Download as ZIP
          </button>
          {roomData?.ownerId === user?._id &&
            roomData?.status !== "completed" && (
              <div>
                <button
                  type="button"
                  onClick={() =>
                    setConfirmAction(
                      confirmAction === "complete" ? null : "complete"
                    )
                  }
                  className="w-full flex items-center gap-2 px-3 py-2 bg-[#ccff00]/5 hover:bg-[#ccff00]/10 border border-[#ccff00]/20 rounded-lg text-[12px] text-[#ccff00] transition-all cursor-pointer font-medium"
                >
                  <Check size={14} /> Mark as Completed
                </button>
                {confirmAction === "complete" && (
                  <div className="mt-2 p-3 bg-[#ccff00]/5 border border-[#ccff00]/20 rounded-lg">
                    <p className="text-[11px] text-[#ccff00] mb-2">
                      This will move the project to your Completed tab.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await axios.patch(
                              `${BASE_URL}/project/room/${roomId}/status`,
                              { status: "completed" },
                              { withCredentials: true }
                            );
                            if (setRoomData)
                              setRoomData((prev) => ({
                                ...prev,
                                status: "completed",
                              }));
                            setConfirmAction(null);
                            toast.success("Project marked as completed");
                          } catch {
                            setConfirmAction(null);
                          }
                        }}
                        className="flex-1 px-2 py-1.5 bg-[#ccff00] text-black rounded text-[11px] font-bold hover:bg-[#d9ff33] transition-colors cursor-pointer"
                      >
                        Confirm Complete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmAction(null)}
                        className="flex-1 px-2 py-1.5 bg-white/[0.06] text-[#52525b] hover:text-[#f0f0f0] rounded text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          {roomData?.ownerId === user?._id && (
            <div>
              <button
                type="button"
                onClick={() =>
                  setConfirmAction(
                    confirmAction === "archive" ? null : "archive"
                  )
                }
                className="w-full flex items-center gap-2 px-3 py-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] rounded-lg text-[12px] text-[#d4d4d8] hover:text-[#f0f0f0] transition-all cursor-pointer"
              >
                <Layers size={14} /> Archive Project
              </button>
              {confirmAction === "archive" && (
                <div className="mt-2 p-3 bg-white/[0.03] border border-white/[0.07] rounded-lg">
                  <p className="text-[11px] text-[#52525b] mb-2">
                    This will hide the project from your active view.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await axios.patch(
                            `${BASE_URL}/project/room/${roomId}/status`,
                            { status: "archived" },
                            { withCredentials: true }
                          );
                          if (setRoomData)
                            setRoomData((prev) => ({
                              ...prev,
                              status: "archived",
                            }));
                          setConfirmAction(null);
                          toast.success("Project archived");
                        } catch {
                          setConfirmAction(null);
                        }
                      }}
                      className="flex-1 px-2 py-1.5 bg-white/[0.1] text-[#f0f0f0] rounded text-[11px] font-medium hover:bg-white/[0.15] transition-colors cursor-pointer"
                    >
                      Confirm Archive
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmAction(null)}
                      className="flex-1 px-2 py-1.5 bg-white/[0.04] text-[#52525b] rounded text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          {roomData?.ownerId === user?._id &&
            roomData?.status !== "completed" && (
              <div>
                <button
                  type="button"
                  onClick={() =>
                    setConfirmAction(
                      confirmAction === "delete" ? null : "delete"
                    )
                  }
                  className="w-full flex items-center gap-2 px-3 py-2 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 rounded-lg text-[12px] text-red-400 transition-all cursor-pointer"
                >
                  <Trash2 size={14} /> Delete Project
                </button>
                {confirmAction === "delete" && (
                  <div className="mt-2 p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                    <p className="text-[11px] text-red-400 mb-2">
                      This will permanently delete this room including code,
                      chat, and tasks.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await axios.delete(
                              `${BASE_URL}/project/room/${roomId}`,
                              { withCredentials: true }
                            );
                            navigate("/projects");
                          } catch {
                            setConfirmAction(null);
                          }
                        }}
                        className="flex-1 px-2 py-1.5 bg-red-500 text-white rounded text-[11px] font-bold hover:bg-red-600 transition-colors cursor-pointer"
                      >
                        Confirm Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmAction(null)}
                        className="flex-1 px-2 py-1.5 bg-white/[0.04] text-[#52525b] rounded text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

// --------- Custom Preview Controls ------------------------------------------------------------------------------------------------------------
const PreviewControls = ({ roomId }) => {
  const { sandpack } = useSandpack();
  return (
    <div className="absolute top-2 right-2 z-50 flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => {
          try {
            const files = { ...sandpack.files };
            sandpack.resetAllFiles();
            Object.keys(files).forEach((p) =>
              sandpack.updateFile(p, files[p].code)
            );
          } catch {
            // fallback
          }
        }}
        className="p-1.5 bg-[#1a1a1f]/90 hover:bg-[#ccff00] text-[#52525b] hover:text-black rounded-md transition-all backdrop-blur-sm cursor-pointer"
        title="Refresh Preview"
      >
        <RefreshCw size={12} />
      </button>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(
            `${window.location.origin}/project/preview/${roomId}`
          );
          toast.success("Public preview link copied to clipboard");
        }}
        className="p-1.5 bg-[#1a1a1f]/90 hover:bg-[#b266ff] text-[#52525b] hover:text-[#09090b] rounded-md transition-all backdrop-blur-sm cursor-pointer"
        title="Copy Public Preview Link"
      >
        <Copy size={12} />
      </button>
      <button
        type="button"
        onClick={() => {
          const sock = getSocket();
          const allFiles = {};
          Object.keys(sandpack.files).forEach((p) => {
            allFiles[p] = { code: sandpack.files[p].code };
          });
          if (sock && sock.connected) {
            sock.emit("saveProjectFiles", { roomId, files: allFiles });
          }
          window.open(`/project/preview/${roomId}`, "_blank");
        }}
        className="p-1.5 bg-[#1a1a1f]/90 hover:bg-[#b266ff] text-[#52525b] hover:text-[#09090b] rounded-md transition-all backdrop-blur-sm cursor-pointer"
        title="Open Public Preview in New Tab"
      >
        <ExternalLink size={12} />
      </button>
    </div>
  );
};

// --------- Custom Terminal Console ------------------------------------------------------------------------------------------------------------
const CustomTerminal = ({ template }) => {
  const { sandpack } = useSandpack();

  const getStartCommand = (tmpl) => {
    switch (tmpl) {
      case "vue":
        return "npm run dev";
      case "angular":
        return "ng serve";
      case "react":
      default:
        return "npm start";
    }
  };
  const startCommand = getStartCommand(template);

  if (sandpack.status === "idle" || sandpack.status === "initializing") {
    return (
      <div className="flex flex-col w-full h-full bg-[#09090b] font-mono text-[13px]">
        <div className="flex items-center justify-between px-3 py-2 bg-[#111113] border-b border-white/[0.07] shrink-0">
          <div className="flex items-center gap-2 text-[#52525b]">
            <Terminal size={12} />
            <span className="text-xs">bash - user@workspace</span>
          </div>
        </div>
        <div className="flex-1 p-3 flex items-center justify-center text-[#52525b]">
          <div className="flex items-center gap-2">
            <RefreshCw className="animate-spin" /> Booting shell environment...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-[#09090b] font-mono text-[13px]">
      <div className="flex items-center justify-between px-3 py-2 bg-[#111113] border-b border-white/[0.07] shrink-0">
        <div className="flex items-center gap-2 text-[#52525b]">
          <Terminal size={12} />
          <span className="text-xs">bash - user@workspace</span>
        </div>
      </div>

      <div className="flex-1 p-3 overflow-y-auto custom-scrollbar flex flex-col relative">
        <div className="flex items-center gap-2 text-[#ccff00] mb-2 opacity-80 shrink-0">
          <span>user@workspace:~/project$</span>
          <span className="text-[#f0f0f0]">{startCommand}</span>
        </div>

        <div className="flex-1 relative" style={{ minHeight: "150px" }}>
          <SandpackConsole
            showHeader={false}
            resetOnPreviewRestart={false}
            style={{
              width: "100%",
              height: "100%",
              background: "transparent",
            }}
          />
        </div>

        <div className="flex items-center gap-2 text-[#ccff00] mt-2 mt-auto shrink-0">
          <span>user@workspace:~/project$</span>
          <span className="animate-pulse w-2 h-4 bg-[#ccff00] inline-block" />
        </div>
      </div>
    </div>
  );
};

// --------- Header Action Buttons ------------------------------------------------------------------------------------------------------------------
const HeaderButtons = ({ openTabs, setOpenTabs, activeTab, setActiveTab }) => {
  const isRunning = openTabs.includes("preview");
  const isConsole = openTabs.includes("console");
  const isTasks = openTabs.includes("tasks");
  const isChat = openTabs.includes("chat");

  const toggleTab = (tabId) => {
    if (openTabs.includes(tabId)) {
      const newTabs = openTabs.filter((t) => t !== tabId);
      setOpenTabs(newTabs);
      if (activeTab === tabId)
        setActiveTab(newTabs.length > 0 ? newTabs[newTabs.length - 1] : null);
    } else {
      setOpenTabs([...openTabs, tabId]);
      setActiveTab(tabId);
    }
  };

  const btnCls = (active) =>
    `flex items-center gap-1.5 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] rounded-md transition-all whitespace-nowrap border cursor-pointer ${
      active
        ? "bg-[#1a1a1f] text-[#f0f0f0] border-white/20 shadow-inner"
        : "bg-transparent hover:bg-white/[0.04] text-[#52525b] hover:text-[#f0f0f0] border-transparent"
    }`;

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => toggleTab("tasks")}
        className={btnCls(isTasks)}
      >
        <CheckSquare size={11} /> <span className="hidden xl:inline">Tasks</span>
      </button>
      <button
        type="button"
        onClick={() => toggleTab("chat")}
        className={btnCls(isChat)}
      >
        <MessageSquare size={11} /> <span className="hidden xl:inline">Chat</span>
      </button>
      <button
        type="button"
        onClick={() => toggleTab("preview")}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] rounded-md transition-all whitespace-nowrap shadow-md cursor-pointer ${
          isRunning
            ? "bg-red-500/90 hover:bg-red-500 text-white"
            : "bg-[#ccff00] hover:bg-[#d9ff33] text-black"
        }`}
      >
        {isRunning ? <Square size={10} /> : <Play size={10} />}
        <span className="hidden xl:inline">{isRunning ? "Stop" : "Run"}</span>
      </button>
      <button
        type="button"
        onClick={() => toggleTab("console")}
        className={btnCls(isConsole)}
      >
        <Terminal size={11} /> <span className="hidden xl:inline">Console</span>
      </button>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// --------- MAIN COMPONENT ---------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
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
  const [pendingTemplate, setPendingTemplate] = useState(null);

  // Resizable Panels with Iframe drag protection
  const [isDraggingSplitter, setIsDraggingSplitter] = useState(false);
  const leftWidthRef = useRef(260);
  const [leftWidth, startLeftDrag] = useHorizontalSplitter(
    260,
    180,
    500,
    setIsDraggingSplitter
  );
  useEffect(() => {
    leftWidthRef.current = leftWidth;
  }, [leftWidth]);
  const [rightWidth, startRightDrag] = useRightSplitter(
    380,
    leftWidthRef,
    setIsDraggingSplitter
  );

  // Session Timer
  const sessionTime = useSessionTimer();

  // Partner / Presence
  const targetId =
    user && roomData
      ? roomData.members?.find((m) => String(m._id) !== String(user._id))?._id
      : null;
  const [isTargetUserInRoom, setIsTargetUserInRoom] = useState(false);

  // WebRTC
  const {
    localStream,
    remoteStream,
    isInCall,
    currentRoomId,
    joinCall,
    leaveCall,
    toggleMute,
    handleToggleVideo,
    isMuted,
    isVideoOff,
    isRemoteMuted,
    isRemoteVideoOff,
    isSpeaking,
    isRemoteSpeaking,
    localReactions,
    remoteReactions,
    sendReaction,
  } = useWebRTCContext();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const hasJoinedCallRef = useRef(false);

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
      const targetUser = roomData?.members?.find(
        (m) => String(m._id) === String(targetId)
      );
      joinCall(roomId, targetUser);
    }
  }, [socketConnected, isInCall, roomData, targetId, roomId, joinCall]);

  useEffect(() => {
    if (localStream && localVideoRef.current && !isVideoOff)
      localVideoRef.current.srcObject = localStream;
  }, [localStream, isInCall, isVideoOff]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current && !isRemoteVideoOff)
      remoteVideoRef.current.srcObject = remoteStream;
  }, [remoteStream, isInCall, isRemoteVideoOff]);

  // Fetch user & room data
  useEffect(() => {
    const fetchUserAndRoom = async () => {
      try {
        let currentUser = user;
        if (!currentUser) {
          const res = await axios.get(BASE_URL + "/profile/view", {
            withCredentials: true,
          });
          dispatch(addUser(res.data));
          currentUser = res.data;
        }

        const roomRes = await axios.get(BASE_URL + "/project/room/" + roomId, {
          withCredentials: true,
        });
        const data = roomRes.data.data;
        setRoomData(data);

        if (data.template) setTemplate(data.template);

        let filesToLoad = null;
        if (
          data.files &&
          typeof data.files === "object" &&
          Object.keys(data.files).length > 0
        ) {
          filesToLoad = data.files;
        } else if (data.lastCode) {
          try {
            const parsed = JSON.parse(data.lastCode);
            if (typeof parsed === "object" && !parsed.code) {
              filesToLoad = parsed;
            } else {
              filesToLoad = {
                "/App.js": { code: data.lastCode, active: true },
              };
            }
          } catch {
            filesToLoad = { "/App.js": { code: data.lastCode, active: true } };
          }
        }

        const localBackup =
          localStorage.getItem(`sandpack_code_${roomId}`) ||
          localStorage.getItem(`sandpack_files_${roomId}`);
        if (localBackup && !filesToLoad) {
          try {
            const parsedBackup = JSON.parse(localBackup);
            if (parsedBackup && Object.keys(parsedBackup).length > 0) {
              filesToLoad = parsedBackup;
            }
          } catch (e) {
            console.error("Failed to parse local backup", e);
          }
        }

        if (filesToLoad) {
          setInitialFiles(filesToLoad);
        }

        if (data.tasks) setLiveTasks(data.tasks);
      } catch (err) {
        console.error(err);
        if (err?.response?.status === 401 || err?.response?.status === 403)
          navigate("/feed");
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
      sock.emit("enterProjectRoom", {
        roomId,
        projectTitle: roomData.projectPostId?.project?.title,
      });
      sock.emit("projectRoom:ping", { roomId });
    };
    const onDisconnect = () => setSocketConnected(false);
    const onPartnerEntered = ({ userId }) => {
      if (String(userId) === String(targetId)) {
        setIsTargetUserInRoom(true);
        sock.emit("webrtc:media", {
          roomId,
          videoOff: isVideoOff,
          muted: isMuted,
        });
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
      sock.emit("enterProjectRoom", {
        roomId,
        projectTitle: roomData.projectPostId?.project?.title,
      });
      sock.emit("projectRoom:ping", { roomId });
      sock.emit("webrtc:media", {
        roomId,
        videoOff: isVideoOff,
        muted: isMuted,
      });
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
  }, [user, roomId, isInitializing, roomData, targetId, isVideoOff, isMuted]);

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
      getSocket()?.emit("room:chat_message", {
        roomId,
        message: summaryMessage,
      });
    }
    leaveCall();
    navigate("/feed");
  };

  const handleTemplateChangeRequest = (newTemplate) => {
    if (newTemplate === template) return;
    setPendingTemplate(newTemplate);
  };

  const confirmTemplateChange = () => {
    const nextTmpl = pendingTemplate;
    setPendingTemplate(null);
    setTemplate(nextTmpl);
    const sock = getSocket();
    if (sock?.connected) {
      sock.emit("saveProjectFiles", {
        roomId,
        files: DEFAULT_FILES[nextTmpl],
        template: nextTmpl,
      });
    }
    toast.success(`Template switched to ${nextTmpl}`);
  };

  // Loading
  if (isInitializing) {
    return (
      <div className="h-dvh w-full flex flex-col items-center justify-center bg-[#09090b] gap-4">
        <div className="w-10 h-10 border-2 border-[#ccff00] border-t-transparent rounded-full animate-spin" />
        <span className="text-[#52525b] text-xs font-mono uppercase tracking-widest">
          Loading workspace...
        </span>
      </div>
    );
  }

  // Derived data
  const post = roomData?.projectPostId;
  const partner = roomData?.members?.find(
    (m) => String(m._id) !== String(user._id)
  );
  const techStack = post?.project?.techStack || [];
  const isCorrectRoom = isInCall && currentRoomId === roomId;
  const filesToLoad =
    Object.keys(initialFiles).length > 0
      ? initialFiles
      : DEFAULT_FILES[template];

  const sandpackTheme = {
    colors: {
      surface1: "#111113",
      surface2: "#1a1a1f",
      surface3: "#242429",
      clickable: "#52525b",
      base: "#f0f0f0",
      disabled: "#3f3f46",
      hover: "#f0f0f0",
      accent: "#ccff00",
      error: "#ef4444",
      errorSurface: "rgba(239, 68, 68, 0.15)",
    },
    syntax: {
      plain: "#f0f0f0",
      comment: { color: "#52525b", fontStyle: "italic" },
      keyword: "#b266ff",
      tag: "#ccff00",
      punctuation: "#52525b",
      definition: "#38bdf8",
      property: "#c084fc",
      static: "#f87171",
      string: "#a3e635",
    },
    font: {
      body: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: '"JetBrains Mono", "Fira Code", monospace',
      size: "13px",
      lineHeight: "22px",
    },
  };

  const saveIcons = {
    saved: {
      icon: <Check size={10} />,
      text: "Saved",
      cls: "text-[#52525b]",
    },
    saving: {
      icon: <RefreshCw size={10} className="animate-spin" />,
      text: "Saving...",
      cls: "text-[#b266ff]",
    },
    unsaved: {
      icon: <div className="w-1.5 h-1.5 rounded-full bg-[#ccff00]" />,
      text: "Unsaved",
      cls: "text-[#ccff00]",
    },
  };

  return (
    <SandpackProvider
      template={template}
      theme={sandpackTheme}
      files={filesToLoad}
      options={{ autorun: true, autoReload: true }}
    >
      <SandpackSyncer roomId={roomId} onSaveStatusChange={setSaveStatus} />
      <ManualSaveHandler roomId={roomId} onSaveStatusChange={setSaveStatus} />

      {/* Splitter Iframe Mouse Shield */}
      {isDraggingSplitter && (
        <div className="fixed inset-0 z-[9999] cursor-col-resize select-none pointer-events-auto" />
      )}

      <div className="h-dvh w-full flex flex-col bg-[#09090b] text-[#f0f0f0] font-sans overflow-hidden select-none relative">
        <LiveCursors roomId={roomId} />

        {/* --------- HEADER --------- */}
        <header className="h-12 bg-[#111113] border-b border-white/[0.07] flex items-center justify-between px-3 z-20 shrink-0">
          {/* Left */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={handleExitRoom}
              className="p-1.5 hover:bg-white/[0.04] rounded-md text-[#52525b] hover:text-[#f0f0f0] transition-all shrink-0 cursor-pointer"
              title="Exit Room"
            >
              <ArrowLeft size={15} />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#ccff00] to-[#059669] flex items-center justify-center shrink-0">
                <Code2 className="text-black" size={12} />
              </div>
              {post?.project?.title ? (
                <span className="text-[#f0f0f0] font-semibold text-[13px] tracking-tight truncate max-w-[160px]">
                  {post.project.title}
                </span>
              ) : (
                <span className="text-[#52525b] italic font-medium text-[13px] tracking-tight truncate max-w-[160px]">
                  Untitled Workspace
                </span>
              )}
              <span
                className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-[0.1em] shrink-0 font-mono ${
                  template === "react"
                    ? "bg-[#61dafb]/10 text-[#61dafb]"
                    : template === "vue"
                    ? "bg-[#42b883]/10 text-[#42b883]"
                    : "bg-[#dd1b16]/10 text-[#dd1b16]"
                }`}
              >
                {template}
              </span>
            </div>
          </div>

          {/* Center */}
          <div className="hidden md:flex items-center gap-4">
            <div
              className={`flex items-center gap-1.5 text-[10px] ${saveIcons[saveStatus].cls} transition-colors font-mono`}
            >
              {saveIcons[saveStatus].icon}
              <span className="font-medium">{saveIcons[saveStatus].text}</span>
            </div>
            <div className="w-px h-3 bg-white/[0.07]" />
            <div className="flex items-center gap-1.5 text-[10px] text-[#52525b]">
              <Clock size={10} />
              <span className="font-mono">{sessionTime}</span>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.02]">
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  socketConnected
                    ? "bg-[#ccff00] shadow-[0_0_6px_rgba(204,255,0,0.6)]"
                    : "bg-red-500 animate-pulse"
                }`}
              />
              <span className="text-[9px] font-mono text-[#52525b] uppercase">
                {socketConnected ? "Live" : "..."}
              </span>
            </div>
            <div className="flex items-center -space-x-1.5">
              <div className="relative z-10">
                <img
                  src={user?.photoUrl || DEFAULT_AVATAR}
                  alt="Me"
                  className="w-6 h-6 rounded-full border border-[#ccff00]/60 object-cover"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-[#ccff00] rounded-full border border-[#111113]" />
              </div>
              {partner && (
                <div className="relative z-0">
                  <img
                    src={partner.photoUrl || DEFAULT_AVATAR}
                    alt={partner.firstName}
                    className={`w-6 h-6 rounded-full border object-cover transition-all ${
                      isTargetUserInRoom
                        ? "border-white/20 opacity-100"
                        : "border-transparent opacity-30 grayscale"
                    }`}
                  />
                  {isTargetUserInRoom && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-[#ccff00] rounded-full border border-[#111113]" />
                  )}
                </div>
              )}
            </div>
            <div className="w-px h-4 bg-white/[0.07] mx-0.5" />
            <HeaderButtons
              openTabs={openTabs}
              setOpenTabs={setOpenTabs}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <div className="w-px h-4 bg-white/[0.07] mx-0.5 hidden xl:block" />
            <button
              type="button"
              onClick={handleExitRoom}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white text-[9px] font-bold uppercase tracking-[0.12em] rounded-md transition-all hidden xl:flex border border-red-500/20 hover:border-red-500 cursor-pointer"
            >
              <LogOut size={11} /> Exit
            </button>
          </div>
        </header>

        {/* --------- MAIN WORKSPACE --------- */}
        <div className="flex-1 w-full flex overflow-hidden">
          {/* Activity Bar */}
          <div className="w-[46px] bg-[#09090b] border-r border-white/[0.07] flex flex-col items-center py-3 gap-1 shrink-0 z-10">
            {[
              { id: "explorer", icon: Folder },
              { id: "search", icon: Search },
              { id: "settings", icon: Settings },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeLeftTab === tab.id && isSidebarVisible;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    if (activeLeftTab === tab.id && isSidebarVisible)
                      setIsSidebarVisible(false);
                    else {
                      setActiveLeftTab(tab.id);
                      setIsSidebarVisible(true);
                    }
                  }}
                  className={`relative w-10 h-10 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? "text-[#ccff00]"
                      : "text-[#52525b] hover:text-[#f0f0f0]"
                  }`}
                  title={tab.id}
                >
                  <TabIcon size={18} />
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-[#ccff00] rounded-r-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Left Sidebar */}
          {isSidebarVisible && (
            <div
              style={{ width: leftWidth }}
              className="bg-[#111113] flex flex-col shrink-0 relative border-r border-white/[0.07]"
            >
              <div
                onMouseDown={startLeftDrag}
                className="absolute top-0 right-0 w-[3px] h-full cursor-col-resize hover:bg-[#ccff00] z-50 transition-colors"
              />
              <div className="px-4 py-3 flex items-center justify-between shrink-0">
                <span className="text-[9px] font-bold text-[#52525b] uppercase tracking-[0.15em] font-mono">
                  {activeLeftTab === "explorer"
                    ? "Explorer"
                    : activeLeftTab === "search"
                    ? "Search"
                    : "Settings"}
                </span>
              </div>

              {activeLeftTab === "explorer" && (
                <>
                  <div className="mx-3 mb-2 px-3 py-2.5 bg-[#09090b] rounded-lg border border-white/[0.07]">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-[#b266ff]/20 flex items-center justify-center shrink-0">
                        <Code2 className="text-[#b266ff]" size={11} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-[#f0f0f0] font-semibold truncate">
                          {post?.project?.title || "untitled-workspace"}
                        </p>
                        <p className="text-[9px] text-[#52525b] font-mono">
                          {Object.keys(filesToLoad).length} files
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col flex-1 min-h-0">
                    <CustomFileExplorer projectName={post?.project?.title} />
                    <DependencyManager roomId={roomId} />
                  </div>
                </>
              )}
              {activeLeftTab === "search" && <SearchPanel />}
              {activeLeftTab === "settings" && (
                <SettingsPanel
                  post={post}
                  techStack={techStack}
                  template={template}
                  onTemplateChange={handleTemplateChangeRequest}
                  sessionTime={sessionTime}
                  roomId={roomId}
                  roomData={roomData}
                  user={user}
                  navigate={navigate}
                  setRoomData={setRoomData}
                />
              )}
            </div>
          )}

          {/* Sandpack Workspace */}
          <div className="flex-1 h-full relative flex min-w-0">
            <div
              style={{
                display: "flex",
                width: "100%",
                height: "100%",
                minWidth: 0,
              }}
            >
              {/* Code Editor */}
              <div className="flex-1 flex flex-col relative min-w-0 bg-[#09090b]">
                <SandpackCodeEditor
                  showLineNumbers
                  showTabs
                  closableTabs
                  showInlineErrors
                  showRunButton={false}
                  style={{ flex: 1, height: "100%", minWidth: 0 }}
                />
              </div>

              {/* Right Panel */}
              <div
                style={{
                  width: rightWidth,
                  maxWidth: `calc(100vw - ${
                    (isSidebarVisible ? leftWidth : 0) + 150
                  }px)`,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  flexShrink: 0,
                  position: "relative",
                  background: "#111113",
                  borderLeft: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div
                  onMouseDown={startRightDrag}
                  className="absolute top-0 left-0 w-[3px] h-full cursor-col-resize hover:bg-[#ccff00] z-50 transition-colors"
                />

                {/* Camera Feed */}
                {isCorrectRoom ? (
                  <div
                    style={{
                      flex: "0 0 auto",
                      height: isVideoExpanded
                        ? openTabs.length > 0
                          ? "240px"
                          : "280px"
                        : "36px",
                      borderBottom: "1px solid rgba(255,255,255,0.07)",
                      overflow: "hidden",
                      background: "#09090b",
                      display: "flex",
                      flexDirection: "column",
                      transition: "height 0.3s ease",
                    }}
                  >
                    <div
                      className="px-3 py-2 border-b border-white/[0.07] bg-[#111113] flex items-center justify-between shrink-0 cursor-pointer hover:bg-white/[0.02] transition-colors"
                      onClick={() => setIsVideoExpanded(!isVideoExpanded)}
                    >
                      <span className="text-[9px] font-bold text-[#52525b] uppercase tracking-[0.15em] flex items-center gap-2 font-mono">
                        <Video size={10} className="text-[#52525b]" /> Camera
                      </span>
                      {isVideoExpanded ? (
                        <ChevronUp className="text-[#52525b]" size={12} />
                      ) : (
                        <ChevronDown className="text-[#52525b]" size={12} />
                      )}
                    </div>
                    {isVideoExpanded && (
                      <div
                        className={`flex-1 w-full p-2 flex gap-2 ${
                          openTabs.length > 0 ? "flex-row" : "flex-col"
                        } items-stretch justify-center`}
                      >
                        {remoteStream && (
                          <div
                            className={`relative flex-1 bg-[#111113] rounded-xl overflow-hidden border transition-all duration-300 ${
                              isRemoteSpeaking
                                ? "border-[#ccff00]/60"
                                : "border-white/[0.07]"
                            }`}
                            style={{ minHeight: "80px" }}
                          >
                            {!isRemoteVideoOff ? (
                              <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                {partner?.photoUrl ? (
                                  <img
                                    src={partner.photoUrl}
                                    alt="Partner"
                                    className="w-12 h-12 rounded-full object-cover border border-white/10"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#b266ff] to-[#7c3aed] flex items-center justify-center text-white font-bold text-sm border border-white/10 shadow-lg">
                                    {(
                                      partner?.firstName?.[0] || "P"
                                    ).toUpperCase()}
                                  </div>
                                )}
                              </div>
                            )}
                            {isRemoteSpeaking && (
                              <div className="absolute bottom-1.5 right-1.5 pointer-events-none flex items-center gap-[2px] h-4 opacity-80">
                                {[40, 100, 60, 80, 50].map((h, i) => (
                                  <div
                                    key={i}
                                    className="w-[2px] bg-[#ccff00] rounded-full animate-[waveform_1s_infinite_ease-in-out]"
                                    style={{
                                      height: `${h}%`,
                                      animationDelay: `${i * 0.15}s`,
                                    }}
                                  />
                                ))}
                              </div>
                            )}
                            {remoteReactions?.length > 0 && (
                              <div className="absolute top-2 right-2 animate-[fadeInOut_2s_ease-out_forwards] pointer-events-none z-30">
                                {renderReactionBadge(
                                  remoteReactions[remoteReactions.length - 1]
                                    .emoji
                                )}
                              </div>
                            )}
                            <div className="absolute bottom-1.5 left-1.5 bg-[#09090b]/80 backdrop-blur-sm px-1.5 py-0.5 rounded-md flex items-center gap-1.5">
                              <span className="text-[#f0f0f0] text-[9px] font-medium truncate">
                                {partner?.firstName || "Partner"}
                              </span>
                              {isRemoteMuted && (
                                <MicOff size={8} className="text-red-400 shrink-0" />
                              )}
                            </div>
                          </div>
                        )}
                        {localStream && (
                          <div
                            className={`relative flex-1 bg-[#111113] rounded-xl overflow-hidden border group transition-all duration-300 ${
                              isSpeaking
                                ? "border-[#ccff00]/60"
                                : "border-white/[0.07]"
                            }`}
                            style={{ minHeight: "80px" }}
                          >
                            {!isVideoOff ? (
                              <video
                                ref={localVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover scale-x-[-1]"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                {user?.photoUrl ? (
                                  <img
                                    src={user.photoUrl}
                                    alt="You"
                                    className="w-12 h-12 rounded-full object-cover border border-[#ccff00]/30"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ccff00] to-[#059669] flex items-center justify-center text-black font-bold text-sm border border-[#ccff00]/30 shadow-lg">
                                    {(user?.firstName?.[0] || "U").toUpperCase()}
                                  </div>
                                )}
                              </div>
                            )}
                            {isSpeaking && (
                              <div className="absolute bottom-1.5 right-1.5 pointer-events-none flex items-center gap-[2px] h-4 opacity-80">
                                {[40, 100, 60, 80, 50].map((h, i) => (
                                  <div
                                    key={i}
                                    className="w-[2px] bg-[#ccff00] rounded-full animate-[waveform_1s_infinite_ease-in-out]"
                                    style={{
                                      height: `${h}%`,
                                      animationDelay: `${i * 0.15}s`,
                                    }}
                                  />
                                ))}
                              </div>
                            )}
                            {localReactions?.length > 0 && (
                              <div className="absolute top-2 right-2 animate-[fadeInOut_2s_ease-out_forwards] pointer-events-none z-30">
                                {renderReactionBadge(
                                  localReactions[localReactions.length - 1].emoji
                                )}
                              </div>
                            )}
                            <div className="absolute bottom-1.5 left-1.5 bg-[#09090b]/80 backdrop-blur-sm px-1.5 py-0.5 rounded-md flex items-center gap-1.5 group-hover:opacity-0 transition-opacity">
                              <span className="text-[#f0f0f0] text-[9px] font-medium truncate">
                                {user?.firstName} (You)
                              </span>
                              {isMuted && (
                                <MicOff size={8} className="text-red-400 shrink-0" />
                              )}
                            </div>
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              {showReactions && (
                                <div className="absolute bottom-[calc(50%+24px)] flex items-center gap-1.5 bg-[#1a1a1f]/95 backdrop-blur-md p-1.5 rounded-full border border-white/[0.07] shadow-2xl z-40">
                                  {REACTIONS.map((r) => {
                                    const ReactionIcon = r.icon;
                                    return (
                                      <button
                                        key={r.id}
                                        type="button"
                                        onClick={() => {
                                          sendReaction(r.id);
                                          setShowReactions(false);
                                        }}
                                        className="p-1.5 rounded-full hover:bg-white/[0.06] text-[#ccff00] hover:scale-110 transition-all cursor-pointer"
                                        title={r.label}
                                      >
                                        <ReactionIcon className="w-4 h-4" />
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                              <div className="flex items-center gap-1.5 bg-[#111113]/90 backdrop-blur-xl px-2.5 py-1.5 rounded-full border border-white/[0.07] shadow-2xl">
                                <button
                                  type="button"
                                  onClick={toggleMute}
                                  className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                                    isMuted
                                      ? "bg-red-500 text-white"
                                      : "bg-[#1a1a1f] hover:bg-white/10 text-[#f0f0f0]"
                                  }`}
                                >
                                  {isMuted ? <MicOff size={12} /> : <Mic size={12} />}
                                </button>
                                <button
                                  type="button"
                                  onClick={handleToggleVideo}
                                  className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                                    isVideoOff
                                      ? "bg-red-500 text-white"
                                      : "bg-[#1a1a1f] hover:bg-white/10 text-[#f0f0f0]"
                                  }`}
                                >
                                  {isVideoOff ? (
                                    <VideoOff size={12} />
                                  ) : (
                                    <Video size={12} />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setShowReactions(!showReactions)}
                                  className="p-1.5 rounded-full bg-[#1a1a1f] hover:bg-white/10 text-[#ccff00] transition-colors cursor-pointer"
                                >
                                  <Smile size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={leaveCall}
                                  className="p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors cursor-pointer"
                                >
                                  <PhoneOff size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full shrink-0 p-3 border-b border-white/[0.07] bg-[#09090b]">
                    <div className="bg-[#111113] border border-white/[0.07] rounded-xl p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-white/[0.04] rounded-lg flex items-center justify-center shrink-0">
                          <VideoOff className="text-[#52525b]" size={16} />
                        </div>
                        <div>
                          <h4 className="text-[#f0f0f0] font-semibold text-xs">
                            Camera Disconnected
                          </h4>
                          <p className="text-[#52525b] text-[10px]">
                            Voice call ended
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const tu = roomData?.members?.find(
                            (m) => String(m._id) === String(targetId)
                          );
                          joinCall(roomId, tu);
                        }}
                        className="bg-[#ccff00] hover:bg-[#d9ff33] text-black px-3.5 py-1.5 rounded-lg font-bold text-[10px] transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <PhoneOff size={12} className="rotate-[135deg]" /> Rejoin
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab Content Area */}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 0,
                    backgroundColor:
                      openTabs.length === 0 ? "#09090b" : "transparent",
                  }}
                >
                  {openTabs.length > 0 ? (
                    <>
                      <div className="flex items-center border-b border-white/[0.07] bg-[#111113] shrink-0 overflow-x-auto custom-scrollbar">
                        {openTabs.map((tabId) => (
                          <div
                            key={tabId}
                            onClick={() => setActiveTab(tabId)}
                            className={`group flex items-center gap-1.5 px-3 py-2 cursor-pointer border-b-2 transition-all text-[10px] font-mono ${
                              activeTab === tabId
                                ? "border-b-[#ccff00] text-[#ccff00]"
                                : "border-b-transparent text-[#52525b] hover:text-[#f0f0f0] hover:bg-white/[0.02]"
                            }`}
                          >
                            {tabId === "preview" && (
                              <Globe
                                size={10}
                                className={
                                  activeTab === tabId ? "text-[#ccff00]" : ""
                                }
                              />
                            )}
                            {tabId === "console" && (
                              <Terminal
                                size={10}
                                className={
                                  activeTab === tabId ? "text-[#10b981]" : ""
                                }
                              />
                            )}
                            {tabId === "tasks" && (
                              <CheckSquare
                                size={10}
                                className={
                                  activeTab === tabId ? "text-[#ccff00]" : ""
                                }
                              />
                            )}
                            {tabId === "chat" && (
                              <MessageSquare
                                size={10}
                                className={
                                  activeTab === tabId ? "text-[#b266ff]" : ""
                                }
                              />
                            )}
                            <span className="font-semibold uppercase tracking-[0.1em]">
                              {tabId === "preview"
                                ? "Preview"
                                : tabId === "console"
                                ? "Console"
                                : tabId === "tasks"
                                ? "Tasks"
                                : "Chat"}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const nt = openTabs.filter((t) => t !== tabId);
                                setOpenTabs(nt);
                                if (activeTab === tabId)
                                  setActiveTab(
                                    nt.length > 0 ? nt[nt.length - 1] : null
                                  );
                              }}
                              className="p-0.5 rounded hover:bg-white/[0.06] text-[#52525b] hover:text-[#f0f0f0] transition-colors opacity-0 group-hover:opacity-100 ml-1 cursor-pointer"
                            >
                              <X size={9} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div
                        style={{
                          flex: 1,
                          position: "relative",
                          minHeight: 0,
                          background: "#09090b",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        {(openTabs.includes("preview") ||
                          openTabs.includes("console")) && (
                          <div
                            style={{
                              display:
                                activeTab === "preview" ? "flex" : "none",
                              flexDirection: "column",
                              width: "100%",
                              height: "100%",
                              flex: 1,
                            }}
                          >
                            <PreviewControls roomId={roomId} />
                            <SandpackPreview
                              showOpenInCodeSandbox={false}
                              showRefreshButton={false}
                              style={{
                                flex: 1,
                                width: "100%",
                                height: "100%",
                              }}
                            />
                          </div>
                        )}
                        {openTabs.includes("console") && (
                          <div
                            style={{
                              display:
                                activeTab === "console" ? "flex" : "none",
                              flexDirection: "column",
                              width: "100%",
                              height: "100%",
                              flex: 1,
                              overflow: "hidden",
                            }}
                          >
                            <CustomTerminal template={template} />
                          </div>
                        )}
                        {openTabs.includes("tasks") && (
                          <div
                            style={{
                              display: activeTab === "tasks" ? "block" : "none",
                              width: "100%",
                              height: "100%",
                              flex: 1,
                              overflow: "auto",
                            }}
                          >
                            <TaskList
                              roomId={roomId}
                              initialTasks={roomData?.tasks || []}
                              onTasksChange={setLiveTasks}
                            />
                          </div>
                        )}
                        {openTabs.includes("chat") && (
                          <div
                            style={{
                              display: activeTab === "chat" ? "flex" : "none",
                              flexDirection: "column",
                              width: "100%",
                              height: "100%",
                              flex: 1,
                            }}
                          >
                            <TeamChat
                              roomId={roomId}
                              initialChats={roomData?.chats || []}
                            />
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-0">
                      <div className="w-full max-w-sm flex flex-col items-center text-center">
                        <div className="w-11 h-11 bg-white/[0.03] rounded-2xl flex items-center justify-center mb-4 border border-white/[0.07]">
                          <Terminal className="text-[#52525b]" size={18} />
                        </div>
                        <h3 className="text-[#f0f0f0] font-semibold text-sm mb-1">
                          Open a panel
                        </h3>
                        <p className="text-[#52525b] text-[11px] mb-5">
                          Select a tool to launch
                        </p>
                        <div className="grid grid-cols-2 gap-2 w-full">
                          {[
                            {
                              id: "preview",
                              icon: Globe,
                              label: "Preview",
                              color: "#ccff00",
                            },
                            {
                              id: "console",
                              icon: Terminal,
                              label: "Console",
                              color: "#10b981",
                            },
                            {
                              id: "tasks",
                              icon: CheckSquare,
                              label: "Tasks",
                              color: "#ccff00",
                            },
                            {
                              id: "chat",
                              icon: MessageSquare,
                              label: "Chat",
                              color: "#b266ff",
                            },
                          ].map((item) => {
                            const PanelIcon = item.icon;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                  if (!openTabs.includes(item.id))
                                    setOpenTabs((p) => [...p, item.id]);
                                  setActiveTab(item.id);
                                }}
                                className="flex items-center gap-2.5 bg-[#111113] hover:bg-white/[0.03] p-3 rounded-xl border border-white/[0.07] transition-all hover:border-white/20 group text-left cursor-pointer"
                              >
                                <div
                                  className="p-1.5 rounded-lg group-hover:scale-110 transition-transform"
                                  style={{
                                    backgroundColor: `${item.color}15`,
                                  }}
                                >
                                  <PanelIcon
                                    style={{ color: item.color }}
                                    size={14}
                                  />
                                </div>
                                <span className="text-[#52525b] group-hover:text-[#f0f0f0] font-semibold text-[11px]">
                                  {item.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --------- STATUS BAR --------- */}
        <div className="h-6 bg-[#111113] border-t border-white/[0.07] flex items-center justify-between px-3 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <span
              className={`text-[9px] font-bold uppercase tracking-[0.1em] px-1.5 py-0.5 rounded font-mono ${
                template === "react"
                  ? "bg-[#61dafb]/10 text-[#61dafb]"
                  : template === "vue"
                  ? "bg-[#42b883]/10 text-[#42b883]"
                  : "bg-[#dd1b16]/10 text-[#dd1b16]"
              }`}
            >
              {template}
            </span>
            <span className="text-[9px] text-[#52525b] font-mono">
              {post?.project?.title || "untitled-workspace"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[9px] text-[#52525b] flex items-center gap-1 font-mono">
              <Clock size={9} /> {sessionTime}
            </span>
            <div className="flex items-center gap-1.5 font-mono">
              {socketConnected ? (
                <Wifi size={9} className="text-[#ccff00]" />
              ) : (
                <WifiOff size={9} className="text-red-500" />
              )}
              <span className="text-[9px] text-[#52525b]">
                {socketConnected ? "Connected" : "Offline"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* --------- TEMPLATE CHANGE MODAL --------- */}
      {pendingTemplate && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111113] border border-white/[0.07] rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl">
            <div className="w-12 h-12 bg-[#ccff00]/10 border border-[#ccff00]/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Code2 className="w-6 h-6 text-[#ccff00]" />
            </div>
            <h3 className="text-sm font-bold text-[#f0f0f0] mb-1">
              Switch Template?
            </h3>
            <p className="text-xs text-[#52525b] mb-4">
              Switching template to {pendingTemplate.toUpperCase()} will reset
              your project files to the default template.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPendingTemplate(null)}
                className="flex-1 py-2 rounded-lg border border-white/[0.07] text-xs font-medium text-[#f0f0f0] hover:bg-white/[0.04] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmTemplateChange}
                className="flex-1 py-2 rounded-lg bg-[#ccff00] text-black text-xs font-bold hover:bg-[#d9ff33] cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------- EXIT MODAL --------- */}
      {isExiting && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111113] border border-white/[0.07] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-[fadeInUp_0.2s_ease-out]">
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                <LogOut className="text-red-400 ml-0.5" size={22} />
              </div>
              <h2 className="text-[#f0f0f0] text-lg font-bold mb-1.5">
                End Session?
              </h2>
              <p className="text-[#52525b] text-xs mb-5">
                Your work is auto-saved. You can rejoin anytime.
              </p>
              <div className="bg-[#09090b] rounded-xl p-4 border border-white/[0.07] mb-5 text-left">
                <div className="flex flex-col mb-3">
                  <span className="text-[#52525b] text-[9px] font-bold uppercase tracking-[0.15em] mb-0.5 font-mono">
                    Project
                  </span>
                  <span className="text-[#f0f0f0] font-semibold text-sm truncate">
                    {post?.project?.title || "Project Room"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#111113] rounded-lg p-2.5 border border-white/[0.07]">
                    <span className="block text-[#52525b] text-[8px] font-bold uppercase tracking-[0.15em] mb-1 font-mono">
                      Tasks
                    </span>
                    <span className="text-[#f0f0f0] font-bold text-base leading-none font-mono">
                      {liveTasks.filter((t) => t.completed).length}
                    </span>
                    <span className="text-[#52525b] text-[10px] font-medium font-mono">
                      /{liveTasks.length}
                    </span>
                  </div>
                  <div className="bg-[#111113] rounded-lg p-2.5 border border-white/[0.07]">
                    <span className="block text-[#52525b] text-[8px] font-bold uppercase tracking-[0.15em] mb-1 font-mono">
                      Duration
                    </span>
                    <span className="text-[#f0f0f0] font-bold text-xs leading-none font-mono">
                      {sessionTime}
                    </span>
                  </div>
                  <div className="bg-[#111113] rounded-lg p-2.5 border border-white/[0.07]">
                    <span className="block text-[#52525b] text-[8px] font-bold uppercase tracking-[0.15em] mb-1 font-mono">
                      Members
                    </span>
                    <span className="text-[#f0f0f0] font-bold text-base leading-none font-mono">
                      {roomData?.members?.length || 1}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsExiting(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/[0.07] text-[#f0f0f0] font-semibold text-xs hover:bg-white/[0.04] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmExit}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-xs transition-colors shadow-lg cursor-pointer"
                >
                  Exit Room
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SandpackProvider>
  );
};

export default ProjectRoom;
