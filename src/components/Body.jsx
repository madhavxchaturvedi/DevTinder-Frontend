import { Outlet, useNavigate } from "react-router-dom";
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
  const Navigate = useNavigate();

  const fetchUser = async () => {
    if (userData) return;
    try {
      const res = await axios.get(BASE_URL + "/profile/view", {
        withCredentials: true,
      });
      dispatch(addUser(res.data));
    } catch (err) {
      if (err?.response?.status === 401) {
        Navigate("/login");
      }
      console.log(err);
    }
  };

  // Fetch existing notifications from DB on mount
  const fetchNotifications = async () => {
    try {
      const res = await axios.get(BASE_URL + "/notifications", {
        withCredentials: true,
      });
      dispatch(setNotifications(res.data));
    } catch (err) {
      // Silent — not critical
      console.log("Could not fetch notifications:", err?.message);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Set up socket connection and listen for real-time notifications
  // Only after the user is known to be logged in
  useEffect(() => {
    if (!userData) return;

    fetchNotifications();

    const socket = getSocket();

    const handleNewNotification = (notification) => {
      dispatch(addNotification(notification));
    };

    socket.on("newNotification", handleNewNotification);

    return () => {
      socket.off("newNotification", handleNewNotification);
    };
  }, [userData]);

  return (
    <div className="min-h-screen flex flex-col relative text-[#0a0a0a] selection:bg-[#ccff00]/50 bg-[#f4f4f5]">

      <Toaster />
      <Header />
      <div className="flex-1 pt-28 pb-10 w-full flex flex-col items-center">
        <Outlet />
      </div>

      {/* <Footer /> */}
    </div>
  );
};

export default Body;
