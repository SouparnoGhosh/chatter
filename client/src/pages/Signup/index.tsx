import React, { useState } from "react";
import {
  handleKeyDown,
  validateEmail,
  validatePassword,
  validateUsername,
} from "@/utils/utils";
import { FiEye, FiEyeOff } from "react-icons/fi";
import axios, { AxiosError } from "axios";
import DialogBox from "@/components/DialogBox";

interface ErrorResponse {
  error: string;
}

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    /* Check if all fields are filled and valid */
    if (
      !username ||
      !password ||
      !email ||
      !!usernameError ||
      !!passwordError ||
      !!emailError
    ) {
      return;
    }

    /* Prepare the data to be sent */
    const userData = {
      username,
      password,
      email,
    };

    setIsLoading(true);

    try {
      /* Send a POST request to the /signup endpoint */
      const response = await axios.post(
        "http://localhost:3200/signup",
        userData
      );

      /* If the request is successful, the response will be a JSON object with a "message" property */

      /* Handle success here */
      setDialogMessage(response.data.message);
      setDialogOpen(true);
      setIsError(false);
      setIsSuccessful(true);
    } catch (error) {
      /* Handle error here */
      const axiosError = error as AxiosError<ErrorResponse>;

      if (axiosError.response) {
        setDialogMessage(axiosError.response.data.error);
      } else {
        setDialogMessage("An error occurred while signing up.");
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
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-5">New here?</h1>
      <div className="w-96">
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <input
            className="border mb-2 p-2"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setUsernameError(validateUsername(e.target.value));
            }}
            onKeyDown={handleKeyDown}
          />
          {usernameError && (
            <p className="text-red-500 w-96 break-words">{usernameError}</p>
          )}
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
          <div className="flex border-2 mb-2 p-2 bg-white focus-within:border-black rounded">
            <input
              className="flex-grow outline-none"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => {
                const newPassword = e.target.value;
                setPassword(newPassword);
                setPasswordError(validatePassword(newPassword));
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
              !!usernameError ||
              !!passwordError ||
              !!emailError ||
              !username ||
              !password ||
              !email ||
              isSuccessful ||
              isLoading
                ? "bg-gray-500"
                : "bg-blue-500"
            } text-white`}
            type="submit"
            disabled={
              !!usernameError ||
              !!passwordError ||
              !!emailError ||
              !username ||
              !password ||
              !email ||
              isSuccessful ||
              isLoading
            }
          >
            {isLoading ? "Loading..." : "Sign Up"}
          </button>
        </form>
        <p className="mt-5 text-center">
          Already a member?{" "}
          <a href="/login" className="text-blue-500">
            Log in
          </a>
        </p>
      </div>
      {isSuccessful && (
        <div className="text-xl w-96 mt-10">
          Login Successful. Verify your email. Go to your inbox.
        </div>
      )}
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

export default SignupPage;
