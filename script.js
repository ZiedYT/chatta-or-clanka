let realMessages = [];
let aiMessages = [];
let usedAiMessages = []; // Track used AI messages
let currentStreak = 0;
let currentRealMessage = null;
let currentAiMessage = null;
let hasAnswered = false;

// Get streamer name from URL
const urlParams = new URLSearchParams(window.location.search);
const streamerName = urlParams.get('name');

if (!streamerName) {
    document.getElementById('instruction').textContent = 'Error: No streamer specified';
    document.getElementById('gameArea').innerHTML = `
        <div class="error">
            <h2>No Streamer Specified</h2>
            <p>Please add a streamer name to the URL:</p>
            <code>index.html?name=yourstreamer</code>
        </div>
    `;
    throw new Error('No streamer name provided in URL');
}

document.getElementById('instruction').textContent = `👉 Can you find the ${streamerName} chatter? 👈`;

// Load CSV file
async function loadCSV() {
    try {
        const response = await fetch(`./${streamerName}/logs.csv`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        const lines = text.split('\n').slice(1); // Skip header
        
        realMessages = lines
            .filter(line => line.trim())
            .map(line => {
                // Parse CSV properly - split by comma but handle quoted fields
                const match = line.match(/^([^,]+),([^,]+),([^,]+),(.+)$/);
                if (match) {
                    return {
                        date_time: match[1],
                        user: match[2],
                        vod_link: match[3],
                        message: match[4].replace(/^"(.*)"$/, '$1').trim() // Remove quotes if present
                    };
                }
                return null;
            })
            .filter(msg => msg && msg.message.length > 10);
        
        return true;
    } catch (error) {
        console.error('Error loading CSV:', error);
        return false;
    }
}

// Load generated text file
async function loadGenerated() {
    try {
        const response = await fetch(`./${streamerName}/generated.txt`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        
        // Each line is one AI-generated quote
        aiMessages = text
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 10);
        
        return true;
    } catch (error) {
        console.error('Error loading generated text:', error);
        return false;
    }
}

// Get random item from array
function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function getMatchingLengthMessage(targetMessage, messageArray) {
    const targetLength = targetMessage.length;
    
    // Try 10 random messages and pick the closest one in length
    let closestMessage = null;
    let closestDifference = Infinity;
    
    for (let i = 0; i < Math.min(100, messageArray.length); i++) {
        const randomMessage = getRandomItem(messageArray);
        const msgLength = typeof randomMessage === 'string' ? randomMessage.length : randomMessage.message.length;
        const difference = Math.abs(msgLength - targetLength);
        
        if (difference < closestDifference) {
            closestDifference = difference;
            closestMessage = randomMessage;
        }
    }
    
    return closestMessage || getRandomItem(messageArray);
}

// Display game
function displayGame() {
    if (realMessages.length === 0 || aiMessages.length === 0) {
        document.getElementById('gameArea').innerHTML = '<div class="error">Error loading messages. Please try again.</div>';
        return;
    }

    // Pick a random AI message first
    currentAiMessage = getRandomItem(aiMessages);
    
    // Then find a real message with similar length
    currentRealMessage = getMatchingLengthMessage(currentAiMessage, realMessages);
    
    hasAnswered = false;

    // Randomly decide which side gets real message
    const realOnLeft = Math.random() > 0.5;

    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = `
        <div class="messages">
            <div class="message-card" data-real="${realOnLeft}" onclick="selectMessage(this, ${realOnLeft})">
                <div class="message-text">${escapeHtml(realOnLeft ? currentRealMessage.message : currentAiMessage)}</div>
            </div>
            <div class="message-card" data-real="${!realOnLeft}" onclick="selectMessage(this, ${!realOnLeft})">
                <div class="message-text">${escapeHtml(realOnLeft ? currentAiMessage : currentRealMessage.message)}</div>
            </div>
        </div>
        <div class="result-message" id="resultMessage"></div>
        <button id="nextButton" style="display: none;" onclick="nextRound()">Next Round</button>
    `;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Handle message selection
function selectMessage(element, isReal) {
    if (hasAnswered) return;
    
    hasAnswered = true;
    const cards = document.querySelectorAll('.message-card');
    const resultMessage = document.getElementById('resultMessage');
    const nextButton = document.getElementById('nextButton');

    // Show which was real
    cards.forEach(card => {
        if (card.dataset.real === 'true') {
            card.classList.add('correct');
        } else {
            card.classList.add('incorrect');
        }
    });

    if (isReal) {
        currentStreak++;
        resultMessage.innerHTML = `
            ✅ Correct! That was a real chatter!<br>
            <small style="opacity: 0.8; font-size: 0.9em;">
                The real message was written by <strong>${escapeHtml(currentRealMessage.user)}</strong><br>
                Posted at ${escapeHtml(currentRealMessage.date_time)}<br>
                <a href="${escapeHtml(currentRealMessage.vod_link)}" target="_blank" style="color: #667eea; text-decoration: none;">View VOD →</a>
            </small>
        `;
        resultMessage.className = 'result-message correct';
    } else {
        currentStreak = 0;
        resultMessage.innerHTML = `
            ❌ Wrong! That was AI generated!<br>
            <small style="opacity: 0.8; font-size: 0.9em;">
                The real message was: "${escapeHtml(currentRealMessage.message)}"<br>
                Written by <strong>${escapeHtml(currentRealMessage.user)}</strong><br>
                Posted at ${escapeHtml(currentRealMessage.date_time)}<br>
                <a href="${escapeHtml(currentRealMessage.vod_link)}" target="_blank" style="color: #667eea; text-decoration: none;">View VOD →</a>
            </small>
        `;
        resultMessage.className = 'result-message incorrect';
    }

    document.getElementById('streakCount').textContent = currentStreak;
    nextButton.style.display = 'block';
}

// Next round
function nextRound() {
    // Remove the used AI message from the pool
    const index = aiMessages.indexOf(currentAiMessage);
    if (index > -1) {
        usedAiMessages.push(aiMessages[index]);
        aiMessages.splice(index, 1);
    }
    
    displayGame();
}

// Reset messages to play again
function resetMessages() {
    // Restore all AI messages
    aiMessages = [...aiMessages, ...usedAiMessages];
    usedAiMessages = [];
    currentStreak = 0;
    document.getElementById('streakCount').textContent = currentStreak;
    displayGame();
}

// Make resetMessages globally accessible
window.resetMessages = resetMessages;

// Initialize game
async function init() {
    document.getElementById('gameArea').innerHTML = '<div class="loading">Loading messages...</div>';
    
    const csvLoaded = await loadCSV();
    const generatedLoaded = await loadGenerated();

    if (csvLoaded && generatedLoaded) {
        displayGame();
    } else {
        document.getElementById('gameArea').innerHTML = `
            <div class="error">
                <h2>Failed to load game data</h2>
                <p>Could not load messages for streamer: <strong>${streamerName}</strong></p>
                <p>Please make sure the following files exist in the same directory:</p>
                <ul style="text-align: left; max-width: 400px; margin: 20px auto;">
                    <li><code>${streamerName}/logs.csv</code></li>
                    <li><code>${streamerName}/generated.txt</code></li>
                </ul>
                <p style="margin-top: 20px; font-size: 0.9em; color: #666;">
                    <strong>Note:</strong> Make sure all files are in the correct folder structure.<br>
                    For browsers like Chrome, you may need to use the <code>--allow-file-access-from-files</code> flag.
                </p>
            </div>
        `;
    }
}

// Start the game
init();
