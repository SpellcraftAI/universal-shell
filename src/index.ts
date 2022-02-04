/* eslint-disable no-console */
/**
 * @license MIT
 */

import chalk from "chalk";

import { SpawnOptions } from "child_process";
import { spawn } from "child_process";

const WINDOWS = process.platform === "win32";
const DEFAULTS: SpawnOptions = {
  shell: true,
  stdio: "inherit",
  detached: !WINDOWS,
  env: process.env,
};

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace global {
  const SHELL_LOG: boolean | undefined;
  const SHELL_STRICT: boolean | undefined;
  const SHELL_OPTIONS: SpawnOptions | undefined;
}

import type * as child_process from "child_process";
let childProcess: ReturnType<typeof child_process.spawn> | undefined;

const WINDOWS_CMDS: Record<string, string> = {
  yarn: "yarn.cmd",
};

/**
 * Execute a sequence of shell commands.
 *
 * @param {...string} cmds
 * The commands to run in sequential order, i.e. `shell('echo hello world',
 * 'echo 42')`.
 *
 * @return {Promise}
 * A Promise that will resolve when call is finished, or reject on error.
 */
export const shell = async (...cmds: string[]) => {
  for (let cmd of cmds) {
    /**
     * Trim unnecessary whitespace for convenience.
     */
    cmd = cmd.trim();

    /**
     * Allow multiline commands:
     *
     * await shell(`
        google-closure-compiler
          -O ADVANCED
          --jscomp_off='*'
          --js ./testcl.js
      `);
     *
     * ->
     *
     * google-closure-compiler \
        -O ADVANCED \
        --jscomp_off='*' \
        --js ./testcl.js
     */
    const lines = cmd.split("\n");
    if (lines.length > 1) {
      cmd = lines.map(
        (line, i) => !/\\\s*?$/m.test(line) && i < lines.length - 1
          ? line + " \\"
          : line,
      ).join("\n");
    }

    const commandParts = cmd.split(" ");

    await new Promise((resolve, reject) => {
      let thisCmd = commandParts.shift() ?? "";
      const args = commandParts;

      if (process.platform === "win32" && thisCmd in WINDOWS_CMDS) {
        thisCmd = WINDOWS_CMDS[thisCmd];
      }

      if (thisCmd.trim() !== "echo" && global.SHELL_LOG) {
        console.log(chalk.grey(`\n> ${thisCmd} ${args.join(" ")}\n`));
      }

      childProcess =
        spawn(
          thisCmd,
          args,
          global.SHELL_OPTIONS || DEFAULTS
        ).on(
          "exit",
          (code) => {
            childProcess = undefined;
            if (code === 0) resolve(0);
            else {
              if (global.SHELL_STRICT) {
                process.exit(1);
              } else {
                reject(new Error("Exited with code: " + code));
              }
            }
          },
        );
    });
  }
  /** Write newline to prevent visual clutter. */
  if (global.SHELL_LOG) console.log();
};

import { execSync } from "child_process";
export const killShell: child_process.ChildProcess["kill"] = (signal = "SIGKILL") => {
  if (childProcess?.pid) {
    if (WINDOWS) {
      execSync(`taskkill /pid ${childProcess.pid} /t /f`);
      return true;
    } else {
      return process.kill(-childProcess.pid, signal);
    }
  }

  return false;
};