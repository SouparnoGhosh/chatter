import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { decodeToken, handleKeyDown, validateChannelName } from "@/utils/utils";
import { MdArrowBack } from "react-icons/md";
import DialogBox from "@/components/DialogBox";
import axios, { AxiosError } from "axios";


interface ErrorResponse {
  error: string;
}

const CreateChannel = () => {
  const [channelName, setChannelName] = useState("");
  const [error, setError] = useState<string | null>("");
  const [loading, setLoading] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isSuccessful && !dialogOpen) {
      navigate("/");
    }
  }, [isSuccessful, dialogOpen, navigate]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChannelName(event.target.value);
    setError(validateChannelName(event.target.value));
  };

  const token = localStorage.getItem("token");
  if (!token) {
    /* Handle unauthenticated user */
    return;
  }

  const decodedToken = decodeToken();
  let username = "";
  if (decodedToken) {
    username = decodedToken.username;
  }

  const createChannel = async (event: React.FormEvent) => {
    event.preventDefault();

    setLoading(true);

    try {
      /* API call to create channel */
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/channels/create`,
        {
          name: channelName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      /* On success: */
      setDialogMessage(
        `Status ${response.status}: Channel created successfully`
      );
      setDialogOpen(true);
      setIsError(false);
    } catch (error) {
      /* On error: show error message */
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response) {
        setDialogMessage(
          axiosError.response.data.error ||
            `An error occurred: ${axiosError.response.status}`
        );
      } else {
        setDialogMessage("An error occurred while creating the channel.");
      }
      setDialogOpen(true);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const closeDialogBox = () => {
    setDialogOpen(false);
    setIsSuccessful(true);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <button
        className="absolute top-4 left-4 text-blue-500"
        onClick={() => navigate(-1)}
        disabled={loading}
      >
        <MdArrowBack size={24} />
      </button>
      <h2 className="mb-4 text-xl text-center">{username} is creating</h2>
      <form
        className="p-6 bg-white rounded shadow-md w-96"
        onSubmit={createChannel}
        onKeyDown={handleKeyDown}
      >
        <label className="block mb-2 text-center">
          <span className="text-gray-700">Channel Name:</span>
          <input
            type="text"
            value={channelName}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </label>
        {error && <p className="text-red-500">{error}</p>}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={!!error || loading || isSuccessful}
            className={`mt-4 px-4 py-2 text-white rounded ${
              !!error || loading || isSuccessful
                ? "bg-gray-400"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? "Loading..." : "Create Channel"}
          </button>
        </div>
      </form>
      <div className="absolute bottom-4 right-4">
        <DialogBox
          message={dialogMessage}
          isOpen={dialogOpen}
          onClose={closeDialogBox}
          isError={isError}
        />
      </div>
    </div>
  );
};

export default CreateChannel;
