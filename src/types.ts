import { ChildProcess } from "child_process";
import { SpawnOptions } from ".";

export type { SpawnOptions } from "child_process";
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
  /**
   * Whether to suppress non-error output.
   */
  silent?: boolean;

  shellTranslations?: ShellTranslations;
  commandTranslations?: CommandTranslations;
}

export interface Shell {
  run(command: ShellCommand): Promise<SpawnResult>;
  kill(): boolean;
  childProcess: ChildProcess | null;
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