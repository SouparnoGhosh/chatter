import DialogBox from "@/components/DialogBox";
import axios, { AxiosError } from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface ErrorResponse {
  error: string;
}

const EmailVerificationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const token = params.get("token");
  const [isLoading, setIsLoading] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);

  useEffect(() => {
    if (isSuccessful && !dialogOpen) {
      navigate("/login");
    }
  }, [isSuccessful, dialogOpen, navigate]);

  const verifyEmail = async () => {
    if (!token) {
      setDialogMessage("Invalid verification link.");
      setDialogOpen(true);
      setIsError(true);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3200/verify-email?token=${token}`
      );
      setDialogMessage(response.data.message);
      setDialogOpen(true);
      setIsError(false);
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response) {
        setDialogMessage(axiosError.response.data.error);
      } else {
        setDialogMessage("An error occurred while verifying email.");
      }
      setDialogOpen(true);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setDialogMessage("");
    if (!isError) {
      setIsSuccessful(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-5">Email Verification</h1>
      <p className="mb-4 text-center break-words w-96">
        Click this to verify your email. You were sent here because a email
        verification message was sent to your provided address.
      </p>
      <button
        className={`text-white p-3 rounded-xl ${
          isLoading ? "bg-gray-500" : "bg-blue-500"
        }`}
        onClick={verifyEmail}
        disabled={isLoading}
      >
        Verify Email
      </button>
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

export default EmailVerificationPage;
