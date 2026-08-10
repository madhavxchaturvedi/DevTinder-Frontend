import axios from "axios";
import React, { useEffect, useState } from "react";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addRequest, removeRequest } from "../redux/requestSlice";
import RequestCard from "./RequestCard";
import { SkeletonRequestCard } from "./Skeletons";
import toast from "react-hot-toast";
import MatchSplash from "./MatchSplash";
import { AnimatePresence } from "framer-motion";
import { FiInbox } from "react-icons/fi";

const RequestPage = () => {
  const requests = useSelector((store) => store.requests);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [matchedUser, setMatchedUser] = useState(null);

  const fetchRequests = async () => {
    if (requests && requests.length > 0) return;
    try {
      setLoading(true);
      const res = await axios.get(BASE_URL + "/user/request/received", {
        withCredentials: true,
      });
      dispatch(addRequest(res.data?.data));
    } catch (err) {
      toast.error("Could not load requests.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const reviewRequest = async (status, _id, reqUser) => {
    try {
      await axios.post(
        BASE_URL + "/request/review/" + status + "/" + _id,
        {},
        { withCredentials: true }
      );
      dispatch(removeRequest(_id));
      
      if (status === "accepted") {
        setMatchedUser(reqUser);
      } else {
        toast.success("Request declined", { style: { background: '#121212', color: '#e5e5e5' } });
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
      console.log(err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 w-full pt-6">
        <h1 className="text-3xl text-white font-bold mb-8 tracking-tight">Connection Requests</h1>
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-full h-20 bg-[#121212] rounded-2xl animate-pulse border border-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center mt-24 gap-4 text-center px-4">
        <div className="w-24 h-24 bg-[#121212] border border-white/10 shadow-lg rounded-full flex items-center justify-center mb-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#a855f7]/10" />
          <FiInbox className="text-4xl relative z-10 text-[#a855f7]" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">No pending requests</h1>
        <p className="text-[#a3a3a3] font-medium text-sm max-w-xs">
          When someone swipes right on you, their request will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 w-full pt-6 pb-20">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl text-white font-bold tracking-tight">
          Requests
        </h1>
        <span className="bg-[#a855f7]/20 text-[#a855f7] px-3 py-1 rounded-full text-sm font-bold border border-[#a855f7]/30">
          {requests.length} new
        </span>
      </div>
      
      <div className="flex flex-col gap-2">
        {requests.map((req, i) => (
          <RequestCard
            key={req._id || i}
            user={req.fromUserId}
            onAccept={() => reviewRequest("accepted", req._id, req.fromUserId)}
            onReject={() => reviewRequest("rejected", req._id, null)}
          />
        ))}
      </div>
      
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
