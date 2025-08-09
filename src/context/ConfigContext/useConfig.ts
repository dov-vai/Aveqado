import { createContext, useContext } from 'react';
import { Config } from '../../utils/config';

export const ConfigContext = createContext<Config | null>(null);

export function useConfig() {
  const config = useContext(ConfigContext);
  if (!config) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return config;
}
