import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { FolderGit2, ArrowRight } from "lucide-react";

const ShippedTogether = ({ rooms, isOwnProfile, userId, user }) => {
  const params = useParams();
  const loggedInUser = useSelector((store) => store?.user);

  if (!rooms || rooms.length === 0) {
    if (isOwnProfile) {
      return (
        <div className="glass-card p-6 rounded-xl border border-white/[0.07] text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FolderGit2 className="w-5 h-5 text-[#b266ff]" />
            <h2 className="text-lg font-bold text-[#f0f0f0]">Shipped Together</h2>
          </div>
          <p className="text-xs text-[#52525b] mb-4">
            No projects shipped yet. Join a Project Room to build together!
          </p>
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#b266ff] hover:bg-[#c285ff] text-black rounded-lg text-xs font-bold transition-all shadow-[0_0_15px_rgba(178,102,255,0.2)]"
          >
            Explore Projects
            <ArrowRight size={13} />
          </Link>
        </div>
      );
    }
    return null;
  }

  const profileUserId = (
    userId ||
    user?._id ||
    (isOwnProfile ? (loggedInUser?._id || user?._id) : (params?.userId || loggedInUser?._id))
  )?.toString();

  const uniqueCollaborators = new Set();
  rooms.forEach((room) => {
    room.members?.forEach((member) => {
      const memberId = (
        member?._id ||
        member?.id ||
        (typeof member === "string" ? member : null)
      )?.toString();
      if (memberId && (!profileUserId || memberId !== profileUserId)) {
        uniqueCollaborators.add(memberId);
      }
    });
  });

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return (
          <span className="bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/30 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md">
            Active
          </span>
        );
      case "completed":
        return (
          <span className="bg-[#b266ff]/10 text-[#b266ff] border border-[#b266ff]/30 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md">
            Completed
          </span>
        );
      default:
        return (
          <span className="bg-white/5 text-white/50 border border-white/10 text-[10px] font-mono uppercase px-2 py-0.5 rounded-md">
            {status || "Archived"}
          </span>
        );
    }
  };

  return (
    <div className="glass-card p-6 rounded-xl border border-white/[0.07]">
      <div className="flex items-center gap-2 mb-5">
        <FolderGit2 className="w-5 h-5 text-[#b266ff]" />
        <h2 className="text-lg font-bold text-[#f0f0f0] tracking-tight">
          Shipped Together
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {rooms.map((room) => (
          <div
            key={room.roomId || room._id}
            className="bg-[#09090b] p-4 rounded-xl border border-white/[0.07] hover:border-white/[0.12] transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-2 gap-2">
                <h3 className="font-bold text-sm text-[#f0f0f0] truncate">
                  {room.title}
                </h3>
                {getStatusBadge(room.status)}
              </div>

              {room.techStack && room.techStack.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {room.techStack.slice(0, 3).map((tech, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono text-[#f0f0f0]/70 bg-white/5 border border-white/[0.06] px-2 py-0.5 rounded-md"
                    >
                      {tech}
                    </span>
                  ))}
                  {room.techStack.length > 3 && (
                    <span className="text-[10px] font-mono text-[#52525b] bg-white/5 border border-white/[0.06] px-2 py-0.5 rounded-md">
                      +{room.techStack.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/[0.04]">
              <div className="flex -space-x-2">
                {room.members?.slice(0, 3).map((member) => (
                  <Link
                    key={member._id}
                    to={`/user/${member._id}`}
                    className="transition-transform hover:scale-110"
                  >
                    <img
                      src={
                        member.photoUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          `${member.firstName || ""} ${member.lastName || ""}`.trim() ||
                            "User"
                        )}&background=111113&color=ccff00`
                      }
                      alt={member.firstName}
                      title={`${member.firstName || ""} ${member.lastName || ""}`}
                      className="w-6 h-6 rounded-full border-2 border-[#09090b] bg-[#111113] object-cover"
                    />
                  </Link>
                ))}
                {room.members?.length > 3 && (
                  <div className="w-6 h-6 rounded-full border-2 border-[#09090b] bg-white/10 flex items-center justify-center text-[9px] font-mono font-bold text-[#f0f0f0]">
                    +{room.members.length - 3}
                  </div>
                )}
              </div>
              <Link
                to={`/project/preview/${room.roomId || room._id}`}
                className="text-xs font-mono text-[#b266ff] hover:text-[#ccff00] transition-colors flex items-center gap-1"
              >
                <span>View Room</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-xs text-[#52525b] pt-4 border-t border-white/[0.05]">
        Built <span className="text-[#f0f0f0] font-bold">{rooms.length}</span>{" "}
        {rooms.length === 1 ? "project" : "projects"}{" "}
        {uniqueCollaborators.size === 0 ? (
          "(Solo project)"
        ) : (
          <>
            with{" "}
            <span className="text-[#f0f0f0] font-bold">
              {uniqueCollaborators.size}
            </span>{" "}
            {uniqueCollaborators.size === 1 ? "developer" : "developers"}
          </>
        )}
      </div>
    </div>
  );
};

export default ShippedTogether;
