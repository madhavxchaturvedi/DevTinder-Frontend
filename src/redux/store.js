import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice";
import feedSlice from "./feedSlice";
import connectionSlice from "./connectionSlice";
import requestSlice from "./requestSlice";
import notificationReducer from "./notificationSlice";
import postReducer from "./postSlice";
import onlineUsersReducer from "./onlineUsersSlice";

const appStore = configureStore({
  reducer: {
    user: userSlice,
    feed: feedSlice,
    connections: connectionSlice,
    requests: requestSlice,
    notifications: notificationReducer,
    posts: postReducer,
    onlineUsers: onlineUsersReducer,
  },
});

export default appStore;
