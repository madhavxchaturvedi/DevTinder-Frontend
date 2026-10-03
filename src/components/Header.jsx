import axios from "axios";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { removeUser } from "../redux/userSlice";
import { clearNotifications } from "../redux/notificationSlice";
import NotificationsDropdown from "./NotificationsDropdown";
import { timeAgo } from "../utils/timeAgo";

const Header = () => {
  const user = useSelector((store) => store.user);
  const { unreadCount } = useSelector(
    (store) => store.notifications
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  return (
    <header className="fixed top-0 left-0 w-full bg-white border-b-4 border-[#0a0a0a] px-8 py-4 flex justify-between items-center z-[100] transition-all duration-300">
      <div className="flex-1 flex items-center gap-2">
        <Link
          to={user ? "/feed" : "/"}
          className="text-3xl font-black tracking-tighter text-[#0a0a0a] inline-block hover:text-[#a855f7] transition-colors"
        >
          DevTinder
        </Link>
      </div>

      {user && (
        <div className="flex items-center gap-3">
          <p className="text-[#0a0a0a] pt-1 px-2 text-lg font-bold hidden sm:block">
            Hello, {user.firstName}
          </p>

          <NotificationsDropdown />

          {/* ── Avatar dropdown ─────────────────────────────── */}
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              title={user.createdAt ? `Active ${timeAgo(user.createdAt)}` : undefined}
              className="btn btn-ghost btn-circle avatar border-2 border-[#0a0a0a] shadow-[2px_2px_0px_#0a0a0a] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#0a0a0a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
              <div className="w-10 rounded-full">
                <img alt="Profile" src={user.photoUrl} />
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-white border-2 border-[#0a0a0a] shadow-[6px_6px_0px_#0a0a0a] rounded-2xl z-10 mt-3 w-52 p-2"
            >
              <li>
                <Link to="/profile" className="text-[#0a0a0a] font-bold hover:bg-gray-100 justify-between">
                  Profile
                  <span className="badge badge-sm bg-[#ccff00] text-[#0a0a0a] border-2 border-[#0a0a0a] shadow-[1px_1px_0px_#0a0a0a]">
                    Edit
                  </span>
                </Link>
              </li>
              <li>
                <Link to="/connections" className="text-[#0a0a0a] font-bold hover:bg-gray-100">
                  Connections
                </Link>
              </li>
              <li>
                <Link to="/requests" className="text-[#0a0a0a] font-bold hover:bg-gray-100">
                  Requests
                  {unreadCount > 0 && (
                    <span className="badge badge-sm bg-[#a855f7] text-white border-2 border-[#0a0a0a] shadow-[1px_1px_0px_#0a0a0a]">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              </li>
              <li>
                <Link to="/premium" className="text-[#0a0a0a] font-bold hover:bg-gray-100">
                  Premium ✨
                </Link>
              </li>
              <div className="divider my-0.5 border-t-2 border-[#0a0a0a]" />
              <li>
                <button
                  onClick={handleLogout}
                  className="text-red-500 font-bold hover:bg-red-50"
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
