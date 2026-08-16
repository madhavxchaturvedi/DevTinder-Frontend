import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { FiCheck, FiX, FiArrowLeft } from "react-icons/fi";
import toast from "react-hot-toast";

const ProjectRequests = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/project/${postId}/requests`, {
          withCredentials: true,
        });
        setRequests(res.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load requests.");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [postId]);

  const handleReview = async (requestId, status) => {
    try {
      await axios.post(
        `${BASE_URL}/project/review/${requestId}/${status}`,
        {},
        { withCredentials: true }
      );
      toast.success(`Request ${status} successfully!`);
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-80px)]">
        <span className="loading loading-spinner loading-lg text-[#ccff00]"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-80px)] text-white">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
        >
          <FiArrowLeft className="text-xl" />
        </button>
        <h1 className="text-2xl font-bold text-white">Project Join Requests</h1>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12 bg-[#151515] border border-white/5 rounded-2xl">
          <p className="text-white/40">No pending requests.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map((req) => {
            const user = req.requesterId;
            if (!user) return null;
            return (
              <div
                key={req._id}
                className="bg-[#151515] border border-[#262626] rounded-2xl overflow-hidden hover:border-white/20 transition-all flex flex-col"
              >
                <div className="p-6 flex gap-4">
                  <img
                    src={user.photoUrl || "https://geographyandyou.com/images/user-profile.png"}
                    alt={user.firstName}
                    className="w-16 h-16 rounded-full object-cover border border-white/10"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-sm text-[#a3a3a3] line-clamp-2 mt-1">
                      {user.about || "No bio provided."}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-4 flex-1">
                  {user.skills && user.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {user.skills.slice(0, 4).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-white/5 text-[#a3a3a3] text-xs font-semibold rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                      {user.skills.length > 4 && (
                        <span className="px-2 py-1 bg-white/5 text-[#a3a3a3] text-xs font-semibold rounded-md">
                          +{user.skills.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  {req.message && (
                    <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                      <p className="text-sm text-[#e5e5e5] italic">"{req.message}"</p>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-white/5 border-t border-white/10 flex gap-3">
                  <button
                    onClick={() => handleReview(req._id, "accepted")}
                    className="flex-1 bg-[#ccff00] text-[#0a0a0a] font-bold py-2 rounded-xl hover:bg-[#bbf000] transition-all flex items-center justify-center gap-2"
                  >
                    <FiCheck size={18} /> Accept
                  </button>
                  <button
                    onClick={() => handleReview(req._id, "rejected")}
                    className="flex-1 bg-white/10 text-white font-bold py-2 rounded-xl hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                  >
                    <FiX size={18} /> Decline
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectRequests;
