import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Home, Compass, Users, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

// Mobile BottomTabBar: Discover, Network, Chat, Profile, Feed tabs
const BottomTabBar = () => {
  const location = useLocation();
  const user = useSelector((store) => store.user);
  const requests = useSelector((store) => store.requests);
  const pendingCount = Array.isArray(requests) ? requests.length : 0;

  if (!user) return null;

  const tabs = [
    {
      name: "Feed",
      path: "/feed",
      icon: Home,
      match: (pathname) => pathname === "/feed" || pathname === "/",
    },
    {
      name: "Discover",
      path: "/discover",
      icon: Compass,
      match: (pathname) => pathname.startsWith("/discover"),
    },
    {
      name: "Network",
      path: "/connections",
      icon: Users,
      badge: pendingCount > 0 ? pendingCount : null,
      match: (pathname) =>
        pathname.startsWith("/network") ||
        pathname.startsWith("/connections") ||
        pathname.startsWith("/requests"),
    },
    {
      name: "Chat",
      path: "/chat",
      icon: MessageSquare,
      match: (pathname) => pathname.startsWith("/chat"),
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden h-16 border-t border-white/[0.07] bg-[#09090b] pb-[env(safe-area-inset-bottom)] px-3 flex items-center justify-around shadow-lg transition-colors select-none"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.match(location.pathname);

        return (
          <Link
            key={tab.name}
            to={tab.path}
            className={cn(
              "flex flex-col items-center justify-center flex-1 py-1 gap-1 text-[11px] font-medium transition-all relative",
              isActive
                ? "text-[#ccff00] font-bold"
                : "text-[#52525b] hover:text-[#a0a0a0]"
            )}
          >
            <div className="relative">
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform",
                  isActive && "scale-110 text-[#ccff00] drop-shadow-[0_0_8px_rgba(204,255,0,0.6)]"
                )}
              />
              {tab.badge && (
                <span className="absolute -top-1 -right-2 bg-[#b266ff]/20 text-[#b266ff] border border-[#b266ff]/40 text-[9px] font-mono font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </div>
            <span>{tab.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomTabBar;
