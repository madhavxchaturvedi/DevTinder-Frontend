import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import ConnectionCard from "./ConnectionCard";
import { useDispatch, useSelector } from "react-redux";
import { addConnections } from "../redux/connectionSlice";
import { SkeletonConnectionCard } from "./Skeletons";
import toast from "react-hot-toast";

const ConnectionsPage = () => {
  const connections = useSelector((store) => store.connections);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const fetchConnections = async () => {
    if (connections && connections.length > 0) return;
    try {
      setLoading(true);
      const res = await axios.get(BASE_URL + "/user/connections", {
        withCredentials: true,
      });
      dispatch(addConnections(res.data?.data));
    } catch (err) {
      toast.error("Could not load connections.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  if (loading) {
    return (
      <div className="max-h-screen relative">
        <div className="relative z-10">
          <h1 className="text-3xl text-white font-bold mb-10 text-center">
            My Connections
          </h1>
          <div className="flex flex-wrap gap-5 mx-8 justify-center items-center">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonConnectionCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!connections || connections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center mt-24 gap-4 text-center px-4">
        <p className="text-6xl">🤝</p>
        <h1 className="text-3xl font-bold text-white">No connections yet</h1>
        <p className="text-white/50 text-sm max-w-xs">
          Start swiping on the feed to connect with other developers!
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-screen relative">
      <div className="relative z-10">
        <h1 className="text-3xl text-white font-bold mb-10 text-center">
          My Connections
          <span className="ml-3 text-base font-normal text-white/40">
            ({connections.length})
          </span>
        </h1>
        <div className="flex flex-wrap gap-5 mx-8 justify-center items-center">
          {connections.map((user, i) => (
            <ConnectionCard key={user._id || i} user={user} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConnectionsPage;
