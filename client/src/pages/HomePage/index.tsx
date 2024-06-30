import SidePane from "@/components/SidePane/SidePane";
import React, { useEffect } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { decodeToken } from "@/utils/utils";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const serverUrl = import.meta.env.VITE_SERVER_URL;

  useEffect(() => {
    const decodedToken = decodeToken();
    if (decodedToken) {
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        localStorage.removeItem("token");
        navigate(0);
      }
    }
    /* Establish a WebSocket connection when the component is mounted */
    const socket = io(`${serverUrl}`);

    /* Listen for connection errors */
    socket.on("connect_error", (error) => {
      console.log("Connection Error", error);
    });

    return () => {
      /* Disconnect the WebSocket connection when the component is unmounted */
      socket.disconnect();
    };
  }, [navigate, serverUrl]);

  return (
    <div className="flex">
      <div className="w-96">
        <SidePane />
      </div>
      {/* <div className="flex-grow bg-blue-200"></div> */}
      <div className="flex-grow bg-gradient-to-br from-blue-gray-200 to-blue-300"></div>
    </div>
  );
};

export default HomePage;
