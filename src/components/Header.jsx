import axios from "axios";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL, DEFAULT_AVATAR } from "../utils/constants";
import { removeUser } from "../redux/userSlice";
import { clearNotifications } from "../redux/notificationSlice";
import NotificationsDropdown from "./NotificationsDropdown";
import { timeAgo } from "../utils/timeAgo";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Sparkles, LogOut, User, Users, UserCheck } from "lucide-react";
import { OctoPairLogo } from "./brand/OctoPairLogo";

const Header = () => {
  const user = useSelector((store) => store.user);
  const { unreadCount } = useSelector((store) => store.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      try {
        localStorage.removeItem("octopair_auth_hint");
        localStorage.removeItem("octopair_auth");
        localStorage.removeItem("devtinder_auth_hint");
        localStorage.removeItem("devtinder_auth");
      } catch {
        // Ignore storage errors on logout
      }
      dispatch(removeUser());
      dispatch(clearNotifications());
      navigate("/login");
    }
  };

  const initials = (
    (user?.firstName?.[0] || "") + (user?.lastName?.[0] || "")
  ).toUpperCase() || "U";

  return (
    <header className="fixed top-0 left-0 w-full bg-[#09090b]/95 backdrop-blur-md border-b border-white/[0.07] px-6 py-3 flex justify-between items-center z-[100] transition-colors lg:hidden select-none">
      <div className="flex-1 flex items-center gap-2">
        <Link
          to={user ? "/feed" : "/"}
          className="flex items-center gap-2 text-[#f0f0f0] hover:text-[#ccff00] transition-colors group"
        >
          <OctoPairLogo className="h-7 w-auto text-[#f0f0f0] group-hover:text-[#ccff00] transition-colors" />
          <span className="text-xl font-black tracking-tighter">
            OctoPair
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {!user ? (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#ccff00] text-black hover:bg-[#d9ff33] transition-colors"
            >
              Log in
            </Link>
          </div>
        ) : (
          <>
            <Link
              to={`/user/${user._id}`}
              className="text-[#f0f0f0] pt-1 px-2 text-xs font-semibold hidden sm:block hover:text-[#ccff00] transition-colors"
            >
              Hello, {user.firstName}
            </Link>

            <NotificationsDropdown />

            {/* Avatar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className="rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ccff00]"
                title={user.createdAt ? `Active ${timeAgo(user.createdAt)}` : undefined}
              >
                <Avatar className="h-8 w-8 rounded-lg border border-white/10 hover:border-[#ccff00] transition-colors cursor-pointer">
                  <AvatarImage src={user.photoUrl || DEFAULT_AVATAR} alt={user.firstName} />
                  <AvatarFallback className="bg-[#111113] text-xs font-mono font-bold text-[#f0f0f0]">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-2xl bg-[#1a1a1f] border border-white/[0.07] text-[#f0f0f0]">
                <DropdownMenuItem
                  onClick={() => navigate(`/user/${user._id}`)}
                  className="flex items-center justify-between font-medium cursor-pointer text-xs hover:bg-white/5"
                >
                  <span className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-[#ccff00]" /> View Profile
                  </span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => navigate("/profile")}
                  className="flex items-center justify-between font-medium cursor-pointer text-xs hover:bg-white/5"
                >
                  <span className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-[#52525b]" /> Edit Profile
                  </span>
                  <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0 bg-[#ccff00]/20 text-[#ccff00] border border-[#ccff00]/30">
                    Edit
                  </Badge>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => navigate("/network?tab=connections")}
                  className="flex items-center gap-2 font-medium cursor-pointer text-xs hover:bg-white/5"
                >
                  <Users className="h-3.5 w-3.5 text-[#52525b]" /> Connections
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => navigate("/network?tab=requests")}
                  className="flex items-center justify-between font-medium cursor-pointer text-xs hover:bg-white/5"
                >
                  <span className="flex items-center gap-2">
                    <UserCheck className="h-3.5 w-3.5 text-[#52525b]" /> Requests
                  </span>
                  {unreadCount > 0 && (
                    <Badge variant="default" className="text-[10px] font-mono px-1.5 py-0 bg-[#b266ff] text-white">
                      {unreadCount}
                    </Badge>
                  )}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => navigate("/premium")}
                  className="flex items-center gap-2 font-medium cursor-pointer text-xs hover:bg-white/5"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#b266ff]" /> Premium
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1 bg-white/[0.07]" />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer text-xs"
                >
                  <LogOut className="h-3.5 w-3.5" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
