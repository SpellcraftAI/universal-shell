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