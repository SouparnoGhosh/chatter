// contexts/ChannelInfoReloadProvider.tsx
import React, { useState } from "react";
import { ChannelInfoReloadContext } from "./ChannelInfoReloadContext";

interface ChannelInfoReloadProviderProps {
  children: React.ReactNode;
}

export const ChannelInfoReloadProvider: React.FC<
  ChannelInfoReloadProviderProps
> = ({ children }) => {
  const [reloadChannelInfo, setReloadChannelInfo] = useState<boolean>(false);

  return (
    <ChannelInfoReloadContext.Provider
      value={{ reloadChannelInfo, setReloadChannelInfo }}
    >
      {children}
    </ChannelInfoReloadContext.Provider>
  );
};
