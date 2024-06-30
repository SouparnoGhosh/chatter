import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { validatePassword, handleKeyDown } from "@/utils/utils";
import DialogBox from "@/components/DialogBox";
import axios, { AxiosError } from "axios";

interface ErrorResponse {
  error: string;
}

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isError, setIsError] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const passwordError = validatePassword(password);

    setPasswordError(passwordError);

    if (passwordError) {
      return;
    }

    /* Extract passwordResetToken from URL */
    const urlParams = new URLSearchParams(window.location.search);
    const passwordResetToken = urlParams.get("token");
    console.log(passwordResetToken);

    setIsLoading(true);

    try {
      /* Send POST request to /password-reset endpoint */
      const response = await axios.post(
        "http://localhost:3200/password-reset",
        {
          passwordResetToken,
          newPassword: password,
        }
      );
      /* Handle password reset here */
      setDialogMessage(response.data.message);
      setDialogOpen(true);
      setIsSuccess(true);
      setIsError(false);
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response && axiosError.response.data.error) {
        setDialogMessage(axiosError.response.data.error);
      } else {
        setDialogMessage("An error occurred while resetting password.");
      }
      setDialogOpen(true);
      setIsError(true);
    }

    setIsLoading(false);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setDialogMessage("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-5">Reset Your Password</h1>
      <div className="w-96">
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <div className="flex border-2 mb-2 p-2 bg-white focus-within:border-black rounded">
            <input
              className="flex-grow outline-none"
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
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
              !!passwordError || !password || isLoading || isSuccess
                ? "bg-gray-500"
                : "bg-blue-500"
            } text-white`}
            type="submit"
            disabled={!!passwordError || !password || isLoading || isSuccess}
          >
            {isLoading ? "Loading..." : "Submit"}
          </button>
        </form>
        {isSuccess && (
          <p className="mt-3">
            Your password reset was successful. You may login now.
          </p>
        )}
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

export default ResetPassword;
