import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiArrowLeft } from "react-icons/fi";
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
  const [loading, setLoading] = useState(true);
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

    // BASE_URL is the backend root URL — same origin for Socket.io
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
        // Avoid duplicates
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

    // If already connected, join immediately
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

    // Stop typing indicator
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

  // Group messages by date for date separators
  const groupedMessages = messages.reduce((groups, msg) => {
    const dateLabel = formatDateLabel(msg.createdAt);
    if (!groups[dateLabel]) groups[dateLabel] = [];
    groups[dateLabel].push(msg);
    return groups;
  }, {});

  const isMyMessage = (msg) => {
    const senderId =
      typeof msg.senderId === "object" ? msg.senderId._id : msg.senderId;
    return senderId?.toString() === loggedInUser?._id?.toString();
  };

  // ── Loading state ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="flex flex-col items-center gap-4 neo-card p-10 bg-white">
          <div className="w-10 h-10 border-4 border-[#a855f7] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#0a0a0a] font-bold text-sm">Loading chat...</p>
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center p-8 bg-white border-4 border-[#0a0a0a] shadow-[8px_8px_0px_#0a0a0a] rounded-3xl max-w-md">
          <p className="text-4xl mb-4">🔒</p>
          <h2 className="text-[#0a0a0a] font-black text-2xl mb-2">
            Chat Unavailable
          </h2>
          <p className="text-gray-600 font-bold text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate("/connections")}
            className="neo-btn-primary"
          >
            Go to Connections
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-start min-h-[calc(100vh-80px)] px-4 py-4 pt-8">
      <div className="w-full max-w-2xl flex flex-col h-[calc(100vh-140px)] rounded-[32px] overflow-hidden border-4 border-[#0a0a0a] shadow-[8px_8px_0px_#0a0a0a] bg-white">
        {/* ── Header ───────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-5 py-4 border-b-4 border-[#0a0a0a] bg-[#f4f4f5]">
          <button
            onClick={() => navigate(-1)}
            className="text-[#0a0a0a] hover:bg-gray-200 rounded-full transition p-2 border-2 border-transparent hover:border-[#0a0a0a]"
          >
            <FiArrowLeft size={20} strokeWidth={3} />
          </button>
          {targetUser && (
            <>
              <div className="relative">
                <img
                  src={
                    targetUser.photoUrl ||
                    "https://geographyandyou.com/images/user-profile.png"
                  }
                  alt={targetUser.firstName}
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#0a0a0a]"
                />
                {socketConnected && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#ccff00] rounded-full border-2 border-[#0a0a0a]" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-[#0a0a0a] font-black text-sm leading-tight uppercase tracking-wider">
                  {targetUser.firstName} {targetUser.lastName}
                </span>
                <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                  {isTyping
                    ? "typing..."
                    : socketConnected
                    ? "online"
                    : "connecting..."}
                </span>
              </div>
            </>
          )}
          <div className="ml-auto">
            <div
              className={`w-3 h-3 rounded-full border-2 border-[#0a0a0a] ${
                socketConnected ? "bg-[#ccff00]" : "bg-yellow-400 animate-pulse"
              }`}
              title={socketConnected ? "Connected" : "Connecting..."}
            />
          </div>
        </div>

        {/* ── Messages ─────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 bg-white">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <div className="text-5xl">👋</div>
              <p className="text-gray-600 font-bold text-sm">
                No messages yet. Say hi to{" "}
                <span className="text-[#0a0a0a] font-black">
                  {targetUser?.firstName}
                </span>
                !
              </p>
            </div>
          )}

          {Object.entries(groupedMessages).map(([dateLabel, msgs]) => (
            <div key={dateLabel}>
              {/* Date separator */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-[2px] bg-[#0a0a0a]" />
                <span className="text-xs text-[#0a0a0a] font-black uppercase tracking-widest px-2">
                  {dateLabel}
                </span>
                <div className="flex-1 h-[2px] bg-[#0a0a0a]" />
              </div>

              {/* Messages for this date */}
              {msgs.map((msg, idx) => {
                const mine = isMyMessage(msg);
                return (
                  <motion.div
                    key={msg._id || idx}
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.18 }}
                    className={`flex items-end gap-2 mb-2 ${
                      mine ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Avatar (only for other user) */}
                    {!mine && (
                      <img
                        src={
                          typeof msg.senderId === "object"
                            ? msg.senderId.photoUrl
                            : targetUser?.photoUrl
                        }
                        alt="avatar"
                        className="w-7 h-7 rounded-full object-cover flex-shrink-0 mb-1"
                      />
                    )}

                    {/* Bubble */}
                    <div
                      className={`max-w-[70%] px-5 py-3 text-sm leading-relaxed border-2 border-[#0a0a0a] shadow-[4px_4px_0px_#0a0a0a] ${
                        mine
                          ? "bg-[#ccff00] text-[#0a0a0a] font-bold rounded-bl-2xl rounded-tl-2xl rounded-tr-2xl rounded-br-sm"
                          : "bg-[#a855f7] text-white font-bold rounded-br-2xl rounded-tr-2xl rounded-tl-2xl rounded-bl-sm"
                      }`}
                    >
                      <p className="break-words">{msg.text}</p>
                      <p
                        className={`text-[10px] mt-1 font-black ${
                          mine ? "text-[#0a0a0a]/60 text-right" : "text-white/60"
                        }`}
                      >
                        {formatTime(msg.createdAt)}
                        {mine && msg.seen && (
                          <span className="ml-1 text-black">✓✓</span>
                        )}
                      </p>
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
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="flex items-end gap-2"
              >
                <img
                  src={targetUser?.photoUrl}
                  alt="avatar"
                  className="w-7 h-7 rounded-full object-cover flex-shrink-0 border-2 border-[#0a0a0a]"
                />
                <div className="bg-[#f4f4f5] border-2 border-[#0a0a0a] shadow-[4px_4px_0px_#0a0a0a] px-4 py-3 rounded-br-2xl rounded-tr-2xl rounded-tl-2xl rounded-bl-sm">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-2 h-2 bg-[#a855f7] border border-[#0a0a0a] rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input ────────────────────────────────────────────── */}
        <div className="px-4 py-4 border-t-4 border-[#0a0a0a] bg-[#f4f4f5]">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              rows={1}
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${targetUser?.firstName || ""}...`}
              className="flex-1 bg-white border-2 border-[#0a0a0a] rounded-xl px-4 py-3 text-[#0a0a0a] font-bold placeholder:text-gray-400 outline-none resize-none max-h-28 shadow-[2px_2px_0px_#0a0a0a] focus:shadow-[4px_4px_0px_#a855f7] focus:ring-0 transition-all"
              style={{ minHeight: "48px" }}
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || !socketConnected}
              className="w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center transition-all bg-[#ccff00] border-2 border-[#0a0a0a] shadow-[2px_2px_0px_#0a0a0a] disabled:opacity-50 disabled:cursor-not-allowed hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#0a0a0a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              <FiSend size={18} className="text-[#0a0a0a] font-black ml-0.5" strokeWidth={3} />
            </button>
          </div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center mt-3">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
