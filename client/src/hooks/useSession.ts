import { useContext } from 'react';
import { SessionContext } from '@/context/SessionContext/SessionContext';

export const useSession = () => {
  return useContext(SessionContext);
};