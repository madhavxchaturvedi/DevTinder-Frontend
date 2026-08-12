import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiArrowLeft, FiMoreVertical, FiCode, FiMessageSquare } from "react-icons/fi";
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

    sock.on("error", (err) => {
      console.error("Socket error:", err.message);
    });

    if (sock.connected) {
      setSocketConnected(true);
      sock.emit("joinChat", { targetId });
    }

    return () => {
      sock.off("connect");
      sock.off("disconnect");
      sock.off("receiveMessage");
      sock.off("userTyping");
      sock.off("error");
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
    <div className="flex justify-center items-start min-h-[calc(100vh-80px)] px-4 py-4 pt-6 max-w-[1400px] mx-auto w-full gap-6">
      {/* ── Main Chat Area ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-[calc(100vh-120px)] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#0a0a0a] relative">
        
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
                      className={`max-w-[70%] px-5 py-3 text-[15px] leading-relaxed shadow-sm ${
                        mine
                          ? "bg-[#ccff00] text-[#0a0a0a] font-medium"
                          : "bg-[#121212] text-[#e5e5e5] border border-white/5 font-medium"
                      } ${
                        mine
                          ? `rounded-l-2xl ${isFirstInSequence ? 'rounded-tr-2xl' : 'rounded-tr-md'} ${isLastInSequence ? 'rounded-br-2xl' : 'rounded-br-md'}`
                          : `rounded-r-2xl ${isFirstInSequence ? 'rounded-tl-2xl' : 'rounded-tl-md'} ${isLastInSequence ? 'rounded-bl-2xl' : 'rounded-bl-md'}`
                      }`}
                    >
                      <p className="break-words">{msg.text}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 ${mine ? 'text-[#0a0a0a]/60' : 'text-[#a3a3a3]'}`}>
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
        <div className="p-4 bg-[#121212]/80 backdrop-blur-md border-t border-white/5 z-20">
          <div className="flex items-end gap-3 max-w-4xl mx-auto">
            <div className="flex-1 bg-[#1a1a1a] rounded-2xl border border-white/5 flex items-end focus-within:border-[#ccff00]/50 focus-within:ring-1 focus-within:ring-[#ccff00]/50 transition-all overflow-hidden shadow-inner">
              <textarea
                ref={inputRef}
                rows={1}
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="w-full bg-transparent px-5 py-4 text-[#e5e5e5] font-medium placeholder:text-[#a3a3a3] outline-none resize-none max-h-32 text-[15px]"
                style={{ minHeight: "54px" }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || !socketConnected}
              className="w-14 h-[54px] flex-shrink-0 rounded-2xl flex items-center justify-center transition-all bg-[#ccff00] disabled:bg-[#ccff00]/20 disabled:text-[#0a0a0a]/30 disabled:cursor-not-allowed hover:bg-[#bbf000] text-[#0a0a0a] shadow-lg shadow-[#ccff00]/10 active:scale-95"
            >
              <FiSend size={20} className="ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Right Profile Panel (Desktop Only) ──────────────── */}
      {targetUser && (
        <div className="hidden xl:flex w-80 flex-col h-[calc(100vh-120px)] rounded-3xl border border-white/10 shadow-2xl bg-[#121212] overflow-y-auto scrollbar-hide">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-br from-[#a855f7] to-[#ccff00] relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20" />
          </div>
          
          <div className="px-6 pb-8 flex flex-col items-center -mt-12 relative z-10">
            {/* Avatar */}
            <div className="mb-4">
              <div className="w-24 h-24 rounded-full p-1 bg-[#121212] shadow-xl">
                <img
                  src={targetUser.photoUrl || "https://geographyandyou.com/images/user-profile.png"}
                  alt={targetUser.firstName}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-white text-center tracking-tight">
              {targetUser.firstName} {targetUser.lastName}
            </h2>
            
            <p className="text-xs font-semibold text-[#a3a3a3] mt-1 text-center">
              {targetUser.about || "Developer"}
            </p>

            <div className="w-full h-px bg-white/5 my-6" />
            
            {/* Stats / Info Row */}
            <div className="flex w-full justify-around mb-6">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[#a855f7] font-bold text-sm">{targetUser.age || "--"}</span>
                <span className="text-[10px] text-[#a3a3a3] uppercase tracking-wider font-semibold">Age</span>
              </div>
              <div className="w-px h-8 bg-white/5" />
              <div className="flex flex-col items-center gap-1">
                <span className="text-[#ccff00] font-bold text-sm capitalize">{targetUser.gender || "--"}</span>
                <span className="text-[10px] text-[#a3a3a3] uppercase tracking-wider font-semibold">Gender</span>
              </div>
            </div>

            {targetUser.skills && targetUser.skills.length > 0 && (
              <div className="w-full mb-6">
                <p className="text-[10px] font-bold text-[#a3a3a3] uppercase tracking-widest mb-3">
                  Tech Stack
                </p>
                <div className="flex flex-wrap gap-2">
                  {targetUser.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-md bg-[#1a1a1a] border border-white/5 text-[#e5e5e5]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <button 
              onClick={() => navigate(`/user/${targetUser._id}`)}
              className="w-full mt-6 py-2 bg-[#ccff00] border-2 border-[#0a0a0a] shadow-[2px_2px_0px_#0a0a0a] font-black uppercase text-xs tracking-wider hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_#0a0a0a] transition-all"
            >
              View Full Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
