# TODOs

- [x] Remove Tauri. Use [electron.js](https://www.electronjs.org/) for cross-platform consistency.

- [x] Fix order of backend setup. The backend should perform checks in the following order:

  - Embedded python files
  - Python environment setup

  All checks are to be performed on the first startup of the app only.

- [x] Implement Windows python backend setup using [Windows Embeddable python package](https://www.python.org/ftp/python/3.11.9/python-3.11.9-embed-amd64.zip) and [get-pip.py](https://github.com/pypa/get-pip)

  - Command for downloading get-pip.py

  ```bash
  $ curl -sSL https://bootstrap.pypa.io/get-pip.py -o get-pip.py
  ```

- [ ] Change the [`setup/setup.js`](setup/setup.js) to use Electron build location.

- [ ] The Miniforge install on Linux creates a `.conda/condarc` file in `$HOME` directory which could interfare with user's conda environments. Change the Miniforge config so it creates the `.conda/condarc` file in the installation directory only.

- [ ] To make sure all files of embedded python binary are successfully downloaded, compare their hashes too.

- [ ] Move the python version, download links, etc to a separate config file.

- [ ] Set an electron persistent variable using [Electron-store](https://github.com/sindresorhus/electron-store) to avoid recreation of backend environment.

- [ ] Implement a function that selectively installs only the missing python dependencies

- [ ] Backend uvicorn server uses `quit()` function to stop. Find and use some other way

- [x] Make textContent and displayContent separate fields textContent will contain the text content of the document displayContent will contain the content of the document in HTML format. This will allow the user to view the document in as html and also allow for better search indexing by the model.

- [x] Replace TipTap with [ByteMD](https://github.com/bytedance/bytemd) or [codemirror](https://codemirror.net) (Preferably) -- Replaced with [remark](https://github.com/remarkjs/remark)

- [ ] Implement server status bar on the frontend.

- [ ] Since supporting markdown and HTML with same source simultaneously is a hassle, separate them and make a new field which represents which kind of data the text represents. (can call the field mime, then maybe support multiple formats in the future) And now, content is split into 2 fields:

  - Plaintext (Required) : Textual representation of whatever is in the document.
  - DisplayText (Optional) : Textual representation of display code. Takes value of `Plaintext` if null
  - MimeType (Required) [Only supports markdown and html for now] : Type of the document. This will be used to call the appropriate display function for the DisplayText

- [ ] Implement editing text using buttons (like Bold, Italic, etc) in the editor

- [ ] Enable keybind support
