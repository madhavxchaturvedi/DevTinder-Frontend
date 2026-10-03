import React from 'react';
import { motion as Motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ShippedTogether = ({ rooms, isOwnProfile, userId, user }) => {
  const params = useParams();
  const loggedInUser = useSelector((store) => store?.user);

  if (!rooms || rooms.length === 0) {
    if (isOwnProfile) {
      return (
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#121212] p-6 rounded-3xl border border-white/10 mt-6 text-center"
        >
          <h2 className="text-xl font-bold text-[#e5e5e5] mb-2">🚀 Shipped Together</h2>
          <p className="text-[#a3a3a3] text-sm mb-4">
            No projects shipped yet. Join a Project Room to build together!
          </p>
          <Link
            to="/projects"
            className="inline-flex items-center px-4 py-2 bg-[#a855f7] hover:bg-[#9333ea] text-white rounded-xl text-sm font-semibold transition shadow-md"
          >
            Explore Projects
          </Link>
        </Motion.div>
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
  rooms.forEach(room => {
    room.members?.forEach(member => {
      const memberId = (member?._id || member?.id || (typeof member === 'string' ? member : null))?.toString();
      if (memberId && (!profileUserId || memberId !== profileUserId)) {
        uniqueCollaborators.add(memberId);
      }
    });
  });

  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'active':
        return <span className="bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Active</span>;
      case 'completed':
        return <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Completed</span>;
      default:
        return <span className="bg-gray-500/20 text-gray-400 border border-gray-500/30 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">{status || 'Archived'}</span>;
    }
  };

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#121212] p-6 rounded-3xl border border-white/10 mt-6"
    >
      <h2 className="text-xl font-bold text-[#e5e5e5] mb-4">🚀 Shipped Together</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {rooms.map((room) => (
          <div key={room.roomId || room._id} className="bg-[#0a0a0a] p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-[#e5e5e5] truncate mr-2">{room.title}</h3>
                {getStatusBadge(room.status)}
              </div>
              
              {room.techStack && room.techStack.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {room.techStack.slice(0, 3).map((tech, i) => (
                    <span key={i} className="text-[10px] text-[#a3a3a3] bg-white/5 px-2 py-0.5 rounded">
                      {tech}
                    </span>
                  ))}
                  {room.techStack.length > 3 && (
                    <span className="text-[10px] text-[#a3a3a3] bg-white/5 px-2 py-0.5 rounded">
                      +{room.techStack.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-auto">
              <div className="flex -space-x-2">
                {room.members?.slice(0, 3).map((member) => (
                  <Link key={member._id} to={`/user/${member._id}`} className="transition-transform hover:scale-110">
                    <img 
                      src={member.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(`${member.firstName || ''} ${member.lastName || ''}`.trim() || 'User')}&background=random`}
                      alt={member.firstName}
                      title={`${member.firstName || ''} ${member.lastName || ''}`}
                      className="w-6 h-6 rounded-full border-2 border-[#0a0a0a] bg-[#121212]"
                    />
                  </Link>
                ))}
                {room.members?.length > 3 && (
                  <div className="w-6 h-6 rounded-full border-2 border-[#0a0a0a] bg-white/10 flex items-center justify-center text-[8px] font-bold text-white">
                    +{room.members.length - 3}
                  </div>
                )}
              </div>
              <Link 
                to={`/project/preview/${room.roomId || room._id}`}
                className="text-xs text-[#a855f7] hover:text-white transition-colors"
              >
                View Room →
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-sm text-[#a3a3a3] pt-4 border-t border-white/5">
        Built <span className="text-[#e5e5e5] font-bold">{rooms.length}</span> {rooms.length === 1 ? 'project' : 'projects'} {uniqueCollaborators.size === 0 ? "(Solo project)" : (
          <>with <span className="text-[#e5e5e5] font-bold">{uniqueCollaborators.size}</span> {uniqueCollaborators.size === 1 ? 'developer' : 'developers'}</>
        )}
      </div>
    </Motion.div>
  );
};

export default ShippedTogether;
