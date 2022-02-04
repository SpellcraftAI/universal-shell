import { spawnSync } from "child_process";

spawnSync(
  "node",
  ["-e", "'while(true){}'"],
  {
    shell: true,
    detached: false,
    env: process.env,
  }
);