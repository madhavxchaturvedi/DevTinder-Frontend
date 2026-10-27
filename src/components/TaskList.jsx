import React, { useState, useEffect } from "react";
import { Check, Plus, Trash2, CheckSquare } from "lucide-react";
import { getSocket } from "../utils/socket";
import { useSelector } from "react-redux";

const TaskList = ({ roomId, initialTasks = [], onTasksChange }) => {
  const [tasks, setTasks] = useState(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const user = useSelector((store) => store.user);

  // Synchronize when initialTasks prop loads asynchronously
  useEffect(() => {
    if (initialTasks && Array.isArray(initialTasks) && initialTasks.length > 0) {
      setTasks(initialTasks);
    }
  }, [initialTasks]);

  // Report task changes to parent
  useEffect(() => {
    if (onTasksChange) onTasksChange(tasks);
  }, [tasks, onTasksChange]);

  // Real-time socket sync
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handleTasksUpdate = ({ tasks: updatedTasks }) => {
      if (Array.isArray(updatedTasks)) {
        setTasks(updatedTasks);
      }
    };
    socket.on("room:tasks_update", handleTasksUpdate);
    return () => socket.off("room:tasks_update", handleTasksUpdate);
  }, []);

  const updateTasks = (newTasks) => {
    setTasks(newTasks);
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit("room:tasks_update", { roomId, tasks: newTasks });
    }
  };

  const addTask = (e) => {
    e.preventDefault();
    const trimmed = newTaskTitle.trim();
    if (!trimmed) return;
    const newTask = {
      _id: Math.random().toString(36).substring(7),
      title: trimmed,
      completed: false,
      assignedTo: user?._id,
      createdAt: new Date(),
    };
    updateTasks([...tasks, newTask]);
    setNewTaskTitle("");
  };

  const toggleTask = (taskId) => {
    const newTasks = tasks.map((t) =>
      t._id === taskId ? { ...t, completed: !t.completed } : t
    );
    updateTasks(newTasks);
  };

  const deleteTask = (taskId) => {
    const newTasks = tasks.filter((t) => t._id !== taskId);
    updateTasks(newTasks);
  };

  return (
    <div className="flex flex-col h-full bg-[#111113] overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {tasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 select-none">
            <div className="w-10 h-10 rounded-xl bg-[#1a1a1f] border border-white/[0.07] flex items-center justify-center mb-3">
              <CheckSquare className="w-5 h-5 text-[#52525b]" />
            </div>
            <p className="text-[#f0f0f0] text-xs font-semibold mb-1">No tasks yet</p>
            <p className="text-[#52525b] text-[11px] font-mono leading-relaxed max-w-[200px]">
              Add milestones and tasks below to collaborate with your team.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {tasks.map((task) => (
              <div
                key={task._id}
                className={`group flex items-center gap-2.5 p-3 rounded-lg border transition-all duration-200 ${
                  task.completed
                    ? "bg-[#1a1a1f]/40 border-white/[0.04] text-[#52525b]"
                    : "bg-[#1a1a1f] border-white/[0.07] text-[#f0f0f0] hover:border-white/[0.12] hover:bg-[#1a1a1f]/90"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleTask(task._id)}
                  className="shrink-0 outline-none transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                  title={task.completed ? "Mark incomplete" : "Mark complete"}
                >
                  {task.completed ? (
                    <div className="w-4 h-4 rounded bg-[#ccff00] flex items-center justify-center shadow-[0_0_8px_rgba(204,255,0,0.4)]">
                      <Check className="w-3 h-3 text-black stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded border border-white/20 group-hover:border-[#ccff00]/60 flex items-center justify-center bg-black/30 transition-colors" />
                  )}
                </button>
                <span
                  className={`flex-1 text-xs font-sans leading-snug transition-all ${
                    task.completed ? "line-through text-[#52525b]" : "text-[#f0f0f0]"
                  }`}
                >
                  {task.title}
                </span>
                <button
                  type="button"
                  onClick={() => deleteTask(task._id)}
                  className="opacity-0 group-hover:opacity-100 text-[#52525b] hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all p-1 cursor-pointer"
                  title="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 bg-[#111113] border-t border-white/[0.07] flex-shrink-0">
        <form onSubmit={addTask} className="relative">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a new task..."
            className="w-full bg-[#09090b] border border-white/10 rounded-lg py-2 pl-3 pr-10 text-xs text-[#f0f0f0] placeholder:text-[#52525b] focus:outline-none focus:border-[#ccff00]/60 focus:ring-1 focus:ring-[#ccff00]/40 transition-all font-sans"
          />
          <button
            type="submit"
            disabled={!newTaskTitle.trim()}
            className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-[#ccff00] text-black hover:bg-[#d9ff33] rounded-md transition-all disabled:opacity-30 disabled:hover:bg-[#ccff00] disabled:cursor-not-allowed cursor-pointer"
            title="Add task"
          >
            <Plus className="w-3.5 h-3.5 text-black stroke-[2.5]" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskList;
