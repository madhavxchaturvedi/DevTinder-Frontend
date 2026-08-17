import React, { useState, useEffect, useRef } from 'react';
import { FiSend } from 'react-icons/fi';
import { getSocket } from '../utils/socket';
import { useSelector } from 'react-redux';

const TeamChat = ({ roomId, initialChats = [] }) => {
  const [chats, setChats] = useState(initialChats);
  const [newMessage, setNewMessage] = useState("");
  const user = useSelector(store => store.user);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  useEffect(() => {
    const socket = getSocket();
    const handleChatMessage = ({ message }) => {
      setChats(prev => [...prev, message]);
    };
    socket.on('room:chat_message', handleChatMessage);
    return () => socket.off('room:chat_message', handleChatMessage);
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const message = {
      _id: Math.random().toString(36).substring(7),
      senderId: {
        _id: user?._id,
        firstName: user?.firstName,
        lastName: user?.lastName,
        photoUrl: user?.photoUrl
      },
      text: newMessage,
      type: 'user',
      createdAt: new Date()
    };
    
    setChats(prev => [...prev, message]);
    getSocket().emit('room:chat_message', { roomId, message });
    setNewMessage("");
  };

  const formatTime = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0d0e]">
      <div className="p-4 border-b border-white/5 bg-[#141415] flex-shrink-0">
        <h3 className="text-[#e5e5e5] font-bold text-sm tracking-wide">Team Chat</h3>
        <p className="text-[#737373] text-[11px] mt-0.5">Share snippets and ideas</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-4">
        {chats.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
              <FiSend className="text-[#a3a3a3]" size={20} />
            </div>
            <p className="text-[#737373] text-xs">No messages yet.<br/>Say hello to your partner!</p>
          </div>
        ) : (
          chats.map(chat => {
            const isMe = chat.senderId?._id === user?._id;
            const isSystem = chat.type === 'system';
            
            if (isSystem) {
              return (
                <div key={chat._id} className="flex justify-center my-2">
                  <div className="bg-[#ccff00]/10 border border-[#ccff00]/20 text-[#ccff00] px-3 py-1.5 rounded-full text-[11px] font-bold">
                    {chat.text}
                  </div>
                </div>
              );
            }
            
            return (
              <div key={chat._id} className={`flex gap-3 max-w-[85%] ${isMe ? 'self-end flex-row-reverse' : 'self-start'}`}>
                <img 
                  src={chat.senderId?.photoUrl || "https://geographyandyou.com/images/user-profile.png"} 
                  alt={chat.senderId?.firstName} 
                  className="w-8 h-8 rounded-full object-cover shrink-0 mt-auto"
                />
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] text-[#737373] font-bold">
                      {isMe ? 'You' : chat.senderId?.firstName}
                    </span>
                    <span className="text-[9px] text-[#525252]">{formatTime(chat.createdAt)}</span>
                  </div>
                  <div className={`px-4 py-2 rounded-2xl text-[13px] leading-relaxed break-words ${
                    isMe 
                      ? 'bg-blue-600 text-white rounded-br-sm' 
                      : 'bg-[#1a1a1c] border border-white/5 text-[#e5e5e5] rounded-bl-sm'
                  }`}>
                    {chat.text}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-[#141415] border-t border-white/5 flex-shrink-0">
        <form onSubmit={sendMessage} className="relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="w-full bg-[#1a1a1c] border border-white/10 rounded-xl py-2.5 pl-4 pr-10 text-sm text-white placeholder-[#737373] focus:outline-none focus:border-blue-500"
          />
          <button type="submit" disabled={!newMessage.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent">
            <FiSend size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeamChat;
