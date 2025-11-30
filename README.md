# Chatta or Clanka 🎮🤖

A minigame where you guess which message was written by a real Twitch chatter vs AI-generated text!

## 🚀 Quick Start

### For GitHub Pages (Deployed)
Simply open: `https://yourusername.github.io/chatta-or-clanka/index.html?name=zoil`

### For Local Development

**You must run a local web server** - browsers block file access for security reasons.

#### Option 1: Python (Recommended)
```bash
# Navigate to the project folder
cd d:\GitHub\chatta-or-clanka

# Run Python server
python -m http.server 8000

# Open in browser
http://localhost:8000/index.html?name=zoil
```

#### Option 2: VS Code Live Server
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

#### Option 3: Node.js
```bash
# Install http-server globally (one time)
npm install -g http-server

# Run server
npx http-server -p 8000

# Open in browser
http://localhost:8000/index.html?name=zoil
```

## 📁 Project Structure

```
chatta-or-clanka/
├── index.html          # Main game page
├── styles.css          # All styling
├── script.js           # Game logic
├── README.md          # This file
└── [streamer-name]/   # Streamer data folder
    ├── logs.csv       # Real chat messages (format: date_time,user,vod_link,message)
    └── generated.txt  # AI-generated messages (one per line)
```

## 🎯 How to Play

1. Open the game with a streamer name: `index.html?name=zoil`
2. Two messages will appear - one real, one AI-generated
3. Click on the message you think is from a real chatter
4. Build up your streak by guessing correctly!
5. Click "Next Round" to continue playing

## 📝 Adding a New Streamer

1. Create a new folder with the streamer's name (lowercase)
2. Add `logs.csv` with format: `date_time,user,vod_link,message`
3. Add `generated.txt` with one AI-generated quote per line
4. Open: `index.html?name=newstreamer`

## 🌐 Deploying to GitHub Pages

1. Push your code to GitHub
2. Go to repository Settings → Pages
3. Select your branch (usually `main`) and root directory
4. Your site will be available at: `https://yourusername.github.io/chatta-or-clanka/`

## 🛠️ Features

- ✨ Random selection of real vs AI messages
- 🔥 Streak tracking
- ✅ Visual feedback on correct/incorrect answers
- 📱 Responsive design
- 🎨 Clean, modern UI

## ⚠️ Troubleshooting

**"Access to fetch has been blocked by CORS policy"**
- You're opening the HTML file directly. Run a local server (see Quick Start above).

**"Failed to load game data"**
- Make sure your streamer folder exists with both required files
- Check that file names match exactly: `logs.csv` and `generated.txt`
- Verify the CSV format: `date_time,user,vod_link,message`

**Messages not showing up**
- Check that messages are longer than 10 characters
- Verify CSV format is correct with proper comma separation
- Make sure generated.txt has one quote per line

## 📄 License

Feel free to use and modify for your own projects!
