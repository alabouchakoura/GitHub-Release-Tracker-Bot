# GitHub Release Tracker Bot

> A Telegram bot that monitors GitHub repositories for new releases and notifies you instantly when a new version drops—no GitHub account required.
## 🔗 Try it on Telegram
[**@aliakutamibot**](https://t.me/aliakutamibot)
## Features

- **Watch Repositories** — Add GitHub repos by URL and get notifications when new releases drop
- **Watch Management** — View all your watched repos and their latest versions, remove individual watches or all at once
- **Automatic Monitoring** — Checks every 6 hours for new release tags across all your watched repos
- **User-Friendly Interface** — Simple Telegram commands with keyboard navigation (no need to type URLs)
- **Persistent Storage** — All watches and version history stored in a SQLite database
- **Multi-User Support** — Multiple Telegram users can watch the same repo independently

## Project Structure

```

├── bot.js                  # Main entry point; handles all Telegram commands and event listeners
├── db.js                   # Database schema and CRUD operations (SQLite)
├── utilities.js            # Helper functions (URL validation, GitHub API calls, version checks)
├── bot.db                  # SQLite database file (created automatically on first run)
├── .env                    # Environment variables (BOT_TOKEN)
├── package.json            # Dependencies and build scripts
├── test.js                 # Test file
└── README.md               # Documentation file
```

### Key Modules

**bot.js**
- Command handlers for `/start`, `/watch`, `/list`, `/remove`, `/remove_all`, `/remove_by_url`, `/back`
- Message listener for user input during workflows
- Telegram polling setup
- Scheduled cron job (every 6 hours) that notifies users of new releases

**db.js**
- Creates and manages three tables: `users`, `repos`, and `watches`
- Exports functions: `addUser`, `addRepo`, `addWatch`, `removeWatch`, `removeAllWatches`, `getWatchedById`, `getAllWatchedRepos`, `updateRepo`

**utilities.js**
- `useRegex()` — Validates GitHub URLs
- `getRepoName()` — Extracts repo name from URL
- `getOwnerName()` — Extracts owner name from URL
- `getLatestVersion()` — Fetches latest release tag from GitHub API
- `verifyVersion()` — Returns all watched repos

## Prerequisites

- Node.js (v14 or higher recommended)
- npm (comes with Node.js)
- A Telegram account and a bot token from [@BotFather](https://telegram.me/BotFather)
- Internet connection (to access GitHub API and Telegram)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Telegram-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a `.env` file** in the root directory and add your bot token:
   ```bash
   BOT_TOKEN=your_token_here
   ```
   To get a bot token:
   - Open Telegram and message [@BotFather](https://telegram.me/BotFather)
   - Type `/newbot` and follow the prompts
   - Copy the token and paste it into `.env`

4. **Start the bot**
   ```bash
   npm run dev      # Development (with auto-reload via nodemon)
   npm start        # Production (node bot.js)
   ```

The bot is running once you see: `the bot is running`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `BOT_TOKEN` | Telegram bot token from @BotFather | Yes |

## Running the Bot

**Development mode** (auto-reloads on file changes):
```bash
npm run dev
```

**Production mode** (or simple run):
```bash
node bot.js
```

The bot uses Telegram polling, so it runs continuously after starting.

## Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Register with the bot and view available commands |
| `/watch` | Start watching a GitHub repo (bot asks for repo URL) |
| `/list` | View all repos you're currently watching and their latest release tags |
| `/remove` | Open removal menu to remove specific repos or all repos |
| `/remove_all` | Remove all watched repos at once |
| `/remove_by_url` | Remove a specific repo by URL |
| `/back` | Return to the main menu from any submenu |

## Scheduled Tasks

The bot runs a scheduled task every 6 hours:

```
Cron Schedule: '* */6 * * *' (every 6 hours)
```

This task:
1. Fetches all watched repos for all users
2. Checks GitHub API for the latest release tag
3. Sends Telegram notifications to users who are watching repos with new releases

## Database Schema

SQLite database with three tables:

**users**
- `chat_id` (INTEGER, PRIMARY KEY) — Telegram chat ID

**repos**
- `url` (TEXT, PRIMARY KEY) — GitHub repo URL
- `name` (TEXT) — Repository name
- `last_tag` (TEXT) — Latest known release tag
- `last_checked` (INTEGER) — Unix timestamp of last check

**watches** (Junction table)
- `chat_id` (INTEGER, FOREIGN KEY) — User's Telegram chat ID
- `url` (TEXT, FOREIGN KEY) — Repo URL
- PRIMARY KEY on both columns — prevents duplicate watches

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `node-telegram-bot-api` | ^0.67.0 | Telegram bot client |
| `better-sqlite3` | ^12.10.0 | SQLite database driver |
| `axios` | ^1.16.1 | HTTP client for GitHub API requests |
| `node-cron` | ^4.2.1 | Scheduled task runner |
| `dotenv` | ^17.4.2 | Environment variable loader |
| `nodemon` | ^3.1.14 | Auto-reload for development |

## Known Limitations
- Only supports public GitHub repositories
- Requires active internet connection for GitHub API calls
- Telegram polling (vs webhooks) means slightly higher latency and server load

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request