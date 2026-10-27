import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BASE_URL, DEFAULT_AVATAR } from "../utils/constants";
import { getSocket } from "../utils/socket";
import { useNavigate } from "react-router-dom";
import { timeAgo } from "../utils/timeAgo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Bell,
  Heart,
  MessageSquare,
  UserPlus,
  GitFork,
  Users,
  Code2,
  CheckCircle2,
  XCircle,
  Play,
  CheckCheck,
} from "lucide-react";

const getNotificationDetails = (notification) => {
  const actors =
    notification.actorIds?.length > 0
      ? notification.actorIds
      : notification.fromUserId
      ? [notification.fromUserId]
      : [];

  if (actors.length === 0) {
    return {
      text: "Someone interacted with your profile",
      icon: <Bell className="w-3.5 h-3.5 text-muted-foreground" />,
    };
  }

  const firstActor = actors[0];
  const nameStr =
    actors.length === 1
      ? `${firstActor.firstName || "A developer"} ${firstActor.lastName || ""}`.trim()
      : `${firstActor.firstName} and ${actors.length - 1} others`;

  switch (notification.type) {
    case "reaction":
      return {
        text: `${nameStr} reacted to your post`,
        icon: <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500/20" />,
        avatar: firstActor.photoUrl,
      };
    case "comment":
      return {
        text: `${nameStr} commented on your post`,
        icon: <MessageSquare className="w-3.5 h-3.5 text-blue-400" />,
        avatar: firstActor.photoUrl,
      };
    case "fork":
      return {
        text: `${nameStr} forked your code snippet`,
        icon: <GitFork className="w-3.5 h-3.5 text-accent" />,
        avatar: firstActor.photoUrl,
      };
    case "follow":
      return {
        text: `${nameStr} started following you`,
        icon: <UserPlus className="w-3.5 h-3.5 text-primary" />,
        avatar: firstActor.photoUrl,
      };
    case "match":
    case "request_accepted":
      return {
        text: `You and ${nameStr} are now connected!`,
        icon: <Users className="w-3.5 h-3.5 text-primary" />,
        avatar: firstActor.photoUrl,
        link: `/chat/${firstActor._id}`,
      };
    case "connection_request":
      return {
        text: `${nameStr} sent you a connection request`,
        icon: <UserPlus className="w-3.5 h-3.5 text-accent" />,
        avatar: firstActor.photoUrl,
        link: "/network?tab=requests",
      };
    case "project_join_request":
      return {
        text: `${nameStr} requested to join ${notification.post?.title || "your project"}`,
        icon: <Code2 className="w-3.5 h-3.5 text-accent" />,
        avatar: firstActor.photoUrl,
        link: `/project/${notification.post?._id || notification.postId}/requests`,
      };
    case "project_accepted":
      return {
        text: `Your request to join ${notification.post?.title || "project"} was accepted!`,
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-primary" />,
        avatar: firstActor.photoUrl,
        link: `/chat/${firstActor._id}`,
      };
    case "project_rejected":
      return {
        text: `Your request to join ${notification.post?.title || "project"} was declined.`,
        icon: <XCircle className="w-3.5 h-3.5 text-destructive" />,
        avatar: firstActor.photoUrl,
      };
    case "partner_in_room":
      return {
        text: `${nameStr} joined the project workspace!`,
        icon: <Play className="w-3.5 h-3.5 text-primary" />,
        avatar: firstActor.photoUrl,
        link: `/project/room/${notification.roomId || notification.metadata?.roomId}`,
      };
    default:
      return {
        text: `${nameStr} sent an update`,
        icon: <Bell className="w-3.5 h-3.5 text-muted-foreground" />,
        avatar: firstActor.photoUrl,
      };
  }
};

const NotificationsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/notifications`, { withCredentials: true });
        setNotifications(res.data?.notifications || []);
        setUnreadCount(res.data?.unreadCount || 0);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };
    fetchNotifications();

    const sock = getSocket();
    if (sock) {
      const handleNewNotification = (notification) => {
        setNotifications((prev) => {
          const exists = prev.findIndex((n) => n._id === notification._id);
          if (exists >= 0) {
            const next = [...prev];
            next[exists] = notification;
            return next;
          }
          return [notification, ...prev];
        });
        setUnreadCount((prev) => prev + 1);
      };

      sock.on("newNotification", handleNewNotification);
      return () => sock.off("newNotification", handleNewNotification);
    }
  }, []);

  // Close when clicking outside
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
    try {
      await axios.patch(`${BASE_URL}/notifications/mark-read`, {}, { withCredentials: true });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark notifications read", err);
    }
  };

  const toggleDropdown = () => {
    if (!isOpen && unreadCount > 0) {
      handleMarkAsRead();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleDropdown}
        className="relative rounded-full text-foreground/80 hover:text-foreground hover:bg-muted/60"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-primary text-[10px] font-black text-primary-foreground shadow-sm">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 sm:right-auto sm:left-0 mt-3 w-80 sm:w-96 bg-card border border-border/80 rounded-2xl shadow-2xl overflow-hidden z-[9999] animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-4 border-b border-border/50 flex justify-between items-center bg-muted/40">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-primary/20 text-primary">
                  {unreadCount} new
                </Badge>
              )}
            </div>

            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAsRead}
                className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 px-2"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </Button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-border/30">
            {notifications.length === 0 ? (
              <div className="py-12 px-4 text-center text-muted-foreground flex flex-col items-center gap-2">
                <Bell className="w-8 h-8 opacity-30" />
                <p className="text-xs font-medium">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const details = getNotificationDetails(notif);
                return (
                  <div
                    key={notif._id}
                    onClick={() => {
                      if (details.link) {
                        setIsOpen(false);
                        navigate(details.link);
                      }
                    }}
                    className={`flex items-start gap-3 p-3.5 hover:bg-muted/40 transition-colors ${
                      details.link ? "cursor-pointer" : ""
                    } ${notif.read ? "opacity-75" : "bg-primary/5"}`}
                  >
                    <div className="relative shrink-0 mt-0.5">
                      <Avatar className="w-9 h-9 border border-border/60">
                        <AvatarImage src={details.avatar || DEFAULT_AVATAR} alt="Avatar" />
                        <AvatarFallback className="text-xs bg-muted">DEV</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-background rounded-full flex items-center justify-center border border-border/60 shadow-xs">
                        {details.icon}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground/90 leading-snug">
                        {details.text}
                      </p>
                      <span className="text-[10px] text-muted-foreground mt-1 block">
                        {timeAgo(notif.createdAt)}
                      </span>
                    </div>

                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
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
