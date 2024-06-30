import React, { useState } from "react";
import { FiArrowLeft, FiEye, FiEyeOff } from "react-icons/fi";
import { validatePassword, handleKeyDown } from "@/utils/utils";
import DialogBox from "@/components/DialogBox";
import { useNavigate } from "react-router-dom";

const DeleteProfile: React.FC = () => {
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setIsLoading(true);

    try {
      const response = await fetch("/delete-profile", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          // Add your JWT here
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        throw new Error("Error deleting profile");
      }

      setIsSuccessful(true);
      setDialogMessage("Profile deleted successfully");
      setIsError(false);
      setDialogOpen(true);
    } catch (error) {
      console.error(error);
      setDialogMessage("Error deleting profile");
      setIsError(true);
      setDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const navigate = useNavigate();

  const closeDialog = () => {
    setDialogOpen(false);
    setDialogMessage("");
    if (isSuccessful) {
      localStorage.removeItem("token");
      navigate(0);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <button
        className="absolute top-0 left-0 m-5"
        onClick={() => navigate(-2)}
      >
        <FiArrowLeft size={24} />
      </button>
      <h1 className="text-3xl font-bold mb-5">Delete Your Profile</h1>
      <div className="w-96">
        <p className="mb-4 text-center break-words">
          Please enter your password to confirm profile deletion. This action
          cannot be undone.
        </p>
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <div className="flex border-2 mb-2 p-2 bg-white focus-within:border-black rounded">
            <input
              className="flex-grow outline-none"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(validatePassword(e.target.value));
              }}
              onKeyDown={handleKeyDown}
            />
            <button
              className="flex-none"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {passwordError && (
            <p className="text-red-500 w-96 break-words">{passwordError}</p>
          )}
          <button
            className={`p-2 rounded ${
              !!passwordError || !password || isLoading || isSuccessful
                ? "bg-gray-500"
                : "bg-red-500"
            } text-white`}
            type="submit"
            disabled={!!passwordError || !password || isLoading || isSuccessful}
          >
            {isLoading ? "Loading..." : "Delete Profile"}
          </button>
        </form>
      </div>
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

export default DeleteProfile;
