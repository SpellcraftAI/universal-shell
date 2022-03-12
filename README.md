# `await-shell`

Library for calling POSIX-style shell commands cross-platform. Automatically
translates commands for Windows support out of the box.

`shell.run()` returns a Promise that will resolve or reject to an object
containing process information of type `SpawnResult`:

```ts
export interface SpawnResult {
  code: number | null;
  stdout: string;
  stderr: string;
}
```

### Pattern

```ts
/**
 * Create a new process where shells will run.
 */
const shell = createShell();

/**
 * Read the exit code, stdout, and stderr from shell.run().
 * 
 * Note: POSIX-like syntax works on Windows! See "Specification" below.
 */
const { code, stdout, stderr } = await shell.run("cp -rf src dest && yarn --cwd dest some-command");

/**
 * Run sequential commands.
 */
await shell.run(
  "cd dir && yarn do_stuff",
  "cd otherDir && yarn do_stuff"
);
```

#### Override per-platform

You can override the command to run per-platform in `shell.run(...)`.

```ts
const shell = createShell();

/**
 * All process.platform types are supported, i.e. "win32" and "darwin".
 * 
 * "posix" matches "linux" and "darwin".
 */ 
const { code, stdout, stderr } = await shell.run({
  win32: "...",
  posix: "..."
});
```

#### Custom options

You can pass custom spawn options to `createShell({ ... })`.

```ts
/**
 * Disable logging of commands and pass custom spawn options. 
 */
const customShell = createShell({
  log: false,
  // Custom process.spawn() options.
  stdio: 'inherit',
  // ...
});
```

## Specification

This section explains how shell command strings (like `"cd dir/"`) are
supported on Windows, as well as translations for specific commands.

### Shell support

| POSIX | Windows |
| --- | --- |
| *Detached* | *Not detached* |
| `my-cmd [...args]` | `cmd.exe /d /s /c my-cmd [...args]` |

### Specific commands

| POSIX | Windows |
| --- | --- |
| `cp -rf [src] dest]` | `xcopy /E /S /G /Q /Y [src] [dest]` |
| `pkill [pid]` | `taskkill /T /F /pid [pid]` |
| `ln [link] [target]` | `mklink [link] [target]` |

## Footnotes

#### Quotes on Windows

You should use single quotes in your strings if possible for interoperability
with Windows.

```ts
const { code, stdout, stderr } = await shell.run("my-cmd 'a string'");
```