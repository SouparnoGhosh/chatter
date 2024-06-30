import React from "react";
import MessageTooltip from "../../Tooltips/MessageTooltip";
import { MdFileDownload } from "react-icons/md";
import axios from "axios";

interface FileMessageProps {
  file: {
    _id: string;
    filename: string;
    mimetype: string;
    size: number;
    url: string;
  };
  sender: string;
  timestamp: string;
  isOwnMessage: boolean;
  isLoggedInUserAdmin: boolean;
}

const FileMessage: React.FC<FileMessageProps> = ({
  file,
  sender,
  timestamp,
  isOwnMessage,
  isLoggedInUserAdmin,
}) => {
  const handleDownload = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`/files/${file._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.filename);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  return (
    <div
      className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}
    >
      <div
        className={`relative max-w-xs py-2 px-4 rounded-lg ${
          isOwnMessage ? "bg-blue-500 text-white" : "bg-gray-300 text-black"
        }`}
      >
        <span className="pr-2 whitespace-normal">{file.filename}</span>
        <MdFileDownload onClick={handleDownload} />
        <div className="absolute top-0 right-0 mr-2 mt-2">
          {(isOwnMessage || isLoggedInUserAdmin) && (
            <MessageTooltip
              isOwnMessage={isOwnMessage}
              isLoggedInUserAdmin={isLoggedInUserAdmin}
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

export default FileMessage;
