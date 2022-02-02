import ora from "ora";
import { shell } from "../src";

(async function() {
  let spinner = ora("Testing sleep delay...").start();
  await shell("sleep 1");
  spinner.succeed("All done!");

  spinner = ora("Testing stdin...").start();
  await shell(
    "sleep 1",
    "echo Message 1",
    "sleep 1",
    "echo Message 2"
  );
  spinner.stop();

  spinner = ora("Testing error...").start();
  try {
    await shell(
      "sleep 1",
      "exit 1",
    );
  } catch (e) {
    spinner.fail("Uh-oh, something went wrong!");
    await shell("sleep 1");
  }

  spinner = ora("Testing success...").start();
  await shell("sleep 1");
  spinner.succeed("Nothing broke!");
})();