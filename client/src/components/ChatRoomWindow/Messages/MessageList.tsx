import { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import TextMessage from "./TextMessage";
import RotateLoader from "../../Loaders/RotateLoader";
import DialogBox from "@/components/DialogBox";
import SocketContext from "@/context/SocketContext/SocketContext";
import { decodeToken } from "@/utils/utils";
import FileMessage from "./FileMessage";

type Message = {
  _id: string;
  content: string;
  timestamp: string;
  user: string;
  username: string;
  channel: string;
  isNotification: boolean;
  file?: {
    _id: string;
    filename: string;
    mimetype: string;
    size: number;
    url: string;
  };
  deleted: boolean;
};

const MessageList: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoggedInUserAdmin, setIsLoggedInUserAdmin] =
    useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const token = localStorage.getItem("token");
  const { channelId } = useParams<{ channelId: string }>();
  const serverURL = import.meta.env.VITE_SERVER_URL;
  const socket = useContext(SocketContext);
  // console.log("Socket of message list is:", socket);

  const decodedToken = decodeToken();
  let userId = "";
  if (decodedToken) {
    userId = decodedToken.userId;
  }

  const endOfMessagesRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const getIsAdmin = async () => {
      try {
        const response = await axios.get(
          `${serverURL}/channels/${channelId}/isadmin`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setIsLoggedInUserAdmin(response.data.isAdmin);
      } catch (error) {
        console.error("Error getting isAdmin status:", error);
        setDialogMessage("Error getting isAdmin status. Please try again.");
        setIsError(true);
        setDialogOpen(true);
      }
    };

    const getMessages = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${serverURL}/channels/${channelId}/messages`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setMessages(response.data.messages);
      } catch (error) {
        console.error("Error getting messages:", error);
        setDialogMessage("Error getting messages. Please try again.");
        setIsError(true);
        setDialogOpen(true);
      } finally {
        setIsLoading(false);
      }
    };

    getIsAdmin();
    getMessages();
  }, [channelId, token, serverURL]);

  useEffect(() => {
    if (socket) {
      socket.on("new-message", (data) => {
        // const { message } = data;
        console.log("Received new message:", data);

        // Create a new message object
        const newMessage: Message = {
          _id: data._id,
          content: data.content,
          timestamp: data.timestamp,
          user: data.user,
          username: data.username,
          channel: data.channel,
          isNotification: data.isNotification,
          deleted: data.deleted,
        };

        // If the file property exists in the data, add it to the new message object
        if (data.file) {
          newMessage.file = {
            _id: data.file._id,
            filename: data.file.filename,
            mimetype: data.file.mimetype,
            size: data.file.size,
            url: data.file.url,
          };
        }
        // Update the state with the new message
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      });

      // socket.on("make-admin", (data) => {
      //   console.log("Received make-admin event:", data);
      // });

      // socket.emit("make-admin", { channel: channelId, user: userId });
    }

    // Clean up the event listener when the component is unmounted
    return () => {
      if (socket) {
        socket.off("new-message");
      }
    };
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on("delete-message", (messageId) => {
        console.log("Received delete message:", messageId);
        // Update the state to reflect the deletion of the message
        // setMessages((prevMessages) =>
        //   prevMessages.map((message) =>
        //     message._id === messageId ? { ...message, deleted: true } : message
        //   )
        // );
      });
    }

    // Clean up the event listener when the component is unmounted
    return () => {
      if (socket) {
        socket.off("delete-message");
      }
    };
  }, [socket]);

  // console.log(messages);
  // console.log("isLoggedInUserAdmin:", isLoggedInUserAdmin);

  const closeDialog = () => {
    setDialogOpen(false);
    setDialogMessage("");
  };

  return (
    <div className="flex-grow overflow-y-auto p-4 h-full">
      {isLoading ? (
        <div className="my-4">
          <RotateLoader />
        </div>
      ) : (
        messages.map((message, index) => {
          if (message.content) {
            return (
              <TextMessage
                key={index}
                text={message.content}
                messageId={message._id}
                senderId={message.user}
                sender={message.username}
                timestamp={message.timestamp}
                isNotification={message.isNotification}
                isOwnMessage={message.user === userId}
                isLoggedInUserAdmin={isLoggedInUserAdmin}
                deleted={message.deleted}
              />
            );
          } else if (message.file) {
            return (
              <FileMessage
                key={index}
                file={message.file}
                sender={message.user}
                timestamp={message.timestamp}
                isOwnMessage={message.user === userId}
                isLoggedInUserAdmin={isLoggedInUserAdmin}
              />
            );
          } else {
            return null;
          }
        })
      )}
      <div ref={endOfMessagesRef}></div>

      <div className="fixed bottom-0 right-0 m-6">
        <DialogBox
          message={dialogMessage}
          isOpen={dialogOpen}
          onClose={closeDialog}
          isError={isError}
        />
      </div>
    </div>
  );
};

export default MessageList;
