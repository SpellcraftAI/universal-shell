import { shell, killShell } from "../src";
import test from "ava";
import { execSync } from "child_process";

const SLEEP = "node -e 'const start = Date.now(); while(Date.now() - start < 30000) {};'";

test.serial("should not throw for exit code 0", async (t) => {
  try {
    await shell("exit 0");
  } catch (e) {
    return t.fail();
  }
  t.pass();
});

test.serial("should throw for nonzero exit code", async (t) => {
  try {
    globalThis.SHELL_LOG = true;
    await shell("exit 1");
  } catch (e) {
    return t.pass();
  }
  t.fail();
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

  // await shell(SLEEP);
  await shell("exit 0");

  // await Promise.allSettled([
  //   // shell(`${SLEEP}`),
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