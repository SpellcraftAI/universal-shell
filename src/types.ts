export type { SpawnOptions } from "child_process";
export interface SpawnResult {
  code: number | null;
  stdout: string;
  stderr: string;
}

export type Platform = "posix" | NodeJS.Process["platform"];

export type PlatformCommand = {
  [platform in Platform]?: string;
};

export type ShellCommand = string | PlatformCommand;

export type CommandTranslation = {
  [platform in NodeJS.Process["platform"]]?: (args: string[]) => string;
};

export interface CommandTranslations {
  [cmd: string]: CommandTranslation;
}
export interface SpawnCmdArgs {
  cmd: string;
  args: string[];
}

export type ShellTranslations = {
  [platform in NodeJS.Process["platform"]]?: (commandString: string) => SpawnCmdArgs;
};