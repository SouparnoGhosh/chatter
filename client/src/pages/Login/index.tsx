import React, { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { FiEye, FiEyeOff } from "react-icons/fi";
import {
  validateUsername,
  validatePassword,
  handleKeyDown,
} from "@/utils/utils";
import DialogBox from "@/components/DialogBox";
import { useSession } from "../../hooks/useSession";

interface ErrorResponse {
  error: string;
}

const LoginPage: React.FC = () => {
  /* All state variables */
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { setSession } = useSession();

  useEffect(() => {
    if (dialogOpen === false && shouldRedirect === true) {
      setSession(true);
    }
  }, [dialogOpen, setSession, shouldRedirect]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const usernameError = validateUsername(username);
    const passwordError = validatePassword(password);

    setUsernameError(usernameError);
    setPasswordError(passwordError);

    if (usernameError || passwordError) {
      return;
    }

    setIsLoading(true);

    try {
      /* Make a POST request to the /login endpoint with the username and password */
      const response = await axios.post(
        "http://localhost:3200/login",
        {
          username,
          password,
        },
        {
          timeout: 5000 /* Timeout after 5 seconds */,
        }
      );

      /* If the request is successful, the response will be a JSON object with a "token" property */
      console.log(response.data);

      /* Store the JWT token in local storage */
      localStorage.setItem("token", response.data.token);

      /* Show a dialog box stating "You are successfully logged in" */
      setDialogMessage("You are successfully logged in");
      setIsError(false);
      setDialogOpen(true);

      /* Set shouldRedirect to true */
      setShouldRedirect(true);
    } catch (error) {
      const axiosError = error as AxiosError;

      /* Check if the error was caused by a timeout */
      if (axiosError.code === "ECONNABORTED") {
        setDialogMessage("Request timed out. Please try again.");
        setIsError(true);
        setDialogOpen(true);
      } else if (axiosError.response) {
        const errorData = axiosError.response.data as ErrorResponse;
        if (errorData && errorData.error) {
          console.error(axiosError.response.data);
          setDialogMessage(errorData.error);
          setIsError(true);
        } else {
          setDialogMessage("Unexpected server response. Please try again.");
          setIsError(true);
        }
        setDialogOpen(true);
      }
      setIsLoading(false);
    }
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setDialogMessage("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-5">Welcome back!</h1>
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
              !!usernameError ||
              !!passwordError ||
              !username ||
              !password ||
              isLoading
                ? "bg-gray-500"
                : "bg-blue-500"
            } text-white`}
            type="submit"
            disabled={
              !!usernameError ||
              !!passwordError ||
              !username ||
              !password ||
              isLoading
            }
          >
            {isLoading ? "Loading..." : "Log in"}
          </button>
        </form>
        <div className="flex flex-col items-center justify-center mt-5">
          <a href="/forgot-password" className="text-blue-500 mt-2">
            Forgot password?
          </a>
          <div className="mt-1">
            New here?{" "}
            <a href="/signup" className="text-blue-500 ml-1">
              Sign up
            </a>
          </div>
        </div>
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

export default LoginPage;
