import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiArrowLeft, FiMoreVertical, FiCode, FiMessageSquare, FiZap, FiPhoneOff } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { getSocket } from "../utils/socket";

// Formats a Date into a readable time string
const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatDateLabel = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
};

const Chat = () => {
  const { targetId } = useParams();
  const loggedInUser = useSelector((store) => store.user);
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [targetUser, setTargetUser] = useState(null);
  const [loading, setLoading] = useState(!!targetId);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [isTargetInSandbox, setIsTargetInSandbox] = useState(false);
  const [projectRoom, setProjectRoom] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Fetch message history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${BASE_URL}/chat/${targetId}`, {
          withCredentials: true,
        });
        setMessages(res.data.messages || []);
        setTargetUser(res.data.targetUser);
      } catch (err) {
        if (err?.response?.status === 403) {
          setError("You can only chat with your connections.");
        } else {
          setError("Failed to load chat. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (targetId) fetchHistory();
  }, [targetId]);

  // Fetch project room if exists
  useEffect(() => {
    const fetchProjectRoom = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/project/room-by-members?userId=${targetId}`, {
          withCredentials: true,
        });
        if (res.data.data) {
          setProjectRoom(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch project room", err);
      }
    };
    if (targetId) fetchProjectRoom();
  }, [targetId]);

  // Set up Socket.io
  useEffect(() => {
    if (!loggedInUser || !targetId) return;

    const sock = getSocket(BASE_URL);

    sock.on("connect", () => {
      setSocketConnected(true);
      sock.emit("joinChat", { targetId });
    });

    sock.on("disconnect", () => {
      setSocketConnected(false);
    });

    sock.on("receiveMessage", (message) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });
    });

    sock.on("userTyping", ({ isTyping: typing }) => {
      setIsTyping(typing);
    });

    sock.on("userJoinedSandbox", ({ userId }) => {
      if (String(userId) === String(targetId)) setIsTargetInSandbox(true);
    });

    sock.on("userLeftSandbox", ({ userId }) => {
      if (String(userId) === String(targetId)) setIsTargetInSandbox(false);
    });

    sock.on("sandboxPresencePong", ({ userId }) => {
      if (String(userId) === String(targetId)) setIsTargetInSandbox(true);
    });

    sock.on("error", (err) => {
      console.error("Socket error:", err.message);
    });

    if (sock.connected) {
      setSocketConnected(true);
      sock.emit("joinChat", { targetId });
      
      const roomId = [loggedInUser._id, targetId].sort().join("_");
      sock.emit("pingSandboxPresence", { roomId });
    }

    return () => {
      sock.off("connect");
      sock.off("disconnect");
      sock.off("receiveMessage");
      sock.off("userTyping");
      sock.off("error");
      sock.off("userJoinedSandbox");
      sock.off("userLeftSandbox");
      sock.off("sandboxPresencePong");
    };
  }, [loggedInUser, targetId]);

  const handleSend = () => {
    if (!inputText.trim() || !socketConnected) return;

    const sock = getSocket();
    sock.emit("sendMessage", { targetId, text: inputText.trim() });

    sock.emit("typing", { targetId, isTyping: false });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    setInputText("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMessageText = (text, mine, isSandboxInvite) => {
    if (isSandboxInvite) {
      const url = text.split("I launched a Live Sandbox! Click here to join: ")[1];
      return (
        <div className="flex flex-col gap-3 py-1 min-w-[240px] sm:min-w-[280px]">
          <div className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#a855f7]/20 to-[#ccff00]/20 flex items-center justify-center border border-white/5 flex-shrink-0">
              <FiCode className="text-xl text-[#ccff00]" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-white text-[15px] leading-none mb-1">Live Sandbox</h4>
              <p className="text-[10px] text-[#ccff00] uppercase tracking-widest font-bold">
                {mine && targetUser ? `Invite to ${targetUser.firstName}` : targetUser ? `Invite from ${targetUser.firstName}` : "Collab Invite"}
              </p>
            </div>
            {isTargetInSandbox && targetUser && (
              <div className="relative ml-2 group">
                <img 
                  src={targetUser.photoUrl} 
                  alt="avatar" 
                  className="w-8 h-8 rounded-full border border-white/10 object-cover flex-shrink-0" 
                />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#121212]" />
                <div className="absolute top-10 right-0 bg-[#1a1a1a] border border-white/10 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  {targetUser.firstName} is in the Sandbox
                </div>
              </div>
            )}
          </div>
          <p className="text-[13px] text-[#a3a3a3] leading-relaxed mt-1">
            I've opened a real-time collaborative workspace for us. Let's code together!
          </p>
          <button 
            onClick={(e) => {
              e.preventDefault();
              let path = url;
              if (url.startsWith("http")) {
                path = new URL(url).pathname;
              }
              navigate(path);
            }}
            className="flex items-center justify-center gap-2 font-black px-4 py-3 rounded-xl hover:scale-[1.02] active:scale-95 transition-all w-full mt-2 bg-[#ccff00] text-[#0a0a0a] hover:bg-[#bbf000] shadow-[0_0_15px_rgba(204,255,0,0.15)] active:scale-95"
          >
            <FiZap className="text-lg" /> Join Workspace
          </button>
        </div>
      );
    }
    return <p className="break-words whitespace-pre-wrap">{text}</p>;
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);

    const sock = getSocket();
    if (sock?.connected) {
      sock.emit("typing", { targetId, isTyping: true });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        sock.emit("typing", { targetId, isTyping: false });
      }, 1500);
    }
  };

  const groupedMessages = messages.reduce((groups, msg) => {
    const dateLabel = formatDateLabel(msg.createdAt);
    if (!groups[dateLabel]) groups[dateLabel] = [];
    groups[dateLabel].push(msg);
    return groups;
  }, {});

  const isMyMessage = (msg) => {
    const senderId = typeof msg.senderId === "object" ? msg.senderId._id : msg.senderId;
    return senderId?.toString() === loggedInUser?._id?.toString();
  };

  // ── No Target ID state ────────────────────────────────────────────
  if (!targetId) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="text-center p-12 bg-[#121212] border border-white/5 rounded-3xl max-w-md shadow-2xl w-full">
          <div className="w-20 h-20 bg-[#a855f7]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiMessageSquare className="text-3xl text-[#a855f7]" />
          </div>
          <h2 className="text-white font-bold text-2xl mb-3 tracking-tight">
            Your Messages
          </h2>
          <p className="text-[#a3a3a3] font-medium text-sm mb-8">
            Select a connection to start messaging and collaborate in real-time.
          </p>
          <button
            onClick={() => navigate("/connections")}
            className="w-full bg-[#ccff00] text-[#0a0a0a] font-bold py-3 rounded-xl hover:bg-[#bbf000] transition-colors shadow-lg shadow-[#ccff00]/10"
          >
            Find Connections
          </button>
        </div>
      </div>
    );
  }

  // ── Loading state ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="flex flex-col items-center gap-4 p-10">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-[#a3a3a3] font-semibold text-sm">Connecting to secure chat...</p>
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center p-10 bg-[#121212] border border-white/5 rounded-3xl max-w-md shadow-2xl">
          <p className="text-5xl mb-6">🔒</p>
          <h2 className="text-white font-bold text-2xl mb-3 tracking-tight">
            Secure Channel Closed
          </h2>
          <p className="text-[#a3a3a3] font-medium text-sm mb-8">{error}</p>
          <button
            onClick={() => navigate("/connections")}
            className="w-full bg-[#ccff00] text-[#0a0a0a] font-bold py-3 rounded-xl hover:bg-[#bbf000] transition-colors"
          >
            Return to Connections
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-start h-[100dvh] w-full bg-[#0a0a0a]">
      {/* ── Main Chat Area ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative border-l border-white/5">
        
        {/* ── Header ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#121212]/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-[#a3a3a3] hover:text-white transition p-2 hover:bg-white/5 rounded-full"
            >
              <FiArrowLeft size={20} />
            </button>
            {targetUser && (
              <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate(`/user/${targetUser._id}`)}>
                <div className="relative">
                  <img
                    src={targetUser.photoUrl || "https://geographyandyou.com/images/user-profile.png"}
                    alt={targetUser.firstName}
                    className="w-11 h-11 rounded-full object-cover border border-white/10 group-hover:border-[#a855f7] transition-colors"
                  />
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#121212] ${socketConnected ? 'bg-[#ccff00]' : 'bg-yellow-500 animate-pulse'}`} />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-bold text-sm tracking-wide group-hover:text-[#a855f7] transition-colors">
                    {targetUser.firstName} {targetUser.lastName}
                  </span>
                  <span className="text-xs text-[#a3a3a3] font-medium">
                    {isTyping ? <span className="text-[#ccff00]">typing...</span> : (socketConnected ? "Active now" : "Connecting...")}
                  </span>
                </div>
              </div>
            )}
            {projectRoom && (
              <button
                onClick={() => navigate(`/project/room/${projectRoom.roomId}`)}
                className="hidden md:flex items-center gap-1.5 ml-2 bg-gradient-to-r from-[#a855f7] to-[#ccff00] text-black px-3 py-1.5 rounded-lg text-xs font-bold hover:scale-105 transition-transform"
              >
                🚀 Enter Project Room
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                const roomId = [loggedInUser._id, targetUser._id].sort().join("_");
                const sock = getSocket();
                if (sock?.connected) {
                  sock.emit("sendMessage", { targetId, text: "I launched a Live Sandbox! Click here to join: " + window.location.origin + "/sandbox/" + roomId });
                }
                navigate(`/sandbox/${roomId}`);
              }}
              className="hidden md:flex items-center gap-2 bg-[#ccff00]/10 text-[#ccff00] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#ccff00]/20 transition-colors border border-[#ccff00]/20"
            >
              <FiCode size={14} /> Live Sandbox
            </button>
            <button className="text-[#a3a3a3] hover:text-white p-2 hover:bg-white/5 rounded-full transition">
              <FiMoreVertical size={20} />
            </button>
          </div>
        </div>

        {/* ── Messages ─────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-2 bg-[#0a0a0a] scrollbar-hide">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-20 h-20 bg-[#121212] rounded-full flex items-center justify-center border border-white/5 shadow-lg mb-2">
                <span className="text-4xl">👋</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg mb-1">Start the conversation</h3>
                <p className="text-[#a3a3a3] font-medium text-sm">
                  Send a message to break the ice with {targetUser?.firstName}!
                </p>
              </div>
            </div>
          )}

          {Object.entries(groupedMessages).map(([dateLabel, msgs]) => (
            <div key={dateLabel} className="pt-4 pb-2">
              {/* Date separator */}
              <div className="flex items-center justify-center my-6">
                <span className="text-[10px] text-[#a3a3a3] font-semibold bg-[#121212] px-4 py-1.5 rounded-full border border-white/5 uppercase tracking-widest">
                  {dateLabel}
                </span>
              </div>

              {/* Messages for this date */}
              {msgs.map((msg, idx) => {
                const mine = isMyMessage(msg);
                const isFirstInSequence = idx === 0 || isMyMessage(msgs[idx - 1]) !== mine;
                const isLastInSequence = idx === msgs.length - 1 || isMyMessage(msgs[idx + 1]) !== mine;
                const isSandboxInvite = msg.text.includes("I launched a Live Sandbox! Click here to join: ");
                
                if (msg.type === "call_action") {
                  return (
                    <motion.div
                      key={msg._id || idx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex justify-center my-4"
                    >
                      <div className="bg-[#121212] border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 max-w-[300px] shadow-lg">
                        <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center">
                          <FiPhoneOff size={14} />
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium">{msg.text}</p>
                          <p className="text-[10px] text-[#a3a3a3] font-mono mt-0.5">{formatTime(msg.createdAt)}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    key={msg._id || idx}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-end gap-2 mb-1 ${mine ? "flex-row-reverse" : "flex-row"} ${isLastInSequence ? "mb-4" : ""}`}
                  >
                    {/* Avatar (only for other user and only on last message of sequence) */}
                    {!mine && (
                      <div className="w-8 flex-shrink-0">
                        {isLastInSequence && (
                          <img
                            src={typeof msg.senderId === "object" ? msg.senderId.photoUrl : targetUser?.photoUrl}
                            alt="avatar"
                            className="w-8 h-8 rounded-full object-cover border border-white/10"
                          />
                        )}
                      </div>
                    )}

                    {/* Bubble */}
                    <div
                      className={`max-w-[85%] md:max-w-[75%] px-5 py-3 text-[15px] leading-relaxed shadow-sm ${
                        isSandboxInvite
                          ? "bg-[#121212] border border-white/10 text-white"
                          : mine
                            ? "bg-[#a855f7] text-white font-medium shadow-[#a855f7]/10"
                            : "bg-[#1a1a1a] text-[#e5e5e5] border border-white/5 font-medium"
                      } ${
                        mine
                          ? `rounded-l-2xl ${isFirstInSequence ? 'rounded-tr-2xl' : 'rounded-tr-md'} ${isLastInSequence ? 'rounded-br-2xl' : 'rounded-br-md'}`
                          : `rounded-r-2xl ${isFirstInSequence ? 'rounded-tl-2xl' : 'rounded-tl-md'} ${isLastInSequence ? 'rounded-bl-2xl' : 'rounded-bl-md'}`
                      }`}
                    >
                      {renderMessageText(msg.text, mine, isSandboxInvite)}
                      <div className={`flex items-center justify-end gap-1 mt-2 ${isSandboxInvite ? 'text-[#a3a3a3]' : mine ? 'text-white/70' : 'text-[#a3a3a3]'}`}>
                        <span className="text-[9px] font-bold tracking-wider">
                          {formatTime(msg.createdAt)}
                        </span>
                        {mine && (
                          <span className="text-[10px]">
                            {msg.seen ? "✓✓" : "✓"}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))}

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-end gap-2 mb-4"
              >
                <div className="w-8 flex-shrink-0">
                  <img
                    src={targetUser?.photoUrl}
                    alt="avatar"
                    className="w-8 h-8 rounded-full object-cover border border-white/10"
                  />
                </div>
                <div className="bg-[#121212] border border-white/5 px-5 py-4 rounded-2xl rounded-bl-md shadow-sm">
                  <div className="flex gap-1.5 items-center h-2">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 bg-[#a855f7] rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} className="h-2" />
        </div>

        {/* ── Input ────────────────────────────────────────────── */}
        <div className="px-6 py-4 pb-8 md:pb-6 bg-[#121212]/95 backdrop-blur-xl border-t border-white/5 z-20">
          <div className="flex items-end gap-3 w-full max-w-6xl mx-auto">
            <div className="flex-1 bg-[#1a1a1a] rounded-2xl border border-white/5 flex items-end focus-within:border-[#a855f7]/50 focus-within:ring-1 focus-within:ring-[#a855f7]/50 transition-all overflow-hidden shadow-inner">
              <textarea
                ref={inputRef}
                rows={1}
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Message..."
                className="w-full bg-transparent px-5 py-4 text-[#e5e5e5] font-medium placeholder:text-[#a3a3a3] outline-none resize-none max-h-32 text-[15px]"
                style={{ minHeight: "54px" }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || !socketConnected}
              className="w-14 h-[54px] flex-shrink-0 rounded-2xl flex items-center justify-center transition-all bg-[#ccff00] disabled:bg-[#ccff00]/20 disabled:text-[#0a0a0a]/30 disabled:cursor-not-allowed hover:bg-[#bbf000] text-[#0a0a0a] shadow-[0_0_15px_rgba(204,255,0,0.15)] active:scale-95"
            >
              <FiSend size={20} className="ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
