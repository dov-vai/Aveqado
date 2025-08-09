import { ConfigContext } from './useConfig.ts';
import { Config } from '../../utils/config.ts';
import { ReactNode } from 'react';

export function ConfigProvider({
  config,
  children,
}: {
  config: Config;
  children: ReactNode;
}) {
  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
}
