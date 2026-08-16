import { BrowserRouter, Route, Routes } from "react-router-dom";
import Body from "./components/Body";
import Login from "./components/Login";
import Feed from "./components/Feed";
import Profile from "./components/Profile";
import ConnectionsPage from "./components/ConnectionsPage";
import RequestPage from "./components/RequestPage";
import LandingPage from "./components/LandingPage";
import Premium from "./components/Premium";
import Chat from "./components/Chat";
import UserProfilePage from "./components/UserProfilePage";
import Discover from "./components/Discover";
import Sandbox from "./components/Sandbox";
import ProjectRequests from "./components/ProjectRequests";
import ProjectRoom from "./components/ProjectRoom";

import { WebRTCProvider } from "./context/WebRTCContext";

const App = () => {
  return (
    <BrowserRouter basename="/">
      <WebRTCProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route element={<Body />}>
          <Route path="/feed" element={<Feed />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/connections" element={<ConnectionsPage />} />
          <Route path="/requests" element={<RequestPage />} />
          <Route path="/premium" element={<Premium />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/:targetId" element={<Chat />} />
          <Route path="/user/:userId" element={<UserProfilePage />} />
          <Route path="/project/:postId/requests" element={<ProjectRequests />} />
        </Route>
        <Route path="/sandbox/:roomId" element={<Sandbox />} />
        <Route path="/project/room/:roomId" element={<ProjectRoom />} />
        </Routes>
      </WebRTCProvider>
    </BrowserRouter>
  );
};

export default App;
