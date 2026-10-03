import React from 'react';
import { motion as Motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { timeAgo } from '../../utils/timeAgo';

const SOSTrackRecord = ({ sosTrackRecord, isOwnProfile }) => {
  if (!sosTrackRecord || !sosTrackRecord.totalSolved || sosTrackRecord.totalSolved === 0) {
    if (isOwnProfile) {
      return (
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#121212] p-5 rounded-3xl border border-white/10 mt-6 text-center"
        >
          <h2 className="text-lg font-bold text-[#e5e5e5] mb-2">🐛 Debug SOS Track Record</h2>
          <p className="text-[#a3a3a3] text-sm mb-4">
            No solved problems yet. Answer questions in Debug SOS to build your track record!
          </p>
          <Link
            to="/feed"
            className="inline-flex items-center px-4 py-2 bg-[#ccff00] hover:bg-[#b8e600] text-[#0a0a0a] rounded-xl text-sm font-bold transition shadow-md"
          >
            Explore Debug SOS
          </Link>
        </Motion.div>
      );
    }
    return null;
  }

  const { totalSolved, isResponsive, topAreas, recentSolves } = sosTrackRecord;

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#121212] p-5 rounded-3xl border border-white/10 mt-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#e5e5e5]">🐛 Debug SOS Track Record</h2>
        {isResponsive && totalSolved >= 10 && (
          <span className="bg-[#ccff00]/10 text-[#ccff00] text-xs px-2.5 py-1 rounded-full border border-[#ccff00]/20 font-medium">
            Usually responsive
          </span>
        )}
      </div>

      <p className="text-[#e5e5e5] text-sm mb-4">
        <span className="font-bold text-xl">{totalSolved}</span> problems solved
      </p>

      {topAreas && topAreas.length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-[#a3a3a3] uppercase tracking-widest font-bold mb-2">TOP AREAS</div>
          <div className="flex flex-wrap gap-2">
            {topAreas.map((area, idx) => (
              <span key={idx} className="bg-white/5 border border-white/10 text-[#e5e5e5] text-xs px-2.5 py-1 rounded-md flex items-center space-x-1.5">
                <span>{area.tag?.replace(/^#/, '')}</span>
                <span className="text-[#a3a3a3] bg-white/10 rounded px-1">{area.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {recentSolves && recentSolves.length > 0 && (
        <div>
          <div className="text-xs text-[#a3a3a3] uppercase tracking-widest font-bold mb-2">RECENT SOLVES</div>
          <div className="space-y-2">
            {recentSolves.slice(0, 3).map((solve, idx) => (
              <Link 
                key={idx} 
                to={`/post/${solve.postId}`}
                className="block bg-[#0a0a0a] rounded-xl p-3 border border-white/5 hover:border-white/15 transition-all group"
              >
                <p className="text-sm text-[#e5e5e5] group-hover:text-white truncate mb-2">
                  {solve.postContent ? (solve.postContent.length > 50 ? `"${solve.postContent.substring(0, 50)}..."` : `"${solve.postContent}"`) : ""}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex gap-1">
                    {solve.stackTags?.slice(0, 2).map((tag, i) => (
                      <span key={i} className="text-[10px] text-[#a855f7] bg-[#a855f7]/10 px-1.5 py-0.5 rounded">
                        #{tag?.replace(/^#/, '')}
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] text-[#a3a3a3]">{timeAgo(solve.solvedAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </Motion.div>
  );
};

export default SOSTrackRecord;
