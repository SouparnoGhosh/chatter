// contexts/ChannelInfoReloadContext.tsx
import React from 'react';

interface ChannelInfoReloadContextProps {
  reloadChannelInfo: boolean;
  setReloadChannelInfo: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ChannelInfoReloadContext = React.createContext<ChannelInfoReloadContextProps>({
  reloadChannelInfo: false,
  setReloadChannelInfo: () => {}, // empty function
});