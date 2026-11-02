# Safe first test — foundation only

**This will not start a door game or open a listening port.**

1. Use a test computer, not your live BBS host, for your first attempt.
2. Install a compatible Node.js runtime from https://nodejs.org/ and verify `node --version` and `npm --version` in a terminal.
3. Download/extract the project as described in [GitHub basics](github-basics.md).
4. Open a terminal in the project folder (the one containing `package.json`).
5. Run:

```text
npm test
npm start
```

`npm test` runs the session-management unit tests. `npm start` loads a disabled example game catalog and prints a message; it **does not** listen on TCP 5000, generate dropfiles, or execute DOS programs.

**Important for 32-bit Windows:** The project has **not yet verified a supported Node.js runtime on the planned Windows 10 32-bit VM**. Do not assume the newest Node.js version is available for that system. The eventual Windows installation guide will specify a tested runtime or packaged executable.

**Linux:** DOSEMU2 compatibility and terminal/FOSSIL bridging have not yet been tested. Do not install a DOS emulator just to run these foundation tests.
