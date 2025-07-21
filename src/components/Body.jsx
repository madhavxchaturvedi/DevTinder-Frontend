import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import bgImage from "../assets/bg-image.png";

const Body = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1" style={{ backgroundImage: `url(${bgImage})` }}>
        <Outlet />
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default Body;
