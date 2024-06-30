import React, { useState, ReactNode } from "react";
import { SessionContext } from "./SessionContext";

interface SessionContextProviderProps {
  children: ReactNode;
}

const SessionContextProvider: React.FC<SessionContextProviderProps> = ({
  children,
}) => {
  const [session, setSession] = useState(!!localStorage.getItem("token"));

  return (
    <SessionContext.Provider value={{ session, setSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export default SessionContextProvider;
