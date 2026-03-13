import { BrowserRouter, Route, Routes } from "react-router-dom";
import Body from "./components/Body";
import Login from "./components/Login";
import Feed from "./components/Feed";
import Profile from "./components/Profile";
import ConnectionsPage from "./components/ConnectionsPage";
import RequestPage from "./components/RequestPage";
import LandingPage from "./components/LandingPage";

const App = () => {
  return (
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route element={<Body />}>
          <Route path="/feed" element={<Feed />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/connections" element={<ConnectionsPage />} />
          <Route path="/requests" element={<RequestPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
