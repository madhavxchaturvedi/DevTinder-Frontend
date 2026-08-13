import { createSlice } from "@reduxjs/toolkit";

const postSlice = createSlice({
  name: "posts",
  initialState: [],
  reducers: {
    setPosts: (state, action) => {
      return action.payload;
    },
    appendPosts: (state, action) => {
      // Append new posts, filtering out any duplicates
      const existingIds = new Set(state.map(post => post._id));
      const newPosts = action.payload.filter(post => !existingIds.has(post._id));
      return [...state, ...newPosts];
    },
    addPost: (state, action) => {
      // Add new post to the top
      state.unshift(action.payload);
    },
    removePost: (state, action) => {
      return state.filter((post) => post._id !== action.payload);
    },
    updatePost: (state, action) => {
      const index = state.findIndex((post) => post._id === action.payload._id);
      if (index !== -1) {
        state[index] = action.payload;
      }
    },
  },
});

export const { setPosts, appendPosts, addPost, removePost, updatePost } = postSlice.actions;
export default postSlice.reducer;
