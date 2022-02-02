import { shell } from "../src";
import test from "ava";

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
    await shell("echo test", "exit 1");
  } catch (e) {
    return t.pass();
  }
  t.fail();
});

test.serial("should throw on process failure", async (t) => {
  try {
    await import("../example/nodeFailure.js");
  } catch (e) {
    return t.pass();
  }
  t.fail();
});
