import { URL, fileURLToPath } from "url";
import { shell, killShell } from "../src";
import test from "ava";

// @ts-ignore - Fix later
const subprocessFile = new URL("./subprocess.js", import.meta.url);
const subprocessPath = fileURLToPath(subprocessFile);

const SLEEP = "node -e 'while(true){}'";

test.serial("should not throw for exit code 0", async (t) => {
  try {
    await shell("exit 0");
  } catch (e) {
    return t.fail();
  }
  t.pass();
});

test.serial("should throw for other exit codes", async (t) => {
  try {
    globalThis.SHELL_LOG = true;
    await shell("exit 1", "exit 2");
  } catch (e) {
    return t.pass();
  }
  t.fail();
});

test.serial("killShell() should cause promise to resolve", async (t) => {
  t.timeout(10_000);

  await Promise.allSettled([
    shell(SLEEP),
    new Promise(
      (resolve) => {
        setTimeout(
          () => {
            const killed = killShell();
            resolve(killed);
          },
          5000
        );
      }),
  ]);

  t.pass();
});

test.serial("killShell() should kill subprocesses", async (t) => {
  t.timeout(10_000);

  await Promise.allSettled([
    shell(`${SLEEP} & ${SLEEP} & node ${subprocessPath}`),
    new Promise(
      (resolve) => {
        setTimeout(
          () => {
            const killed = killShell();
            resolve(killed);
          },
          5000
        );
      }),
  ]);

  t.pass();
});