import React, { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Body from "./components/Body";
import Login from "./components/Login";
import NotFoundPage from "./components/NotFoundPage";
import ErrorBoundary from "./components/ErrorBoundary";
import { Toaster } from "sonner";
import { WebRTCProvider } from "./context/WebRTCContext";

// Marketing routes under LandingShell with clean code-splitting
const LandingShell = lazy(() => import("./components/landing/LandingShell"));
const LandingPage = lazy(() => import("./components/LandingPage"));
const FeaturesMatchPage = lazy(() => import("./pages/marketing/FeaturesMatchPage"));
const FeaturesCollabPage = lazy(() => import("./pages/marketing/FeaturesCollabPage"));
const FeaturesFeedPage = lazy(() => import("./pages/marketing/FeaturesFeedPage"));
const FeaturesProjectsPage = lazy(() => import("./pages/marketing/FeaturesProjectsPage"));
const PricingDestinationPage = lazy(() => import("./pages/marketing/PricingDestinationPage"));
const CommunityDestinationPage = lazy(() => import("./pages/marketing/CommunityDestinationPage"));

// Lazy-loaded routes for code-splitting and bundle isolation
const Feed = lazy(() => import("./components/Feed"));
const Discover = lazy(() => import("./components/Discover"));
const Profile = lazy(() => import("./components/Profile"));
const NetworkPage = lazy(() => import("./pages/NetworkPage"));
const ConnectionsPage = lazy(() => import("./components/ConnectionsPage"));
const RequestPage = lazy(() => import("./components/RequestPage"));
const Premium = lazy(() => import("./components/Premium"));
const Chat = lazy(() => import("./components/Chat"));
const UserProfilePage = lazy(() => import("./components/UserProfilePage"));
const Sandbox = lazy(() => import("./components/Sandbox"));
const ProjectRequests = lazy(() => import("./components/ProjectRequests"));
const ProjectRoom = lazy(() => import("./components/ProjectRoom"));
const FullscreenPreview = lazy(() => import("./components/FullscreenPreview"));
const MyProjects = lazy(() => import("./components/MyProjects"));
const Onboarding = lazy(() => import("./components/Onboarding"));
const PrivacyPage = lazy(() => import("./components/PrivacyPage"));
const TermsPage = lazy(() => import("./components/TermsPage"));

const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter basename="/">
        <WebRTCProvider>
          <Toaster
            position="bottom-right"
            theme="dark"
            toastOptions={{
              style: {
                background: "#111113",
                color: "#f0f0f0",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              },
            }}
          />
          <Suspense fallback={<div className="min-h-screen bg-[#09090b]" />}>
            <Routes>
              {/* Marketing routes under unified LandingShell */}
              <Route element={<LandingShell />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/features/match" element={<FeaturesMatchPage />} />
                <Route path="/features/collab" element={<FeaturesCollabPage />} />
                <Route path="/features/feed" element={<FeaturesFeedPage />} />
                <Route path="/features/projects" element={<FeaturesProjectsPage />} />
                <Route path="/pricing" element={<PricingDestinationPage />} />
                <Route path="/community" element={<CommunityDestinationPage />} />
              </Route>

              {/* Standalone public / auth routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route element={<Body />}>
                <Route path="/feed" element={<Feed />} />
                <Route path="/discover" element={<Discover />} />
                <Route path="/network" element={<NetworkPage />} />
                <Route path="/connections" element={<ConnectionsPage />} />
                <Route path="/requests" element={<RequestPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/premium" element={<Premium />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/chat/:targetId" element={<Chat />} />
                <Route path="/projects" element={<MyProjects />} />
                <Route path="/user/:userId" element={<UserProfilePage />} />
                <Route path="/project/:postId/requests" element={<ProjectRequests />} />
              </Route>
              <Route path="/sandbox/:roomId" element={<Sandbox />} />
              <Route path="/project/room/:roomId" element={<ProjectRoom />} />
              <Route path="/project/preview/:roomId" element={<FullscreenPreview />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </WebRTCProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
