import React, { useState } from "react";
import { handleKeyDown, validateEmail } from "@/utils/utils";
import DialogBox from "@/components/DialogBox";
import axios, { AxiosError } from "axios";

interface ErrorResponse {
  error: string;
}

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (emailError || !email) {
      return;
    }

    setIsLoading(true); // Set isLoading to true when form is submitted

    try {
      const response = await axios.post(
        "http://localhost:3200/request-password-reset",
        { email }
      );

      setDialogMessage(response.data.message);
      setDialogOpen(true);
      setIsError(false);
      setIsSuccess(true);
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;

      if (axiosError.response) {
        setDialogMessage(axiosError.response.data.error);
      } else {
        setDialogMessage("An error occurred while requesting password reset.");
      }
      setDialogOpen(true);
      setIsError(true);
    } finally {
      setIsLoading(false); // Set isLoading back to false when API call is finished
    }
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setDialogMessage("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-5">Forgot Password</h1>
      <div className="w-96">
        {" "}
        <p className="mb-4 text-center break-words">
          Please enter your email address. You will receive a link to create a
          new password via email.
        </p>
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <input
            className="border mb-2 p-2"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError(validateEmail(e.target.value));
            }}
            onKeyDown={handleKeyDown}
          />
          {emailError && (
            <p className="text-red-500 break-words">{emailError}</p>
          )}
          <button
            className={`p-2 rounded text-white ${
              emailError || !email || isLoading || isSuccess
                ? "bg-gray-500"
                : "bg-blue-500"
            }`}
            type="submit"
            disabled={!!emailError || !email || isLoading || isSuccess}
          >
            {isLoading ? "Loading..." : "Send Email"}{" "}
            {/* Change button text based on isLoading */}
          </button>
        </form>
        {isSuccess && (
          <p className="mt-3">
            Password reset email has been sent to your address.
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

export default ForgotPassword;
