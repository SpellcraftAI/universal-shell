import { shell } from "../src";
import test from "ava";

test("should not throw for exit code 0", async (t) => {
  try {
    await shell(`
      exit 0
    `);
  } catch (e) {
    return t.fail();
  }
  t.pass();
});

test("should throw for nonzero exit code", async (t) => {
  try {
    globalThis.SHELL_LOG = true;
    await shell("echo test", "exit 1");
  } catch (e) {
    return t.pass();
  }
  t.fail();
});

test("should throw on process failure", async (t) => {
  try {
    await shell("tsm ./example/nodeFailure.ts");
  } catch (e) {
    return t.pass();
  }
  t.fail();
});
