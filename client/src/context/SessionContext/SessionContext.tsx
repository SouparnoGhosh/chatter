/* eslint-disable */
import React from "react";

export const SessionContext = React.createContext({
  session: false,
  // @ts-ignore
  setSession: (session: boolean) => {},
});
