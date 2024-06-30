import React, { useContext, useEffect } from "react";
import UserComponentTooltip from "../Tooltips/UserComponentTooltip";
import { decodeToken } from "@/utils/utils";
import SocketContext from "@/context/SocketContext/SocketContext";

interface UserComponentProps {
  username: string;
  userId: string;
  isAdmin: boolean;
  isLoggedInUserAdmin: boolean;
}

const UserComponent: React.FC<UserComponentProps> = ({
  username,
  userId,
  isAdmin: initialIsAdmin,
  isLoggedInUserAdmin,
}) => {
  let isCurrentUser = false;
  const decodedToken = decodeToken();
  if (decodedToken) {
    isCurrentUser = decodedToken.userId === userId;
  }

  // const isAdminRef = useRef(initialIsAdmin);
  const [isAdmin, setIsAdmin] = React.useState(initialIsAdmin);
  const socket = useContext(SocketContext);

  useEffect(() => {
    socket?.on("make-admin", (data) => {
      if (data.newAdmin === userId) {
        setIsAdmin(true);
      }
    });

    socket?.on("remove-admin", (data) => {
      if (data.removedAdmin === userId) {
        setIsAdmin(false);
      }
    });

    // socket?.on("new-message", () => {
    //   console.log("Got It");
    // });

    return () => {
      socket?.off("make-admin");
      socket?.off("remove-admin");
    };
  }, [socket, userId]);

  return (
    <div className="py-2 flex justify-between items-center">
      <span>{username}</span>
      <div className="flex items-center">
        {isAdmin && (
          <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded-full mr-2">
            Admin
          </span>
        )}
        {isCurrentUser ? (
          <div style={{ width: "16px", height: "24px" }} /> // Placeholder with the same size as the tooltip
        ) : (
          <UserComponentTooltip
            memberId={userId}
            isLoggedInUserAdmin={isLoggedInUserAdmin}
            isMemberAdmin={isAdmin}
          />
        )}
      </div>
    </div>
  );
};

export default UserComponent;
