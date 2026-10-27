import { createSlice } from "@reduxjs/toolkit";

const connectionSlice = createSlice({
  name: "connections",
  initialState: null,
  reducers: {
    addConnections: (state, action) => action.payload,
    addConnection: (state, action) => {
      if (!state) return [action.payload];
      if (state.some((c) => c._id === action.payload._id)) return state;
      return [action.payload, ...state];
    },
    removeConnections: () => null,
  },
});

export const { addConnections, addConnection, removeConnections } = connectionSlice.actions;

export default connectionSlice.reducer;
