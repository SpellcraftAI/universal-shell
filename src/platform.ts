import { CommandTranslations, ShellTranslations } from "./types";

export const shellTranslations: ShellTranslations = {
  "win32": (commandString: string) => ({
    cmd: "cmd.exe",
    args: ["/d", "/s", "/c", commandString]
  }),
};

export const commandTranslations: CommandTranslations = {
  "cp -rf": {
    "win32": (args) => {
      console.log({ args });
      const cmd = "xcopy /E /S /G /Q /Y";
      /**
       * Ensure dirs have trailing slashes.
       */
      const argsWithTrailingSlashes = args.map(
        (arg) => arg.endsWith("\\") ? arg : `${arg}\\`
      );

      /**
       * xcopy handles folder contents, so drop trailing asterisk.
       */
      const argsWithoutAsterisk = argsWithTrailingSlashes.map(
        (arg) => arg.replace(/\*\\$/, "")
      );

      return `${cmd} ${argsWithoutAsterisk.join(" ")}`;
    },
  },
  "ln": {
    "win32": (args) => `mklink /D ${args.join(" ")}`,
  },
  "pkill": {
    "win32": (args) => `taskkill /T /F /pid ${args.join(" ")}`,
  },
};

export const translateForPlatform = (
  commandString: string,
  customShellTranslations: ShellTranslations,
  customCommandTranslations: CommandTranslations,
) => {
  const activeShellTranslations = {
    ...shellTranslations,
    ...customShellTranslations
  };

  const activeCommandTranslations = {
    ...commandTranslations,
    ...customCommandTranslations
  };

  const translateShell = (commandString: string) => {
    const platform = process.platform;
    const translation = activeShellTranslations[platform];

    if (translation) {
      return translation(commandString);
    }

    const [cmd, ...args] = commandString.split(" ");
    return { cmd, args };
  };

  const translateCommand = (commandString: string) => {
    const activeTargets = Object.entries(activeCommandTranslations);
    for (const [command, translations] of activeTargets) {
      if (commandString.startsWith(command)) {
        const platform = process.platform;
        const translate = translations[platform];

        if (!translate) {
          break;
        }

        const args = commandString.slice(command.length).trim().split(" ");
        return translate(args);
      }
    }

    return commandString;
  };

  const translatedCommand = translateCommand(commandString);
  const translatedShell = translateShell(translatedCommand);

  return translatedShell;
};