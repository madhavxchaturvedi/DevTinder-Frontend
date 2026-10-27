import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { addRequest, removeRequest } from "../redux/requestSlice";
import { addConnection, addConnections } from "../redux/connectionSlice";
import MatchSplash from "./MatchSplash";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { toast } from "sonner";
import { Inbox, Check, X } from "lucide-react";

const DEFAULT_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2352525b'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";

const RequestPage = () => {
  const requests = useSelector((store) => store.requests);
  const connections = useSelector((store) => store.connections);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [matchedUser, setMatchedUser] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const connectionsCount = Array.isArray(connections) ? connections.length : 0;

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(BASE_URL + "/user/request/received", {
        withCredentials: true,
      });
      dispatch(addRequest(res.data?.data || []));
    } catch (err) {
      toast.error("Could not load connection requests.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const reviewRequest = async (status, reqId, reqUser) => {
    try {
      setActionLoadingId(reqId);
      await axios.post(
        `${BASE_URL}/request/review/${status}/${reqId}`,
        {},
        { withCredentials: true }
      );
      dispatch(removeRequest(reqId));

      if (status === "accepted") {
        if (reqUser) {
          dispatch(addConnection(reqUser));
        }
        setMatchedUser(reqUser);
      } else {
        toast.success("Request declined");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    if (!connections) {
      axios
        .get(BASE_URL + "/user/connections", { withCredentials: true })
        .then((res) => {
          if (res.data?.data) dispatch(addConnections(res.data.data));
        })
        .catch(() => {});
    }
  }, [connections, dispatch]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 min-h-dvh pb-20 text-[#f0f0f0]">
      {/* Top Underline Tabs Switcher */}
      <div className="flex items-center gap-6 border-b border-white/[0.07] mb-6">
        <button
          onClick={() => navigate("/connections")}
          className="pb-3 text-sm font-medium text-[#52525b] hover:text-[#f0f0f0] flex items-center gap-2 cursor-pointer transition-colors"
        >
          <span>Connections</span>
          {connectionsCount > 0 && (
            <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/20">
              {connectionsCount}
            </span>
          )}
        </button>
        <button
          onClick={() => navigate("/requests")}
          className="pb-3 text-sm font-bold border-b-2 border-[#ccff00] text-[#ccff00] flex items-center gap-2 cursor-pointer transition-colors"
        >
          <span>Requests</span>
          {requests?.length > 0 && (
            <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-[#b266ff]/10 text-[#b266ff] border border-[#b266ff]/20">
              {requests.length}
            </span>
          )}
        </button>
      </div>

      {loading && (!requests || requests.length === 0) ? (
        <div>
          <div className="mb-6">
            <div className="h-8 w-40 bg-white/5 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-60 bg-white/5 rounded-lg animate-pulse" />
          </div>
          <div className="space-y-3 mt-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 w-full bg-[#111113] border border-white/[0.07] rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
      ) : !requests || requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-[#111113] border border-white/[0.07] flex items-center justify-center mb-4 text-[#52525b] shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <Inbox className="w-8 h-8 text-[#b266ff]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#f0f0f0] mb-2">
            No pending requests
          </h1>
          <p className="text-xs sm:text-sm text-[#52525b] max-w-sm mb-6 leading-relaxed">
            When other developers want to connect with you, their incoming requests will appear here.
          </p>
          <button
            onClick={() => navigate("/discover")}
            className="bg-[#ccff00] text-black font-bold text-xs px-5 py-2.5 rounded-lg hover:bg-[#d9ff33] transition-colors shadow-[0_0_20px_rgba(204,255,0,0.2)]"
          >
            Discover Developers
          </button>
        </div>
      ) : (
        <>
          {/* Header with live count badge */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f0f0f0]">
                Requests
              </h1>
              {/* Live count badge in purple */}
              <span className="bg-[#b266ff]/10 text-[#b266ff] border border-[#b266ff]/20 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold">
                {requests.length} pending
              </span>
            </div>
          </div>

          {/* Request Cards List */}
          <div className="space-y-3">
            {requests.map((req) => {
              const user = req.fromUserId;
              if (!user) return null;
              const isActing = actionLoadingId === req._id;

              return (
                <Motion.div
                  key={req._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="glass-card bg-[#111113] border border-white/[0.07] hover:border-white/[0.12] rounded-xl p-4 sm:p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  {/* User Avatar + Info */}
                  <div className="flex items-start sm:items-center gap-4 min-w-0">
                    <Link to={`/user/${user._id}`} className="shrink-0">
                      <img
                        src={user.photoUrl || DEFAULT_AVATAR}
                        alt={user.firstName}
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-white/10 group-hover:ring-[#ccff00]/40 transition-all"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = DEFAULT_AVATAR;
                        }}
                      />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          to={`/user/${user._id}`}
                          className="font-bold text-sm text-[#f0f0f0] group-hover:text-[#ccff00] transition-colors truncate"
                        >
                          {user.firstName} {user.lastName}
                        </Link>
                        {user.age && (
                          <span className="font-mono text-[11px] text-[#52525b]">
                            , {user.age}
                          </span>
                        )}
                      </div>

                      {/* Skills Badges (mono) */}
                      {user.skills && user.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-1.5">
                          {user.skills.slice(0, 4).map((skill, idx) => (
                            <span
                              key={idx}
                              className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/[0.07] text-[#f0f0f0]/80"
                            >
                              {skill}
                            </span>
                          ))}
                          {user.skills.length > 4 && (
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-[#52525b]">
                              +{user.skills.length - 4}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Bio Snippet */}
                      <p className="text-xs text-[#52525b] line-clamp-1 max-w-lg leading-relaxed">
                        {user.headline || user.about || "Developer looking to connect and build together."}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons: Decline (ghost red) and Accept (lime outline) */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0">
                    <button
                      onClick={() => reviewRequest("rejected", req._id, user)}
                      disabled={isActing}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Decline</span>
                    </button>
                    <button
                      onClick={() => reviewRequest("accepted", req._id, user)}
                      disabled={isActing}
                      className="border border-[#ccff00] text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-semibold text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(204,255,0,0.1)] hover:shadow-[0_0_16px_rgba(204,255,0,0.25)] disabled:opacity-50 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept</span>
                    </button>
                  </div>
                </Motion.div>
              );
            })}
          </div>
        </>
      )}

      {/* Match Splash Modal when a request is accepted */}
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

export default RequestPage;
