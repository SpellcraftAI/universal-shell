import type { ChildProcess, SpawnOptions } from "child_process";
import { spawn, execSync } from "child_process";
import chalk from "chalk";

interface SpawnResult {
  code: number | null;
  stdout: string;
  stderr: string;
}

interface CreateShellOptions {
  log: boolean;
  spawnOptions: SpawnOptions;
}

const WINDOWS = process.platform === "win32";

const DEFAULT_SPAWN_OPTIONS: SpawnOptions = {
  stdio: "inherit",
  shell: true,
  detached: !WINDOWS,
  env: process.env,
};

const DEFAULT_SHELL_OPTIONS: CreateShellOptions = {
  log: true,
  spawnOptions: DEFAULT_SPAWN_OPTIONS,
};

interface Shell {
  run(commandString: string): Promise<SpawnResult>;
  kill(): boolean;
  childProcess: ChildProcess | null;
}

export const createShell = ({
  log,
  spawnOptions,
} = DEFAULT_SHELL_OPTIONS): Shell => {
  return {
    childProcess: null,
    async run(commandString) {
      /**
       * Replace single-quotes with double quotes on Windows.
       */
      // if (WINDOWS) {
      //   commandString = commandString.replaceAll("'", "\"");
      // }

      if (this.childProcess) {
        throw new Error("Only one command per shell.");
      }

      let cmd: string;
      let args: string[];

      switch (process.platform) {
        case "win32":
          cmd = "cmd.exe";
          args = ["/d", "/s", "/c", commandString];
          break;

        default:
          const cmdParts = commandString.split(" ");
          cmd = cmdParts[0];
          args = cmdParts.slice(1);
          break;
      }

      if (log) {
        // eslint-disable-next-line no-console
        console.log(chalk.gray(`> ${commandString}`));
      }

      return await new Promise<SpawnResult>(
        (resolve, reject) => {
          this.childProcess = spawn(cmd, args, spawnOptions);
          let stdout = "";
          let stderr = "";

          if (!this.childProcess) {
            throw new Error("Child process was not set.");
          }

          this.childProcess.stdout?.on("data", (data) => stdout += data);
          this.childProcess.stderr?.on("data", (data) => stderr += data);

          const resolveResult = (code: number) => {
            const spawnResult = {
              code,
              stdout,
              stderr,
            };

            if (code === 0) {
              resolve(spawnResult);
            } else if (code === 1 && !WINDOWS) {
              resolve(spawnResult);
            } else {
              reject(spawnResult);
            }
          };

          this.childProcess.on("close", resolveResult);
          this.childProcess.on("exit", resolveResult);
        }
      );
    },

    kill(signal = "SIGKILL") {
      if (this.childProcess?.pid) {
        if (WINDOWS) {
          execSync(`taskkill /pid ${this.childProcess.pid} /t /f`);
          return true;
        } else {
          return process.kill(-this.childProcess.pid, signal);
        }
      }

      return false;
    }
  };
};