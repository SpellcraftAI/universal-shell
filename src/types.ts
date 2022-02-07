import type { ChildProcess, SpawnOptions } from "child_process";

export interface SpawnResult {
  code: number | null;
  stdout: string;
  stderr: string;
}

export interface CreateShellOptions {
  log: boolean;
  spawnOptions: SpawnOptions;
}

export interface Shell {
  run(commandString: string): Promise<SpawnResult>;
  kill(): boolean;
  childProcess: ChildProcess | null;
}

export type { SpawnOptions } from "child_process";