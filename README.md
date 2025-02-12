# Semantic

_A document management and querying system that uses Semantic Search_

<p align="center">
<img width="60%" src="Documentation/Logo.png" style="filter:drop-shadow(0 0 7px rgb(24, 21, 48, 0.5))"/>

Semantic is made to end tab hoarding and efficiently search for documents and images _(planned to implement)_ when needed.

The approach is similar to [TagStudio](https://github.com/TagStudioDev/TagStudio) but also uses semantic search for querying.

> This is still work in progress btw...

![Screenshot](Documentation/Screenshot.png)

## Contents

- [Development](#Development)
- [Todos](#Todos)

## Development (current preferred mode for running)

### For semantic client

- Clone this repo and change directory into it:

```bash
git clone https://github.com/mdhvg/semantic.git
cd semantic
```

- Install node modules:

```bash
npm i
```

### For semantic server

- Clone the semantic server (in a separate directory)

```bash
git clone https://github.com/mdhvg/semantic-server.git
cd semantic-server
```

- Create python environment (optional, but recommended) and install python depencencies:

```bash
python -m venv .env
source .env/bin/activate
```

```bash
pip install -r requirements.txt
```

- (From client Directory) Run the client application in development mode:

```bash
npm run dev
```

- (From the server Directory) Start the python server (In a separate terminal after activating the environment):

```bash
python main.py
```

## TODOs

- [ ] [UI] Use fuzzy search algorithm to find searched element document preview.

- [ ] [Server] Replace entire python backend with a C++ backend using [llama.cpp](https://github.com/ggerganov/llama.cpp).

- [ ] [UI] Imeplement the mime type switcher in the editor

- [ ] [Backend] To make sure all files of embedded python binary are successfully downloaded, compare their hashes too.

- [ ] [UI] Create server status bar.

- [ ] [UI] Implement editing text using buttons (like Bold, Italic, etc) in the editor.

- [ ] [UI] Enable keybind support.
