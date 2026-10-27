import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL, DEFAULT_AVATAR } from "../utils/constants";
import {
  Search,
  Compass,
  Home,
  Users,
  MessageSquare,
  FolderGit2,
  User,
  Sparkles,
  Settings,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { createPortal } from "react-dom";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { cn } from "@/lib/utils";

// Sub-primitives for shadcn compatibility
export const CommandDialog = ({ open, onOpenChange, children, ...props }) => {
  if (!open) return null;
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[200] flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-sm animate-in fade-in-0 duration-150"
      onClick={() => onOpenChange?.(false)}
      {...props}
    >
      <div
        className="relative w-full max-w-xl bg-[#1a1a1f] border border-white/[0.07] rounded-2xl shadow-2xl p-0 overflow-hidden text-[#f0f0f0] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

export const CommandInput = React.forwardRef(({ value, onChange, placeholder, ...props }, ref) => (
  <div className="flex items-center px-4 border-b border-white/[0.07]">
    <Search className="h-4 w-4 shrink-0 text-[#52525b] mr-2" />
    <input
      ref={ref}
      value={value}
      onChange={onChange}
      placeholder={placeholder || "Type a command or search..."}
      className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-[#52525b] text-[#f0f0f0] disabled:cursor-not-allowed disabled:opacity-50"
      {...props}
    />
  </div>
));
CommandInput.displayName = "CommandInput";

export const CommandList = ({ children, className, ...props }) => (
  <div className={cn("max-h-80 overflow-y-auto p-2 scrollbar-hide space-y-2", className)} {...props}>
    {children}
  </div>
);

export const CommandGroup = ({ heading, children, className, ...props }) => (
  <div className={cn("px-2 py-1.5", className)} {...props}>
    {heading && (
      <div className="px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#52525b]">
        {heading}
      </div>
    )}
    <div className="space-y-0.5">{children}</div>
  </div>
);

export const CommandItem = ({ onSelect, onClick, active, children, className, ...props }) => (
  <div
    role="button"
    tabIndex={0}
    onClick={onSelect || onClick}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        (onSelect || onClick)?.();
      }
    }}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-lg px-2.5 py-2 text-sm outline-none transition-colors hover:bg-white/[0.05] hover:text-[#f0f0f0] text-[#a0a0a0]",
      active && "bg-[#ccff00]/10 text-[#ccff00]",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

const CommandPalette = ({ open: controlledOpen, onOpenChange: setControlledOpen }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen : setInternalOpen;

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const user = useSelector((store) => store.user);
  const navigate = useNavigate();
  const searchTimeoutRef = useRef(null);

  // Global keydown listener for Cmd+K / Ctrl+K and custom event
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    const handleCustomOpen = () => setOpen(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-palette", handleCustomOpen);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-palette", handleCustomOpen);
    };
  }, [setOpen]);

  // Search users via GET /user/search?q=...
  const fetchUsers = useCallback(async (q) => {
    if (!q || q.trim().length < 2) {
      setSearchResults([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/user/search?q=${encodeURIComponent(q.trim())}`, {
        withCredentials: true,
      });
      setSearchResults(res.data?.data || []);
    } catch (err) {
      console.error("Search error:", err?.message);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (val.trim().length >= 2) {
      setLoading(true);
      searchTimeoutRef.current = setTimeout(() => {
        fetchUsers(val);
      }, 250);
    } else {
      setSearchResults([]);
      setLoading(false);
    }
  };

  const handleSelectRoute = (path) => {
    setOpen(false);
    setQuery("");
    navigate(path);
  };

  const navItems = [
    { label: "My Feed", path: "/feed", icon: Home, category: "Navigation" },
    { label: "Explore & Discover", path: "/discover", icon: Compass, category: "Navigation" },
    { label: "Network Hub", path: "/network", icon: Users, category: "Navigation" },
    { label: "Messages & Chat", path: "/chat", icon: MessageSquare, category: "Navigation" },
    { label: "My Projects", path: "/projects", icon: FolderGit2, category: "Navigation" },
    { label: "Edit Profile", path: "/profile", icon: Settings, category: "Account" },
    { label: "OctoPair Premium", path: "/premium", icon: Sparkles, category: "Account" },
  ];

  if (user?._id) {
    navItems.unshift({
      label: "My Public Profile",
      path: `/user/${user._id}`,
      icon: User,
      category: "Account",
    });
  }

  const filteredNav = query.trim()
    ? navItems.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      )
    : navItems;

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        value={query}
        onChange={handleQueryChange}
        placeholder="Type a command or search developers & pages... (Cmd+K)"
      />

      <CommandList>
        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center justify-center p-4 text-xs text-[#52525b] gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-[#ccff00]" />
            Searching OctoPair...
          </div>
        )}

        {/* User Search Results */}
        {searchResults.length > 0 && (
          <CommandGroup heading="Developers">
            {searchResults.map((dev) => (
              <CommandItem
                key={dev._id}
                onSelect={() => handleSelectRoute(`/user/${dev._id}`)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-7 w-7 rounded-lg border border-white/10">
                    <AvatarImage src={dev.photoUrl || DEFAULT_AVATAR} alt={dev.firstName} />
                    <AvatarFallback className="bg-[#111113] text-[10px] font-mono text-[#f0f0f0]">
                      {(dev.firstName?.[0] || "U").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-sm truncate text-[#f0f0f0]">
                      {dev.firstName} {dev.lastName}
                    </span>
                    {dev.headline && (
                      <span className="text-[11px] font-mono text-[#52525b] truncate">
                        {dev.headline}
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[#52525b] shrink-0 opacity-60" />
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Pages & Commands */}
        {filteredNav.length > 0 && (
          <CommandGroup heading="Quick Navigation">
            {filteredNav.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.path}
                  onSelect={() => handleSelectRoute(item.path)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-[#52525b]" />
                    <span className="font-medium text-sm text-[#f0f0f0]">{item.label}</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#52525b]">
                    {item.path}
                  </span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {/* Empty State */}
        {!loading && query.trim() && searchResults.length === 0 && filteredNav.length === 0 && (
          <div className="text-center py-6 text-sm text-[#52525b]">
            No matching developers or commands found for "{query}".
          </div>
        )}
      </CommandList>

      <div className="border-t border-white/[0.07] px-4 py-2 flex items-center justify-between text-[11px] text-[#52525b] bg-[#111113]">
        <span>
          Press{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px] text-[#a0a0a0]">
            Esc
          </kbd>{" "}
          to close
        </span>
        <span>
          <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px] text-[#a0a0a0]">
            Enter
          </kbd>{" "}
          to select
        </span>
      </div>
    </CommandDialog>
  );
};

export default CommandPalette;
