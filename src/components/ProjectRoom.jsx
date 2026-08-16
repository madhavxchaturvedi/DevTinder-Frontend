import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { addUser } from "../redux/userSlice";
import { FiArrowLeft, FiPhoneOff, FiVideo, FiMic, FiVideoOff, FiMicOff, FiCode, FiMoreHorizontal, FiFolder, FiSearch, FiSettings, FiShare2, FiSave, FiMonitor, FiTerminal, FiGlobe, FiInfo, FiPlay, FiRefreshCw, FiExternalLink } from "react-icons/fi";
import { getSocket } from "../utils/socket";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import { useWebRTCContext } from "../context/WebRTCContext";
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

const useRightSplitter = (initialWidth) => {
  const [width, setWidth] = useState(initialWidth);
  const startDrag = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = width;
    const onMouseMove = (moveEvent) => {
      const delta = startX - moveEvent.clientX;
      setWidth(Math.max(250, Math.min(800, startWidth + delta)));
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
    }
  }, [sandpack.files]);

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

// Custom button to safely trigger a recompile without crashing the Sandpack client
const CustomRunButton = () => {
  const { sandpack } = useSandpack();
  const [isRunning, setIsRunning] = useState(false);
  
  return (
    <button 
      disabled={isRunning}
      onClick={() => {
        setIsRunning(true);
        // The safest way to force a compile across all Sandpack versions without crashing the iframe
        // is to bypass the debounce by mutating the code and reverting it after the debounce window.
        const activeFile = sandpack.activeFile;
        const currentCode = sandpack.files[activeFile].code;
        
        sandpack.updateFile(activeFile, currentCode + "\n/* trigger-run */");
        
        setTimeout(() => {
          sandpack.updateFile(activeFile, currentCode);
          setTimeout(() => setIsRunning(false), 500); // Reset button state
        }, 600);
      }}
      className={`flex items-center gap-1.5 px-3 py-1.5 ${isRunning ? 'bg-[#bbf000] opacity-70 cursor-not-allowed' : 'bg-[#ccff00] hover:bg-[#bbf000]'} text-[#141415] text-[10px] font-bold uppercase tracking-widest rounded transition-all shadow-[0_0_10px_rgba(204,255,0,0.1)]`}
    >
      {isRunning ? <FiRefreshCw className="animate-spin" size={12} /> : <FiPlay size={12} />} 
      {isRunning ? "Running..." : "Run / Restart"}
    </button>
  );
};

