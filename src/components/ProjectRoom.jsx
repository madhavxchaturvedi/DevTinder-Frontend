import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { addUser } from "../redux/userSlice";
import { FiArrowLeft, FiCode, FiInfo, FiPhoneCall, FiVideo, FiMic, FiVideoOff, FiMicOff, FiPhoneOff } from "react-icons/fi";
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
  useSandpack
} from "@codesandbox/sandpack-react";

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

const ProjectRoom = () => {
  const { roomId } = useParams();
  const user = useSelector((store) => store.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isInitializing, setIsInitializing] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [roomData, setRoomData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [initialFiles, setInitialFiles] = useState({});

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

    if (sock.connected) {
      setSocketConnected(true);
      sock.emit("enterProjectRoom", { roomId, projectTitle: roomData.projectPostId?.project?.title });
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
    };
  }, [user, roomId, isInitializing, roomData, targetId]);

  const handleLeaveRoom = () => {
    leaveCall();
    navigate("/feed");
  };

  if (isInitializing) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0a0a0a]">
        <div className="w-10 h-10 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const post = roomData?.projectPostId;
  const partner = roomData?.members.find((m) => String(m._id) !== String(user._id));

  const techStack = post?.project?.techStack || [];
  let template = "vanilla";
  const stackStr = techStack.join(" ").toLowerCase();
  if (stackStr.includes("react")) template = "react";
  else if (stackStr.includes("node")) template = "node";

  const isCorrectRoom = isInCall && currentRoomId === roomId;

  return (
    <div className="h-screen w-full flex flex-col bg-[#0a0a0a] overflow-hidden relative">
      <div className="h-14 border-b border-white/5 bg-[#121212] flex items-center justify-between px-4 z-20 flex-shrink-0 shadow-sm relative">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-[#a3a3a3] hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <FiArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2 border-r border-white/10 pr-4">
            <FiCode className="text-[#3b82f6] text-xl" />
            <span className="text-white font-bold tracking-tight truncate max-w-[200px]">
              {post?.project?.title || "Project Room"}
            </span>
          </div>

          <div className="flex items-center gap-2 pl-2">
            <img
              src={user?.photoUrl}
              alt="Me"
              className="w-8 h-8 rounded-full border-2 border-[#3b82f6] object-cover"
              title="You"
            />
            {partner && (
              <img
                src={partner.photoUrl}
                alt={partner.firstName}
                className={`w-8 h-8 rounded-full border-2 object-cover transition-colors ${
                  isTargetUserInRoom ? "border-green-500" : "border-transparent opacity-50"
                }`}
                title={partner.firstName}
              />
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-1.5 hidden sm:flex">
            <div className={`w-2 h-2 rounded-full ${socketConnected ? "bg-green-500" : "bg-red-500 animate-pulse"}`} />
            <span className="text-xs font-mono text-[#a3a3a3]">
              {socketConnected ? "Connected" : "Connecting..."}
            </span>
          </div>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`relative p-2 rounded-lg transition-colors ${
              isSidebarOpen ? "bg-[#3b82f6]/20 text-[#3b82f6]" : "text-[#a3a3a3] hover:text-white hover:bg-white/5"
            }`}
          >
            <FiInfo size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 w-full flex overflow-hidden relative">
        {isSidebarOpen && (
          <div className="w-80 bg-[#121212] border-r border-white/5 flex flex-col flex-shrink-0">
            <div className="p-4 border-b border-white/5 overflow-y-auto max-h-[40%]">
              <h2 className="text-lg font-bold text-white mb-2">{post?.project?.title}</h2>
              <p className="text-sm text-[#a3a3a3] mb-4">{post?.content}</p>
              {post?.project?.roleNeeded && (
                <div className="mb-4">
                  <span className="text-xs font-bold text-[#a3a3a3] uppercase tracking-wider block mb-1">
                    Role Needed
                  </span>
                  <span className="text-sm text-white bg-white/5 px-2 py-1 rounded">
                    {post.project.roleNeeded}
                  </span>
                </div>
              )}
            </div>

            {isCorrectRoom && (
              <div className="flex-1 p-4 flex flex-col bg-[#0a0a0a] border-t border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live Call
                  </span>
                </div>
                
                <div className="flex flex-col gap-3 mb-4 flex-1">
                  {remoteStream && (
                    <div className="relative flex-1 bg-[#151515] rounded-xl overflow-hidden border border-white/10 shadow-inner">
                      {!isRemoteVideoOff ? (
                        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <img 
                            src={partner?.photoUrl || "https://geographyandyou.com/images/user-profile.png"} 
                            alt="Partner Avatar" 
                            className="w-16 h-16 rounded-full border border-white/10 shadow-lg object-cover"
                          />
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded-md text-xs text-white font-medium backdrop-blur">
                        {partner?.firstName || "Partner"}
                      </div>
                    </div>
                  )}
                  
                  {localStream && (
                    <div className="relative h-[120px] bg-[#151515] rounded-xl overflow-hidden border border-white/10 shadow-inner">
                      {!isVideoOff ? (
                        <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <img 
                            src={user?.photoUrl || "https://geographyandyou.com/images/user-profile.png"} 
                            alt="Your Avatar" 
                            className={`w-12 h-12 rounded-full object-cover transition-all duration-300 ${isSpeaking ? 'ring-2 ring-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'border border-white/10 shadow-lg'}`}
                          />
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded-md text-[10px] text-white font-medium backdrop-blur">
                        You
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={toggleMute}
                    className={`flex-1 flex items-center justify-center py-2.5 rounded-xl transition ${
                      isMuted ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {isMuted ? <FiMicOff /> : <FiMic />}
                  </button>
                  <button
                    onClick={handleToggleVideo}
                    className={`flex-1 flex items-center justify-center py-2.5 rounded-xl transition ${
                      isVideoOff ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {isVideoOff ? <FiVideoOff /> : <FiVideo />}
                  </button>
                  <button
                    onClick={handleLeaveRoom}
                    className="flex-1 flex items-center justify-center py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white transition shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                  >
                    <FiPhoneOff />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col flex-1 w-full relative">
          <SandpackProvider
            template={template}
            theme="dark"
            files={Object.keys(initialFiles).length > 0 ? initialFiles : undefined}
          >
            <SandpackSyncer roomId={roomId} />
            <SandpackLayout style={{ height: "100%", borderRadius: "0" }}>
              <SandpackFileExplorer />
              <SandpackCodeEditor showLineNumbers showTabs style={{ height: "100%" }} />
              <SandpackPreview showOpenInCodeSandbox={false} style={{ height: "100%" }} />
            </SandpackLayout>
          </SandpackProvider>
        </div>
      </div>
    </div>
  );
};

export default ProjectRoom;
