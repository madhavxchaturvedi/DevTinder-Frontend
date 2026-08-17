import React, { useState, useEffect } from 'react';
import { FiCheck, FiCircle, FiPlus, FiTrash2 } from 'react-icons/fi';
import { getSocket } from '../utils/socket';
import { useSelector } from 'react-redux';

const TaskList = ({ roomId, initialTasks = [] }) => {
  const [tasks, setTasks] = useState(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const user = useSelector(store => store.user);

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
    <div className="flex flex-col h-full bg-[#0d0d0e]">
      <div className="p-4 border-b border-white/5 bg-[#141415] flex-shrink-0">
        <h3 className="text-[#e5e5e5] font-bold text-sm tracking-wide">Project Tasks</h3>
        <p className="text-[#737373] text-[11px] mt-0.5">Shared checklist for this session</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {tasks.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <p className="text-[#737373] text-xs">No tasks yet.<br/>Add one below to start collaborating!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {tasks.map(task => (
              <div 
                key={task._id} 
                className={`group flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  task.completed 
                    ? 'bg-green-500/5 border-green-500/20 text-[#a3a3a3]' 
                    : 'bg-[#1a1a1c] border-white/5 text-[#e5e5e5] hover:border-white/10'
                }`}
              >
                <button onClick={() => toggleTask(task._id)} className="shrink-0 outline-none">
                  {task.completed ? (
                    <div className="w-5 h-5 rounded-md bg-green-500 flex items-center justify-center text-black">
                      <FiCheck size={14} strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-md border border-white/20 group-hover:border-white/50 flex items-center justify-center bg-[#141415]">
                    </div>
                  )}
                </button>
                <span className={`flex-1 text-[13px] ${task.completed ? 'line-through' : ''}`}>
                  {task.title}
                </span>
                <button onClick={() => deleteTask(task._id)} className="opacity-0 group-hover:opacity-100 text-red-500/50 hover:text-red-500 transition-colors p-1">
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 bg-[#141415] border-t border-white/5 flex-shrink-0">
        <form onSubmit={addTask} className="relative">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a new task..."
            className="w-full bg-[#1a1a1c] border border-white/10 rounded-xl py-2.5 pl-4 pr-10 text-sm text-white placeholder-[#737373] focus:outline-none focus:border-[#a855f7]"
          />
          <button type="submit" disabled={!newTaskTitle.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#a855f7] hover:bg-[#a855f7]/10 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent">
            <FiPlus size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskList;
