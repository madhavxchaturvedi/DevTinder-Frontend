import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useSearchParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addConnections, addConnection } from "../redux/connectionSlice";
import { addRequest, removeRequest } from "../redux/requestSlice";
import ConnectionCard from "../components/ConnectionCard";
import RequestCard from "../components/RequestCard";
import MatchSplash from "../components/MatchSplash";
import { SkeletonConnectionCard } from "../components/Skeletons";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, Inbox, MessageSquare, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence } from "framer-motion";

const NetworkPage = ({ initialTab = "connections" }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(urlTab || initialTab);

  const connections = useSelector((store) => store.connections);
  const requests = useSelector((store) => store.requests);
  const dispatch = useDispatch();

  const [loadingConnections, setLoadingConnections] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [matchedUser, setMatchedUser] = useState(null);

  const fetchConnections = useCallback(async () => {
    try {
      setLoadingConnections(true);
      const res = await axios.get(`${BASE_URL}/user/connections`, {
        withCredentials: true,
      });
      dispatch(addConnections(res.data?.data || []));
    } catch (err) {
      toast.error("Could not load connections.");
      console.error(err);
    } finally {
      setLoadingConnections(false);
    }
  }, [dispatch]);

  const fetchRequests = useCallback(async () => {
    try {
      setLoadingRequests(true);
      const res = await axios.get(`${BASE_URL}/user/request/received`, {
        withCredentials: true,
      });
      dispatch(addRequest(res.data?.data || []));
    } catch (err) {
      toast.error("Could not load pending requests.");
      console.error(err);
    } finally {
      setLoadingRequests(false);
    }
  }, [dispatch]);

  useEffect(() => {
    if (!connections) {
      fetchConnections();
    }
    if (!requests) {
      fetchRequests();
    }
  }, [connections, requests, fetchConnections, fetchRequests]);

  const handleTabChange = (val) => {
    setActiveTab(val);
    setSearchParams({ tab: val });
  };

  const reviewRequest = async (status, _id, reqUser) => {
    try {
      await axios.post(
        `${BASE_URL}/request/review/${status}/${_id}`,
        {},
        { withCredentials: true }
      );
      dispatch(removeRequest(_id));

      if (status === "accepted") {
        if (reqUser) {
          dispatch(addConnection(reqUser));
          setMatchedUser(reqUser);
        }
        toast.success("Connection request accepted!");
      } else {
        toast.info("Connection request declined.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to review request.");
      console.error(err);
    }
  };

  const pendingCount = Array.isArray(requests) ? requests.length : 0;
  const connectionsCount = Array.isArray(connections) ? connections.length : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 w-full pt-6 pb-24">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            Network Hub
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your developer connections and incoming collaboration requests.
          </p>
        </div>
      </div>

      {/* Tabs Container */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md mb-8 bg-muted/60 p-1 rounded-xl">
          <TabsTrigger value="connections" className="flex items-center gap-2 font-semibold">
            <Users className="h-4 w-4" />
            <span>My Connections</span>
            {connectionsCount > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 min-w-[16px]">
                {connectionsCount}
              </Badge>
            )}
          </TabsTrigger>

          <TabsTrigger value="requests" className="flex items-center gap-2 font-semibold">
            <UserCheck className="h-4 w-4" />
            <span>Pending Requests</span>
            {pendingCount > 0 && (
              <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4 min-w-[16px] bg-accent text-accent-foreground font-bold">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* -- Tab: Connections ------------------------------------------ */}
        <TabsContent value="connections" className="outline-none">
          {loadingConnections && !connections ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <SkeletonConnectionCard key={i} />
              ))}
            </div>
          ) : !connections || connections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-card/40 rounded-3xl border border-border/50">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">No connections yet</h2>
              <p className="text-sm text-muted-foreground max-w-sm mb-6">
                Discover developers on the feed. When you match with other developers, they will appear in your network!
              </p>
              <Link
                to="/feed"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <Sparkles className="h-4 w-4" />
                Explore Feed
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {connections.map((user, i) => (
                <ConnectionCard key={user._id || i} user={user} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* -- Tab: Requests -------------------------------------------- */}
        <TabsContent value="requests" className="outline-none">
          {loadingRequests && !requests ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-full h-20 bg-muted/40 rounded-2xl animate-pulse border border-border/50" />
              ))}
            </div>
          ) : !requests || requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-card/40 rounded-3xl border border-border/50">
              <div className="w-16 h-16 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-4">
                <Inbox className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">No pending requests</h2>
              <p className="text-sm text-muted-foreground max-w-xs mb-6">
                When someone wants to collaborate or connect with you, their invite will appear right here.
              </p>
              <Link
                to="/discover"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border transition-colors"
              >
                Discover Developers
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {requests.map((req, i) => (
                <RequestCard
                  key={req._id || i}
                  user={req.fromUserId}
                  onAccept={() => reviewRequest("accepted", req._id, req.fromUserId)}
                  onReject={() => reviewRequest("rejected", req._id, null)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Match Celebration Modal */}
      <AnimatePresence>
        {matchedUser && (
          <MatchSplash
            matchedUser={matchedUser}
            onClose={() => setMatchedUser(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default NetworkPage;
