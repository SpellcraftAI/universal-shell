import { spawn, execSync } from "child_process";

const childProcess = spawn("cmd.exe", [
  "/d",
  "/s",
  "/c",
  "node -e \"while(true){}\""
], {
  shell: true,
  stdio: "inherit"
});

console.log(childProcess.pid);
execSync(`taskkill /pid ${childProcess.pid} /t /f`);