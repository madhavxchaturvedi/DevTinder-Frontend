import { createSlice } from "@reduxjs/toolkit";

const postSlice = createSlice({
  name: "posts",
  initialState: [],
  reducers: {
    setPosts: (state, action) => {
      return action.payload;
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

export const { setPosts, addPost, removePost, updatePost } = postSlice.actions;
export default postSlice.reducer;
