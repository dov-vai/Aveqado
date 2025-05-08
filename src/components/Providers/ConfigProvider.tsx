import {Config} from "../../utils/config.ts";
import {createContext, ReactNode, useContext} from "react";

const ConfigContext = createContext<Config | null>(null);

export function ConfigProvider({ config, children }: { config: Config, children: ReactNode }) {
    return (
        <ConfigContext.Provider value={config}>
            {children}
        </ConfigContext.Provider>
    );
}

export function useConfig() {
    const config = useContext(ConfigContext);
    if (!config) {
        throw new Error('useConfig must be used within a ConfigProvider');
    }
    return config;
}