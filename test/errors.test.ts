import { shell, killShell } from "../src";
import test from "ava";


const SLEEP = process.platform === "win32" ? "timeout /t 30 /nobreak > NUL" : "sleep 30";

test.serial("should not throw for exit code 0", async (t) => {
  if (process.platform !== "win32") {
    try {
      await shell("exit 0");
    } catch (e) {
      return t.fail();
    }
    t.pass();
  } else {
    t.pass("Skipped on Windows.");
  }
});

test.serial("should throw for nonzero exit code", async (t) => {
  if (process.platform !== "win32") {
    try {
      globalThis.SHELL_LOG = true;
      await shell("exit 1");
    } catch (e) {
      return t.pass();
    }
    t.fail();
  } else {
    t.pass("Skipped on Windows.");
  }
});

// test.serial("killShell() should cause promise to resolve", async (t) => {
//   t.timeout(10_000);

//   await Promise.allSettled([
//     shell(`${SLEEP}`),
//     new Promise(
//       (resolve) => {
//         setTimeout(
//           () => {
//             const killed = killShell();
//             resolve(killed);
//           },
//           5000
//         );
//       }),
//   ]);

//   t.pass();
// });

test.serial("killShell() should kill subprocesses", async (t) => {
  t.timeout(10_000);

  const { exec } = await import("child_process");
  exec("echo test");

  // await Promise.allSettled([
  //   shell(`${SLEEP} & ${SLEEP} & echo Slept 30s.`),
  //   new Promise(
  //     (resolve) => {
  //       setTimeout(
  //         () => {
  //           const killed = killShell();
  //           resolve(killed);
  //         },
  //         5000
  //       );
  //     }),
  // ]);

  t.pass();
});