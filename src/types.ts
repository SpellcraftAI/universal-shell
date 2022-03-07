import type { ChildProcess, SpawnOptions } from "child_process";

export interface SpawnResult {
  code: number | null;
  stdout: string;
  stderr: string;
}

export interface CreateShellOptions extends SpawnOptions {
  /**
   * Whether to log the command to the console.
   */
  log?: boolean;
}

export type Platform = "posix" | NodeJS.Process["platform"];

export type PlatformCommand = {
  [platform in Platform]?: string;
};

export type ShellCommand = string | PlatformCommand;

export interface Shell {
  run(command: ShellCommand): Promise<SpawnResult>;
  kill(): boolean;
  childProcess: ChildProcess | null;
}

export type { SpawnOptions } from "child_process";

export type OriginalCommand = string;
export type TranslatedCommand = string;

export type CommandTranslation = {
  [platform in NodeJS.Process["platform"]]?: TranslatedCommand;
};

export interface CommandTranslations {
  [cmd: OriginalCommand]: CommandTranslation;
}