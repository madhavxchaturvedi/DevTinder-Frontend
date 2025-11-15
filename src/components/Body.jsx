import { Outlet, useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import bgImage from "../assets/bg-image.png";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addUser } from "../redux/userSlice";
import { useEffect } from "react";
import axios from "axios";
import { Toaster } from "react-hot-toast";

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
      if (err.status === 401) {
        Navigate("/login");
      }
      console.log(err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Fixed background image behind everything */}
      <div
        className="fixed top-0 left-0 w-full h-full bg-no-repeat bg-cover bg-center -z-10"
        style={{ backgroundImage: `url(${bgImage})` }}
      ></div>

      <Toaster />
      <Header />
      <div className="flex-1">
        <Outlet />
      </div>
      
      {/* <Footer /> */}
    </div>
  );
};

export default Body;
