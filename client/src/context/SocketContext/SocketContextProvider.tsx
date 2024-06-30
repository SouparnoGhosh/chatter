import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import SocketContext from "./SocketContext";

interface SocketContextProviderProps {
  children: React.ReactNode;
}

const SocketContextProvider: React.FC<SocketContextProviderProps> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const serverUrl = import.meta.env.VITE_SERVER_URL;

  useEffect(() => {
    const newSocket = io(`${serverUrl}`);

    /* Listen for connection errors */
    newSocket.on("connect_error", (error) => {
      console.log("Connection Error", error);
    });

    /* Listen for successful connection */
    newSocket.on("connect", () => {
      setIsConnected(true);
    });

    setSocket(newSocket);

    return () => {
      /* Disconnect the WebSocket connection when the component is unmounted */
      newSocket.disconnect();
    };
  }, [serverUrl]);

  return (
    <SocketContext.Provider value={socket}>
      {isConnected && children}
    </SocketContext.Provider>
  );
};

export default SocketContextProvider;