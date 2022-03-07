export const shellTranslations: ShellTranslations = {
  "win32": (commandString: string) => ({
    cmd: "cmd.exe",
    args: ["/d", "/s", "/c", commandString]
  }),
};

export const commandTranslations: CommandTranslations = {
  "cp -rf": {
    "win32": "xcopy /E /S /G /Q /Y"
  },
  "ln": {
    "win32": "mklink"
  },
  "pkill": {
    "win32": "taskkill /T /F /pid"
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
        const translation = translations[platform];

        if (!translation) {
          break;
        }

        return `${translation} ${commandString.slice(command.length)}`;
      }
    }

    return commandString;
  };

  const translatedCommand = translateCommand(commandString);
  const translatedShell = translateShell(translatedCommand);

  return translatedShell;
};

export type CommandTranslation = {
  [platform in NodeJS.Process["platform"]]?: string;
};

export interface CommandTranslations {
  [cmd: string]: CommandTranslation;
}
export interface SpawnCmdArgs {
  cmd: string;
  args: string[];
}

export type ShellTranslations = {
  [platform in NodeJS.Process["platform"]]?: (commandString: string) => SpawnCmdArgs;
};