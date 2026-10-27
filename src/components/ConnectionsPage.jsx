import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { addConnections } from "../redux/connectionSlice";
import { addRequest } from "../redux/requestSlice";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";

const DEFAULT_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2352525b'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";

const ConnectionsPage = () => {
  const connections = useSelector((store) => store.connections);
  const requests = useSelector((store) => store.requests);
  const onlineUsers = useSelector((store) => store.onlineUsers || []);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const pendingCount = Array.isArray(requests) ? requests.length : 0;

  const fetchConnections = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(BASE_URL + "/user/connections", {
        withCredentials: true,
      });
      dispatch(addConnections(res.data?.data || []));
    } catch (err) {
      toast.error("Could not load connections.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  useEffect(() => {
    if (!requests) {
      axios
        .get(BASE_URL + "/user/request/received", { withCredentials: true })
        .then((res) => {
          if (res.data?.data) dispatch(addRequest(res.data.data));
        })
        .catch(() => {});
    }
  }, [requests, dispatch]);

  const formatTimestamp = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const now = new Date();
    const diffHours = (now - date) / (1000 * 60 * 60);

    if (diffHours < 24 && now.getDate() === date.getDate()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    if (diffHours < 48) {
      return "Yesterday";
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  // Read saved conversation history from localStorage
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

  // Partition connections into new matches vs active conversations
  const newMatches = [];
  const conversationList = [];

  (connections || []).forEach((user) => {
    const saved = savedConversations[user._id];
    const hasMessages = Boolean(user.hasMessages || user.lastMessage || saved?.text);
    if (hasMessages) {
      conversationList.push({
        ...user,
        lastMessage: user.lastMessage || (saved ? { text: saved.text, createdAt: saved.createdAt } : null),
      });
    } else {
      newMatches.push(user);
    }
  });

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 min-h-dvh pb-20 text-[#f0f0f0]">
      {/* Top Underline Tabs Switcher */}
      <div className="flex items-center gap-6 border-b border-white/[0.07] mb-6">
        <button
          onClick={() => navigate("/connections")}
          className="pb-3 text-sm font-bold border-b-2 border-[#ccff00] text-[#ccff00] flex items-center gap-2 cursor-pointer transition-colors"
        >
          <span>Connections</span>
          <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/20">
            {connections?.length || 0}
          </span>
        </button>
        <button
          onClick={() => navigate("/requests")}
          className="pb-3 text-sm font-medium text-[#52525b] hover:text-[#f0f0f0] flex items-center gap-2 cursor-pointer transition-colors"
        >
          <span>Requests</span>
          {pendingCount > 0 && (
            <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-[#b266ff]/10 text-[#b266ff] border border-[#b266ff]/20">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {loading && (!connections || connections.length === 0) ? (
        <div>
          <div className="mb-6">
            <div className="h-8 w-48 bg-white/5 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-72 bg-white/5 rounded-lg animate-pulse" />
          </div>
          <div className="space-y-3 mt-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-16 w-full bg-[#111113] border border-white/[0.07] rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
      ) : !connections || connections.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-[#111113] border border-white/[0.07] flex items-center justify-center mb-4 text-[#52525b] shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <MessageSquare className="w-8 h-8 text-[#ccff00]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#f0f0f0] mb-2">
            No connections yet
          </h1>
          <p className="text-xs sm:text-sm text-[#52525b] max-w-sm mb-6 leading-relaxed">
            Start exploring developers on the feed and discover cards. When you both connect, your direct conversations will appear here.
          </p>
          <button
            onClick={() => navigate("/discover")}
            className="bg-[#ccff00] text-black font-bold text-xs px-5 py-2.5 rounded-lg hover:bg-[#d9ff33] transition-colors shadow-[0_0_20px_rgba(204,255,0,0.2)]"
          >
            Discover Developers
          </button>
        </div>
      ) : (
        <>
          {/* Top Header info */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f0f0f0]">
                Connections
              </h1>
              <p className="text-xs text-[#52525b] mt-1">
                Manage your network and start collaborating in real-time.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-md bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/20">
                {connections.length} {connections.length === 1 ? "Connection" : "Connections"}
              </span>
            </div>
          </div>

          {/* Top Section: New Matches (horizontal circular avatar scroller) */}
          {newMatches.length > 0 && (
            <div className="mb-8 bg-[#111113] border border-white/[0.07] rounded-xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-[10px] uppercase font-bold tracking-widest text-[#52525b]">
                  NEW MATCHES
                </h2>
                <span className="text-[10px] font-mono text-[#52525b]">
                  {newMatches.length} pending chat
                </span>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2 pt-1 scrollbar-hide px-1">
                {newMatches.map((user) => {
                  const isOnline = onlineUsers.includes(user._id);
                  return (
                    <Link
                      key={`new-match-${user._id}`}
                      to={`/chat/${user._id}`}
                      className="flex flex-col items-center gap-2 min-w-[72px] group transition-transform hover:scale-105"
                    >
                      <div className="relative">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-[2px] ring-1 ring-[#ccff00]/40 group-hover:ring-[#ccff00] transition-all shadow-[0_0_12px_rgba(204,255,0,0.15)] group-hover:shadow-[0_0_16px_rgba(204,255,0,0.3)]">
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
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#09090b]" />
                        )}
                      </div>
                      <span className="text-xs text-[#f0f0f0] truncate w-16 text-center group-hover:text-[#ccff00] transition-colors">
                        {user.firstName}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Conversations Section */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-[10px] uppercase font-bold tracking-widest text-[#52525b]">
                CONVERSATIONS
              </h2>
              <span className="text-[10px] font-mono text-[#52525b]">
                {conversationList.length} active
              </span>
            </div>

            {conversationList.length > 0 ? (
              <div className="space-y-1">
                {conversationList.map((user) => {
                  const isOnline = onlineUsers.includes(user._id);
                  const previewText =
                    user.lastMessage?.text ||
                    user.headline ||
                    user.about ||
                    "Tap to start chatting with your match";
                  const timestamp =
                    user.lastMessage?.createdAt || user.updatedAt || user.createdAt;

                  return (
                    <Link
                      key={`conv-${user._id}`}
                      to={`/chat/${user._id}`}
                      className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border border-transparent hover:border-white/[0.06] hover:bg-white/[0.03] transition-all group"
                    >
                      {/* 32px rounded-full avatar */}
                      <div className="relative shrink-0">
                        <img
                          src={user.photoUrl || DEFAULT_AVATAR}
                          alt={user.firstName}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10 group-hover:ring-[#ccff00]/40 transition-all"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = DEFAULT_AVATAR;
                          }}
                        />
                        {isOnline && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-1 ring-[#09090b]" />
                        )}
                      </div>

                      {/* Name & message preview */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="font-bold text-[13px] text-[#f0f0f0] truncate group-hover:text-[#ccff00] transition-colors">
                            {user.firstName} {user.lastName}
                          </span>
                          {timestamp && (
                            <span className="font-mono text-[10px] text-[#52525b] shrink-0">
                              {formatTimestamp(timestamp)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#52525b] truncate max-w-sm sm:max-w-md group-hover:text-[#71717a] transition-colors">
                          {previewText}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 px-4 rounded-xl border border-white/[0.07] bg-[#111113] text-center">
                <p className="text-xs text-[#52525b]">
                  No conversations started yet. Tap any match above to start chatting.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ConnectionsPage;
