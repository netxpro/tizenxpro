// types/settings.ts

export const settingOptions = [
  {
    value: "straight",
    label: "Straight",
    icon: "♀️‍♂️", 
  },
  {
    value: "gay",
    label: "Gay",
    icon: "♂️♂️", 
  },
  {
    value: "shemale",
    label: "Transgender",
    icon: "⚧️",
  },
] as const;

export type Setting = typeof settingOptions[number]["value"];

export interface SettingsOption {
  value: Setting;
  label: string;
  icon: string;
}

export interface Platform {
  id: string;
  label: string;
  comment?: string;
}

export interface SettingsProps {
  setting: Setting;
  setSetting: (value: Setting) => void;
  platform: Platform["id"];
  setPlatform: (value: Platform["id"]) => void;
}
