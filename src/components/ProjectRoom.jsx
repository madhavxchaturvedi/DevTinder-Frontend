import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { addUser } from "../redux/userSlice";
import { 
  FiFolder, FiSearch, FiSettings, FiMenu, FiX, FiPlay, FiSquare, FiMaximize2, FiMinimize2,
  FiTerminal, FiGlobe, FiChevronRight, FiChevronDown, FiFile, FiRefreshCw, FiExternalLink,
  FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneOff, FiMoreHorizontal, FiMonitor, FiSmile,
  FiArrowLeft, FiCode, FiShare2, FiSave, FiInfo, FiCheckSquare, FiMessageCircle
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

// --- Splitter Hooks ---
const useLeftSplitter = (initialWidth) => {
  const [width, setWidth] = useState(initialWidth);
  const startDrag = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = width;
    const onMouseMove = (moveEvent) => {
      const delta = moveEvent.clientX - startX;
      setWidth(Math.max(150, Math.min(600, startWidth + delta)));
    };
    const onMouseUp = () => {
      document.body.style.cursor = "default";
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    document.body.style.cursor = "col-resize";
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };
  return [width, startDrag];
};

const useRightSplitter = (initialWidth, leftWidthRef) => {
  const [width, setWidth] = useState(initialWidth);
  const startDrag = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = width;
    const onMouseMove = (moveEvent) => {
      const delta = startX - moveEvent.clientX;
      const currentLeftWidth = leftWidthRef?.current || 260;
      const maxWidth = window.innerWidth - currentLeftWidth - 150; // Leave space for activity bar and editor
      setWidth(Math.max(250, Math.min(maxWidth, startWidth + delta)));
    };
    const onMouseUp = () => {
      document.body.style.cursor = "default";
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    document.body.style.cursor = "col-resize";
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };
  return [width, startDrag];
};

// --- Sandpack Syncer ---
const SandpackSyncer = ({ roomId }) => {
  const { sandpack } = useSandpack();
  const isRemoteUpdate = useRef(false);

  useEffect(() => {
    const sock = getSocket();
    if (!sock) return;

    const handleReceiveFiles = ({ files }) => {
      isRemoteUpdate.current = true;
      Object.keys(files).forEach((path) => {
        if (sandpack.files[path]?.code !== files[path].code) {
          sandpack.updateFile(path, files[path].code);
        }
      });
    };

    sock.on("codeChange", handleReceiveFiles);
    return () => sock.off("codeChange", handleReceiveFiles);
  }, [sandpack]);

  useEffect(() => {
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }
    const sock = getSocket();
    if (sock?.connected) {
      const activeFile = sandpack.activeFile;
      const code = sandpack.files[activeFile].code;
      sock.emit("codeChange", { roomId, files: { [activeFile]: { code } } });
      
      // Also instantly sync to any open preview tabs via localStorage
      localStorage.setItem(`sandpack_code_${roomId}`, code);
    }
  }, [sandpack.files, roomId]);

  useEffect(() => {
    const interval = setInterval(() => {
      const sock = getSocket();
      if (sock?.connected) {
        const activeFile = sandpack.activeFile;
        const code = sandpack.files[activeFile].code;
        sock.emit("saveProjectState", { roomId, code, language: "javascript" });
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [sandpack.files, roomId]);

  return null;
};

// Global Header Buttons that sit inside SandpackProvider
// Global Header Buttons that sit inside SandpackProvider
const GlobalHeaderButtons = ({ openTabs, setOpenTabs, activeTab, setActiveTab, roomId }) => {
  const isRunning = openTabs.includes("preview");
  const isConsole = openTabs.includes("console");

  const isTasks = openTabs.includes("tasks");
  const isChat = openTabs.includes("chat");

  const toggleTab = (tabId) => {
    if (openTabs.includes(tabId)) {
      // Close it
      const newTabs = openTabs.filter(t => t !== tabId);
      setOpenTabs(newTabs);
      if (activeTab === tabId) setActiveTab(newTabs.length > 0 ? newTabs[newTabs.length - 1] : null);
    } else {
      // Open it
      setOpenTabs([...openTabs, tabId]);
      setActiveTab(tabId);
    }
  };

  return (
    <div className="flex items-center gap-2 ml-2">
      <button 
        onClick={() => toggleTab("tasks")}
        className={`flex items-center gap-1.5 px-3 py-1.5 ${isTasks ? 'bg-white/20 text-white' : 'bg-[#0d0d0e] hover:bg-white/10 text-[#737373] hover:text-[#e1e1e3]'} border border-white/5 text-[10px] font-bold uppercase tracking-widest rounded transition-all whitespace-nowrap`}
      >
        <FiCheckSquare size={12} />
        <span className="hidden xl:inline">Tasks</span>
      </button>

      <button 
        onClick={() => toggleTab("chat")}
        className={`flex items-center gap-1.5 px-3 py-1.5 ${isChat ? 'bg-white/20 text-white' : 'bg-[#0d0d0e] hover:bg-white/10 text-[#737373] hover:text-[#e1e1e3]'} border border-white/5 text-[10px] font-bold uppercase tracking-widest rounded transition-all whitespace-nowrap`}
      >
        <FiMessageCircle size={12} />
        <span className="hidden xl:inline">Chat</span>
      </button>

      {/* RUN / STOP TOGGLE */}
      <button 
        onClick={() => toggleTab("preview")}
        className={`flex items-center gap-1.5 px-3 py-1.5 ${isRunning ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-[#ccff00] hover:bg-[#bbf000] text-[#141415]'} text-[10px] font-bold uppercase tracking-widest rounded transition-all shadow-lg whitespace-nowrap`}
      >
        {isRunning ? <FiGlobe size={12} /> : <FiPlay size={12} />} 
        <span className="hidden xl:inline">{isRunning ? "Stop" : "Run"}</span>
      </button>

      {/* TERMINAL TOGGLE */}
      <button 
        onClick={() => toggleTab("console")}
        className={`flex items-center gap-1.5 px-3 py-1.5 ${isConsole ? 'bg-white/20 text-white' : 'bg-[#0d0d0e] hover:bg-white/10 text-[#737373] hover:text-[#e1e1e3]'} border border-white/5 text-[10px] font-bold uppercase tracking-widest rounded transition-all whitespace-nowrap`}
      >
        <FiTerminal size={12} />
        <span className="hidden xl:inline">Terminal</span>
      </button>
    </div>
  );
};

// Custom button that opens our standalone FullscreenPreview route in a new tab
const CustomOpenBrowserButton = ({ roomId }) => {
  const { sandpack } = useSandpack();
  
  return (
    <div className="absolute top-2 right-2 z-50 flex items-center gap-2">
      {/* Small Refresh Button overlay on preview */}
      <button 
        onClick={() => {
           const activeFile = sandpack.activeFile;
           if (activeFile && sandpack.files[activeFile]) {
              sandpack.updateFile(activeFile, sandpack.files[activeFile].code + "\n/* trigger-refresh */");
              setTimeout(() => {
                 sandpack.updateFile(activeFile, sandpack.files[activeFile].code.replace("\n/* trigger-refresh */", ""));
              }, 50);
           }
        }}
        className="p-2 bg-[#1a1a1c]/80 hover:bg-[#bbf000] text-[#e1e1e3] hover:text-[#141415] rounded-md transition-colors shadow-lg backdrop-blur-sm group"
        title="Refresh Preview"
      >
        <FiRefreshCw size={14} /> 
      </button>
      
      {/* Open in New Tab */}
      <button 
        onClick={() => {
          const activeFile = sandpack.activeFile;
          if (activeFile && sandpack.files[activeFile]) {
             localStorage.setItem(`sandpack_code_${roomId}`, sandpack.files[activeFile].code);
          }
          window.open(`/project/preview/${roomId}`, "_blank");
        }}
        className="p-2 bg-[#1a1a1c]/80 hover:bg-[#a855f7] text-[#e1e1e3] hover:text-white rounded-md transition-colors shadow-lg backdrop-blur-sm group"
        title="Open Preview in New Tab"
      >
        <FiExternalLink size={14} /> 
      </button>
    </div>
  );
};

const ProjectRoom = () => {
  const { roomId } = useParams();
  const user = useSelector((store) => store.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isInitializing, setIsInitializing] = useState(true);
  const [openTabs, setOpenTabs] = useState([]); // Array of strings: ['preview', 'console']
  const [activeTab, setActiveTab] = useState(null); // 'preview' | 'console' | null
  const [socketConnected, setSocketConnected] = useState(false);
  const [roomData, setRoomData] = useState(null);
  const [initialFiles, setInitialFiles] = useState({});

  // UI State
  const [activeLeftTab, setActiveLeftTab] = useState("explorer"); // 'explorer', 'search', 'settings'
  const [searchQuery, setSearchQuery] = useState("");
  
  // Resizable Panels
  const leftWidthRef = useRef(260);
  const [leftWidth, startLeftDrag] = useLeftSplitter(260);
  useEffect(() => {
    leftWidthRef.current = leftWidth;
  }, [leftWidth]);
  const [rightWidth, startRightDrag] = useRightSplitter(380, leftWidthRef);

  const targetId = user && roomData ? roomData.members.find((m) => String(m._id) !== String(user._id))?._id : null;
  const [isTargetUserInRoom, setIsTargetUserInRoom] = useState(false);

  const { 
    localStream, remoteStream, isInCall, currentRoomId, 
    joinCall, leaveCall, toggleMute, handleToggleVideo, 
    isMuted, isVideoOff, isRemoteMuted, isRemoteVideoOff, isSpeaking, isRemoteSpeaking,
    localReaction, remoteReaction, sendReaction
  } = useWebRTCContext();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const hasJoinedCallRef = useRef(false);

  const EMOJIS = ["👍", "🔥", "🚀", "💡", "😂"];
  const [showReactions, setShowReactions] = useState(false);

  useEffect(() => {
    if (socketConnected && !hasJoinedCallRef.current && !isInCall) {
      hasJoinedCallRef.current = true;
      const targetUser = roomData?.members?.find(m => String(m._id) === String(targetId));
      joinCall(roomId, targetUser);
    }
  }, [socketConnected, isInCall, roomData, targetId, roomId, joinCall]);

  useEffect(() => {
    if (localStream && localVideoRef.current && !isVideoOff) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, isInCall, isVideoOff]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current && !isRemoteVideoOff) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, isInCall, isRemoteVideoOff]);

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

        if (data.files) {
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
      } catch (err) {
        console.error(err);
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          navigate("/feed");
        }
      } finally {
        setIsInitializing(false);
      }
    };
    fetchUserAndRoom();
  }, [user, dispatch, navigate, roomId]);

  useEffect(() => {
    if (isInitializing || !user || !roomId || !roomData) return;

    const sock = getSocket(BASE_URL);

    sock.on("connect", () => {
      setSocketConnected(true);
      sock.emit("enterProjectRoom", { roomId, projectTitle: roomData.projectPostId?.project?.title });
      sock.emit("projectRoom:ping", { roomId });
    });

    sock.on("disconnect", () => {
      setSocketConnected(false);
    });

    sock.on("partnerEnteredRoom", ({ userId }) => {
      if (String(userId) === String(targetId)) {
        setIsTargetUserInRoom(true);
        sock.emit("webrtc:media", { roomId, videoOff: isVideoOff, muted: isMuted });
      }
    });

    sock.on("partnerLeftRoom", ({ userId }) => {
      if (String(userId) === String(targetId)) setIsTargetUserInRoom(false);
    });
    
    sock.on("projectRoom:ping", ({ fromSocketId, userId }) => {
      sock.emit("projectRoom:pong", { targetSocketId: fromSocketId });
      if (String(userId) === String(targetId)) setIsTargetUserInRoom(true);
    });
    
    sock.on("projectRoom:pong", ({ userId }) => {
      if (String(userId) === String(targetId)) setIsTargetUserInRoom(true);
    });

    if (sock.connected) {
      setSocketConnected(true);
      sock.emit("enterProjectRoom", { roomId, projectTitle: roomData.projectPostId?.project?.title });
      sock.emit("projectRoom:ping", { roomId });
      sock.emit("webrtc:media", { roomId, videoOff: isVideoOff, muted: isMuted });
    }

    return () => {
      if (sock.connected) {
        sock.emit("leaveProjectRoom", { roomId });
      }
      sock.off("connect");
      sock.off("disconnect");
      sock.off("partnerEnteredRoom");
      sock.off("partnerLeftRoom");
      sock.off("projectRoom:ping");
      sock.off("projectRoom:pong");
    };
  }, [user, roomId, isInitializing, roomData, targetId]);

  const handleLeaveRoom = () => {
    const completedTasks = roomData?.tasks?.filter(t => t.completed).length || 0;
    const totalTasks = roomData?.tasks?.length || 0;
    
    if (totalTasks > 0) {
      const summaryMessage = {
        _id: Math.random().toString(36).substring(7),
        senderId: { _id: "system" },
        text: `Session ended. ${completedTasks}/${totalTasks} tasks completed.`,
        type: 'system',
        createdAt: new Date()
      };
      getSocket()?.emit('room:chat_message', { roomId, message: summaryMessage });
    }

    leaveCall();
    navigate("/feed");
  };

  if (isInitializing) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#18181b]">
        <div className="w-10 h-10 border-2 border-[#a855f7] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const post = roomData?.projectPostId;
  const partner = roomData?.members.find((m) => String(m._id) !== String(user._id));
  const techStack = post?.project?.techStack || [];

  // ROOT CAUSE FIX:
  // The database saved files from a NODEBOX (Node.js) session: index.js, public/, styles.css etc.
  // These files are INCOMPATIBLE with the React template and silently crash the Sandpack bundler.
  // 
  // SOLUTION: Always start from a CLEAN React template. Only recover the user's App.js code from DB.
  // This guarantees the preview always boots, no matter what template was used before.
  const savedAppCode = 
    initialFiles["/App.js"]?.code || 
    initialFiles["App.js"]?.code || 
    initialFiles["/src/App.js"]?.code ||
    null;

  const cleanFiles = {
    "/App.js": {
      code: savedAppCode || `export default function App() {
  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1 style={{ color: "#a855f7" }}>Hello, CodeSphere! 🚀</h1>
      <p style={{ color: "#ccc" }}>Your collaborative environment is ready. Start coding!</p>
    </div>
  );
}`,
      active: true,
    },
  };

  const isCorrectRoom = isInCall && currentRoomId === roomId;

  // Custom Sandpack theme matching the CodeSphere design (Deep gray/purple accents)
  const customSandpackTheme = {
    colors: {
      surface1: "#141415", // Editor bg
      surface2: "#1a1a1c", // Sidebar bg
      surface3: "#222224", // Tab inactive bg
      clickable: "#737373",
      base: "#e1e1e3",
      disabled: "#404040",
      hover: "#ffffff",
      accent: "#a855f7", // Purple accent
      error: "#ff7b72",
      errorSurface: "#ff7b721a",
    },
    syntax: {
      plain: "#e1e1e3",
      comment: { color: "#737373", fontStyle: "italic" },
      keyword: "#a855f7", // Purple
      tag: "#ccff00",     // Neon Green
      punctuation: "#737373",
      definition: "#79c0ff",
      property: "#d2a8ff",
      static: "#ff7b72",
      string: "#a5d6ff",
    },
    font: {
      body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      mono: '"JetBrains Mono", "Fira Code", monospace',
      size: "13px",
      lineHeight: "22px",
    },
  };

  return (
    <SandpackProvider
      template="react"
      theme={customSandpackTheme}
      files={cleanFiles}
      options={{ autorun: true, autoReload: true }}
    >
      <SandpackSyncer roomId={roomId} />
      <div className="h-screen w-full flex flex-col bg-[#141415] text-[#e1e1e3] font-sans overflow-hidden">
      
      {/* CodeSphere Style Header */}
      <header className="h-14 bg-[#1a1a1c] border-b border-white/5 flex items-center justify-between px-4 z-20 shrink-0 w-full">
        
        {/* Left: Logo Area */}
        <div className="flex items-center gap-4 w-[280px]">
          <button onClick={() => navigate(-1)} className="text-[#737373] hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors">
            <FiArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-[#a855f7] to-[#8b5cf6] flex items-center justify-center shadow-lg">
              <FiCode className="text-white" size={12} />
            </div>
            <span className="text-white font-bold tracking-tight text-[15px]">CodeSphere</span>
          </div>
        </div>

        {/* Center: Empty Space for layout balance */}
        <div className="hidden md:flex items-center justify-center flex-1">
        </div>

        {/* Right: Avatars & Action Buttons */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-1.5 bg-[#0d0d0e] rounded-full border border-white/5 px-2 py-1">
            <div className={`w-2 h-2 rounded-full ${socketConnected ? "bg-[#ccff00]" : "bg-red-500 animate-pulse"}`} />
            <span className="text-[10px] font-mono text-[#a3a3a3] uppercase pr-2">
              {socketConnected ? "Main" : "Connecting"}
            </span>
          </div>

          <div className="w-[1px] h-4 bg-white/10 mx-1" />

          {/* Avatars */}
          <div className="flex items-center -space-x-2">
            <div className="relative z-10 group">
              <img src={user?.photoUrl} alt="Me" className="w-7 h-7 rounded-full border-[1.5px] border-[#a855f7] object-cover" />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#ccff00] rounded-full border-[1.5px] border-[#1a1a1c]" />
            </div>
            {partner && (
              <div className="relative z-0 group transition-all">
                <img 
                  src={partner.photoUrl} 
                  alt={partner.firstName} 
                  className={`w-7 h-7 rounded-full border-[1.5px] object-cover transition-all ${isTargetUserInRoom ? "border-[#1a1a1c]" : "border-transparent opacity-30 grayscale"}`} 
                />
                {isTargetUserInRoom && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#ccff00] rounded-full border-[1.5px] border-[#1a1a1c]" />
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 ml-2">
             <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0d0d0e] border border-white/5 hover:bg-white/5 text-[#737373] hover:text-white text-[10px] font-bold uppercase tracking-widest rounded transition-colors hidden xl:flex">
                <FiShare2 size={12} /> Share
             </button>
             
             <div className="w-[1px] h-4 bg-white/10 mx-1 hidden xl:block" />

             <GlobalHeaderButtons openTabs={openTabs} setOpenTabs={setOpenTabs} activeTab={activeTab} setActiveTab={setActiveTab} roomId={roomId} />
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 w-full flex overflow-hidden">
        
        {/* Extreme Left Activity Bar */}
        <div className="w-[50px] bg-[#1a1a1c] border-r border-white/5 flex flex-col items-center py-4 gap-6 shrink-0 z-10">
           <div className="relative group cursor-pointer" onClick={() => setActiveLeftTab("explorer")}>
              <FiFolder className={`${activeLeftTab === "explorer" ? "text-[#a855f7]" : "text-[#737373] hover:text-[#e1e1e3]"} transition-colors`} size={20} />
              {activeLeftTab === "explorer" && <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#a855f7] rounded-r-full" />}
           </div>
           <div className="relative group cursor-pointer" onClick={() => setActiveLeftTab("search")}>
              <FiSearch className={`${activeLeftTab === "search" ? "text-[#a855f7]" : "text-[#737373] hover:text-[#e1e1e3]"} transition-colors`} size={20} />
              {activeLeftTab === "search" && <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#a855f7] rounded-r-full" />}
           </div>
           <div className="relative group cursor-pointer" onClick={() => setActiveLeftTab("settings")}>
              <FiSettings className={`${activeLeftTab === "settings" ? "text-[#a855f7]" : "text-[#737373] hover:text-[#e1e1e3]"} transition-colors`} size={20} />
              {activeLeftTab === "settings" && <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#a855f7] rounded-r-full" />}
           </div>
        </div>
        
        {/* The Sandpack Workspace */}
        <div className="flex-1 h-full relative flex bg-[#141415] min-w-0"> 
            <div style={{ display: "flex", width: "100%", height: "100%", minWidth: 0 }}>
              
              {/* File Explorer & Project Sidebar */}
              <div style={{ width: leftWidth }} className="bg-[#1a1a1c] flex flex-col shrink-0 relative">
                 {/* Right edge drag handle */}
                 <div 
                   onMouseDown={startLeftDrag}
                   className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize bg-white/5 hover:bg-[#a855f7] z-50 transition-colors"
                 />

                 {/* Project Info Dropdown Header */}
                 <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#141415]/50">
                    <div>
                       <span className="text-[10px] font-bold text-[#737373] uppercase tracking-widest block mb-0.5">Project</span>
                       <h2 className="text-[#e1e1e3] text-[13px] font-semibold truncate max-w-[200px]">
                         {post?.project?.title || "Untitled Workspace"}
                       </h2>
                    </div>
                 </div>

                 {/* Dynamic Left Panel Content */}
                 {activeLeftTab === "explorer" && (
                   <>
                     <div className="px-4 py-2 flex items-center justify-between mt-2">
                        <span className="text-[10px] font-bold text-[#737373] uppercase tracking-widest">File Explorer</span>
                     </div>
                     <div className="flex-1 overflow-y-auto pl-2 custom-scrollbar">
                        <SandpackFileExplorer />
                     </div>
                   </>
                 )}

                 {activeLeftTab === "search" && (
                   <div className="flex-1 p-4 flex flex-col gap-4">
                     <span className="text-[10px] font-bold text-[#737373] uppercase tracking-widest">Search</span>
                     <div className="bg-[#0d0d0e] border border-white/5 rounded-md flex items-center px-3 py-2">
                       <FiSearch className="text-[#737373] mr-2" size={14} />
                       <input 
                         type="text" 
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         placeholder="Search codebase..."
                         className="bg-transparent text-[#e1e1e3] text-xs outline-none w-full"
                       />
                     </div>
                     <div className="flex-1 flex items-center justify-center text-center">
                       <p className="text-[#737373] text-[11px] leading-relaxed">
                         Search results will appear here.<br />(Global search powered by Sandpack)
                       </p>
                     </div>
                   </div>
                 )}

                 {activeLeftTab === "settings" && (
                   <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 custom-scrollbar">
                     <div>
                       <span className="text-[10px] font-bold text-[#737373] uppercase tracking-widest flex items-center gap-1.5 mb-2">
                         <FiInfo size={12} /> Project Details
                       </span>
                       <p className="text-[#a3a3a3] text-[12px] leading-relaxed">
                         {post?.content || "No project description provided."}
                       </p>
                     </div>

                     {post?.project?.roleNeeded && (
                       <div>
                         <span className="text-[10px] font-bold text-[#737373] uppercase tracking-widest block mb-2">
                           Seeking Role
                         </span>
                         <span className="inline-block px-2.5 py-1 bg-[#ccff00]/10 border border-[#ccff00]/20 text-[#ccff00] text-[11px] font-mono rounded">
                           {post.project.roleNeeded}
                         </span>
                       </div>
                     )}

                     {techStack.length > 0 && (
                       <div>
                         <span className="text-[10px] font-bold text-[#737373] uppercase tracking-widest block mb-2">
                           Tech Stack
                         </span>
                         <div className="flex flex-wrap gap-2">
                           {techStack.map((tech, idx) => (
                             <span key={idx} className="px-2 py-1 bg-[#141415] border border-white/5 text-[#a3a3a3] text-[10px] rounded">
                               {tech}
                             </span>
                           ))}
                         </div>
                       </div>
                     )}
                   </div>
                 )}
              </div>

              {/* Code Editor */}
              <div className="flex-1 flex flex-col relative min-w-0 bg-[#141415]">
                <SandpackCodeEditor 
                  showLineNumbers 
                  showTabs 
                  showRunButton={false}
                  style={{ flex: 1, height: "100%", minWidth: 0 }} 
                />
              </div>

              {/* Right Sidebar: WebRTC & Preview / Console */}
              <div style={{ width: rightWidth, maxWidth: `calc(100vw - ${leftWidth + 150}px)`, height: "100%", display: "flex", flexDirection: "column", flexShrink: 0, position: "relative", background: "#1a1a1c" }}>
                 {/* Left edge drag handle */}
                 <div 
                   onMouseDown={startRightDrag}
                   className="absolute top-0 left-0 w-1.5 h-full cursor-col-resize bg-white/5 hover:bg-[#ccff00] z-50 transition-colors"
                 />

                 {/* Top Section: Team Video */}
                 <div style={{ flex: openTabs.length > 0 ? "0 0 auto" : 1, height: openTabs.length > 0 ? (isCorrectRoom ? "280px" : "60px") : "100%", borderBottom: "1px solid rgba(255,255,255,0.05)", overflow: "hidden", background: "#141415", display: "flex", flexDirection: "column", transition: "all 0.3s ease" }}>
                    <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "#1a1a1c", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                       <span className="text-[10px] font-bold text-[#737373] uppercase tracking-widest">Team Chat & Video</span>
                       <FiMoreHorizontal className="text-[#737373] cursor-pointer hover:text-white" size={14} />
                    </div>
                    {isCorrectRoom ? (
                      <div className={`flex-1 w-full p-3 flex gap-3 ${openTabs.length > 0 ? "flex-row items-center justify-center" : "flex-col items-stretch justify-center"}`}>
                        {remoteStream && (
                          <div className={`relative flex-1 bg-[#0d0d0e] rounded-xl overflow-hidden shadow-lg border transition-all duration-300 ${isRemoteSpeaking ? 'border-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.15)]' : 'border-white/5'}`} style={{ minHeight: '100px' }}>
                            {!isRemoteVideoOff ? (
                              <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <img src={partner?.photoUrl || "https://geographyandyou.com/images/user-profile.png"} alt="Partner" className="w-16 h-16 rounded-full object-cover opacity-50" />
                              </div>
                            )}
                            
                            {/* Audio Equalizer Overlay */}
                            {isRemoteSpeaking && (
                              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <div className="flex items-end gap-1 h-8 opacity-80">
                                  <div className="w-1.5 bg-[#ccff00] rounded-t animate-[bounce_0.5s_infinite_alternate_ease-in]" style={{height: '40%'}}></div>
                                  <div className="w-1.5 bg-[#ccff00] rounded-t animate-[bounce_0.6s_infinite_alternate_ease-in]" style={{height: '100%'}}></div>
                                  <div className="w-1.5 bg-[#ccff00] rounded-t animate-[bounce_0.4s_infinite_alternate_ease-in]" style={{height: '60%'}}></div>
                                </div>
                              </div>
                            )}

                            {/* Remote Reaction */}
                            {remoteReaction && (
                              <div className="absolute top-2 right-2 text-3xl animate-[bounce_1s_infinite]">
                                {remoteReaction}
                              </div>
                            )}

                            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded flex items-center gap-2 max-w-[calc(100%-16px)]">
                              <span className="text-white text-[10px] font-semibold truncate">
                                {partner?.firstName} {partner?.lastName}
                              </span>
                              {isRemoteMuted && <FiMicOff size={10} className="text-red-400 shrink-0" />}
                            </div>
                          </div>
                        )}
                        {localStream && (
                          <div className={`relative flex-1 bg-[#0d0d0e] rounded-xl overflow-hidden shadow-lg border group transition-all duration-300 ${isSpeaking ? 'border-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.15)]' : 'border-white/5'}`} style={{ minHeight: '100px' }}>
                            {!isVideoOff ? (
                              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <img src={user?.photoUrl || "https://geographyandyou.com/images/user-profile.png"} alt="You" className="w-16 h-16 rounded-full object-cover opacity-50" />
                              </div>
                            )}

                            {/* Audio Equalizer Overlay */}
                            {isSpeaking && (
                              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <div className="flex items-end gap-1 h-8 opacity-80">
                                  <div className="w-1.5 bg-[#ccff00] rounded-t animate-[bounce_0.5s_infinite_alternate_ease-in]" style={{height: '40%'}}></div>
                                  <div className="w-1.5 bg-[#ccff00] rounded-t animate-[bounce_0.6s_infinite_alternate_ease-in]" style={{height: '100%'}}></div>
                                  <div className="w-1.5 bg-[#ccff00] rounded-t animate-[bounce_0.4s_infinite_alternate_ease-in]" style={{height: '60%'}}></div>
                                </div>
                              </div>
                            )}
                            
                            {/* Local Reaction Overlay */}
                            {localReaction && (
                              <div className="absolute top-2 right-2 text-3xl animate-[bounce_1s_infinite]">
                                {localReaction}
                              </div>
                            )}

                            {/* Local User Name Overlay (Hidden on hover) */}
                            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded flex items-center gap-2 max-w-[calc(100%-16px)] group-hover:opacity-0 transition-opacity">
                              <span className="text-white text-[10px] font-semibold truncate">
                                {user?.firstName} {user?.lastName} (You)
                              </span>
                              {isMuted && <FiMicOff size={10} className="text-red-400 shrink-0" />}
                            </div>

                            {/* Hover Controls (Pill design) */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                               {/* Reaction Menu popout */}
                               {showReactions && (
                                 <div className="absolute top-[20%] flex items-center gap-2 bg-[#1a1a1c]/90 backdrop-blur-md p-2 rounded-full border border-white/10 shadow-2xl animate-[fadeInUp_0.2s_ease-out]">
                                   {EMOJIS.map(emoji => (
                                     <button 
                                       key={emoji}
                                       onClick={() => { sendReaction(emoji); setShowReactions(false); }}
                                       className="text-lg hover:scale-125 transition-transform"
                                     >
                                       {emoji}
                                     </button>
                                   ))}
                                 </div>
                               )}
                               <div className="absolute bottom-[20%] flex items-center gap-2 bg-[#1a1a1c]/70 backdrop-blur-xl px-3 py-2 rounded-full border border-white/10 shadow-2xl scale-95 group-hover:scale-100 transition-transform">
                                  <button onClick={toggleMute} className={`p-2 rounded-full transition-colors ${isMuted ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`} title={isMuted ? "Unmute" : "Mute"}>
                                     {isMuted ? <FiMicOff size={14} /> : <FiMic size={14} />}
                                  </button>
                                  <button onClick={handleToggleVideo} className={`p-2 rounded-full transition-colors ${isVideoOff ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`} title={isVideoOff ? "Turn on camera" : "Turn off camera"}>
                                     {isVideoOff ? <FiVideoOff size={14} /> : <FiVideo size={14} />}
                                  </button>
                                  <button className="p-2 rounded-full bg-white/10 text-white/50 cursor-not-allowed" title="Screenshare (Coming soon)">
                                     <FiMonitor size={14} />
                                  </button>
                                  <button onClick={() => setShowReactions(!showReactions)} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors" title="Send Reaction">
                                     <FiSmile size={14} />
                                  </button>
                                  <button onClick={handleLeaveRoom} className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors" title="Leave call">
                                     <FiPhoneOff size={14} />
                                  </button>
                               </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <p className="text-[#737373] text-xs text-center px-4">Join the live session to collaborate.</p>
                      </div>
                    )}
                 </div>

                 {/* Bottom Section: Preview & Console Tabs */}
                 <div style={{ flex: 1, display: openTabs.length > 0 ? "flex" : "none", flexDirection: "column", minHeight: 0 }}>
                      
                      {/* Dynamic Tabs Header */}
                      <div className="flex items-center border-b border-white/5 bg-[#141415] shrink-0 overflow-x-auto custom-scrollbar">
                         {openTabs.map((tabId) => (
                           <div 
                             key={tabId}
                             onClick={() => setActiveTab(tabId)}
                             className={`group flex items-center gap-2 px-4 py-2.5 cursor-pointer border-t-2 transition-colors ${
                               activeTab === tabId 
                                 ? 'border-t-[#a855f7] bg-[#1a1a1c] text-white' 
                                 : 'border-t-transparent bg-transparent text-[#737373] hover:text-[#e1e1e3] hover:bg-white/5'
                             }`}
                           >
                             {tabId === "preview" && <FiGlobe size={12} className={activeTab === tabId ? "text-[#a855f7]" : ""} />}
                             {tabId === "console" && <FiTerminal size={12} className={activeTab === tabId ? "text-[#a855f7]" : ""} />}
                             {tabId === "tasks" && <FiCheckSquare size={12} className={activeTab === tabId ? "text-[#a855f7]" : ""} />}
                             {tabId === "chat" && <FiMessageCircle size={12} className={activeTab === tabId ? "text-[#a855f7]" : ""} />}
                             <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
                               {tabId === "preview" && "Live Preview"}
                               {tabId === "console" && "Terminal Console"}
                               {tabId === "tasks" && "Project Tasks"}
                               {tabId === "chat" && "Team Chat"}
                             </span>
                             <div 
                               onClick={(e) => {
                                 e.stopPropagation();
                                 const newTabs = openTabs.filter(t => t !== tabId);
                                 setOpenTabs(newTabs);
                                 if (activeTab === tabId) setActiveTab(newTabs.length > 0 ? newTabs[newTabs.length - 1] : null);
                               }}
                               className="p-1 rounded-md hover:bg-white/10 text-[#737373] hover:text-white transition-colors ml-2"
                             >
                               <FiX size={10} />
                             </div>
                           </div>
                         ))}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, position: "relative", minHeight: 0, background: "#0d0d0e" }}>
                        <div style={{ display: activeTab === "preview" ? "block" : "none", width: "100%", height: "100%" }}>
                          <CustomOpenBrowserButton roomId={roomId} />
                          <SandpackPreview showOpenInCodeSandbox={false} showRefreshButton={false} style={{ width: "100%", height: "100%" }} />
                        </div>
                        <div style={{ display: activeTab === "console" ? "block" : "none", width: "100%", height: "100%" }}>
                          <SandpackConsole showHeader={false} resetOnPreviewRestart={true} style={{ width: "100%", height: "100%" }} />
                        </div>
                        <div style={{ display: activeTab === "tasks" ? "block" : "none", width: "100%", height: "100%" }}>
                          <TaskList roomId={roomId} initialTasks={roomData?.tasks || []} />
                        </div>
                        <div style={{ display: activeTab === "chat" ? "block" : "none", width: "100%", height: "100%" }}>
                          <TeamChat roomId={roomId} initialChats={roomData?.chats || []} />
                        </div>
                      </div>
                   </div>

              </div>

          </div>
        </div>
      </div>
    </div>
    </SandpackProvider>
  );
};

export default ProjectRoom;
