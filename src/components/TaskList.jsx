import React, { useState, useEffect } from 'react';
import { FiCheck, FiCircle, FiPlus, FiTrash2, FiCheckSquare } from 'react-icons/fi';
import { getSocket } from '../utils/socket';
import { useSelector } from 'react-redux';

const TaskList = ({ roomId, initialTasks = [], onTasksChange }) => {
  const [tasks, setTasks] = useState(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const user = useSelector(store => store.user);

  // Report task changes to parent
  useEffect(() => {
    if (onTasksChange) onTasksChange(tasks);
  }, [tasks, onTasksChange]);

  useEffect(() => {
    const socket = getSocket();
    const handleTasksUpdate = ({ tasks: updatedTasks }) => {
      setTasks(updatedTasks);
    };
    socket.on('room:tasks_update', handleTasksUpdate);
    return () => socket.off('room:tasks_update', handleTasksUpdate);
  }, []);

  const updateTasks = (newTasks) => {
    setTasks(newTasks);
    getSocket().emit('room:tasks_update', { roomId, tasks: newTasks });
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask = {
      _id: Math.random().toString(36).substring(7), // Temp ID until DB saves
      title: newTaskTitle,
      completed: false,
      assignedTo: user?._id,
      createdAt: new Date()
    };
    updateTasks([...tasks, newTask]);
    setNewTaskTitle("");
  };

  const toggleTask = (taskId) => {
    const newTasks = tasks.map(t => t._id === taskId ? { ...t, completed: !t.completed } : t);
    updateTasks(newTasks);
  };

  const deleteTask = (taskId) => {
    const newTasks = tasks.filter(t => t._id !== taskId);
    updateTasks(newTasks);
  };

  return (
    <div className="flex flex-col h-full bg-[#121212] overflow-hidden">
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        {tasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <FiCheckSquare size={32} className="text-[#737373] mb-3" />
            <p className="text-[#737373] text-xs">No tasks yet.<br/>Add one below to start collaborating!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {tasks.map(task => (
              <div 
                key={task._id} 
                className={`group flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-300 hover:shadow-lg ${
                  task.completed 
                    ? 'bg-[#a855f7]/5 border-[#a855f7]/20 text-[#737373]' 
                    : 'bg-[#1a1a1c] border-white/5 text-[#e5e5e5] hover:border-white/10 hover:bg-[#1f1f21]'
                }`}
              >
                <button onClick={() => toggleTask(task._id)} className="shrink-0 outline-none transition-transform hover:scale-110 active:scale-95">
                  {task.completed ? (
                    <div className="w-5 h-5 rounded-md bg-[#a855f7] shadow-[0_0_10px_rgba(168,85,247,0.4)] flex items-center justify-center text-white">
                      <FiCheck size={14} strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-md border-2 border-white/20 group-hover:border-[#a855f7]/50 flex items-center justify-center bg-black/20 transition-colors">
                    </div>
                  )}
                </button>
                <span className={`flex-1 text-[13px] transition-all duration-300 ${task.completed ? 'line-through opacity-70' : ''}`}>
                  {task.title}
                </span>
                <button onClick={() => deleteTask(task._id)} className="opacity-0 group-hover:opacity-100 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all p-1.5">
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 bg-[#1a1a1c]/80 backdrop-blur-xl border-t border-white/5 flex-shrink-0">
        <form onSubmit={addTask} className="relative">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a new task..."
            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-[#737373] focus:outline-none focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] transition-all shadow-inner"
          />
          <button type="submit" disabled={!newTaskTitle.trim()} className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-[#a855f7] text-white hover:bg-[#9333ea] rounded-lg transition-all disabled:opacity-50 disabled:bg-white/10 disabled:text-[#737373]">
            <FiPlus size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskList;
