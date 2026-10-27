import React, { useState, useEffect, useRef } from "react";
import { Send, MessageSquare } from "lucide-react";
import { getSocket } from "../utils/socket";
import { useSelector } from "react-redux";
import { DEFAULT_AVATAR } from "../utils/constants";

const TeamChat = ({ roomId, initialChats = [] }) => {
  const [chats, setChats] = useState(initialChats);
  const [newMessage, setNewMessage] = useState("");
  const user = useSelector((store) => store.user);
  const messagesEndRef = useRef(null);

  // Synchronize when initialChats prop loads asynchronously
  useEffect(() => {
    if (initialChats && Array.isArray(initialChats) && initialChats.length > 0) {
      setChats(initialChats);
    }
  }, [initialChats]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handleChatMessage = ({ message }) => {
      setChats((prev) => [...prev, message]);
    };
    socket.on("room:chat_message", handleChatMessage);
    return () => socket.off("room:chat_message", handleChatMessage);
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed) return;

    const message = {
      _id: Math.random().toString(36).substring(7),
      senderId: {
        _id: user?._id,
        firstName: user?.firstName,
        lastName: user?.lastName,
        photoUrl: user?.photoUrl,
      },
      text: trimmed,
      type: "user",
      createdAt: new Date(),
    };

    setChats((prev) => [...prev, message]);
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit("room:chat_message", { roomId, message });
    }
    setNewMessage("");
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full bg-[#111113] overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-3">
        {chats.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 select-none">
            <div className="w-10 h-10 rounded-xl bg-[#1a1a1f] border border-white/[0.07] flex items-center justify-center mb-3">
              <MessageSquare className="w-5 h-5 text-[#52525b]" />
            </div>
            <p className="text-[#f0f0f0] text-xs font-semibold mb-1">No messages yet</p>
            <p className="text-[#52525b] text-[11px] font-mono leading-relaxed max-w-[200px]">
              Say hello and coordinate with your teammate in real-time.
            </p>
          </div>
        ) : (
          chats.map((chat) => {
            const isMe = String(chat.senderId?._id) === String(user?._id);
            const isSystem = chat.type === "system";

            if (isSystem) {
              return (
                <div key={chat._id} className="flex justify-center my-1.5">
                  <div className="bg-[#b266ff]/10 border border-[#b266ff]/20 text-[#b266ff] px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wide shadow-sm">
                    {chat.text}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={chat._id}
                className={`flex gap-2.5 max-w-[85%] ${
                  isMe ? "self-end flex-row-reverse" : "self-start"
                }`}
              >
                <img
                  src={chat.senderId?.photoUrl || DEFAULT_AVATAR}
                  alt={chat.senderId?.firstName || "User"}
                  className="w-7 h-7 rounded-full object-cover shrink-0 mt-auto border border-white/[0.08]"
                />
                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold text-[#52525b]">
                      {isMe ? "You" : chat.senderId?.firstName || "Dev"}
                    </span>
                    <span className="text-[9px] font-mono text-[#52525b]/70">
                      {formatTime(chat.createdAt)}
                    </span>
                  </div>
                  <div
                    className={`px-3 py-2 rounded-2xl text-xs leading-relaxed break-words shadow-sm transition-all select-text ${
                      isMe
                        ? "bg-[#ccff00]/10 border border-[#ccff00]/20 text-[#f0f0f0] rounded-br-sm"
                        : "bg-[#1a1a1f] border border-white/[0.07] text-[#f0f0f0] rounded-bl-sm"
                    }`}
                  >
                    {chat.text}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-[#111113] border-t border-white/[0.07] flex-shrink-0">
        <form onSubmit={sendMessage} className="relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="w-full bg-[#09090b] border border-white/10 rounded-lg py-2 pl-3 pr-10 text-xs text-[#f0f0f0] placeholder:text-[#52525b] focus:outline-none focus:border-[#ccff00]/60 focus:ring-1 focus:ring-[#ccff00]/40 transition-all font-sans"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-[#ccff00] text-black hover:bg-[#d9ff33] rounded-md transition-all disabled:opacity-30 disabled:hover:bg-[#ccff00] disabled:cursor-not-allowed cursor-pointer"
            title="Send message"
          >
            <Send className="w-3.5 h-3.5 text-black" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeamChat;
