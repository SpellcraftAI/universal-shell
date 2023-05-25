import { URL, fileURLToPath } from "url";
import { Platform } from "../src/types";
import { createShell } from "../src";
import test from "ava";

// @ts-ignore - Fix later
const subprocessFile = new URL("./subprocess.js", import.meta.url);
const subprocessPath = fileURLToPath(subprocessFile);

const WINDOWS = process.platform === "win32";
const SLEEP = "node -e \"while(true){}\"";

test("should not throw for exit code 0", async (t) => {
  const shell = createShell();
  try {
    await shell.run("exit 0");
  } catch (e) {
    return t.fail();
  }
  t.pass();
});

test("should not throw for exit code 1 on non-Windows", async (t) => {
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

test("should throw for exit code 1 on Windows", async(t) => {
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

test("should throw for other exit codes", async (t) => {
  const shell = createShell();
  try {
    await shell.run("exit 2");
  } catch (e) {
    return t.pass();
  }

  t.fail();
});

test("exit codes should match", async (t) => {
  const shell = createShell();

  const exit0 = await shell.run("exit 0");
  t.is(exit0.code, 0);

  try {
    await shell.run("exit 1");
  } catch (e) {
    t.is(e.code, 1);
  }

  try {
    await shell.run("exit 2");
  } catch (e) {
    t.is(e.code, 2);
  }

  try {
    await shell.run("exit 25");
  } catch (e) {
    t.is(e.code, 25);
  }
});

test("should support concurrent shells", async (t) => {
  const [sh1, sh2] = [createShell(), createShell()];
  const [exit0, exit1] = await Promise.allSettled([
    sh1.run("exit 0"),
    sh2.run("exit 1"),
  ]);

  t.is(exit0.status, "fulfilled");
  t.is(exit1.status, WINDOWS ? "rejected" : "fulfilled");

  if (exit0.status === "fulfilled") {
    t.is(exit0.value.code, 0);
  } else {
    t.fail();
  }

  if (exit1.status === "fulfilled") {
    if (WINDOWS) {
      t.fail();
    }

    t.is(exit1.value.code, 1);
  }
});

test.serial("should return proper { code, stdin, stderr } values", async (t) => {
  const shell = createShell();
  const { code, stdout, stderr } = await shell.run("echo hello world");

  t.is(code, 0);
  t.is(stdout, `hello world`);
  t.is(stderr, "");
});

interface PlatformTest {
  platform: NodeJS.Process["platform"];
  target: Platform;
}

test.serial("should support platform-specific overrides", async (t) => {
  if (process.platform === "win32") {
    return t.pass("Skipping on Windows.");
  }

  const oldProcess = process;
  const platformTests: PlatformTest[] = [
    {
      platform: "darwin",
      target: "darwin"
    },
    {
      platform: "linux",
      target: "posix"
    },
    {
      platform: "darwin",
      target: "posix"
    }
  ];

  for (const platformTest of platformTests) {
    const shell = createShell();
    const { platform, target } = platformTest;

    process = {
      ...oldProcess,
      platform,
    };

    const { stdout } = await shell.run({
      [target]: `echo 'hello ${platform}'`,
    });

    t.is(
      stdout,
      `hello ${platform}`,
      `should use ${platform} command for target ${target}`
    );
  }

  process = oldProcess;
});

test.serial("killShell() should cause promise to resolve", async (t) => {
  t.timeout(5000);
  const shell = createShell();

  await Promise.allSettled([
    shell.run(SLEEP),
    new Promise(
      (resolve) => {
        setTimeout(
          async () => {
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
  t.timeout(5000);
  const shell = createShell();

  await Promise.allSettled([
    shell.run(`${SLEEP} & ${SLEEP} & node ${subprocessPath}`),
    new Promise(
      (resolve) => {
        setTimeout(
          async () => {
            const killed = shell.kill();
            resolve(killed);
          },
          1000
        );
      }),
  ]);

  t.pass();
});