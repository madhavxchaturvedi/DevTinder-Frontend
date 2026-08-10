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
        toast.success("Request declined");
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
      <div className="max-h-screen relative px-6">
        <div className="relative z-10">
          <h1 className="text-3xl text-[#0a0a0a] font-black mb-10 text-center">
            Connection Requests
          </h1>
          <div className="flex flex-col max-w-3xl mx-auto">
            {[1, 2, 3].map((i) => (
              <SkeletonRequestCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center mt-24 gap-4 text-center px-4">
        <p className="text-6xl">📭</p>
        <h1 className="text-3xl font-black text-[#0a0a0a]">No pending requests</h1>
        <p className="text-gray-600 font-bold text-sm max-w-xs">
          When someone swipes right on you, their request will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-screen relative px-6">
      <div className="relative z-10">
        <h1 className="text-3xl text-[#0a0a0a] font-black mb-10 text-center">
          Connection Requests
          <span className="ml-3 text-base font-bold text-gray-400">
            ({requests.length})
          </span>
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
          {requests.map((req, i) => (
            <RequestCard
              key={req._id || i}
              user={req.fromUserId}
              onAccept={() => reviewRequest("accepted", req._id, req.fromUserId)}
              onReject={() => reviewRequest("rejected", req._id, null)}
            />
          ))}
        </div>
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
