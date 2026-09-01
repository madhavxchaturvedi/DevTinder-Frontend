import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { 
  FiFolder, 
  FiClock, 
  FiCheckCircle, 
  FiArchive, 
  FiAlertCircle, 
  FiChevronRight,
  FiFile,
  FiRefreshCw
} from "react-icons/fi";
import { SiReact, SiVuedotjs, SiAngular } from "react-icons/si";

const MyProjects = () => {
  const navigate = useNavigate();
  
  // Data states
  const [myPosts, setMyPosts] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [counts, setCounts] = useState({
    active: 0,
    completed: 0,
    posts: 0
  });
  
  // UI states
  const [activeTab, setActiveTab] = useState("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      const [activeRes, completedRes, postsRes] = await Promise.all([
        axios.get(`${BASE_URL}/project/my-rooms?status=active`, { withCredentials: true }),
        axios.get(`${BASE_URL}/project/my-rooms?status=completed`, { withCredentials: true }),
        axios.get(`${BASE_URL}/project/my-posts`, { withCredentials: true })
      ]);

      setCounts({
        active: activeRes.data?.data?.length || 0,
        completed: completedRes.data?.data?.length || 0,
        posts: postsRes.data?.data?.length || 0
      });
      
      // Also set initial posts data here to avoid double fetching
      setMyPosts(postsRes.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  const fetchRoomsForTab = async (tab) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${BASE_URL}/project/my-rooms?status=${tab}`, { withCredentials: true });
      setRooms(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load workspaces. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchRoomsForTab(activeTab);
  }, [activeTab]);

  const getRelativeTime = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} min${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
  };

  const getTemplateIcon = (template) => {
    switch(template?.toLowerCase()) {
      case 'react':
      case 'reactjs':
        return <SiReact className="text-[#61DAFB]" size={20} />;
      case 'vue':
      case 'vuejs':
        return <SiVuedotjs className="text-[#4FC08D]" size={20} />;
      case 'angular':
        return <SiAngular className="text-[#DD0031]" size={20} />;
      default:
        return <FiFolder className="text-[#a855f7]" size={20} />;
    }
  };

  const getInitials = (firstName, lastName) => {
    const first = firstName ? firstName.charAt(0).toUpperCase() : "";
    const last = lastName ? lastName.charAt(0).toUpperCase() : "";
    return `${first}${last}` || "U";
  };

  const renderStats = () => (
    <div className="flex flex-wrap gap-4 mb-10">
      <div className="flex items-center gap-3 bg-[#141415] border border-[#262626] rounded-xl px-5 py-3">
        <div className="bg-[#ccff00]/10 p-2 rounded-lg">
          <FiFolder className="text-[#ccff00]" size={18} />
        </div>
        <div>
          <p className="text-xs text-[#525252] uppercase tracking-wider font-medium">Active Workspaces</p>
          <p className="text-xl font-semibold text-[#e1e1e3]">{counts.active}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3 bg-[#141415] border border-[#262626] rounded-xl px-5 py-3">
        <div className="bg-[#a855f7]/10 p-2 rounded-lg">
          <FiCheckCircle className="text-[#a855f7]" size={18} />
        </div>
        <div>
          <p className="text-xs text-[#525252] uppercase tracking-wider font-medium">Completed</p>
          <p className="text-xl font-semibold text-[#e1e1e3]">{counts.completed}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-[#141415] border border-[#262626] rounded-xl px-5 py-3">
        <div className="bg-[#525252]/20 p-2 rounded-lg">
          <FiFile className="text-[#e1e1e3]" size={18} />
        </div>
        <div>
          <p className="text-xs text-[#525252] uppercase tracking-wider font-medium">Your Posts</p>
          <p className="text-xl font-semibold text-[#e1e1e3]">{counts.posts}</p>
        </div>
      </div>
    </div>
  );

  const renderMyPosts = () => (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-lg font-medium text-[#e1e1e3]">Your Posts</h2>
        <span className="bg-[#262626] text-[#e1e1e3] text-xs font-medium px-2.5 py-0.5 rounded-full">
          {myPosts.length}
        </span>
      </div>

      {myPosts.length === 0 ? (
        <div className="bg-[#141415] border border-[#262626] border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center">
          <FiFile className="text-[#525252] mb-3" size={32} />
          <p className="text-[#e1e1e3] font-medium mb-1">No project posts yet</p>
          <p className="text-[#525252] text-sm mb-4">Post a project on the feed to find collaborators.</p>
          <Link to="/feed" className="text-sm text-[#a855f7] hover:text-[#c084fc] font-medium transition-colors">
            Go to Feed
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {myPosts.map(post => (
            <div key={post._id} className="bg-[#141415] border border-[#262626] rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-[#e1e1e3] truncate pr-2">{post.project?.title || "Untitled Project"}</h3>
                  {post.isMatched ? (
                    <span className="shrink-0 bg-[#ccff00]/10 text-[#ccff00] text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md">Matched</span>
                  ) : post.project?.isOpen ? (
                    <span className="shrink-0 bg-[#a855f7]/10 text-[#a855f7] text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md">Open</span>
                  ) : (
                    <span className="shrink-0 bg-[#525252]/20 text-[#525252] text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md">Closed</span>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {post.project?.techStack?.slice(0, 3).map((tech, idx) => (
                    <span key={idx} className="text-xs bg-[#262626] text-[#e1e1e3] px-2 py-0.5 rounded-md">
                      {tech}
                    </span>
                  ))}
                  {post.project?.techStack?.length > 3 && (
                    <span className="text-xs bg-[#262626] text-[#525252] px-2 py-0.5 rounded-md">
                      +{post.project.techStack.length - 3}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-2 pt-4 border-t border-[#262626]">
                {post.pendingRequestCount > 0 ? (
                  <Link to={`/project/${post._id}/requests`} className="flex items-center justify-between group">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20 text-red-500 text-xs font-bold">
                        {post.pendingRequestCount}
                      </span>
                      <span className="text-sm text-[#e1e1e3] group-hover:text-white transition-colors">Pending Requests</span>
                    </div>
                    <FiChevronRight className="text-[#525252] group-hover:text-[#a855f7] transition-colors" />
                  </Link>
                ) : post.isMatched && post.roomId ? (
                  <Link to={`/project/room/${post.roomId}`} className="flex items-center justify-between group">
                    <span className="text-sm text-[#ccff00] font-medium">Open Workspace</span>
                    <FiChevronRight className="text-[#ccff00] group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <div className="text-sm text-[#525252]">No pending requests</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="bg-[#141415] border border-[#262626] rounded-xl p-5 animate-pulse">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-[#262626] rounded-xl"></div>
            <div className="flex-1">
              <div className="h-5 bg-[#262626] rounded-md w-3/4 mb-2"></div>
              <div className="h-3 bg-[#262626] rounded-md w-full mb-1"></div>
              <div className="h-3 bg-[#262626] rounded-md w-2/3"></div>
            </div>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#262626]"></div>
            <div className="h-4 bg-[#262626] rounded-md w-1/3"></div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#262626] flex justify-between">
            <div className="h-3 bg-[#262626] rounded-md w-1/4"></div>
            <div className="h-3 bg-[#262626] rounded-md w-1/4"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderEmptyState = () => {
    let title = "";
    let desc = "";
    let action = null;

    if (activeTab === "active") {
      title = "No active workspaces";
      desc = "You don't have any active project workspaces yet. Match with other developers to start collaborating.";
      action = (
        <Link to="/feed" className="mt-4 inline-flex items-center justify-center bg-[#e1e1e3] text-[#0d0d0e] font-medium px-4 py-2 rounded-lg hover:bg-white transition-colors">
          Browse Projects
        </Link>
      );
    } else if (activeTab === "completed") {
      title = "No completed projects yet";
      desc = "Your completed projects will appear here as a portfolio of your work.";
    } else {
      title = "No archived projects";
      desc = "Projects you've archived will be stored here.";
    }

    return (
      <div className="w-full min-h-[350px] bg-[#141415] border border-[#262626] border-dashed rounded-xl py-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-[#1a1a1c] border border-[#333333] rounded-2xl flex items-center justify-center mb-5 shadow-inner">
          <FiFolder className="text-[#525252]" size={24} />
        </div>
        <h3 className="text-xl font-medium text-[#e1e1e3] mb-2">{title}</h3>
        <p className="text-[#525252] max-w-md mx-auto">{desc}</p>
        {action}
      </div>
    );
  };

  const renderWorkspaces = () => {
    if (loading) return renderSkeleton();
    if (error) return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 flex flex-col items-center justify-center text-center">
        <FiAlertCircle className="text-red-500 mb-2" size={24} />
        <p className="text-red-400 mb-4">{error}</p>
        <button 
          onClick={() => fetchRoomsForTab(activeTab)}
          className="flex items-center gap-2 text-sm bg-[#262626] hover:bg-[#333333] text-[#e1e1e3] px-4 py-2 rounded-lg transition-colors"
        >
          <FiRefreshCw size={14} /> Retry
        </button>
      </div>
    );
    
    if (rooms.length === 0) return renderEmptyState();

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {rooms.map(room => {
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          const partner = room.members?.find(m => m._id !== user?._id) || room.members?.[0];
          const partnerName = partner ? `${partner.firstName} ${partner.lastName || ""}`.trim() : "Unknown";
          const title = room.title || room.projectPostId?.project?.title || "Untitled Project";
          const description = room.projectPostId?.content || "No description provided.";
          const fileCount = Object.keys(room.files || {}).length;
          
          return (
            <Link 
              key={room.roomId} 
              to={`/project/room/${room.roomId}`}
              className="group block bg-[#141415] border border-[#262626] hover:border-[#525252] rounded-2xl p-5 transition-all duration-200"
            >
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 rounded-xl bg-[#262626] border border-[#333333] flex items-center justify-center shrink-0">
                  {getTemplateIcon(room.template)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-[#e1e1e3] mb-1 truncate group-hover:text-white transition-colors">
                    {title}
                  </h3>
                  <p className="text-sm text-[#525252] line-clamp-2 leading-snug">
                    {description}
                  </p>
                </div>
              </div>

              {partner && (
                <div className="flex items-center gap-3 mb-5 bg-[#0d0d0e] p-3 rounded-xl border border-[#262626]">
                  {partner.photoUrl ? (
                    <img src={partner.photoUrl} alt={partnerName} className="w-8 h-8 rounded-full object-cover border border-[#262626]" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#a855f7] to-[#7c3aed] border border-[#333333] flex items-center justify-center text-xs font-semibold text-white">
                      {getInitials(partner.firstName, partner.lastName)}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-xs text-[#525252] font-medium uppercase tracking-wider">Partner</span>
                    <span className="text-sm text-[#e1e1e3] truncate">{partnerName}</span>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-[#262626] flex items-center justify-between text-xs text-[#525252]">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <FiFile size={14} />
                    <span>{fileCount} files</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FiClock size={14} />
                    <span>{getRelativeTime(room.updatedAt || room.createdAt)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${activeTab === 'active' ? 'bg-[#ccff00]' : activeTab === 'completed' ? 'bg-[#a855f7]' : 'bg-[#525252]'}`}></div>
                  <span className="font-medium text-[#e1e1e3] group-hover:text-white transition-colors">Open</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#0d0d0e] text-[#e1e1e3] p-6 lg:p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-white">My Projects</h1>
        
        {renderStats()}
        
        {renderMyPosts()}

        <div className="mt-12">
          <div className="flex items-center justify-between mb-6 border-b border-[#262626]">
            <h2 className="text-lg font-medium text-[#e1e1e3] pb-4">Workspaces</h2>
            <div className="flex gap-6">
              {[
                { id: 'active', label: 'Active', icon: FiFolder },
                { id: 'completed', label: 'Completed', icon: FiCheckCircle },
                { id: 'archived', label: 'Archived', icon: FiArchive }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 pb-4 px-1 border-b-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id 
                      ? 'border-[#a855f7] text-[#e1e1e3]' 
                      : 'border-transparent text-[#525252] hover:text-[#a1a1aa]'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {renderWorkspaces()}
        </div>
      </div>
    </div>
  );
};

export default MyProjects;
