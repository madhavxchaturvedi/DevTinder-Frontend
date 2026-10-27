import { Link } from "react-router-dom";
import { timeAgo } from "../../utils/timeAgo";
import { Terminal, Zap, ArrowRight } from "lucide-react";

const SOSTrackRecord = ({ sosTrackRecord, isOwnProfile }) => {
  if (
    !sosTrackRecord ||
    !sosTrackRecord.totalSolved ||
    sosTrackRecord.totalSolved === 0
  ) {
    if (isOwnProfile) {
      return (
        <div className="glass-card p-6 rounded-xl border border-white/[0.07] text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Terminal className="w-5 h-5 text-[#b266ff]" />
            <h2 className="text-lg font-bold text-[#f0f0f0]">
              Debug SOS Track Record
            </h2>
          </div>
          <p className="text-xs text-[#52525b] mb-4">
            No solved problems yet. Answer questions in Debug SOS to build your track record!
          </p>
          <Link
            to="/feed"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#ccff00] hover:bg-[#d9ff33] text-black rounded-lg text-xs font-bold transition-all shadow-[0_0_15px_rgba(204,255,0,0.2)]"
          >
            Explore Debug SOS
            <ArrowRight size={13} />
          </Link>
        </div>
      );
    }
    return null;
  }

  const { totalSolved, isResponsive, topAreas, recentSolves } = sosTrackRecord;

  return (
    <div className="glass-card p-6 rounded-xl border border-white/[0.07]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-[#b266ff]" />
          <h2 className="text-lg font-bold text-[#f0f0f0] tracking-tight">
            Debug SOS Track Record
          </h2>
        </div>
        {isResponsive && totalSolved >= 10 && (
          <span className="flex items-center gap-1.5 bg-[#ccff00]/10 text-[#ccff00] text-[11px] font-mono px-2.5 py-0.5 rounded-md border border-[#ccff00]/25 font-bold">
            <Zap size={11} className="text-[#ccff00]" />
            Usually responsive
          </span>
        )}
      </div>

      <p className="text-xs text-[#52525b] mb-4">
        <span className="font-mono font-bold text-xl text-[#f0f0f0] mr-1.5">
          {totalSolved}
        </span>
        problems solved across community discussions
      </p>

      {topAreas && topAreas.length > 0 && (
        <div className="mb-5">
          <div className="text-[10px] font-mono text-[#52525b] uppercase tracking-widest font-bold mb-2">
            TOP AREAS
          </div>
          <div className="flex flex-wrap gap-2">
            {topAreas.map((area, idx) => (
              <span
                key={idx}
                className="bg-white/5 border border-white/[0.07] text-[#f0f0f0] text-xs font-mono px-2.5 py-1 rounded-md flex items-center gap-1.5"
              >
                <span>#{area.tag?.replace(/^#+/, "")}</span>
                <span className="text-[11px] font-mono font-bold text-[#b266ff] bg-[#b266ff]/10 border border-[#b266ff]/20 rounded px-1.5 py-0.2">
                  {area.count}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {recentSolves && recentSolves.length > 0 && (
        <div>
          <div className="text-[10px] font-mono text-[#52525b] uppercase tracking-widest font-bold mb-2">
            RECENT SOLVES
          </div>
          <div className="space-y-2.5">
            {recentSolves.slice(0, 3).map((solve, idx) => {
              return (
                <Link
                  key={idx}
                  to={`/post/${solve.postId}`}
                  className="block bg-[#09090b] rounded-xl p-3.5 border border-white/[0.07] hover:border-white/[0.15] transition-all group"
                >
                  <p className="text-xs text-[#d4d4d8] group-hover:text-[#f0f0f0] truncate mb-2">
                    {solve.postContent
                      ? solve.postContent.length > 60
                        ? `"${solve.postContent.substring(0, 60)}..."`
                        : `"${solve.postContent}"`
                      : "Solved developer discussion"}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex gap-1.5">
                      {solve.stackTags?.slice(0, 2).map((tag, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-mono text-[#b266ff] bg-[#b266ff]/10 border border-[#b266ff]/20 px-1.5 py-0.5 rounded-md"
                        >
                          #{tag?.replace(/^#+/, "")}
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] font-mono text-[#52525b]">
                      {timeAgo(solve.solvedAt)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SOSTrackRecord;
