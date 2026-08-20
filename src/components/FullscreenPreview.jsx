import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { addUser } from "../redux/userSlice";
import { getSocket } from "../utils/socket";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import {
  SandpackProvider,
  SandpackPreview,
  useSandpack
} from "@codesandbox/sandpack-react";

// --- Sandpack Syncer (Read-Only) ---
const SandpackSyncerReadOnly = ({ roomId }) => {
  const { sandpack } = useSandpack();

  useEffect(() => {
    const sock = getSocket();
    if (!sock) return;

    const handleReceiveFiles = ({ files }) => {
      if (!files) return;
      Object.keys(files).forEach((path) => {
        if (sandpack.files[path]?.code !== files[path].code) {
          sandpack.updateFile(path, files[path].code);
        }
      });
    };

    sock.on("codeChange", handleReceiveFiles);
    
    // Also listen for instant zero-latency sync from localStorage
    const handleStorage = (e) => {
      if (e.key === `sandpack_code_${roomId}` && e.newValue) {
        if (sandpack.files["/App.js"]?.code !== e.newValue) {
          sandpack.updateFile("/App.js", e.newValue);
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    
    return () => {
      sock.off("codeChange", handleReceiveFiles);
      window.removeEventListener("storage", handleStorage);
    };
  }, [sandpack, roomId]);

  return null;
};

const FullscreenPreview = () => {
  const { roomId } = useParams();
  const user = useSelector((store) => store.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isInitializing, setIsInitializing] = useState(true);
  const [initialFiles, setInitialFiles] = useState({});
  const [roomData, setRoomData] = useState(null);

  useEffect(() => {
    const fetchUserAndRoom = async () => {
      try {
        let currentUser = user;
        if (!currentUser) {
          const res = await axios.get(BASE_URL + "/profile/view", { withCredentials: true });
          dispatch(addUser(res.data));
          currentUser = res.data;
        }

        const roomRes = await axios.get(BASE_URL + "/project/room/" + roomId, { withCredentials: true });
        const data = roomRes.data.data;
        setRoomData(data);

        if (data.files) {
          setInitialFiles(data.files);
        } else if (data.lastCode) {
          try {
            const parsed = JSON.parse(data.lastCode);
            if (typeof parsed === "object" && !parsed.code) {
               setInitialFiles(parsed);
            } else {
               setInitialFiles({ "/App.js": { code: data.lastCode, active: true } });
            }
          } catch (e) {
            setInitialFiles({ "/App.js": { code: data.lastCode, active: true } });
          }
        }
      } catch (err) {
        console.error(err);
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          navigate("/feed");
        }
      } finally {
        setIsInitializing(false);
      }
    };
    fetchUserAndRoom();
  }, [user, dispatch, navigate, roomId]);

  useEffect(() => {
    if (isInitializing || !user || !roomId) return;
    const sock = getSocket(BASE_URL);

    sock.on("connect", () => {
      sock.emit("enterProjectRoom", { roomId, projectTitle: "Fullscreen Preview" });
    });

    if (sock.connected) {
      sock.emit("enterProjectRoom", { roomId, projectTitle: "Fullscreen Preview" });
    }

    return () => {
      if (sock.connected) {
        sock.emit("leaveProjectRoom", { roomId });
      }
    };
  }, [user, roomId, isInitializing]);

  if (isInitializing) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#18181b]">
        <div className="w-10 h-10 border-2 border-[#a855f7] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const template = roomData?.template || 'react';

  // Use all saved files, or fall back to localStorage/default
  const savedFiles = Object.keys(initialFiles).length > 0 
    ? initialFiles 
    : null;

  const lsCode = localStorage.getItem(`sandpack_code_${roomId}`);

  const filesToUse = savedFiles || (lsCode ? { "/App.js": { code: lsCode } } : {
    "/App.js": { code: `export default function App() { return <div>Loading preview...</div>; }`, active: true }
  });

  return (
    <div className="h-screen w-full bg-[#0d0d0e]">
      <SandpackProvider
        template={template}
        theme="dark"
        files={filesToUse}
        options={{ autorun: true, autoReload: true }}
      >
        <SandpackSyncerReadOnly roomId={roomId} />
        <div style={{ height: "100%", width: "100%" }}>
          <SandpackPreview 
            showOpenInCodeSandbox={false} 
            showRefreshButton={true}
            style={{ width: "100%", height: "100%" }} 
          />
        </div>
      </SandpackProvider>
    </div>
  );
};

export default FullscreenPreview;
