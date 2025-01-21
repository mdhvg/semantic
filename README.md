# Semantic: A document management and querying system that uses Semantic Search

<p align="center">
<img width="60%" src="Documentation/Logo.png" style="filter:drop-shadow(0 0 7px rgb(24, 21, 48, 0.5))"/>

Semantic is made to end tab hoarding and efficiently search for documents and images _(planned to implement)_ when needed.

The approach is similar to [TagStudio](https://github.com/TagStudioDev/TagStudio) but also uses semantic search for querying.

> [!CAUTION]
> This is far from being a complete application. So far this is just a side project with lot of broken code.

## Contents

- [Development](#Development)
- [Todos](#Todos)

## Development

- Clone this repo and cd into it:

```bash
git clone https://github.com/mdhvg/semantic.git
cd semantic
```

- Install node modules:

```bash
npm i
```

- Create python environment (optional, but recommended) and install python depencencies:

```bash
cd backend
```

```bash
python -m venv .env
source ./.env/bin/activate
```

```bash
pip install -r ../resources/common/requirements.txt
```

- Run the client application in development mode:

```bash
npm run dev
```

- Start the python server (In a separate terminal after activating the environment):

```bash
cd backend
python main.py
```

## TODOs

- [x] Fix order of backend setup. The backend should perform checks in the following order:

  - Embedded python files
  - Python environment setup

  All checks are to be performed on the first startup of the app only.

- [x] Implement Windows python backend setup using [Windows Embeddable python package](https://www.python.org/ftp/python/3.11.9/python-3.11.9-embed-amd64.zip) and [get-pip.py](https://github.com/pypa/get-pip)

  - Command for downloading get-pip.py `curl -sSL https://bootstrap.pypa.io/get-pip.py -o get-pip.py`

- [ ] To make sure all files of embedded python binary are successfully downloaded, compare their hashes too.

- [ ] Move the python version, download links, etc to a separate config file.

- [ ] Set an electron persistent variable using [Electron-store](https://github.com/sindresorhus/electron-store) to avoid recreation of backend environment.

- [ ] Implement server status bar on the frontend.

- [ ] Implement editing text using buttons (like Bold, Italic, etc) in the editor

- [ ] Enable keybind support
