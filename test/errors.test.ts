import { URL, fileURLToPath } from "url";
import { createShell } from "../src";
import test from "ava";

// @ts-ignore - Fix later
const subprocessFile = new URL("./subprocess.js", import.meta.url);
const subprocessPath = fileURLToPath(subprocessFile);

const SLEEP = "node -e 'while(true){}'";

test.serial("should not throw for exit code 0", async (t) => {
  const shell = createShell();
  try {
    await shell.run("exit 0");
  } catch (e) {
    return t.fail();
  }
  t.pass();
});

test.serial("should not throw for exit code 1 on non-Windows", async (t) => {
  const shell = createShell();

  if (process.platform !== "win32") {
    try {
      await shell.run("exit 1");
      t.pass();
    } catch (e) {
      return t.fail();
    }
  } else {
    t.pass();
  }
});

test.serial("should throw for exit code 1 on Windows", async(t) => {
  const shell = createShell();

  if (process.platform === "win32") {
    try {
      await shell.run("exit 1");
      t.fail();
    } catch (e) {
      t.pass();
    }
  } else {
    t.pass();
  }
});

test.serial("should throw for other exit codes", async (t) => {
  const shell = createShell();
  try {
    await shell.run("exit 2");
  } catch (e) {
    return t.pass();
  }

  t.fail();
});

test.serial("killShell() should cause promise to resolve", async (t) => {
  t.timeout(2000);
  const shell = createShell();

  await Promise.allSettled([
    shell.run(SLEEP),
    new Promise(
      (resolve) => {
        setTimeout(
          () => {
            const killed = shell.kill();
            resolve(killed);
          },
          1000
        );
      }),
  ]);

  t.pass();
});

test.serial("killShell() should kill subprocesses", async (t) => {
  t.timeout(2000);
  const shell = createShell();

  await Promise.allSettled([
    shell.run(`${SLEEP} & ${SLEEP} & node ${subprocessPath}`),
    new Promise(
      (resolve) => {
        setTimeout(
          () => {
            const killed = shell.kill();
            resolve(killed);
          },
          1000
        );
      }),
  ]);

  t.pass();
});