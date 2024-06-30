import { size } from "@/utils/utils";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { MdFileUpload, MdSend } from "react-icons/md";
import DialogBox from "../DialogBox";
import { useParams } from "react-router-dom";
import SocketContext from "@/context/SocketContext/SocketContext";

const InputTextArea: React.FC = () => {
  const [message, setMessage] = useState("");
  const [rows, setRows] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const serverURL = import.meta.env.VITE_SERVER_URL;

  const { channelId } = useParams<{ channelId: string }>();
  const socket = useContext(SocketContext);

  useEffect(() => {
    const lineBreaks = (message.match(/\n/g) || []).length;
    setRows(Math.min(5, lineBreaks + 1));
  }, [message]);

  const handleUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        const file = files[0];
        const formData = new FormData();
        formData.append("file", file);

        try {
          await axios.post(
            `${serverURL}/channels/${channelId}/files`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );
          console.log("File uploaded successfully");
        } catch (error) {
          console.error("Error uploading file:", error);
        }
      }
    };
    input.click();
  };
  const token = localStorage.getItem("token");

  const sendMessage = async () => {
    try {
      const response = await axios.post(
        `${serverURL}/channels/${channelId}/messages`,
        { content: message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage("");

      console.log("Response:", response.data.data);

      /* Emit a socket event here */
      if (socket) {
        console.log(`Sending message: ${message} to channel ${channelId}`);

        socket.emit("new-message", response.data.data);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setDialogMessage("Error sending message. Please try again.");
      setIsError(true);
      setDialogOpen(true);
    }
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setDialogMessage("");
  };

  return (
    <div className="flex justify-between items-center p-3 border-t border-gray-200">
      <MdFileUpload
        size={size}
        className="hover:text-blue-500 mr-2"
        onClick={handleUpload}
      />
      <textarea
        className="resize-none overflow-auto max-h-[10em] mr-2 py-2 px-4 rounded border border-gray-200 flex-grow focus:outline-none focus:ring-0 focus:border-gray-400"
        rows={rows}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault(); // Prevents the addition of a new line in the text field (not needed in a lot of cases)
            sendMessage();
          }
        }}
        placeholder="Type a message..."
      />
      <MdSend
        size={size}
        className="hover:text-blue-500"
        onClick={sendMessage}
      />
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

export default InputTextArea;
