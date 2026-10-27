import { Outlet, useNavigate } from "react-router-dom";
import LeftSidebar from "./LeftSidebar";
import Header from "./Header";
import BottomTabBar from "./BottomTabBar";
import CommandPalette from "./CommandPalette";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addUser } from "../redux/userSlice";
import { useEffect, useCallback } from "react";
import axios from "axios";
import { getSocket } from "../utils/socket";
import { addNotification, setNotifications } from "../redux/notificationSlice";
import { setOnlineUsers } from "../redux/onlineUsersSlice";
import { addIncomingRequest } from "../redux/requestSlice";

const Body = () => {
  const userData = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchUser = useCallback(async () => {
    if (userData) return;
    try {
      const res = await axios.get(BASE_URL + "/profile/view", {
        withCredentials: true,
      });
      dispatch(addUser(res.data));
      try {
        sessionStorage.removeItem("octopair_from_root");
      } catch {}
    } catch (err) {
      if (err?.response?.status === 401) {
        // Clear all stale speculative authentication hints so unauthenticated visitors are never trapped
        try {
          localStorage.removeItem("octopair_auth_hint");
          localStorage.removeItem("octopair_auth");
          localStorage.removeItem("devtinder_auth_hint");
          localStorage.removeItem("devtinder_auth");
          document.cookie = "auth_hint=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        } catch {}

        // If user arrived here from a speculative root redirect, route them back to the Landing Page
        const wasRedirectedFromRoot = typeof window !== "undefined" && (
          sessionStorage.getItem("octopair_from_root") === "1" ||
          sessionStorage.getItem("octopair_from_root") === "true"
        );
        if (wasRedirectedFromRoot) {
          try {
            sessionStorage.removeItem("octopair_from_root");
          } catch {}
          navigate("/", { replace: true });
          return;
        }

        if (
          window.location.pathname !== "/login" &&
          window.location.pathname !== "/"
        ) {
          navigate("/login");
        }
      }
      console.log(err);
    }
  }, [userData, dispatch, navigate]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await axios.get(BASE_URL + "/notifications", {
        withCredentials: true,
      });
      dispatch(setNotifications(res.data));
    } catch (err) {
      console.log("Could not fetch notifications:", err?.message);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!userData) return;

    fetchNotifications();
    const socket = getSocket();

    const handleNewNotification = (notification) => {
      dispatch(addNotification(notification));
    };

    const handleOnlineUsers = (usersArray) => {
      dispatch(setOnlineUsers(usersArray));
    };

    const handleIncomingRequest = (requestData) => {
      dispatch(addIncomingRequest(requestData));
    };

    socket.on("newNotification", handleNewNotification);
    socket.on("onlineUsers", handleOnlineUsers);
    socket.on("connectionRequest", handleIncomingRequest);
    socket.on("newRequest", handleIncomingRequest);
    socket.on("incomingRequest", handleIncomingRequest);

    // Redirect incomplete profiles to onboarding
    if (userData && userData.profileComplete === false && window.location.pathname !== "/onboarding") {
      navigate("/onboarding");
      return;
    }

    // Only redirect away from login if already authenticated; allow landing page access
    if (window.location.pathname === "/login") {
      navigate("/feed");
    }

    return () => {
      socket.off("newNotification", handleNewNotification);
      socket.off("onlineUsers", handleOnlineUsers);
      socket.off("connectionRequest", handleIncomingRequest);
      socket.off("newRequest", handleIncomingRequest);
      socket.off("incomingRequest", handleIncomingRequest);
    };
  }, [userData, dispatch, fetchNotifications, navigate]);

  return (
    <div className="h-dvh flex flex-col lg:flex-row bg-[#09090b] text-[#f0f0f0] overflow-hidden">
      {/* -- Global Command Palette (Cmd+K) -- */}
      <CommandPalette />

      {/* -- Header: ONLY mount on mobile for unauthenticated users -- */}
      {!userData && (
        <div className="w-full absolute top-0 z-50 lg:hidden">
          <Header />
        </div>
      )}

      {/* -- Authenticated State: Global Desktop Left Sidebar -- */}
      {userData && <LeftSidebar />}

      {/* -- Main Content Area (Scrollable with mobile bottom bar clearance) -- */}
      <div
        id="main-scroll-container"
        className={`flex-1 overflow-x-hidden overflow-y-auto h-full w-full ${
          !userData ? "pt-24" : "pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0"
        }`}
      >
        <Outlet />
      </div>

      {/* -- Mobile Bottom Tab Bar -- */}
      {userData && <BottomTabBar />}
    </div>
  );
};

export default Body;
