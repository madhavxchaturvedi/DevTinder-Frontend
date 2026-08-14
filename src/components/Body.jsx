import { Outlet, useNavigate } from "react-router-dom";
import LeftSidebar from "./LeftSidebar";
import Header from "./Header";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addUser } from "../redux/userSlice";
import { useEffect } from "react";
import axios from "axios";
import { Toaster } from "react-hot-toast";
import { getSocket } from "../utils/socket";
import { addNotification, setNotifications } from "../redux/notificationSlice";

const Body = () => {
  const userData = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchUser = async () => {
    if (userData) return;
    try {
      const res = await axios.get(BASE_URL + "/profile/view", {
        withCredentials: true,
      });
      dispatch(addUser(res.data));
    } catch (err) {
      if (err?.response?.status === 401) {
        if (
          window.location.pathname !== "/login" &&
          window.location.pathname !== "/"
        ) {
          navigate("/login");
        }
      }
      console.log(err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(BASE_URL + "/notifications", {
        withCredentials: true,
      });
      dispatch(setNotifications(res.data));
    } catch (err) {
      console.log("Could not fetch notifications:", err?.message);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (!userData) return;

    fetchNotifications();
    const socket = getSocket();

    const handleNewNotification = (notification) => {
      dispatch(addNotification(notification));
    };

    socket.on("newNotification", handleNewNotification);

    if (window.location.pathname === "/login" || window.location.pathname === "/") {
      navigate("/feed");
    }

    return () => {
      socket.off("newNotification", handleNewNotification);
    };
  }, [userData]);

  return (
    <div className="h-screen overflow-hidden bg-[#09090b] text-[#e5e5e5] flex flex-col lg:flex-row">
      <Toaster 
        toastOptions={{
          style: {
            background: '#121212',
            color: '#e5e5e5',
            border: '1px solid rgba(255,255,255,0.1)',
          }
        }} 
      />
      
      {/* ── Header: Always show for unauthenticated, show on mobile for authenticated ── */}
      <div className={`w-full absolute top-0 z-50 ${userData ? 'lg:hidden' : ''}`}>
        <Header />
      </div>

      {/* ── Authenticated State: Global 3-Column Layout ── */}
      {userData && <LeftSidebar />}

      {/* ── Main Content Area (Scrollable) ── */}
      <div id="main-scroll-container" className={`flex-1 flex flex-col items-center overflow-x-hidden overflow-y-auto h-full ${!userData ? 'pt-24' : ''}`}>
        <Outlet />
      </div>
    </div>
  );
};

export default Body;
