import type  { ChildProcess, SpawnOptions } from "child_process";
import { spawn, execSync } from "child_process";

const WINDOWS = process.platform === "win32";

const DEFAULT_OPTIONS: SpawnOptions = {
  stdio: "inherit",
  shell: true,
  detached: !WINDOWS,
};

interface SpawnResult {
  code: number | null;
  stdout: string;
  stderr: string;
}

export const createShell = (options = DEFAULT_OPTIONS) => {
  let childProcess: ChildProcess | undefined;

  return {
    async run(commandString: string) {
      if (childProcess) {
        throw new Error("Only one command per shell.");
      }

      let cmd: string;
      let args: string[];

      switch (process.platform) {
        case "win32":
          cmd = "cmd.exe";
          args = ["/d", "/s", "/c", JSON.stringify(commandString)];
          break;

        default:
          const cmdParts = commandString.split(" ");
          cmd = cmdParts[0];
          args = cmdParts.slice(1);
          break;
      }

      childProcess = spawn(cmd, args, options);

      return await new Promise<SpawnResult>(
        (resolve, reject) => {
          let stdout = "";
          let stderr = "";

          if (!childProcess) {
            throw new Error("Child process was not set.");
          }

          childProcess.stdout?.on("data", (data) => stdout += data);
          childProcess.stderr?.on("data", (data) => stderr += data);

          childProcess.on("close", (code) => {
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
          });
        }
      );
    },

    kill(signal = "SIGKILL") {
      if (childProcess?.pid) {
        if (WINDOWS) {
          execSync(`taskkill /pid ${childProcess.pid} /t /f`);
          return true;
        } else {
          return process.kill(-childProcess.pid, signal);
        }
      }

      return false;
    }
  };
};