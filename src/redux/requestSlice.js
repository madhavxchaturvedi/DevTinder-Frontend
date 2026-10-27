import { createSlice } from "@reduxjs/toolkit";

const requestSlice = createSlice({
  name: "requests",
  initialState: null,
  reducers: {
    addRequest: (state, action) => action.payload,
    addIncomingRequest: (state, action) => {
      if (!state) return [action.payload];
      if (state.some((r) => r._id === action.payload._id)) return state;
      return [action.payload, ...state];
    },
    removeRequest: (state, action) => {
      if (!state) return null;
      const newArray = state.filter((r) => r._id !== action.payload);
      return newArray;
    },
  },
});

export const { addRequest, addIncomingRequest, removeRequest } = requestSlice.actions;
export default requestSlice.reducer;
