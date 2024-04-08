# TODOs

1. ~~Remove Tauri. Use [electron.js](https://www.electronjs.org/) for cross-platform consistency.~~

1. Fix order of backend setup. The backend should perform checks in the following order:

   - Embedded python files
   - Python environment setup

   All checks are to be performed on the first startup of the app only.

1. Implement Windows python backend setup using [Windows Embeddable python package](https://www.python.org/ftp/python/3.11.9/python-3.11.9-embed-amd64.zip) and [get-pip.py](https://github.com/pypa/get-pip) -

   - Command for downloading get-pip.py

   ```bash
   $ curl -sSL https://bootstrap.pypa.io/get-pip.py -o get-pip.py
   ```

1. Change the [`setup/setup.js`](setup/setup.js) to use Electron build location.

1. The Miniforge install on Linux creates a `.conda/condarc` file in `$HOME` directory which could interfare with user's conda environments. Change the Miniforge config so it creates the `.conda/condarc` file in the installation directory only.

1. To make sure all files of embedded python binary are successfully downloaded, compare their hashes too.

1. Move the python version, download links, etc to a separate config file.

1. Set an electron persistent variable using [Electron-store](https://github.com/sindresorhus/electron-store) to avoid recreation of backend environment.

1. Implement a function that selectively installs only the missing python dependencies
