import { CreateShellOptions, Platform, Shell, SpawnOptions, SpawnResult } from "./types";
import { spawn, execSync, ChildProcess } from "child_process";
import chalk from "chalk";
import { translateForPlatform } from "./platform";

const POSIX = process.platform === "linux" || process.platform === "darwin";
const WINDOWS = process.platform === "win32";

const DEFAULT_SPAWN_OPTIONS: SpawnOptions = {
  stdio: "pipe",
  shell: true,
  detached: !WINDOWS,
  env: process.env,
};

const DEFAULT_SHELL_OPTIONS: CreateShellOptions = {
  log: true,
  ...DEFAULT_SPAWN_OPTIONS,
};

/**
 * Create a new shell.
 */
export const createShell = ({
  log,
  ...spawnOptions
} = DEFAULT_SHELL_OPTIONS): Shell => {
  let childProcess: ChildProcess | null = null;

  return {
    childProcess,
    async run(command) {
      if (childProcess) {
        throw new Error("Only one command per shell.");
      }

      if (typeof command === "object") {
        let platform: Platform = process.platform;

        if (command["posix"] && POSIX) {
          platform = "posix";
        }

        const platformCommand = command[platform];
        if (!platformCommand) {
          throw new Error(
            "No command found for platform: " + JSON.stringify({
              platform: process.platform,
              command,
            })
          );
        }

        command = platformCommand;
      }

      const { cmd, args } = translateForPlatform(command);
      if (log) {
        // eslint-disable-next-line no-console
        console.log(chalk.dim(`\n$ ${command}\n`));
      }

      return await new Promise<SpawnResult>(
        (resolve, reject) => {
          childProcess = spawn(cmd, args, spawnOptions);
          let stdout = "";
          let stderr = "";

          if (!childProcess) {
            throw new Error("Child process was not set.");
          }

          const resolveResult = (code: number) => {
            childProcess = null;
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

          childProcess.stdout?.on("data", (data: Buffer) => {
            stdout += data.toString();
          });

          childProcess.stderr?.on("data", (data: Buffer) => {
            stderr += data.toString();
          });

          childProcess.on("close", resolveResult);
          childProcess.on("exit", resolveResult);
          childProcess.on("error", resolveResult);

          /**
           * Emulate { stdio: "inherit" } behavior.
           */
          childProcess.stdout?.pipe(process.stdout);
          childProcess.stderr?.pipe(process.stderr);
        }
      );
    },

    kill(signal = "SIGKILL") {
      if (childProcess?.pid) {
        /**
         * In Windows, we need to hack in a small delay.
         */
        if (WINDOWS) {
          execSync(`taskkill /pid ${childProcess.pid} /t /f`);
        } else {
          return process.kill(
            -childProcess.pid,
            signal
          );
        }
      }

      return true;
    }
  };
};

export * from "./types";