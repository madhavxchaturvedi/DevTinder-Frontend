import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const Body = () => {
  return (
    <>
      <Header />
      <Outlet />
      {/* <Footer /> */}
    </>
  );
};

export default Body;
