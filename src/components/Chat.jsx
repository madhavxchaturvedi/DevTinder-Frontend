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
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#fe0142] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Loading chat...</p>
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center p-8 bg-white/5 border border-white/10 rounded-3xl max-w-md">
          <p className="text-4xl mb-4">🔒</p>
          <h2 className="text-white font-bold text-xl mb-2">
            Chat Unavailable
          </h2>
          <p className="text-white/60 text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate("/connections")}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-[#fe5a33] via-[#fe0142] to-[#fe6d27] text-white text-sm font-semibold"
          >
            Go to Connections
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-start min-h-[calc(100vh-80px)] px-4 py-4">
      <div className="w-full max-w-2xl flex flex-col h-[calc(100vh-100px)] rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50 bg-[#0d0d0d]/90 backdrop-blur-xl">
        {/* ── Header ───────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-[#111]/80">
          <button
            onClick={() => navigate(-1)}
            className="text-white/60 hover:text-white transition p-1"
          >
            <FiArrowLeft size={20} />
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
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-[#fe0142]/40"
                />
                {socketConnected && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#111]" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-white font-semibold text-sm leading-tight">
                  {targetUser.firstName} {targetUser.lastName}
                </span>
                <span className="text-xs text-white/40">
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
              className={`w-2 h-2 rounded-full ${
                socketConnected ? "bg-emerald-400" : "bg-yellow-400 animate-pulse"
              }`}
              title={socketConnected ? "Connected" : "Connecting..."}
            />
          </div>
        </div>

        {/* ── Messages ─────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <div className="text-5xl">👋</div>
              <p className="text-white/60 text-sm">
                No messages yet. Say hi to{" "}
                <span className="text-white font-medium">
                  {targetUser?.firstName}
                </span>
                !
              </p>
            </div>
          )}

          {Object.entries(groupedMessages).map(([dateLabel, msgs]) => (
            <div key={dateLabel}>
              {/* Date separator */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-white/30 font-medium px-2">
                  {dateLabel}
                </span>
                <div className="flex-1 h-px bg-white/10" />
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
                      className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-md ${
                        mine
                          ? "bg-gradient-to-br from-[#fe5a33] via-[#fe0142] to-[#fe5a33] text-white rounded-br-sm"
                          : "bg-white/10 text-white/90 rounded-bl-sm border border-white/10"
                      }`}
                    >
                      <p className="break-words">{msg.text}</p>
                      <p
                        className={`text-[10px] mt-1 ${
                          mine ? "text-white/60 text-right" : "text-white/40"
                        }`}
                      >
                        {formatTime(msg.createdAt)}
                        {mine && msg.seen && (
                          <span className="ml-1 text-blue-300">✓✓</span>
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
                  className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                />
                <div className="bg-white/10 border border-white/10 px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce"
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
        <div className="px-4 py-3 border-t border-white/10 bg-[#111]/60">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-2 focus-within:border-[#fe0142]/50 transition-colors">
            <textarea
              ref={inputRef}
              rows={1}
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${targetUser?.firstName || ""}...`}
              className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 outline-none resize-none max-h-28 leading-5"
              style={{ minHeight: "24px" }}
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || !socketConnected}
              className="w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center transition-all bg-gradient-to-br from-[#fe5a33] via-[#fe0142] to-[#fe5a33] disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-lg shadow-[#fe0142]/30"
            >
              <FiSend size={15} className="text-white" />
            </button>
          </div>
          <p className="text-[10px] text-white/20 text-center mt-1.5">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
