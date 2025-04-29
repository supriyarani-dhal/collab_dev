import { io } from "socket.io-client";

export const initSocket = async () => {
  const options = {
    "force new connection": true,
    reconnectionAttempts: "Infinity",
    timeout: 10000,
    transports: ["websocket"],
  };
  return io(
    import.meta.env.MODE === "development"
      ? "http://localhost:5000"
      : "https://coding-capsule.onrender.com",
    options
  );
};
