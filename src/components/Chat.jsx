import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { addConnections } from "../redux/connectionSlice";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  Send,
  ArrowLeft,
  MoreVertical,
  Code,
  MessageSquare,
  Zap,
  PhoneOff,
  Lock,
  Check,
  CheckCheck,
  Copy,
} from "lucide-react";
import { getSocket } from "../utils/socket";

const DEFAULT_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2352525b'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";

// Formats a Date into a readable time string
const formatTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatDateLabel = (dateString) => {
  if (!dateString) return "Today";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Today";
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

// Renders syntax-styled code snippet in chat with copy button and selectable text
const ChatCodeSnippet = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!code) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(code);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-black/50 font-mono text-[11px] rounded-lg border border-white/[0.06] p-2 overflow-x-auto text-[#f0f0f0] select-text">
      <div className="flex items-center justify-between pb-1 mb-1 border-b border-white/[0.06] text-[9px] uppercase tracking-wider text-[#ccff00] font-bold font-mono select-none">
        <span>{language && language !== "code" ? language : "code"}</span>
        <button
          onClick={handleCopy}
          type="button"
          aria-label="Copy code snippet"
          className="text-[10px] font-mono flex items-center gap-1 text-[#52525b] hover:text-[#f0f0f0] transition-colors bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] px-1.5 py-0.5 rounded cursor-pointer select-none"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-[#ccff00]" />
              <span className="text-[#ccff00]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="whitespace-pre font-mono select-text">{code}</pre>
    </div>
  );
};

