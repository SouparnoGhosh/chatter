import React, { useContext, useEffect, useRef, useState } from "react";
import MessageTooltip from "../../Tooltips/MessageTooltip";
import SocketContext from "@/context/SocketContext/SocketContext";
import { decodeToken } from "@/utils/utils";

interface MessageProps {
  text: string;
  messageId: string;
  senderId: string;
  sender: string;
  timestamp: string;
  isNotification: boolean;
  isOwnMessage: boolean;
  isLoggedInUserAdmin: boolean;
  deleted: boolean;
}

interface Data {
  newAdmin: string;
  removedAdmin: string;
}

const TextMessage: React.FC<MessageProps> = ({
  text: initialText,
  messageId,
  sender,
  isNotification,
  timestamp,
  isOwnMessage,
  isLoggedInUserAdmin: isLoggedInUserAdminInitially,
  deleted: isDeletedInitially,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [text, setText] = useState(initialText);
  const [deleted, setDeleted] = useState(isDeletedInitially);
  const [isLoggedInUserAdmin, setIsLoggedInUserAdmin] = useState(
    isLoggedInUserAdminInitially
  );

  const maxLength = 250;

  // console.log(sender)
  const decodedToken = decodeToken();
  // console.log(decodedToken?.userId);

  const displayText =
    isExpanded || text.length <= maxLength
      ? text
      : text.slice(0, maxLength) + "...";

  const socket = useContext(SocketContext);

  const isAdminRef = useRef(isLoggedInUserAdmin);
  isAdminRef.current = isLoggedInUserAdmin;

  useEffect(() => {
    if (socket) {
      socket.on("delete-message", (deletedMessageId) => {
        if (deletedMessageId === messageId) {
          setDeleted(true);
          setText("This message was deleted");
        }
      });

      const handleMakeAdmin = (data: Data) => {
        if (data.newAdmin === decodedToken?.userId && !isAdminRef.current) {
          setIsLoggedInUserAdmin(true);
        }
      };

      const handleRemoveAdmin = (data: Data) => {
        if (data.removedAdmin === decodedToken?.userId && isAdminRef.current) {
          setIsLoggedInUserAdmin(false);
        }
      };

      socket.on("make-admin", handleMakeAdmin);
      socket.on("remove-admin", handleRemoveAdmin);

      return () => {
        if (socket) {
          socket.off("delete-message");
          socket.off("make-admin", handleMakeAdmin);
          socket.off("remove-admin", handleRemoveAdmin);
        }
      };
    }
  }, [socket, messageId, decodedToken?.userId]);

  if (isNotification) {
    return (
      <div className="flex flex-col items-center my-3">
        <div className="relative max-w-xs py-1 px-2 rounded-lg bg-gray-700 text-white text-sm text-center border border-gray-900">
          <p className="pr-2 whitespace-normal">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}
    >
      <div
        className={`relative max-w-xs py-2 px-4 rounded-lg border ${
          isOwnMessage
            ? deleted
              ? "bg-blue-300 text-white border-blue-400"
              : "bg-blue-500 text-white border-blue-700"
            : deleted
            ? "bg-gray-100 text-gray-400 border-gray-400"
            : "bg-gray-300 text-black border-gray-700"
        }`}
      >
        <p className="pr-2 whitespace-normal">{displayText}</p>
        {text.length > maxLength && (
          <button
            className={`${isOwnMessage ? "text-yellow-400" : "text-green-500"}`}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Read Less" : "Read More"}
          </button>
        )}
        <div
          className="absolute top-0 right-0 mr-2
           mt-2"
        >
          {(isOwnMessage || isLoggedInUserAdmin) && !deleted && (
            <MessageTooltip
              isOwnMessage={isOwnMessage}
              isLoggedInUserAdmin={isLoggedInUserAdmin}
              messageId={messageId}
            />
          )}
        </div>
      </div>
      <div className={`text-sm ${isOwnMessage ? "text-right" : "text-left"}`}>
        <span>{sender}</span>
        <span className="text-gray-500 ml-2">{timestamp}</span>
      </div>
    </div>
  );
};

export default TextMessage;
