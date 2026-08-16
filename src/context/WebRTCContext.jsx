import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { getSocket } from '../utils/socket';
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneOff, FiMaximize2 } from 'react-icons/fi';

const WebRTCContext = createContext(null);

export const useWebRTCContext = () => useContext(WebRTCContext);

export const WebRTCProvider = ({ children }) => {
  const user = useSelector((state) => state.user);
  const myUserId = user?._id;
  const location = useLocation();
  const navigate = useNavigate();

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isInCall, setIsInCall] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOff, setIsVideoOff] = useState(true);
  const [isRemoteVideoOff, setIsRemoteVideoOff] = useState(true);
  const [remoteUser, setRemoteUser] = useState(null);

  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const makingOfferRef = useRef(false);
  const iceCandidateQueue = useRef([]);
  
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const initPeerConnection = useCallback((roomId) => {
    if (peerConnectionRef.current) return peerConnectionRef.current;
    
    iceCandidateQueue.current = [];
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
      ]
    });
    
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const sock = getSocket();
        if (sock?.connected) {
          sock.emit('webrtc:ice', { roomId, candidate: event.candidate });
        }
      }
    };
    
    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
    }
    
    peerConnectionRef.current = pc;
    return pc;
  }, []);

  useEffect(() => {
    const sock = getSocket();
    if (!sock || !myUserId || !currentRoomId) return;
    
    const handleJoin = async ({ from }) => {
      if (isInCall && peerConnectionRef.current) {
        try {
          makingOfferRef.current = true;
          const pc = peerConnectionRef.current;
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          sock.emit('webrtc:offer', { roomId: currentRoomId, offer });
        } catch (e) {
          console.error(e);
        } finally {
          makingOfferRef.current = false;
        }
      }
    };

    const handleOffer = async ({ offer, from }) => {
      if (isInCall && peerConnectionRef.current) {
        try {
          const pc = peerConnectionRef.current;
          const polite = String(myUserId) < String(from);
          const offerCollision = makingOfferRef.current || pc.signalingState !== 'stable';
          
          if (offerCollision && !polite) return;
          
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          while (iceCandidateQueue.current.length) {
            const candidate = iceCandidateQueue.current.shift();
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sock.emit('webrtc:answer', { roomId: currentRoomId, answer });
        } catch (e) {
          console.error('Error answering offer', e);
        }
      }
    };
    
    const handleAnswer = async ({ answer }) => {
      if (peerConnectionRef.current) {
        try {
          const pc = peerConnectionRef.current;
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          while (iceCandidateQueue.current.length) {
            const candidate = iceCandidateQueue.current.shift();
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
        } catch (e) {
          console.error('Error setting remote answer', e);
        }
      }
    };
    
    const handleIce = async ({ candidate }) => {
      if (peerConnectionRef.current) {
        try {
          if (peerConnectionRef.current.remoteDescription) {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          } else {
            iceCandidateQueue.current.push(candidate);
          }
        } catch (e) {
          console.error('Error adding received ice candidate', e);
        }
      }
    };
    
    const handleMedia = ({ videoOff, muted }) => {
      if (videoOff !== undefined) setIsRemoteVideoOff(videoOff);
    };

    const handleEnd = () => {
      setRemoteStream(null);
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      initPeerConnection(currentRoomId);
    };

    sock.on('webrtc:join', handleJoin);
    sock.on('webrtc:offer', handleOffer);
    sock.on('webrtc:answer', handleAnswer);
    sock.on('webrtc:ice', handleIce);
    sock.on('webrtc:media', handleMedia);
    sock.on('webrtc:end', handleEnd);
    
    return () => {
      sock.off('webrtc:join', handleJoin);
      sock.off('webrtc:offer', handleOffer);
      sock.off('webrtc:answer', handleAnswer);
      sock.off('webrtc:ice', handleIce);
      sock.off('webrtc:media', handleMedia);
      sock.off('webrtc:end', handleEnd);
    };
  }, [currentRoomId, myUserId, isInCall, initPeerConnection]);

  useEffect(() => {
    if (localStream && !isMuted) {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
      }
      
      const audioCtx = audioContextRef.current;
      const analyser = analyserRef.current;
      let source;
      
      try {
        source = audioCtx.createMediaStreamSource(localStream);
        source.connect(analyser);
      } catch (e) {
      }

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let animationId;

      const checkVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        setIsSpeaking(average > 15);
        animationId = requestAnimationFrame(checkVolume);
      };
      
      checkVolume();

      return () => {
        cancelAnimationFrame(animationId);
        if (source) source.disconnect();
      };
    } else {
      setIsSpeaking(false);
    }
  }, [localStream, isMuted]);

  const joinCall = async (roomId, targetUser = null) => {
    try {
      if (targetUser) setRemoteUser(targetUser);
      setCurrentRoomId(roomId);
      
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getAudioTracks()[0].enabled = false;
      } catch (err) {
        console.warn("No audio device found, creating dummy track");
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = ctx.createOscillator();
        const dst = oscillator.connect(ctx.createMediaStreamDestination());
        oscillator.start();
        stream = dst.stream;
        stream.getAudioTracks()[0].enabled = false;
      }
      
      // Create a 1x1 black synthetic video track so the WebRTC channel is negotiated immediately
      const canvas = document.createElement("canvas");
      canvas.width = 1; canvas.height = 1;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, 1, 1);
      const dummyStream = canvas.captureStream(1); // 1 FPS
      const dummyVideoTrack = dummyStream.getVideoTracks()[0];
      dummyVideoTrack.enabled = false; // Just keep it disabled so it doesn't render
      stream.addTrack(dummyVideoTrack);
      
      setLocalStream(stream);
      localStreamRef.current = stream;
      
      setIsInCall(true);
      setIsMuted(true);
      setIsVideoOff(true);
      
      const pc = initPeerConnection(roomId);
      
      const senders = pc.getSenders();
      stream.getTracks().forEach(track => {
        if (!senders.find(s => s.track === track)) {
          pc.addTrack(track, stream);
        }
      });
      
      const sock = getSocket();
      if (sock?.connected) {
        sock.emit('webrtc:join', { roomId });
        sock.emit("webrtc:media", { roomId, videoOff: true, muted: true });
      }
    } catch (err) {
      console.error('Error joining call', err);
    }
  };
  
  const leaveCall = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    setIsInCall(false);
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    const sock = getSocket();
    if (sock?.connected && currentRoomId) {
      sock.emit('webrtc:end', { roomId: currentRoomId });
      if (remoteUser) {
        sock.emit('chat:system_message', { 
          targetId: remoteUser._id, 
          text: 'Live Session Ended', 
          type: 'call_action' 
        });
      }
    }
    setCurrentRoomId(null);
  };
  
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        
        const sock = getSocket();
        if (sock?.connected) sock.emit("webrtc:media", { roomId: currentRoomId, muted: !audioTrack.enabled });
        return !audioTrack.enabled;
      }
    }
    return true;
  };
  
  const handleToggleVideo = async () => {
    const pc = peerConnectionRef.current;
    if (!pc || !localStreamRef.current) return;

    if (isVideoOff) {
      try {
        const vidStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const newVideoTrack = vidStream.getVideoTracks()[0];
        
        // Remove old (dummy or previous) video track from local stream
        const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
        if (oldVideoTrack) {
          localStreamRef.current.removeTrack(oldVideoTrack);
        }
        
        localStreamRef.current.addTrack(newVideoTrack);
        
        // Use the existing video sender and replace the track directly! No renegotiation!
        const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
        if (sender) {
          sender.replaceTrack(newVideoTrack);
        } else {
          // Fallback just in case (should not happen due to dummy track)
          pc.addTrack(newVideoTrack, localStreamRef.current);
        }
        
        setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
        setIsVideoOff(false);
        getSocket()?.emit("webrtc:media", { roomId: currentRoomId, videoOff: false });
      } catch (err) {
        console.error("Failed to turn on video", err);
      }
    } else {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.stop(); 
        localStreamRef.current.removeTrack(videoTrack);
        
        const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
        if (sender) {
          sender.replaceTrack(null);
        }
        
        setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
        setIsVideoOff(true);
        getSocket()?.emit("webrtc:media", { roomId: currentRoomId, videoOff: true });
      }
    }
  };

  const isProjectRoom = location.pathname.startsWith('/project/room/');

  return (
    <WebRTCContext.Provider value={{
      localStream,
      remoteStream,
      isInCall,
      currentRoomId,
      joinCall,
      leaveCall,
      toggleMute,
      handleToggleVideo,
      isMuted,
      isVideoOff,
      isRemoteVideoOff,
      isSpeaking,
      remoteUser
    }}>
      {children}
      
      {isInCall && !isProjectRoom && (
        <div className="fixed bottom-6 right-6 z-[9999] animate-[fadeInUp_0.3s_ease-out] shadow-2xl">
          <div className="bg-[#111111]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 w-64 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src={remoteUser?.photoUrl || "https://geographyandyou.com/images/user-profile.png"} 
                  alt="Partner" 
                  className={`w-12 h-12 rounded-full object-cover transition-all duration-300 ${isSpeaking ? 'ring-2 ring-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'border border-white/10'}`} 
                />
                {!isRemoteVideoOff && (
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-[#111111] flex items-center justify-center">
                    <FiVideo className="w-2 h-2 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">Live Session</p>
                <p className="text-xs text-[#a3a3a3] truncate">{remoteUser?.firstName || 'Partner'}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={toggleMute}
                className={`flex-1 flex items-center justify-center py-2 rounded-xl transition ${isMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                {isMuted ? <FiMicOff size={16} /> : <FiMic size={16} />}
              </button>
              <button
                onClick={handleToggleVideo}
                className={`flex-1 flex items-center justify-center py-2 rounded-xl transition ${isVideoOff ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                {isVideoOff ? <FiVideoOff size={16} /> : <FiVideo size={16} />}
              </button>
              <button
                onClick={() => navigate(`/project/room/${currentRoomId}`)}
                className="flex-1 flex items-center justify-center py-2 rounded-xl bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 transition"
              >
                <FiMaximize2 size={16} />
              </button>
              <button
                onClick={leaveCall}
                className="flex-1 flex items-center justify-center py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white transition"
              >
                <FiPhoneOff size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </WebRTCContext.Provider>
  );
};
