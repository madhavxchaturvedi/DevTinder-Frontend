import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL, DEFAULT_AVATAR } from "../utils/constants";
import { Check, X, ArrowLeft, Code2, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import toast from "react-hot-toast";

const ProjectRequests = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [acceptedPartner, setAcceptedPartner] = useState(null);

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

  const handleReview = async (req, status) => {
    try {
      await axios.post(
        `${BASE_URL}/project/review/${req._id}/${status}`,
        {},
        { withCredentials: true }
      );
      toast.success(`Request ${status} successfully!`);
      if (status === "accepted") {
        setAcceptedPartner({
          name: req.requesterId?.firstName || "your partner",
          postId,
        });
      }
      setRequests((prev) => prev.filter((r) => r._id !== req._id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-80px)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-80px)] text-foreground">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-foreground">
          Project Join Requests
        </h1>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-2xl">
          <p className="text-muted-foreground">No pending requests.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map((req) => {
            const user = req.requesterId;
            if (!user) return null;
            const initials = (
              (user.firstName?.[0] || "") + (user.lastName?.[0] || "")
            ).toUpperCase() || "U";

            return (
              <div
                key={req._id}
                className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 transition-all flex flex-col"
              >
                <div className="p-6 flex gap-4">
                  <Avatar className="w-16 h-16 border border-border">
                    <AvatarImage
                      src={user.photoUrl || DEFAULT_AVATAR}
                      alt={user.firstName}
                    />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-foreground truncate">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {user.about || "No bio provided."}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-4 flex-1">
                  {user.skills && user.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {user.skills.slice(0, 4).map((skill, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {user.skills.length > 4 && (
                        <span className="text-xs text-muted-foreground self-center">
                          +{user.skills.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  {req.message && (
                    <div className="bg-muted/40 p-3 rounded-lg border border-border/50">
                      <p className="text-sm text-foreground/90 italic">
                        "{req.message}"
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-muted/20 border-t border-border flex gap-3">
                  <Button
                    onClick={() => handleReview(req, "accepted")}
                    className="flex-1 bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="h-4 w-4" /> Accept
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleReview(req, "rejected")}
                    className="flex-1 font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <X className="h-4 w-4" /> Decline
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {acceptedPartner && (
        <div className="mt-8 bg-card border border-primary/30 rounded-2xl p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Check className="text-primary h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Partner Accepted!
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Your workspace with {acceptedPartner.name} is ready. Start coding
            together.
          </p>
          <Button
            onClick={() =>
              navigate(`/project/room/project_${acceptedPartner.postId}`)
            }
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-colors inline-flex items-center gap-2"
          >
            <Code2 className="h-4 w-4" /> Open Workspace
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProjectRequests;
