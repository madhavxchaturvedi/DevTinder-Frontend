import axios from "axios";
import React, { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { removeUser } from "../redux/userSlice";
import { markAllRead, clearNotifications } from "../redux/notificationSlice";
import { motion, AnimatePresence } from "framer-motion";

// How long ago a date was (e.g. "2 min ago", "3 hr ago")
const timeAgo = (dateString) => {
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);
  if (seconds < 60) return "just now";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const notificationMessage = (n) => {
  const name = n.fromUserId?.firstName || "Someone";
  if (n.type === "connection_request") return `${name} sent you a connection request`;
  if (n.type === "request_accepted") return `${name} accepted your connection request 🎉`;
  if (n.type === "request_rejected") return `${name} declined your request`;
  return "You have a new notification";
};

const notificationLink = (n) => {
  if (n.type === "connection_request") return "/requests";
  if (n.type === "request_accepted") return "/connections";
  return "/";
};

const Header = () => {
  const user = useSelector((store) => store.user);
  const { items: notifications, unreadCount } = useSelector(
    (store) => store.notifications
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
      dispatch(removeUser());
      dispatch(clearNotifications());
      navigate("/login");
    } catch (err) {
      console.log(err);
    }
  };

  const handleOpenNotifications = async () => {
    setNotifOpen((prev) => !prev);
    // Mark as read on open if there are unread
    if (unreadCount > 0) {
      try {
        await axios.patch(
          BASE_URL + "/notifications/mark-read",
          {},
          { withCredentials: true }
        );
        dispatch(markAllRead());
      } catch (err) {
        // silent
      }
    }
  };

  return (
    <div className="navbar bg-transparent shadow-none px-6 w-full z-50">
      <div className="flex-1">
        <Link
          to={user ? "/feed" : "/"}
          className="text-2xl font-bold bg-gradient-to-tr from-[#fe5a33] via-[#fe0142] via-30% to-[#fe6d27] inline-block text-transparent bg-clip-text"
        >
          DevTinder
        </Link>
      </div>

      {user && (
        <div className="flex items-center gap-3">
          <p className="text-white pt-1 px-2 text-lg font-medium hidden sm:block">
            Hello, {user.firstName}
          </p>

          {/* ── Notification Bell ───────────────────────────── */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={handleOpenNotifications}
              className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              {/* Bell icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-white/80"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>

              {/* Unread badge */}
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-[#fe5a33] to-[#fe0142] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-[#fe0142]/50"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </motion.span>
              )}
            </button>

            {/* ── Dropdown ──────────────────────────────────── */}
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-80 bg-[#0f0f0f]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden z-50"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                    <span className="text-white font-semibold text-sm">
                      Notifications
                    </span>
                    {unreadCount === 0 && notifications.length > 0 && (
                      <span className="text-xs text-white/30">All caught up</span>
                    )}
                  </div>

                  {/* Notification list */}
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 gap-2">
                        <span className="text-3xl">🔔</span>
                        <p className="text-white/40 text-sm">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <Link
                          key={n._id}
                          to={notificationLink(n)}
                          onClick={() => setNotifOpen(false)}
                          className={`flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5 last:border-0 ${
                            !n.read ? "bg-[#fe0142]/5" : ""
                          }`}
                        >
                          {/* Avatar */}
                          <div className="relative flex-shrink-0">
                            <img
                              src={
                                n.fromUserId?.photoUrl ||
                                "https://geographyandyou.com/images/user-profile.png"
                              }
                              alt={n.fromUserId?.firstName}
                              className="w-9 h-9 rounded-full object-cover"
                            />
                            {/* Type icon */}
                            <span className="absolute -bottom-1 -right-1 text-xs">
                              {n.type === "connection_request" ? "👋" : "🎉"}
                            </span>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className="text-white/85 text-sm leading-snug">
                              {notificationMessage(n)}
                            </p>
                            <p className="text-white/35 text-xs mt-0.5">
                              {timeAgo(n.createdAt)}
                            </p>
                          </div>

                          {/* Unread dot */}
                          {!n.read && (
                            <span className="w-2 h-2 mt-1.5 flex-shrink-0 bg-[#fe0142] rounded-full" />
                          )}
                        </Link>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="px-4 py-2.5 border-t border-white/10">
                      <Link
                        to="/requests"
                        onClick={() => setNotifOpen(false)}
                        className="text-xs text-[#fe5a33] hover:text-[#fe0142] transition font-medium"
                      >
                        View all requests →
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Avatar dropdown ─────────────────────────────── */}
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar ring-2 ring-[#fe0142]/30 hover:ring-[#fe0142]/60 transition-all"
            >
              <div className="w-10 rounded-full">
                <img alt="Profile" src={user.photoUrl} />
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-[#0f0f0f]/95 backdrop-blur-xl border border-white/10 rounded-2xl z-10 mt-3 w-52 p-2 shadow-2xl"
            >
              <li>
                <Link to="/profile" className="text-white/80 hover:text-white justify-between">
                  Profile
                  <span className="badge badge-sm bg-[#fe0142] text-white border-0">
                    Edit
                  </span>
                </Link>
              </li>
              <li>
                <Link to="/connections" className="text-white/80 hover:text-white">
                  Connections
                </Link>
              </li>
              <li>
                <Link to="/requests" className="text-white/80 hover:text-white">
                  Requests
                  {unreadCount > 0 && (
                    <span className="badge badge-sm bg-[#fe0142] text-white border-0">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              </li>
              <li>
                <Link to="/premium" className="text-white/80 hover:text-white">
                  Premium ✨
                </Link>
              </li>
              <div className="divider my-0.5 opacity-20" />
              <li>
                <button
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-300"
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
