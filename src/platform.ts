import { CommandTranslations } from "./types";

export const platformTranslations: CommandTranslations = {
  "cp -rf": {
    "win32": "xcopy /E /S /G /Q /Y"
  },
  "cp": {
    "win32": "xcopy"
  },
  "ln": {
    "win32": "mklink"
  },
  "pkill": {
    "win32": "taskkill /T /F /pid"
  },
};

export const translateForPlatform = (commandString: string) => {
  let cmd: string;
  let args: string[];

  switch (process.platform) {
    case "win32":
      cmd = "cmd.exe";
      args = ["/d", "/s", "/c", commandString];
      break;

    default:
      const cmdParts = commandString.split(" ");
      cmd = cmdParts[0];
      args = cmdParts.slice(1);
      break;
  }

  return { cmd, args };
};