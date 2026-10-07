import { useEffect, useState } from "react";
import socket from "../socket";

/**
 * Custom Hook: useSocket
 * Returns real-time WebSocket connection status and socket instance
 */
export const useSocket = () => {
  const [connected, setConnected] = useState(socket.connected);

  useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    if (socket.connected) {
      setConnected(true);
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return {
    socket,
    connected
  };
};

export default useSocket;