const Chat = () => {
  const { targetId } = useParams();
  const loggedInUser = useSelector((store) => store.user);
  const connections = useSelector((store) => store.connections);
  const onlineUsers = useSelector((store) => store.onlineUsers || []);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [targetUser, setTargetUser] = useState(null);
  const [loading, setLoading] = useState(!!targetId);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [isTargetInSandbox, setIsTargetInSandbox] = useState(false);
  const [projectRooms, setProjectRooms] = useState([]);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Sync latest conversation snippet to localStorage for ConnectionsPage
  const saveConversationSummary = useCallback((userId, text, createdAt) => {
    if (!userId || !text) return;
    try {
      const existing = JSON.parse(
        localStorage.getItem("octopair_conversations") ||
        localStorage.getItem("devtinder_conversations") ||
        "{}"
      );
      existing[userId] = {
        text,
        createdAt: createdAt || new Date().toISOString(),
      };
      localStorage.setItem("octopair_conversations", JSON.stringify(existing));
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Fetch connections for chat inbox & New Matches
  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/user/connections`, {
          withCredentials: true,
        });
        dispatch(addConnections(res.data?.data || []));
      } catch (err) {
        console.error("Failed to load connections:", err);
      }
    };
    if (!connections) {
      fetchConnections();
    }
  }, [connections, dispatch]);

  // Scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProjectDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
        const fetched = res.data.messages || [];
        const sorted = [...fetched].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        setMessages(sorted);
        setTargetUser(res.data.targetUser);

        if (sorted.length > 0) {
          const lastMsg = sorted[sorted.length - 1];
          saveConversationSummary(targetId, lastMsg.text, lastMsg.createdAt);
        }
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

    if (targetId) {
      fetchHistory();
    } else {
      setMessages([]);
      setTargetUser(null);
      setError(null);
      setLoading(false);
    }
  }, [targetId, saveConversationSummary]);

  // Fetch project room if exists
  useEffect(() => {
    const fetchProjectRoom = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/project/room-by-members?userId=${targetId}`,
          {
            withCredentials: true,
          }
        );
        if (res.data.data) {
          setProjectRooms(res.data.data || []);
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
      saveConversationSummary(targetId, message.text, message.createdAt);
    });

    sock.on("userTyping", ({ isTyping: typing, userId }) => {
      if (!userId || String(userId) === String(targetId)) {
        setIsTyping(typing);
      }
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
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      sock.off("connect");
      sock.off("disconnect");
      sock.off("receiveMessage");
      sock.off("userTyping");
      sock.off("error");
      sock.off("userJoinedSandbox");
      sock.off("userLeftSandbox");
      sock.off("sandboxPresencePong");
    };
  }, [loggedInUser, targetId, saveConversationSummary]);

  const handleSend = () => {
    const text = inputText.trim();
    // Guard against blank message submission: !message.trim()
    if (!text || !socketConnected) return;

    const sock = getSocket();
    sock.emit("sendMessage", { targetId, text });

    saveConversationSummary(targetId, text, new Date().toISOString());

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
    if (sock?.connected && targetId) {
      sock.emit("typing", { targetId, isTyping: true });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        sock.emit("typing", { targetId, isTyping: false });
      }, 1500);
    }
  };

  const handleInsertCodeSnippet = () => {
    setInputText((prev) =>
      prev ? `${prev}\n\`\`\`javascript\n// write code here\n\`\`\`\n` : `\`\`\`javascript\n// write code here\n\`\`\`\n`
    );
    inputRef.current?.focus();
  };

  const renderMessageContent = (text, mine, isSandboxInvite) => {
    if (isSandboxInvite) {
      const url =
        text.split("I launched a Live Sandbox! Click here to join: ")[1] || "";
      return (
        <div className="flex flex-col gap-3 py-1 min-w-[240px] sm:min-w-[280px]">
          <div className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#b266ff]/20 to-[#ccff00]/20 flex items-center justify-center border border-white/10 shrink-0">
              <Code className="w-5 h-5 text-[#ccff00]" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-[#f0f0f0] text-sm leading-none mb-1">
                Live Sandbox
              </h4>
              <p className="text-[10px] text-[#ccff00] uppercase tracking-widest font-mono font-bold truncate">
                {mine && targetUser
                  ? `Invite to ${targetUser.firstName}`
                  : targetUser
                    ? `Invite from ${targetUser.firstName}`
                    : "Collab Invite"}
              </p>
            </div>
            {isTargetInSandbox && targetUser && (
              <div className="relative shrink-0">
                <img
                  src={targetUser.photoUrl || DEFAULT_AVATAR}
                  alt="avatar"
                  className="w-8 h-8 rounded-full border border-white/10 object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = DEFAULT_AVATAR;
                  }}
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#09090b]" />
              </div>
            )}
          </div>
          <p className="text-xs text-[#52525b] leading-relaxed">
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
            className="flex items-center justify-center gap-2 font-bold px-4 py-2 rounded-lg transition-all w-full mt-1 bg-[#ccff00] text-black hover:bg-[#d9ff33] text-xs shadow-[0_0_15px_rgba(204,255,0,0.2)] cursor-pointer"
          >
            <Zap className="w-4 h-4" /> Join Workspace
          </button>
        </div>
      );
    }

    // Parse markdown code blocks: ```lang\ncode\n``` or ```code```
    const codeBlockRegex = /```([a-zA-Z0-9_#+.-]*)\n?([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: text.substring(lastIndex, match.index),
        });
      }
      parts.push({
        type: "code",
        language: match[1] || "code",
        code: match[2].trim(),
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push({
        type: "text",
        content: text.substring(lastIndex),
      });
    }

    if (parts.length === 0) {
      return (
        <p className="break-words whitespace-pre-wrap select-text">{text}</p>
      );
    }

    return (
      <div className="space-y-1.5">
        {parts.map((p, i) =>
          p.type === "code" ? (
            <ChatCodeSnippet key={i} code={p.code} language={p.language} />
          ) : (
            <p key={i} className="break-words whitespace-pre-wrap select-text">
              {p.content}
            </p>
          )
        )}
      </div>
    );
  };

  const isMyMessage = (msg) => {
    const senderId =
      typeof msg.senderId === "object" ? msg.senderId._id : msg.senderId;
    return senderId?.toString() === loggedInUser?._id?.toString();
  };

  const groupedMessages = messages.reduce((groups, msg) => {
    const dateLabel = formatDateLabel(msg.createdAt);
    if (!groups[dateLabel]) groups[dateLabel] = [];
    groups[dateLabel].push(msg);
    return groups;
  }, {});

  // Read saved conversation history from localStorage for preview labels
  const savedConversations = (() => {
    try {
      return JSON.parse(
        localStorage.getItem("octopair_conversations") ||
        localStorage.getItem("devtinder_conversations") ||
        "{}"
      );
    } catch {
      return {};
    }
  })();

  const newMatches = (connections || []).filter(
    (user) =>
      !user.hasMessages && !user.lastMessage && !savedConversations[user._id]
  );

  return (
    <div className="h-full flex bg-[#09090b] text-[#f0f0f0] overflow-hidden select-none">
      {/* -- Left Column: Conversation List (Persistent on md+, 280px) -- */}
      <div
        className={`w-full md:w-[280px] shrink-0 border-r border-white/[0.07] flex flex-col h-full bg-[#09090b] ${
          targetId ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Messages Header */}
        <div className="px-4 py-3.5 border-b border-white/[0.07] flex items-center justify-between">
          <h1 className="text-sm font-bold text-[#f0f0f0] tracking-tight">
            Messages
          </h1>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/20">
            {connections?.length || 0}
          </span>
        </div>

        {/* New Matches Horizontal Avatar Scroller */}
        {newMatches.length > 0 && (
          <div className="p-3 border-b border-white/[0.07]">
            <div className="text-[10px] uppercase font-bold tracking-widest text-[#52525b] mb-2 px-1">
              New Matches
            </div>
            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
              {newMatches.map((user) => {
                const isOnline = onlineUsers.includes(user._id);
                return (
                  <Link
                    key={`match-${user._id}`}
                    to={`/chat/${user._id}`}
                    className="flex flex-col items-center gap-1 min-w-[56px] group transition-transform hover:scale-105"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full p-[2px] ring-1 ring-[#ccff00]/40 group-hover:ring-[#ccff00] transition-all">
                        <img
                          src={user.photoUrl || DEFAULT_AVATAR}
                          alt={user.firstName}
                          className="w-full h-full rounded-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = DEFAULT_AVATAR;
                          }}
                        />
                      </div>
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#09090b]" />
                      )}
                    </div>
                    <span className="text-[11px] text-[#f0f0f0] truncate w-14 text-center group-hover:text-[#ccff00] transition-colors">
                      {user.firstName}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Conversations Vertical List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="text-[10px] uppercase font-bold tracking-widest text-[#52525b] px-2 py-1">
            Conversations
          </div>
          {(!connections || connections.length === 0) ? (
            <div className="p-4 text-center">
              <p className="text-xs text-[#52525b]">No connections yet.</p>
            </div>
          ) : (
            connections.map((user) => {
              const isActive = targetId === user._id;
              const isOnline = onlineUsers.includes(user._id);
              const saved = savedConversations[user._id];
              const preview =
                user.lastMessage?.text ||
                saved?.text ||
                user.headline ||
                "Tap to chat";

              return (
                <Link
                  key={`conv-${user._id}`}
                  to={`/chat/${user._id}`}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all group ${
                    isActive
                      ? "bg-[#ccff00]/10 border border-[#ccff00]/20 text-[#f0f0f0]"
                      : "border border-transparent hover:border-white/[0.06] hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={user.photoUrl || DEFAULT_AVATAR}
                      alt={user.firstName}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10 group-hover:ring-[#ccff00]/40 transition-all"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_AVATAR;
                      }}
                    />
                    {isOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-1 ring-[#09090b]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`font-bold text-xs truncate ${
                          isActive
                            ? "text-[#ccff00]"
                            : "text-[#f0f0f0] group-hover:text-[#ccff00]"
                        }`}
                      >
                        {user.firstName} {user.lastName}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#52525b] truncate">
                      {preview}
                    </p>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* -- Right Column: Message Thread or Empty State -- */}
      <div
        className={`flex-1 flex flex-col h-full overflow-hidden bg-[#09090b] ${
          targetId ? "flex" : "hidden md:flex"
        }`}
      >
        {!targetId ? (
          // Empty State on md+ when no conversation selected
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#111113] border border-white/[0.07] flex items-center justify-center mb-4 text-[#52525b] shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              <MessageSquare className="w-8 h-8 text-[#ccff00]" />
            </div>
            <h2 className="text-xl font-bold text-[#f0f0f0] mb-2 tracking-tight">
              Select a conversation
            </h2>
            <p className="text-xs text-[#52525b] max-w-sm mb-6 leading-relaxed">
              Choose a match from the conversation list to start chatting or explore new developers to collaborate.
            </p>
            <button
              onClick={() => navigate("/discover")}
              className="bg-[#ccff00] text-black font-bold text-xs px-5 py-2.5 rounded-lg hover:bg-[#d9ff33] transition-colors shadow-[0_0_20px_rgba(204,255,0,0.2)] cursor-pointer"
            >
              Discover Developers
            </button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-[#ccff00] border-t-transparent rounded-full animate-spin" />
              <p className="text-[#52525b] text-xs font-mono">
                Connecting to secure chat...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full p-6">
            <div className="text-center p-8 bg-[#111113] border border-white/[0.07] rounded-2xl max-w-sm shadow-2xl">
              <Lock className="w-10 h-10 text-[#ccff00] mx-auto mb-3" />
              <h2 className="text-[#f0f0f0] font-bold text-lg mb-2 tracking-tight">
                Secure Channel Closed
              </h2>
              <p className="text-[#52525b] text-xs mb-6">{error}</p>
              <button
                onClick={() => navigate("/connections")}
                className="w-full bg-[#ccff00] text-black font-bold text-xs py-2.5 rounded-lg hover:bg-[#d9ff33] transition-colors cursor-pointer"
              >
                Return to Connections
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Thread Header */}
            <div className="px-4 py-3 border-b border-white/[0.07] bg-[#111113] flex items-center justify-between z-20">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/chat")}
                  className="md:hidden text-[#52525b] hover:text-[#f0f0f0] p-1.5 rounded-lg hover:bg-white/5 transition cursor-pointer"
                  aria-label="Back to messages"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                {targetUser && (
                  <div
                    className="flex items-center gap-2.5 cursor-pointer group"
                    onClick={() => navigate(`/user/${targetUser._id}`)}
                  >
                    <div className="relative">
                      <img
                        src={targetUser.photoUrl || DEFAULT_AVATAR}
                        alt={targetUser.firstName}
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10 group-hover:ring-[#ccff00] transition-all"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = DEFAULT_AVATAR;
                        }}
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-[#09090b] ${
                          socketConnected
                            ? "bg-emerald-500"
                            : "bg-yellow-500 animate-pulse"
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#f0f0f0] group-hover:text-[#ccff00] transition-colors">
                        {targetUser.firstName} {targetUser.lastName}
                      </h3>
                      <p className="text-[10px] text-[#52525b]">
                        {isTyping ? (
                          <span className="text-[#ccff00] font-mono">typing...</span>
                        ) : socketConnected ? (
                          "Active now"
                        ) : (
                          "Connecting..."
                        )}
                      </p>
                    </div>
                  </div>
                )}
                {projectRooms.length === 1 && (
                  <button
                    onClick={() =>
                      navigate(`/project/room/${projectRooms[0].roomId}`)
                    }
                    className="flex items-center gap-1.5 ml-2 bg-[#b266ff]/15 text-[#b266ff] border border-[#b266ff]/30 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold hover:bg-[#b266ff]/25 transition cursor-pointer"
                  >
                    <Code className="w-3 h-3" /> Project Room
                  </button>
                )}
                {projectRooms.length > 1 && (
                  <div className="relative block ml-2" ref={dropdownRef}>
                    <button
                      onClick={() =>
                        setShowProjectDropdown(!showProjectDropdown)
                      }
                      className="flex items-center gap-1.5 bg-[#b266ff]/15 text-[#b266ff] border border-[#b266ff]/30 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold hover:bg-[#b266ff]/25 transition cursor-pointer"
                    >
                      <Code className="w-3 h-3" /> Projects (
                      {projectRooms.length})
                    </button>
                    {showProjectDropdown && (
                      <div className="absolute top-full right-0 mt-2 w-56 bg-[#1a1a1f] border border-white/[0.07] rounded-xl shadow-2xl z-50 py-1 overflow-hidden">
                        {projectRooms.map((room) => (
                          <button
                            key={room.roomId}
                            onClick={() => {
                              navigate(`/project/room/${room.roomId}`);
                              setShowProjectDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs text-[#d4d4d8] hover:bg-white/5 hover:text-[#f0f0f0] transition-colors flex items-center gap-2 cursor-pointer"
                          >
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                room.template === "react"
                                  ? "bg-[#61dafb]"
                                  : room.template === "vue"
                                    ? "bg-[#42b883]"
                                    : "bg-[#dd1b16]"
                              }`}
                            />
                            <span className="truncate">
                              {room.title ||
                                room.projectPostId?.project?.title ||
                                "Untitled Project"}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (!targetUser) return;
                    if (!targetUser._id) return;
                    if (!loggedInUser?._id) return;
                    const roomId = [loggedInUser._id, targetUser._id]
                      .sort()
                      .join("_");
                    const sock = getSocket();
                    if (sock?.connected) {
                      sock.emit("sendMessage", {
                        targetId,
                        text:
                          "I launched a Live Sandbox! Click here to join: " +
                          window.location.origin +
                          "/sandbox/" +
                          roomId,
                      });
                    }
                    navigate(`/sandbox/${roomId}`);
                  }}
                  disabled={!targetUser || !targetUser._id}
                  className="hidden sm:flex items-center gap-1.5 bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/20 px-3 py-1.5 rounded-lg text-xs font-mono font-bold hover:bg-[#ccff00]/20 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Code className="w-3.5 h-3.5" /> Live Sandbox
                </button>
                <button
                  className="text-[#52525b] hover:text-[#f0f0f0] p-1.5 hover:bg-white/5 rounded-lg transition cursor-pointer"
                  aria-label="Options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages View */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-[#09090b] scrollbar-hide">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-[#111113] border border-white/[0.07] flex items-center justify-center mb-1 text-[#ccff00] shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                    <MessageSquare className="w-8 h-8 text-[#ccff00]" />
                  </div>
                  <div>
                    <h3 className="text-[#f0f0f0] font-bold text-sm mb-1 tracking-tight">
                      Start the conversation
                    </h3>
                    <p className="text-[#52525b] text-xs max-w-xs">
                      Send a message to break the ice with {targetUser?.firstName}!
                    </p>
                  </div>
                </div>
              )}

              {Object.entries(groupedMessages).map(([dateLabel, msgs]) => (
                <div key={dateLabel} className="pt-2 pb-1">
                  {/* Date separator */}
                  <div className="flex items-center justify-center my-4">
                    <span className="text-[10px] text-[#52525b] font-mono font-medium bg-[#111113] px-3 py-1 rounded-full border border-white/[0.07] uppercase tracking-wider">
                      {dateLabel}
                    </span>
                  </div>

                  {/* Messages */}
                  {msgs.map((msg, idx) => {
                    const mine = isMyMessage(msg);
                    const isLastInSequence =
                      idx === msgs.length - 1 ||
                      isMyMessage(msgs[idx + 1]) !== mine;
                    const isSandboxInvite = msg.text?.includes(
                      "I launched a Live Sandbox! Click here to join: "
                    );

                    if (msg.type === "call_action") {
                      return (
                        <Motion.div
                          key={msg._id || idx}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex justify-center my-3"
                        >
                          <div className="bg-[#111113] border border-white/[0.07] rounded-xl px-4 py-2.5 flex items-center gap-3 max-w-[280px]">
                            <div className="w-7 h-7 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
                              <PhoneOff className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <p className="text-xs text-[#f0f0f0] font-medium">
                                {msg.text}
                              </p>
                              <p className="text-[10px] text-[#52525b] font-mono mt-0.5">
                                {formatTime(msg.createdAt)}
                              </p>
                            </div>
                          </div>
                        </Motion.div>
                      );
                    }

                    return (
                      <Motion.div
                        key={msg._id || idx}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15 }}
                        className={`group flex items-end gap-2 mb-1 ${
                          mine ? "flex-row-reverse" : "flex-row"
                        } ${isLastInSequence ? "mb-3" : ""}`}
                      >
                        {!mine && (
                          <div className="w-7 shrink-0">
                            {isLastInSequence && (
                              <img
                                src={
                                  (typeof msg.senderId === "object"
                                    ? msg.senderId.photoUrl
                                    : targetUser?.photoUrl) || DEFAULT_AVATAR
                                }
                                alt="avatar"
                                className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = DEFAULT_AVATAR;
                                }}
                              />
                            )}
                          </div>
                        )}

                        <div
                          className={`max-w-[85%] md:max-w-[75%] px-4 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-sm select-text ${
                            mine
                              ? "bg-[#ccff00]/10 border border-[#ccff00]/20 text-[#f0f0f0] rounded-2xl rounded-tr-sm"
                              : "bg-[#1a1a1f] border border-white/[0.06] text-[#d4d4d8] rounded-2xl rounded-tl-sm"
                          }`}
                        >
                          {renderMessageContent(
                            msg.text,
                            mine,
                            isSandboxInvite
                          )}
                          <div className="flex items-center justify-end gap-1.5 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="font-mono text-[10px] text-[#52525b]">
                              {formatTime(msg.createdAt)}
                            </span>
                            {mine && (
                              <span className="text-[#52525b]">
                                {msg.seen ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-[#ccff00]/80" />
                                ) : (
                                  <Check className="w-3.5 h-3.5 text-[#52525b]" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </Motion.div>
                    );
                  })}
                </div>
              ))}

              {/* Typing indicator */}
              <AnimatePresence>
                {isTyping && (
                  <Motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-end gap-2 mb-3"
                  >
                    <div className="w-7 shrink-0">
                      <img
                        src={targetUser?.photoUrl || DEFAULT_AVATAR}
                        alt="avatar"
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = DEFAULT_AVATAR;
                        }}
                      />
                    </div>
                    <div className="bg-[#1a1a1f] border border-white/[0.06] px-4 py-3 rounded-2xl rounded-bl-sm">
                      <div className="flex gap-1.5 items-center h-2">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="w-1.5 h-1.5 bg-[#ccff00] rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  </Motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} className="h-2" />
            </div>

            {/* Input Composer */}
            <div className="p-3 sm:p-4 bg-[#111113] border-t border-white/[0.07] z-20">
              <div className="flex items-end gap-2 max-w-4xl mx-auto">
                <button
                  type="button"
                  onClick={handleInsertCodeSnippet}
                  title="Insert Code Block"
                  className="p-2.5 text-[#52525b] hover:text-[#ccff00] hover:bg-white/5 rounded-lg transition-colors shrink-0 mb-0.5 cursor-pointer"
                >
                  <Code className="w-4 h-4" />
                </button>
                <div className="flex-1 bg-[#1a1a1f] rounded-xl border border-white/10 focus-within:border-[#ccff00]/50 focus-within:ring-1 focus-within:ring-[#ccff00]/30 transition-all overflow-hidden">
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={inputText}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message or code snippet..."
                    className="w-full bg-transparent px-3.5 py-2.5 text-xs sm:text-sm text-[#f0f0f0] placeholder:text-[#52525b] outline-none resize-none max-h-32"
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim() || !socketConnected}
                  className="p-2.5 rounded-xl bg-[#ccff00] hover:bg-[#d9ff33] text-black font-bold transition-all shadow-[0_0_15px_rgba(204,255,0,0.2)] disabled:opacity-20 disabled:cursor-not-allowed shrink-0 mb-0.5 cursor-pointer"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;
