import { io } from "socket.io-client";
import store from "./Store/store"; // Your Redux store
import { addNotification } from "./features/notificationSlice";

let socket;

export const connectSocket = (token) => {
  socket = io(process.env.REACT_APP_SOCKET_URL || "http://localhost:5000", {
    auth: {
      token,
    },
    transports: ["websocket"],
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.warn("❌ Socket disconnected");
  });

  socket.on("connect_error", (err) => {
    console.error("⚠️ Socket connection error:", err.message);
  });

  socket.on("task:updated", (data) => {
    console.log("📬 Notification received:", data);
    store.dispatch(addNotification({ ...data, isRead: false }));
  });

  socket.on("task:assigned", (data) => {
    console.log("📬 Notification received:", data);
    store.dispatch(addNotification({ ...data, isRead: false }));
  });

  socket.on("task:deleted", (data) => {
    console.log("📬 Notification received:", data);
    store.dispatch(addNotification({ ...data, isRead: false }));
  });
  
};

export const getSocket = () => socket;
