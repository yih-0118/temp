const linebot = require('linebot');
const fs = require('fs');
const path = require('path');

const bot = linebot({
  channelId: '2005919475',
  channelSecret: 'e5b6bc94f99fff440a1175a654f190e2',
  channelAccessToken: 'GMafWuvmT/ETPQtzfIjg3zwYzCBWnIlKYXdJGyWkt0ijaLBspSc83xBro9R3kSqC7VBiYxFQdrYcIYBrLzWZz7IrPynGaCNnilV3b2dQFA6Y+Z6ELpFV64Z11JWjr63XCQ2wUsfiO8BBgja5S6MlCQdB04t89/1O/w1cDnyilFU='
});

// 讀取所有 JSON 檔案
const vocabularyPath = path.join(__dirname, 'vocabulary-list');
const allVocabularies = [];

function readVocabularyFiles(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });

  items.forEach(item => {
    const itemPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      readVocabularyFiles(itemPath);
    } else if (item.isFile() && path.extname(item.name) === '.json') {
      try {
        const data = JSON.parse(fs.readFileSync(itemPath, 'utf8'));
        if (Array.isArray(data.vocabularies)) {
          data.vocabularies.forEach(vocab => {
            vocab.source = path.basename(itemPath, '.json'); // 只保留文件名，不包括 .json
          });
          allVocabularies.push(...data.vocabularies);
        }
      } catch (error) {
        console.error(`Error reading file ${itemPath}:`, error);
      }
    }
  });
}

readVocabularyFiles(vocabularyPath);

console.log(`Loaded ${allVocabularies.length} vocabularies in total.`);

// 隨機選擇一個單字
function getRandomVocabulary() {
  const randomIndex = Math.floor(Math.random() * allVocabularies.length);
  return allVocabularies[randomIndex];
}

const userIntervals = {};

// 定時發送單字
function sendVocabulary(userId) {
  if (userIntervals[userId]) {
    clearInterval(userIntervals[userId]);
  }

  userIntervals[userId] = setInterval(() => {
    const vocabulary = getRandomVocabulary();
    const message = `單字：${vocabulary.vocabulary} (${vocabulary.partOfSpeech})\n中文：${vocabulary.chinese}\n出處：${vocabulary.source}`;
    bot.push(userId, message);
  }, 5 * 60 * 1000); // 每 3 秒發送一次
}

function sendVocabulary_fuck(userId) {
  if (userIntervals[userId]) {
    clearInterval(userIntervals[userId]);
  }

  userIntervals[userId] = setInterval(() => {
    const vocabulary = getRandomVocabulary();
    const message = `單字：${vocabulary.vocabulary} (${vocabulary.partOfSpeech})\n中文：${vocabulary.chinese}\n出處：${vocabulary.source}`;
    bot.push(userId, message);
  },3000); // 每 3 秒發送一次
}

// 停止發送單字
function stopSendingVocabulary(userId) {
  if (userIntervals[userId]) {
    clearInterval(userIntervals[userId]);
    delete userIntervals[userId];
  }
}

const botInstructions = `歡迎使用明倫單字卡！
以下是可用的指令：
1. start - 每5分鐘發送一個隨機單字
2. stop - 停止發送單字
3. asterjen - 一句鼓勵的話
4. crazy - 每3秒發送一個隨機單字
5. help - 顯示此說明訊息`;
bot.on('message', function (event) {
  const userMessage = event.message.text.toLowerCase();

  switch (userMessage) {
    case 'start':
      event.reply('之後每5分鐘會傳一個單字給你~');
      sendVocabulary(event.source.userId);
      break;
    case 'crazy':
      event.reply('接招吧哈哈哈！');
      sendVocabulary_fuck(event.source.userId);
      break;
    case 'stop':
      stopSendingVocabulary(event.source.userId);
      event.reply('這麼快就停?\n小菜雞🤏');
      break;
    case 'help':
      event.reply(botInstructions);
      break;
    case 'asterjen':
      event.reply('沒事去多拜拜，做好事，時時觀功念恩👍');
      break;
    default:
      event.reply('如果有問題請輸入help');
  }
});

bot.listen('/linewebhook', 3000, function () {
  console.log('機器人已啟動！');
});