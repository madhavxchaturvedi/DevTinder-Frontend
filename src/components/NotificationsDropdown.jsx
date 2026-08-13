import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { FiBell, FiHeart, FiMessageSquare, FiUserPlus, FiGitMerge, FiUsers } from "react-icons/fi";
import { getSocket } from "../utils/socket";

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

const getNotificationDetails = (notification) => {
  // Legacy vs New structure support
  const actors = notification.actorIds?.length > 0 ? notification.actorIds : (notification.fromUserId ? [notification.fromUserId] : []);
  if (actors.length === 0) return { text: "Someone interacted with you", icon: <FiBell className="text-gray-400" /> };

  const firstActor = actors[0];
  const nameStr = actors.length === 1 
    ? `${firstActor.firstName} ${firstActor.lastName}`
    : `${firstActor.firstName} and ${actors.length - 1} other${actors.length > 2 ? 's' : ''}`;

  switch (notification.type) {
    case "reaction":
      return {
        text: `${nameStr} reacted to your post`,
        icon: <FiHeart className="text-pink-500" />,
        avatar: firstActor.photoUrl
      };
    case "comment":
      return {
        text: `${nameStr} commented on your post`,
        icon: <FiMessageSquare className="text-blue-500" />,
        avatar: firstActor.photoUrl
      };
    case "fork":
      return {
        text: `${nameStr} forked your code snippet`,
        icon: <FiGitMerge className="text-[#a855f7]" />,
        avatar: firstActor.photoUrl
      };
    case "follow":
      return {
        text: `${nameStr} followed you`,
        icon: <FiUserPlus className="text-green-500" />,
        avatar: firstActor.photoUrl
      };
    case "match":
    case "request_accepted":
      return {
        text: `You and ${nameStr} are now a match!`,
        icon: <FiUsers className="text-[#ccff00]" />,
        avatar: firstActor.photoUrl
      };
    case "connection_request":
      return {
        text: `${nameStr} wants to connect`,
        icon: <FiUserPlus className="text-yellow-500" />,
        avatar: firstActor.photoUrl
      };
    default:
      return {
        text: `${nameStr} interacted with you`,
        icon: <FiBell className="text-gray-400" />,
        avatar: firstActor.photoUrl
      };
  }
};

const NotificationsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/notifications`, { withCredentials: true });
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };
    fetchNotifications();

    const sock = getSocket();
    if (sock) {
      const handleNewNotification = (notification) => {
        setNotifications((prev) => {
          // If batched update, replace the existing one
          const exists = prev.findIndex(n => n._id === notification._id);
          if (exists >= 0) {
            const newArray = [...prev];
            newArray[exists] = notification;
            return newArray;
          }
          return [notification, ...prev];
        });
        setUnreadCount((prev) => prev + 1);
      };

      sock.on("newNotification", handleNewNotification);
      return () => sock.off("newNotification", handleNewNotification);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await axios.patch(`${BASE_URL}/notifications/mark-read`, {}, { withCredentials: true });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark notifications read", err);
    }
  };

  const toggleDropdown = () => {
    if (!isOpen) handleMarkAsRead();
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors relative"
      >
        <FiBell className="text-xl" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#ccff00] text-[#121212] text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-3 w-80 sm:w-96 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[9999] animate-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#121212]">
            <h3 className="font-bold text-white">Notifications</h3>
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-white/40">
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const details = getNotificationDetails(notif);
                return (
                  <div 
                    key={notif._id} 
                    className={`flex items-start gap-3 p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${notif.read ? 'opacity-70' : 'bg-[#ccff00]/5'}`}
                  >
                    <div className="relative flex-shrink-0 mt-1">
                      {details.avatar ? (
                        <img src={details.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-white/10" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                          <FiBell />
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#1a1a1a] rounded-full flex items-center justify-center border border-white/10">
                        {details.icon}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/90 leading-snug">
                        {details.text}
                      </p>
                      <span className="text-[10px] text-white/40 mt-1 block">
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                    </div>
                    
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-[#ccff00] mt-2 flex-shrink-0"></div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
