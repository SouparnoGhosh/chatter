import { jwtDecode } from "jwt-decode";

export const size = 32;

export const validateUsername = (username: string) => {
  const usernameRegex = /^[a-zA-Z0-9]{8,20}$/;

  if (!usernameRegex.test(username)) {
    return "Username must be 8-20 characters long and contain no spaces and symbols.";
  }

  return "";
};

export const validatePassword = (password: string) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])\S{8,}$/;

  if (!passwordRegex.test(password)) {
    return "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one symbol and no spaces.";
  }

  return "";
};

export const validateChannelName = (channelName: string): string | null => {
  if (!channelName) {
    return "Channel name is required";
  }

  if (channelName.length < 3) {
    return "Channel name must be at least 3 characters long";
  }

  if (channelName.length > 50) {
    return "Channel name must not exceed 50 characters";
  }

  if (!/^[a-zA-Z0-9-_]+$/.test(channelName)) {
    return "Channel name can only contain alphanumeric characters, hyphens, and underscores";
  }

  return null;
};

export const validateEmail = (email: string) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email)) {
    return "Please enter a valid email address.";
  }

  return "";
};

export const handleKeyDown = (event: React.KeyboardEvent) => {
  if (event.key === "Enter") {
    event.preventDefault();
  }
};

interface CustomJwtPayload {
  userId: string;
  username: string;
  exp: number;
}

export const decodeToken = (): CustomJwtPayload | null => {
  const token = localStorage.getItem("token");
  if (token) {
    return jwtDecode<CustomJwtPayload>(token);
  }
  return null;
};
