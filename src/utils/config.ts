export enum ConfigKey {
  Bands = 'BANDS',
}

interface ConfigSchema {
  [ConfigKey.Bands]: number;
}

const ConfigDefaults: Readonly<ConfigSchema> = {
  [ConfigKey.Bands]: 3,
};

export class Config {
  public get<T extends ConfigKey>(key: T): ConfigSchema[T] {
    try {
      const jsonValue = localStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : ConfigDefaults[key];
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return ConfigDefaults[key];
    }
  }

  public set<T extends ConfigKey>(key: T, value: ConfigSchema[T]): void {
    try {
      const jsonValue = JSON.stringify(value);
      localStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error);
    }
  }

  public clear(): void {
    localStorage.clear();
  }
}
