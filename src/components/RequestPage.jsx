import axios from "axios";
import React, { useEffect } from "react";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addRequest, removeRequest } from "../redux/requestSlice";
import ConnectionCard from "./ConnectionCard";
import RequestCard from "./RequestCard";

const RequestPage = () => {
  const requests = useSelector((store) => store.requests);
  const dispatch = useDispatch();

  const fetchRequests = async () => {
    try {
      const res = await axios.get(BASE_URL + "/user/request/received", {
        withCredentials: true,
      });
      console.log(res.data?.data);
      dispatch(addRequest(res.data?.data));
    } catch (err) {
      //TODO: ERROR HANDLING
      console.log(err);
    }
  };

  const reviewRequest = async (status, _id) => {
    try {
      const res = await axios.post(
        BASE_URL + "/request/review/" + status + "/" + _id,
        {},
        { withCredentials: true }
      );
      dispatch(removeRequest(_id));
    } catch (err) {
      //TODO: ERROR HANDLING
      console.log(err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (!requests) return;

  if (requests.length === 0)
    return (
      <h1 className=" text-center my-30 text-5xl text-white">
        No Request Found!
      </h1>
    );

  return (
    <div className="max-h-screen relative">
      {/* Content wrapper */}
      <div className="relative z-10">
        <h1 className="text-3xl text-white font-bold mb-12 text-center">
          My Requests
        </h1>

        <div className="flex flex-col gap-5">
          {requests.map((user, i) => (
            // <ConnectionCard key={i} user={user.fromUserId} />
            <RequestCard
              key={i}
              user={user.fromUserId}
              onAccept={() => reviewRequest("accepted", user._id)}
              onReject={() => reviewRequest("rejected", user._id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RequestPage;