const ProjectRoom = () => {
  const { roomId } = useParams();
  const user = useSelector((store) => store.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isInitializing, setIsInitializing] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [roomData, setRoomData] = useState(null);
  const [initialFiles, setInitialFiles] = useState({});

  // UI State
  const [activeLeftTab, setActiveLeftTab] = useState("explorer"); // 'explorer', 'search', 'settings'
  const [activeRightTab, setActiveRightTab] = useState("preview"); // 'preview', 'console'
  const [searchQuery, setSearchQuery] = useState("");
  
  // Resizable Panels
  const [leftWidth, startLeftDrag] = useLeftSplitter(260);
  const [rightWidth, startRightDrag] = useRightSplitter(380);

  const targetId = user && roomData ? roomData.members.find((m) => String(m._id) !== String(user._id))?._id : null;
  const [isTargetUserInRoom, setIsTargetUserInRoom] = useState(false);

  const { 
    localStream, remoteStream, isInCall, currentRoomId, 
    joinCall, leaveCall, toggleMute, handleToggleVideo, 
    isMuted, isVideoOff, isRemoteVideoOff, isSpeaking
  } = useWebRTCContext();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const hasJoinedCallRef = useRef(false);

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

        {/* Center: Fake Search / Environment */}
        <div className="hidden md:flex items-center justify-center flex-1">
          <div className="flex items-center gap-3 bg-[#0d0d0e] border border-white/5 rounded-md px-4 py-1.5 w-full max-w-[400px]">
             <FiSearch className="text-[#737373]" size={14} />
             <span className="text-[#737373] text-xs">Global Search...</span>
          </div>
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
             <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#a855f7] hover:bg-[#9333ea] text-white text-xs font-semibold rounded transition-colors shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                <FiShare2 size={12} /> Share
             </button>
             <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ccff00] hover:bg-[#bbf000] text-[#141415] text-xs font-bold rounded transition-colors shadow-[0_0_15px_rgba(204,255,0,0.2)]">
                <FiSave size={12} /> Save
             </button>
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
        <div className="flex-1 h-full w-full relative flex bg-[#141415]"> 
          <SandpackProvider
            template="react"
            theme={customSandpackTheme}
            files={cleanFiles}
            options={{ autorun: true, autoReload: true }}
          >
            <SandpackSyncer roomId={roomId} />
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
                  style={{ flex: 1, height: "100%" }} 
                />
              </div>

              {/* Right Sidebar: WebRTC & Preview / Console */}
              <div style={{ width: rightWidth, height: "100%", display: "flex", flexDirection: "column", flexShrink: 0, position: "relative", background: "#1a1a1c" }}>
                 {/* Left edge drag handle */}
                 <div 
                   onMouseDown={startRightDrag}
                   className="absolute top-0 left-0 w-1.5 h-full cursor-col-resize bg-white/5 hover:bg-[#ccff00] z-50 transition-colors"
                 />

                 {/* Top Section: Team Video - fixed height 280px when in call, 60px when not */}
                 <div style={{ height: isCorrectRoom ? "280px" : "60px", flexShrink: 0, borderBottom: "1px solid rgba(255,255,255,0.05)", overflow: "hidden", background: "#141415", display: "flex", flexDirection: "column" }}>
                    <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "#1a1a1c", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                       <span className="text-[10px] font-bold text-[#737373] uppercase tracking-widest">Team Chat & Video</span>
                       <FiMoreHorizontal className="text-[#737373] cursor-pointer hover:text-white" size={14} />
                    </div>
                    {isCorrectRoom ? (
                      <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", padding: "12px" }}>
                        {remoteStream && (
                          <div className={`relative w-full max-w-[220px] bg-[#0d0d0e] rounded-xl overflow-hidden border border-white/5 shadow-lg mx-auto`} style={{ aspectRatio: "4/3" }}>
                            {!isRemoteVideoOff ? (
                              <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <img src={partner?.photoUrl || "https://geographyandyou.com/images/user-profile.png"} alt="Partner" className="w-12 h-12 rounded-full object-cover" />
                              </div>
                            )}
                            <div className="absolute top-1.5 right-1.5 bg-[#ccff00] text-[#141415] text-[9px] font-bold px-1 py-0.5 rounded">LIVE</div>
                          </div>
                        )}
                        {localStream && (
                          <div className={`relative w-full max-w-[220px] bg-[#0d0d0e] rounded-xl overflow-hidden border shadow-lg group mx-auto ${isSpeaking ? 'border-[#ccff00]' : 'border-white/5'}`} style={{ aspectRatio: "4/3" }}>
                            {!isVideoOff ? (
                              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <img src={user?.photoUrl || "https://geographyandyou.com/images/user-profile.png"} alt="You" className="w-12 h-12 rounded-full object-cover" />
                              </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                               <span className="text-white text-[10px] font-semibold">You</span>
                               <div className="flex gap-1.5">
                                  <button onClick={toggleMute} className={`p-1 rounded-full ${isMuted ? 'bg-red-500/80' : 'bg-white/20'} text-white`}>{isMuted ? <FiMicOff size={10} /> : <FiMic size={10} />}</button>
                                  <button onClick={handleToggleVideo} className={`p-1 rounded-full ${isVideoOff ? 'bg-red-500/80' : 'bg-white/20'} text-white`}>{isVideoOff ? <FiVideoOff size={10} /> : <FiVideo size={10} />}</button>
                                  <button onClick={handleLeaveRoom} className="p-1 rounded-full bg-red-500/90 text-white"><FiPhoneOff size={10} /></button>
                               </div>
                            </div>
                            <div className="absolute bottom-2 left-2 group-hover:opacity-0 transition-opacity"><span className="text-white text-[10px] font-semibold">You</span></div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <p className="text-[#737373] text-xs text-center px-4">Join the live session to collaborate.</p>
                      </div>
                    )}
                 </div>

                 {/* Bottom Section: Preview & Console — takes ALL remaining height */}
                 <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                    {/* Tabs Header */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "#1a1a1c", paddingRight: "12px", flexShrink: 0 }}>
                       <div style={{ display: "flex" }}>
                         <button onClick={() => setActiveRightTab("preview")} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 16px", borderBottom: activeRightTab === "preview" ? "2px solid #a855f7" : "2px solid transparent", color: activeRightTab === "preview" ? "white" : "#737373", background: "none", cursor: "pointer", transition: "color 0.2s" }}>
                           <FiGlobe size={12} /><span style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.1em" }}>Preview</span>
                         </button>
                         <button onClick={() => setActiveRightTab("console")} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 16px", borderBottom: activeRightTab === "console" ? "2px solid #a855f7" : "2px solid transparent", color: activeRightTab === "console" ? "white" : "#737373", background: "none", cursor: "pointer", transition: "color 0.2s" }}>
                           <FiTerminal size={12} /><span style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.1em" }}>Console</span>
                         </button>
                       </div>
                       <CustomRunButton />
                    </div>

                    {/* Preview — always rendered, shown/hidden via display */}
                    <div style={{ flex: activeRightTab === "preview" ? 1 : 0, display: activeRightTab === "preview" ? "flex" : "none", minHeight: 0 }}>
                      <SandpackPreview showOpenInCodeSandbox={false} showRefreshButton={false} style={{ width: "100%", height: "100%" }} />
                    </div>
                    {/* Console — always rendered, shown/hidden via display */}
                    <div style={{ flex: activeRightTab === "console" ? 1 : 0, display: activeRightTab === "console" ? "flex" : "none", minHeight: 0, background: "#0d0d0e" }}>
                      <SandpackConsole showHeader={false} resetOnPreviewRestart={true} style={{ width: "100%", height: "100%" }} />
                    </div>
                 </div>

              </div>

            </div>
          </SandpackProvider>
        </div>

      </div>
    </div>
  );
};

export default ProjectRoom;
