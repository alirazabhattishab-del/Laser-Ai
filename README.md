# Python AI ChatBot

This project is a real LLM-powered chatbot in Python, designed as a stronger base than the earlier rule-based bot. It uses the OpenAI Responses API for multi-turn conversation, keeps context between messages, supports streaming output, and can save transcripts to Markdown.

## Features

- multi-turn chat using `previous_response_id`
- streaming text output in the terminal
- configurable model through environment variables
- reusable system prompt in `system_prompt.txt`
- slash commands for reset, save, help, and quit
- browser frontend with HTML, CSS, and JavaScript
- unit tests that run without live API calls

## Project files

- `chatbot.py` - main chatbot application
- `web_frontend.py` - local web server for the browser UI
- `backend_supervisor.py` - auto-restarts the web server if it crashes
- `start_laser_ai.ps1` - one-command launcher for the supervised backend
- `system_prompt.txt` - assistant behavior and personality
- `requirements.txt` - Python dependency list
- `tests/test_chatbot.py` - unit tests
- `tests/test_web_frontend.py` - web route tests
- `tests/test_backend_supervisor.py` - supervisor tests

## Setup

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Add your API key in either of these ways.

Option A, shell variable:

```powershell
$env:OPENAI_API_KEY="your_api_key_here"
```

Option B, local `.env` file:

```text
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-5.4-mini
OPENAI_REASONING_EFFORT=medium
CHATBOT_STREAM=true
```

The project includes `.env.example`, and `.gitignore` excludes `.env` so your real key stays local.

3. Optional settings:

```powershell
$env:OPENAI_MODEL="gpt-5.4-mini"
$env:OPENAI_REASONING_EFFORT="medium"
$env:CHATBOT_STREAM="true"
```

## Run the chatbot

```bash
python chatbot.py
```

If `python` is not on your PATH in this environment, you can use the bundled runtime:

```powershell
& 'C:\Users\Admin\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' chatbot.py
```

## Run the HTML frontend

Start the local web server:

```powershell
& 'C:\Users\Admin\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' web_frontend.py
```

Then open [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser.

## Keep The Backend Running

If you want the backend to auto-restart when it crashes, run the supervisor instead of the plain server:

```powershell
.\start_laser_ai.ps1
```

Or run it directly with Python:

```powershell
& 'C:\Users\Admin\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' backend_supervisor.py
```

This keeps the website running as long as that supervisor process stays open, and it will relaunch `web_frontend.py` automatically after unexpected exits.

## Open It From Another Network

To access the app from another Wi-Fi or mobile data connection, deploy it to Railway instead of serving it only from your PC.

This project is now prepared for Railway:

- `railway.json` sets the build/start configuration
- the server honors Railway's injected `PORT` variable
- `/api/health` is available for deployment health checks

### Deploy On Railway

1. Push this project to GitHub.
2. In Railway, create a new project from that repo.
3. Railway should detect `railway.json` and use it for the deployment config.
4. In the Railway service variables, add:

```text
OPENAI_API_KEY=your_real_key
OPENAI_MODEL=gpt-5.4-mini
OPENAI_REASONING_EFFORT=medium
CHATBOT_STREAM=false
CHATBOT_STORE=true
```

5. In Railway, generate a public domain for the service.
6. Open that Railway domain from any device or network.

### Railway Notes

- `railway.json` sets `python web_frontend.py` as the start command.
- Railway injects a `PORT` variable, and this app already listens on it.
- Railway health checks can point to `/api/health`.
- Railway variables are applied from the service Variables tab.

Important:

- Do not expose your local PC directly to the internet for this app.
- Keep `OPENAI_API_KEY` only in Railway environment variables, not in source files.
- Public hosting means anyone with the URL can use your bot unless you add authentication.

## Commands

- `/help` shows available commands
- `/reset` clears the current conversation
- `/save` saves the chat transcript to `transcripts/`
- `/save my-chat.md` saves to a custom file
- `/quit` exits the application

## Example session

```text
AI ChatBot ready on model gpt-5.4-mini. Type /help for commands.
You: Write a short Instagram caption for a coffee shop launch
Bot: Here are three caption ideas for your coffee shop launch...
You: Make it more playful
Bot: Here are playful versions with a warmer, punchier tone...
You: /save
Bot: Transcript saved to C:\...\transcripts\chat-20260424-220000.md.
```

## Run tests

```powershell
& 'C:\Users\Admin\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' -m unittest discover -s tests
```
