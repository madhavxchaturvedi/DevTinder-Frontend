import React, { useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import ConnectionCard from "./ConnectionCard";
import { useDispatch, useSelector } from "react-redux";
import { addConnections } from "../redux/connectionSlice";

const ConnectionsPage = () => {
  const connections = useSelector((store) => store.connections);
  const dispatch = useDispatch();
  const fetchConnections = async () => {
    try {
      const res = await axios.get(BASE_URL + "/user/connections", {
        withCredentials: true,
      });
      console.log(res.data?.data);
      dispatch(addConnections(res.data?.data));
    } catch (err) {
      //TODO: Handle Error
      console.log(err);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  if (!connections) return;

  if (connections.length === 0) return <h1>No Connections Found!</h1>;
  return (
    // <div className="min-h-screen p-8">
    //   <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 justify-items-center">
    //     {connections.map((connection) => (
    //       <ConnectionCard key={connection._id} user={connection} />
    //     ))}
    //   </div>
    // </div>
    <div className="max-h-screen relative">
      {/* Content wrapper */}
      <div className="relative z-10">
        <h1 className="text-3xl text-white font-bold mb-12 text-center">
          My Connections
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 justify-items-center">
          {connections.map((user, i) => (
            <ConnectionCard key={i} user={user} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConnectionsPage;
