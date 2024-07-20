const {Client,GatewayIntentBits,EmbedBuilder,REST,Routes,ApplicationCommandOptionType,ActionRowBuilder,StringSelectMenuBuilder,ButtonBuilder,ButtonStyle} = require('discord.js');
const fs = require('fs');
const path = require('path');
const {token} = require('./config.json');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

const vocabularyPath = path.join(__dirname, 'vocabulary-list');

const commands = [{
        name: 'vocabulary',
        description: '顯示單字列表',
        options: [{
            type: ApplicationCommandOptionType.String,
            name: 'category',
            description: '選擇類別',
            required: true,
            choices: [{
                    name: 'Book 1',
                    value: 'Book1'
                },
                {
                    name: 'Book 2',
                    value: 'Book2'
                },
                {
                    name: 'Book 3',
                    value: 'Book3'
                },
                {
                    name: 'Book 4',
                    value: 'Book4'
                },
                {
                    name: 'Book 5',
                    value: 'Book5'
                },
                {
                    name: '單字書 Level 2',
                    value: '單字書 Level 2'
                },
                {
                    name: '單字書 Level 3',
                    value: '單字書 Level 3'
                },
                {
                    name: '單字書 Level 4',
                    value: '單字書 Level 4'
                },
                {
                    name: '常春藤 Level 5',
                    value: '常春藤 Level 5'
                },
                {
                    name: 'ALL PLUS March',
                    value: 'ALL_PLUS_Mar'
                },
                {
                    name: 'ALL PLUS April',
                    value: 'ALL_PLUS_Apr'
                },
                {
                    name: 'ALL PLUS May',
                    value: 'ALL_PLUS_May'
                },
                {
                    name: 'ALL PLUS June',
                    value: 'ALL_PLUS_Jun'
                },
            ],
        }, ],
    },
    {
        name: 'quiz',
        description: '開始單字測驗',
        options: [{
                type: ApplicationCommandOptionType.String,
                name: 'category',
                description: '選擇類別',
                required: true,
                choices: [{
                        name: 'Book 1',
                        value: 'Book1'
                    },
                    {
                        name: 'Book 2',
                        value: 'Book2'
                    },
                    {
                        name: 'Book 3',
                        value: 'Book3'
                    },
                    {
                        name: 'Book 4',
                        value: 'Book4'
                    },
                    {
                        name: 'Book 5',
                        value: 'Book5'
                    },
                    {
                        name: '單字書 Level 2',
                        value: '單字書 Level 2'
                    },
                    {
                        name: '單字書 Level 3',
                        value: '單字書 Level 3'
                    },
                    {
                        name: '單字書 Level 4',
                        value: '單字書 Level 4'
                    },
                    {
                        name: '常春藤 Level 5',
                        value: '常春藤 Level 5'
                    },
                    {
                        name: 'ALL PLUS March',
                        value: 'ALL_PLUS_Mar'
                    },
                    {
                        name: 'ALL PLUS April',
                        value: 'ALL_PLUS_Apr'
                    },
                    {
                        name: 'ALL PLUS May',
                        value: 'ALL_PLUS_May'
                    },
                    {
                        name: 'ALL PLUS June',
                        value: 'ALL_PLUS_Jun'
                    },
                ],
            },
            {
                type: ApplicationCommandOptionType.String,
                name: 'direction',
                description: '選擇測驗方向',
                required: true,
                choices: [{
                        name: '中文到英文',
                        value: 'ch_to_en'
                    },
                    {
                        name: '英文到中文',
                        value: 'en_to_ch'
                    },
                ],
            },
        ],
    },
];

function getRandomColor() {
    return Math.floor(Math.random() * 16777215).toString(16);
}

client.once('ready', async () => {
    console.log('Bot is ready!');

    const rest = new REST({
        version: '10'
    }).setToken(token);
    try {
        console.log('Started refreshing application (/) commands.');

        client.guilds.cache.forEach(async guild => {
            await rest.put(Routes.applicationGuildCommands(client.user.id, guild.id), {
                body: commands,
            });
        });

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        const {
            commandName,
            options
        } = interaction;

        if (commandName === 'vocabulary') {
            const category = options.getString('category');

            const subcategories = getSubcategories(category);

            const row = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                    .setCustomId(`subcategory_select:${category}`)
                    .setPlaceholder('選擇篇目')
                    .addOptions(subcategories.map(sub => ({
                        label: sub.name,
                        value: sub.value,
                    })))
                );

            await interaction.reply({
                content: '請選擇篇目：',
                components: [row]
            });
        }

        if (commandName === 'quiz') {
            const category = options.getString('category');
            const direction = options.getString('direction');

            const subcategories = getSubcategories(category);

            const row = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                    .setCustomId(`quiz_subcategory_select:${category}:${direction}`)
                    .setPlaceholder('選擇篇目')
                    .addOptions(subcategories.map(sub => ({
                        label: sub.name,
                        value: sub.value,
                    })))
                );

            await interaction.reply({
                content: '請選擇要測驗的篇目：',
                components: [row]
            });
        }
    } else if (interaction.isStringSelectMenu()) {
        const [action, ...params] = interaction.customId.split(':');

        if (action === 'subcategory_select') {
            const [category] = params;
            const selectedValue = interaction.values[0];

            let vocabularyData;
            try {
                vocabularyData = JSON.parse(fs.readFileSync(selectedValue, 'utf8'));
            } catch (error) {
                console.error('Error reading JSON file:', error);
                console.error('Attempted to read file:', selectedValue);
                return interaction.update({
                    content: `讀取檔案時發生錯誤。檔案路徑: ${selectedValue}`,
                    components: []
                });
            }

            let wordList = '';
            if (Array.isArray(vocabularyData.vocabularies)) {
                wordList = vocabularyData.vocabularies.map(word =>
                    `${word.vocabulary} (${word.partOfSpeech}): ${word.chinese}`
                ).join('\n');
            } else {
                wordList = '此部分的格式不正確，請檢查 JSON 檔案。';
            }

            const embed = new EmbedBuilder()
                .setTitle(`${category} - ${interaction.component.options.find(o => o.value === selectedValue).label}`)
                .setDescription(wordList || '無單字資料。')
                .setColor(`#${getRandomColor()}`);

            await interaction.update({
                embeds: [embed],
                components: []
            });
        }

        if (action === 'quiz_subcategory_select') {
            const [category, direction] = params;
            const selectedValue = interaction.values[0];

            await startQuiz(interaction, selectedValue, category, direction);
        }
    } else if (interaction.isButton()) {
        const [_, selectedIndex, correctAnswer] = interaction.customId.split('_');

        if (interaction.component.label === correctAnswer) {
            await interaction.reply({
                content: '答對了！🎉',
                ephemeral: true
            });
        } else {
            await interaction.reply({
                content: `錯誤！正確答案是：${correctAnswer}`,
                ephemeral: true
            });
        }
    }
});

function getSubcategories(category) {
    switch (category) {
        case 'Book1':
            return [{
                    name: 'Lesson 1',
                    value: path.join(vocabularyPath, 'Book 1', 'B1 L1.json')
                },
                {
                    name: 'Lesson 2',
                    value: path.join(vocabularyPath, 'Book 1', 'B1 L2.json')
                },
                {
                    name: 'Lesson 3',
                    value: path.join(vocabularyPath, 'Book 1', 'B1 L3.json')
                },
                {
                    name: 'Lesson 4',
                    value: path.join(vocabularyPath, 'Book 1', 'B1 L4.json')
                },
                {
                    name: 'Lesson 5',
                    value: path.join(vocabularyPath, 'Book 1', 'B1 L5.json')
                },
                {
                    name: 'Lesson 6',
                    value: path.join(vocabularyPath, 'Book 1', 'B1 L6.json')
                },
                {
                    name: 'Lesson 7',
                    value: path.join(vocabularyPath, 'Book 1', 'B1 L7.json')
                },
                {
                    name: 'Lesson 8',
                    value: path.join(vocabularyPath, 'Book 1', 'B1 L8.json')
                },
                {
                    name: 'Lesson 9',
                    value: path.join(vocabularyPath, 'Book 1', 'B1 L9.json')
                },
                {
                    name: 'Review 1',
                    value: path.join(vocabularyPath, 'Book 1', 'B1 review 1.json')
                },
                {
                    name: 'Review 2',
                    value: path.join(vocabularyPath, 'Book 1', 'B1 review 2.json')
                },
                {
                    name: 'Review 3',
                    value: path.join(vocabularyPath, 'Book 1', 'B1 review 3.json')
                },
            ];
        case 'Book2':
            return [{
                    name: 'Lesson 1',
                    value: path.join(vocabularyPath, 'Book 2', 'B2 L1.json')
                },
                {
                    name: 'Lesson 2',
                    value: path.join(vocabularyPath, 'Book 2', 'B2 L2.json')
                },
                {
                    name: 'Lesson 3',
                    value: path.join(vocabularyPath, 'Book 2', 'B2 L3.json')
                },
                {
                    name: 'Lesson 4',
                    value: path.join(vocabularyPath, 'Book 2', 'B2 L4.json')
                },
                {
                    name: 'Lesson 5',
                    value: path.join(vocabularyPath, 'Book 2', 'B2 L5.json')
                },
                {
                    name: 'Lesson 6',
                    value: path.join(vocabularyPath, 'Book 2', 'B2 L6.json')
                },
                {
                    name: 'Lesson 7',
                    value: path.join(vocabularyPath, 'Book 2', 'B2 L7.json')
                },
                {
                    name: 'Lesson 8',
                    value: path.join(vocabularyPath, 'Book 2', 'B2 L8.json')
                },
                {
                    name: 'Lesson 9',
                    value: path.join(vocabularyPath, 'Book 2', 'B2 L9.json')
                },
                {
                    name: 'Review 1',
                    value: path.join(vocabularyPath, 'Book 2', 'B2 review 1.json')
                },
                {
                    name: 'Review 2',
                    value: path.join(vocabularyPath, 'Book 2', 'B2 review 2.json')
                },
                {
                    name: 'Review 3',
                    value: path.join(vocabularyPath, 'Book 2', 'B2 review 3.json')
                },
            ];
        case 'Book3':
            return [{
                    name: 'Lesson 1',
                    value: path.join(vocabularyPath, 'Book 3', 'B3 L1.json')
                },
                {
                    name: 'Lesson 2',
                    value: path.join(vocabularyPath, 'Book 3', 'B3 L2.json')
                },
                {
                    name: 'Lesson 3',
                    value: path.join(vocabularyPath, 'Book 3', 'B3 L3.json')
                },
                {
                    name: 'Lesson 4',
                    value: path.join(vocabularyPath, 'Book 3', 'B3 L4.json')
                },
                {
                    name: 'Lesson 5',
                    value: path.join(vocabularyPath, 'Book 3', 'B3 L5.json')
                },
                {
                    name: 'Lesson 6',
                    value: path.join(vocabularyPath, 'Book 3', 'B3 L6.json')
                },
                {
                    name: 'Lesson 7',
                    value: path.join(vocabularyPath, 'Book 3', 'B3 L7.json')
                },
                {
                    name: 'Lesson 8',
                    value: path.join(vocabularyPath, 'Book 3', 'B3 L8.json')
                },
                {
                    name: 'Lesson 9',
                    value: path.join(vocabularyPath, 'Book 3', 'B3 L9.json')
                },
                {
                    name: 'Review 1',
                    value: path.join(vocabularyPath, 'Book 3', 'B3 review 1.json')
                },
                {
                    name: 'Review 2',
                    value: path.join(vocabularyPath, 'Book 3', 'B3 review 2.json')
                },
                {
                    name: 'Review 3',
                    value: path.join(vocabularyPath, 'Book 3', 'B3 review 3.json')
                },
            ];
        case 'Book4':
            return [{
                    name: 'Lesson 1',
                    value: path.join(vocabularyPath, 'Book 4', 'B4 L1.json')
                },
                {
                    name: 'Lesson 2',
                    value: path.join(vocabularyPath, 'Book 4', 'B4 L2.json')
                },
                {
                    name: 'Lesson 3',
                    value: path.join(vocabularyPath, 'Book 4', 'B4 L3.json')
                },
                {
                    name: 'Lesson 4',
                    value: path.join(vocabularyPath, 'Book 4', 'B4 L4.json')
                },
                {
                    name: 'Lesson 5',
                    value: path.join(vocabularyPath, 'Book 4', 'B4 L5.json')
                },
                {
                    name: 'Lesson 6',
                    value: path.join(vocabularyPath, 'Book 4', 'B4 L6.json')
                },
                {
                    name: 'Lesson 7',
                    value: path.join(vocabularyPath, 'Book 4', 'B4 L7.json')
                },
                {
                    name: 'Lesson 8',
                    value: path.join(vocabularyPath, 'Book 4', 'B4 L8.json')
                },
                {
                    name: 'Lesson 9',
                    value: path.join(vocabularyPath, 'Book 4', 'B4 L9.json')
                },
                {
                    name: 'Review 1',
                    value: path.join(vocabularyPath, 'Book 4', 'B4 review 1.json')
                },
                {
                    name: 'Review 2',
                    value: path.join(vocabularyPath, 'Book 4', 'B4 review 2.json')
                },
                {
                    name: 'Review 3',
                    value: path.join(vocabularyPath, 'Book 4', 'B4 review 3.json')
                },
            ];
        case 'Book5':
            return [{
                    name: 'Lesson 1',
                    value: path.join(vocabularyPath, 'Book 5', 'B5 L1.json')
                },
                {
                    name: 'Lesson 2',
                    value: path.join(vocabularyPath, 'Book 5', 'B5 L2.json')
                },
                {
                    name: 'Lesson 3',
                    value: path.join(vocabularyPath, 'Book 5', 'B5 L3.json')
                },
                {
                    name: 'Lesson 4',
                    value: path.join(vocabularyPath, 'Book 5', 'B5 L4.json')
                },
                {
                    name: 'Lesson 5',
                    value: path.join(vocabularyPath, 'Book 5', 'B5 L5.json')
                },
                {
                    name: 'Lesson 6',
                    value: path.join(vocabularyPath, 'Book 5', 'B5 L6.json')
                },
            ];

        case 'ALL_PLUS_Mar':
            return [{
                    name: 'CNN News',
                    value: path.join(vocabularyPath, 'Allplus 3月2024', 'ALL_PLUS_Mar_CNN_News.json')
                },
                {
                    name: 'Unit 1',
                    value: path.join(vocabularyPath, 'Allplus 3月2024', 'ALL_PLUS_Mar_Unit_1.json')
                },
                {
                    name: 'Unit 2',
                    value: path.join(vocabularyPath, 'Allplus 3月2024', 'ALL_PLUS_Mar_Unit_2.json')
                },
                {
                    name: 'Unit 3',
                    value: path.join(vocabularyPath, 'Allplus 3月2024', 'ALL_PLUS_Mar_Unit_3.json')
                },
                {
                    name: 'Unit 4',
                    value: path.join(vocabularyPath, 'Allplus 3月2024', 'ALL_PLUS_Mar_Unit_4.json')
                },
                {
                    name: 'Unit 5',
                    value: path.join(vocabularyPath, 'Allplus 3月2024', 'ALL_PLUS_Mar_Unit_5.json')
                },
                {
                    name: 'Unit 6',
                    value: path.join(vocabularyPath, 'Allplus 3月2024', 'ALL_PLUS_Mar_Unit_6.json')
                },
                {
                    name: 'Unit 7',
                    value: path.join(vocabularyPath, 'Allplus 3月2024', 'ALL_PLUS_Mar_Unit_7.json')
                },
                {
                    name: 'Unit 9',
                    value: path.join(vocabularyPath, 'Allplus 3月2024', 'ALL_PLUS_Mar_Unit_9.json')
                },
                {
                    name: 'Unit 10',
                    value: path.join(vocabularyPath, 'Allplus 3月2024', 'ALL_PLUS_Mar_Unit_10.json')
                },
                {
                    name: 'Unit 11',
                    value: path.join(vocabularyPath, 'Allplus 3月2024', 'ALL_PLUS_Mar_Unit_11.json')
                },
                {
                    name: 'Unit 12',
                    value: path.join(vocabularyPath, 'Allplus 3月2024', 'ALL_PLUS_Mar_Unit_12.json')
                },
                {
                    name: 'Unit 13',
                    value: path.join(vocabularyPath, 'Allplus 3月2024', 'ALL_PLUS_Mar_Unit_13.json')
                },
                {
                    name: 'Unit 14',
                    value: path.join(vocabularyPath, 'Allplus 3月2024', 'ALL_PLUS_Mar_Unit_14.json')
                },
                {
                    name: 'Unit 15',
                    value: path.join(vocabularyPath, 'Allplus 3月2024', 'ALL_PLUS_Mar_Unit_15.json')
                },
            ];
        case 'ALL_PLUS_Apr':
            return [{
                    name: 'CNN News',
                    value: path.join(vocabularyPath, 'Allplus 4月2024', 'ALL_PLUS_Apr_CNN_News.json')
                },
                {
                    name: 'Unit 1',
                    value: path.join(vocabularyPath, 'Allplus 4月2024', 'ALL_PLUS_Apr_Unit_1.json')
                },
                {
                    name: 'Unit 2',
                    value: path.join(vocabularyPath, 'Allplus 4月2024', 'ALL_PLUS_Apr_Unit_2.json')
                },
                {
                    name: 'Unit 3',
                    value: path.join(vocabularyPath, 'Allplus 4月2024', 'ALL_PLUS_Apr_Unit_3.json')
                },
                {
                    name: 'Unit 4',
                    value: path.join(vocabularyPath, 'Allplus 4月2024', 'ALL_PLUS_Apr_Unit_4.json')
                },
                {
                    name: 'Unit 5',
                    value: path.join(vocabularyPath, 'Allplus 4月2024', 'ALL_PLUS_Apr_Unit_5.json')
                },
                {
                    name: 'Unit 6',
                    value: path.join(vocabularyPath, 'Allplus 4月2024', 'ALL_PLUS_Apr_Unit_6.json')
                },
                {
                    name: 'Unit 8',
                    value: path.join(vocabularyPath, 'Allplus 4月2024', 'ALL_PLUS_Apr_Unit_8.json')
                },
                {
                    name: 'Unit 9',
                    value: path.join(vocabularyPath, 'Allplus 4月2024', 'ALL_PLUS_Apr_Unit_9.json')
                },
                {
                    name: 'Unit 10',
                    value: path.join(vocabularyPath, 'Allplus 4月2024', 'ALL_PLUS_Apr_Unit_10.json')
                },
                {
                    name: 'Unit 11',
                    value: path.join(vocabularyPath, 'Allplus 4月2024', 'ALL_PLUS_Apr_Unit_11.json')
                },
                {
                    name: 'Unit 12',
                    value: path.join(vocabularyPath, 'Allplus 4月2024', 'ALL_PLUS_Apr_Unit_12.json')
                },
                {
                    name: 'Unit 13',
                    value: path.join(vocabularyPath, 'Allplus 4月2024', 'ALL_PLUS_Apr_Unit_13.json')
                },
                {
                    name: 'Unit 14',
                    value: path.join(vocabularyPath, 'Allplus 4月2024', 'ALL_PLUS_Apr_Unit_14.json')
                },
                {
                    name: 'Unit 15',
                    value: path.join(vocabularyPath, 'Allplus 4月2024', 'ALL_PLUS_Apr_Unit_15.json')
                },
            ]
        case 'ALL_PLUS_May':
            return [{
                    name: 'Unit 1',
                    value: path.join(vocabularyPath, 'Allplus 5月2024', 'ALL_PLUS_May_Unit_1.json')
                },
                {
                    name: 'Unit 2',
                    value: path.join(vocabularyPath, 'Allplus 5月2024', 'ALL_PLUS_May_Unit_2.json')
                },
                {
                    name: 'Unit 3',
                    value: path.join(vocabularyPath, 'Allplus 5月2024', 'ALL_PLUS_May_Unit_3.json')
                },
                {
                    name: 'Unit 4',
                    value: path.join(vocabularyPath, 'Allplus 5月2024', 'ALL_PLUS_May_Unit_4.json')
                },
                {
                    name: 'Unit 5',
                    value: path.join(vocabularyPath, 'Allplus 5月2024', 'ALL_PLUS_May_Unit_5.json')
                },
                {
                    name: 'Unit 6',
                    value: path.join(vocabularyPath, 'Allplus 5月2024', 'ALL_PLUS_May_Unit_6.json')
                },
                {
                    name: 'Unit 7',
                    value: path.join(vocabularyPath, 'Allplus 5月2024', 'ALL_PLUS_May_Unit_7.json')
                },
                {
                    name: 'Unit 8',
                    value: path.join(vocabularyPath, 'Allplus 5月2024', 'ALL_PLUS_May_Unit_8.json')
                },
                {
                    name: 'Unit 10',
                    value: path.join(vocabularyPath, 'Allplus 5月2024', 'ALL_PLUS_May_Unit_10.json')
                },
                {
                    name: 'Unit 11',
                    value: path.join(vocabularyPath, 'Allplus 5月2024', 'ALL_PLUS_May_Unit_11.json')
                },
                {
                    name: 'Unit 12',
                    value: path.join(vocabularyPath, 'Allplus 5月2024', 'ALL_PLUS_May_Unit_12.json')
                },
                {
                    name: 'Unit 13',
                    value: path.join(vocabularyPath, 'Allplus 5月2024', 'ALL_PLUS_May_Unit_13.json')
                },
                {
                    name: 'Unit 14',
                    value: path.join(vocabularyPath, 'Allplus 5月2024', 'ALL_PLUS_May_Unit_14.json')
                },
                {
                    name: 'Unit 15',
                    value: path.join(vocabularyPath, 'Allplus 5月2024', 'ALL_PLUS_May_Unit_15.json')
                },
                {
                    name: 'Unit 16',
                    value: path.join(vocabularyPath, 'Allplus 5月2024', 'ALL_PLUS_May_Unit_16.json')
                },
            ]
        case 'ALL_PLUS_Jun':
            return [{
                    name: 'CNN News',
                    value: path.join(vocabularyPath, 'Allplus 6月2024', 'ALL_PLUS_Jun_CNN_News.json')
                },
                {
                    name: 'Unit 1',
                    value: path.join(vocabularyPath, 'Allplus 6月2024', 'ALL_PLUS_Jun_Unit_1.json')
                },
                {
                    name: 'Unit 2',
                    value: path.join(vocabularyPath, 'Allplus 6月2024', 'ALL_PLUS_Jun_Unit_2.json')
                },
                {
                    name: 'Unit 3',
                    value: path.join(vocabularyPath, 'Allplus 6月2024', 'ALL_PLUS_Jun_Unit_3.json')
                },
                {
                    name: 'Unit 4',
                    value: path.join(vocabularyPath, 'Allplus 6月2024', 'ALL_PLUS_Jun_Unit_4.json')
                },
                {
                    name: 'Unit 5',
                    value: path.join(vocabularyPath, 'Allplus 6月2024', 'ALL_PLUS_Jun_Unit_5.json')
                },
                {
                    name: 'Unit 6',
                    value: path.join(vocabularyPath, 'Allplus 6月2024', 'ALL_PLUS_Jun_Unit_6.json')
                },
                {
                    name: 'Unit 7',
                    value: path.join(vocabularyPath, 'Allplus 6月2024', 'ALL_PLUS_Jun_Unit_7.json')
                },
                {
                    name: 'Unit 9',
                    value: path.join(vocabularyPath, 'Allplus 6月2024', 'ALL_PLUS_Jun_Unit_9.json')
                },
                {
                    name: 'Unit 10',
                    value: path.join(vocabularyPath, 'Allplus 6月2024', 'ALL_PLUS_Jun_Unit_10.json')
                },
                {
                    name: 'Unit 11',
                    value: path.join(vocabularyPath, 'Allplus 6月2024', 'ALL_PLUS_Jun_Unit_11.json')
                },
                {
                    name: 'Unit 12',
                    value: path.join(vocabularyPath, 'Allplus 6月2024', 'ALL_PLUS_Jun_Unit_12.json')
                },
                {
                    name: 'Unit 13',
                    value: path.join(vocabularyPath, 'Allplus 6月2024', 'ALL_PLUS_Jun_Unit_13.json')
                },
                {
                    name: 'Unit 14',
                    value: path.join(vocabularyPath, 'Allplus 6月2024', 'ALL_PLUS_Jun_Unit_14.json')
                },
            ]
        case '單字書 Level 2':
            return [{
                    name: 'Unit 1',
                    value: path.join(vocabularyPath, '單字書 Level 2', 'vocabulary(L2 Unit1).json')
                },
                {
                    name: 'Unit 2',
                    value: path.join(vocabularyPath, '單字書 Level 2', 'vocabulary(L2 Unit2).json')
                },
                {
                    name: 'Unit 3',
                    value: path.join(vocabularyPath, '單字書 Level 2', 'vocabulary(L2 Unit3).json')
                },
                {
                    name: 'Unit 4',
                    value: path.join(vocabularyPath, '單字書 Level 2', 'vocabulary(L2 Unit4).json')
                },
                {
                    name: 'Unit 5',
                    value: path.join(vocabularyPath, '單字書 Level 2', 'vocabulary(L2 Unit5).json')
                },
                {
                    name: 'Unit 6',
                    value: path.join(vocabularyPath, '單字書 Level 2', 'vocabulary(L2 Unit6).json')
                },
                {
                    name: 'Unit 7',
                    value: path.join(vocabularyPath, '單字書 Level 2', 'vocabulary(L2 Unit7).json')
                },
                {
                    name: 'Unit 8',
                    value: path.join(vocabularyPath, '單字書 Level 2', 'vocabulary(L2 Unit8).json')
                },
            ]
        case '單字書 Level 3':
            return [{
                    name: 'Unit 1',
                    value: path.join(vocabularyPath, '單字書 Level 3', 'vocabulary(L3 Unit1).json')
                },
                {
                    name: 'Unit 2',
                    value: path.join(vocabularyPath, '單字書 Level 3', 'vocabulary(L3 Unit2).json')
                },
                {
                    name: 'Unit 3',
                    value: path.join(vocabularyPath, '單字書 Level 3', 'vocabulary(L3 Unit3).json')
                },
                {
                    name: 'Unit 4',
                    value: path.join(vocabularyPath, '單字書 Level 3', 'vocabulary(L3 Unit4).json')
                },
                {
                    name: 'Unit 5',
                    value: path.join(vocabularyPath, '單字書 Level 3', 'vocabulary(L3 Unit5).json')
                },
                {
                    name: 'Unit 6',
                    value: path.join(vocabularyPath, '單字書 Level 3', 'vocabulary(L3 Unit6).json')
                },
                {
                    name: 'Unit 7',
                    value: path.join(vocabularyPath, '單字書 Level 3', 'vocabulary(L3 Unit7).json')
                },
                {
                    name: 'Unit 8',
                    value: path.join(vocabularyPath, '單字書 Level 3', 'vocabulary(L3 Unit8).json')
                },
                {
                    name: 'Unit 9',
                    value: path.join(vocabularyPath, '單字書 Level 3', 'vocabulary(L3 Unit9).json')
                },
                {
                    name: 'Unit 10',
                    value: path.join(vocabularyPath, '單字書 Level 3', 'vocabulary(L3 Unit10).json')
                },
                {
                    name: 'Unit 11',
                    value: path.join(vocabularyPath, '單字書 Level 3', 'vocabulary(L3 Unit11).json')
                },
                {
                    name: 'Unit 12',
                    value: path.join(vocabularyPath, '單字書 Level 3', 'vocabulary(L3 Unit12).json')
                },
                {
                    name: 'Unit 13',
                    value: path.join(vocabularyPath, '單字書 Level 3', 'vocabulary(L3 Unit13).json')
                },
                {
                    name: 'Unit 14',
                    value: path.join(vocabularyPath, '單字書 Level 3', 'vocabulary(L3 Unit14).json')
                },
                {
                    name: 'Unit 15',
                    value: path.join(vocabularyPath, '單字書 Level 3', 'vocabulary(L3 Unit15).json')
                },
                {
                    name: 'Unit 16',
                    value: path.join(vocabularyPath, '單字書 Level 3', 'vocabulary(L3 Unit16).json')
                },
                {
                    name: 'Unit 17',
                    value: path.join(vocabularyPath, '單字書 Level 3', 'vocabulary(L3 Unit17).json')
                },
                {
                    name: 'Unit 18',
                    value: path.join(vocabularyPath, '單字書 Level 3', 'vocabulary(L3 Unit18).json')
                },
                {
                    name: 'Unit 19',
                    value: path.join(vocabularyPath, '單字書 Level 3', 'vocabulary(L3 Unit19).json')
                },
                {
                    name: 'Unit 20',
                    value: path.join(vocabularyPath, '單字書 Level 3', 'vocabulary(L3 Unit20).json')
                },
                {
                    name: 'Unit 21',
                    value: path.join(vocabularyPath, '單字書 Level 3', 'vocabulary(L3 Unit21).json')
                },
            ]
        case '單字書 Level 4':
            return [{
                    name: 'Unit 1',
                    value: path.join(vocabularyPath, '單字書 Level 4', 'vocabulary(L4 Unit1).json')
                },
                {
                    name: 'Unit 2',
                    value: path.join(vocabularyPath, '單字書 Level 4', 'vocabulary(L4 Unit2).json')
                },
                {
                    name: 'Unit 3',
                    value: path.join(vocabularyPath, '單字書 Level 4', 'vocabulary(L4 Unit3).json')
                },
                {
                    name: 'Unit 4',
                    value: path.join(vocabularyPath, '單字書 Level 4', 'vocabulary(L4 Unit4).json')
                },
                {
                    name: 'Unit 5',
                    value: path.join(vocabularyPath, '單字書 Level 4', 'vocabulary(L4 Unit5).json')
                },
                {
                    name: 'Unit 6',
                    value: path.join(vocabularyPath, '單字書 Level 4', 'vocabulary(L4 Unit6).json')
                },
                {
                    name: 'Unit 7',
                    value: path.join(vocabularyPath, '單字書 Level 4', 'vocabulary(L4 Unit7).json')
                },
                {
                    name: 'Unit 8',
                    value: path.join(vocabularyPath, '單字書 Level 4', 'vocabulary(L4 Unit8).json')
                },
                {
                    name: 'Unit 9',
                    value: path.join(vocabularyPath, '單字書 Level 4', 'vocabulary(L4 Unit9).json')
                },
                {
                    name: 'Unit 10',
                    value: path.join(vocabularyPath, '單字書 Level 4', 'vocabulary(L4 Unit10).json')
                },
                {
                    name: 'Unit 11',
                    value: path.join(vocabularyPath, '單字書 Level 4', 'vocabulary(L4 Unit11).json')
                },
                {
                    name: 'Unit 12',
                    value: path.join(vocabularyPath, '單字書 Level 4', 'vocabulary(L4 Unit12).json')
                },
                {
                    name: 'Unit 13',
                    value: path.join(vocabularyPath, '單字書 Level 4', 'vocabulary(L4 Unit13).json')
                },
                {
                    name: 'Unit 14',
                    value: path.join(vocabularyPath, '單字書 Level 4', 'vocabulary(L4 Unit14).json')
                },
                {
                    name: 'Unit 15',
                    value: path.join(vocabularyPath, '單字書 Level 4', 'vocabulary(L4 Unit15).json')
                },
                {
                    name: 'Unit 16',
                    value: path.join(vocabularyPath, '單字書 Level 4', 'vocabulary(L4 Unit16).json')
                },
                {
                    name: 'Unit 17',
                    value: path.join(vocabularyPath, '單字書 Level 4', 'vocabulary(L4 Unit17).json')
                },
                {
                    name: 'Unit 18',
                    value: path.join(vocabularyPath, '單字書 Level 4', 'vocabulary(L4 Unit18).json')
                },
                {
                    name: 'Unit 19',
                    value: path.join(vocabularyPath, '單字書 Level 4', 'vocabulary(L4 Unit19).json')
                },
                {
                    name: 'Unit 20',
                    value: path.join(vocabularyPath, '單字書 Level 4', 'vocabulary(L4 Unit20).json')
                },
                {
                    name: 'Unit 21',
                    value: path.join(vocabularyPath, '單字書 Level 4', 'vocabulary(L4 Unit21).json')
                },
            ]

        case '單字書 Level 3':
            return [{
                    name: 'Unit 1',
                    value: path.join(vocabularyPath, '常春藤 Level 5', 'vocabulary(L5 Unit1).json')
                },
                {
                    name: 'Unit 2',
                    value: path.join(vocabularyPath, '常春藤 Level 5', 'vocabulary(L5 Unit2).json')
                },
                {
                    name: 'Unit 3',
                    value: path.join(vocabularyPath, '常春藤 Level 5', 'vocabulary(L5 Unit3).json')
                },
                {
                    name: 'Unit 4',
                    value: path.join(vocabularyPath, '常春藤 Level 5', 'vocabulary(L5 Unit4).json')
                },
                {
                    name: 'Unit 5',
                    value: path.join(vocabularyPath, '常春藤 Level 5', 'vocabulary(L5 Unit5).json')
                },
                {
                    name: 'Unit 6',
                    value: path.join(vocabularyPath, '常春藤 Level 5', 'vocabulary(L5 Unit6).json')
                },
                {
                    name: 'Unit 7',
                    value: path.join(vocabularyPath, '常春藤 Level 5', 'vocabulary(L5 Unit7).json')
                },
                {
                    name: 'Unit 8',
                    value: path.join(vocabularyPath, '常春藤 Level 5', 'vocabulary(L5 Unit8).json')
                },
                {
                    name: 'Unit 9',
                    value: path.join(vocabularyPath, '常春藤 Level 5', 'vocabulary(L5 Unit9).json')
                },
                {
                    name: 'Unit 10',
                    value: path.join(vocabularyPath, '常春藤 Level 5', 'vocabulary(L5 Unit10).json')
                },
                {
                    name: 'Unit 11',
                    value: path.join(vocabularyPath, '常春藤 Level 5', 'vocabulary(L5 Unit11).json')
                },
                {
                    name: 'Unit 12',
                    value: path.join(vocabularyPath, '常春藤 Level 5', 'vocabulary(L5 Unit12).json')
                },
                {
                    name: 'Unit 13',
                    value: path.join(vocabularyPath, '常春藤 Level 5', 'vocabulary(L5 Unit13).json')
                },
                {
                    name: 'Unit 14',
                    value: path.join(vocabularyPath, '常春藤 Level 5', 'vocabulary(L5 Unit14).json')
                },
                {
                    name: 'Unit 15',
                    value: path.join(vocabularyPath, '常春藤 Level 5', 'vocabulary(L5 Unit15).json')
                },
                {
                    name: 'Unit 16',
                    value: path.join(vocabularyPath, '常春藤 Level 5', 'vocabulary(L5 Unit16).json')
                },
                {
                    name: 'Unit 17',
                    value: path.join(vocabularyPath, '常春藤 Level 5', 'vocabulary(L5 Unit17).json')
                },
                {
                    name: 'Unit 18',
                    value: path.join(vocabularyPath, '常春藤 Level 5', 'vocabulary(L5 Unit18).json')
                },
                {
                    name: 'Unit 19',
                    value: path.join(vocabularyPath, '常春藤 Level 5', 'vocabulary(L5 Unit19).json')
                },
                {
                    name: 'Unit 20',
                    value: path.join(vocabularyPath, '常春藤 Level 5', 'vocabulary(L5 Unit20).json')
                },
                {
                    name: 'Unit 21',
                    value: path.join(vocabularyPath, '常春藤 Level 5', 'vocabulary(L5 Unit21).json')
                },
                {
                    name: 'Unit 22',
                    value: path.join(vocabularyPath, '常春藤 Level 5', 'vocabulary(L5 Unit22).json')
                },
                {
                    name: 'Unit 23',
                    value: path.join(vocabularyPath, '常春藤 Level 5', 'vocabulary(L5 Unit23).json')
                },
                {
                    name: 'Unit 24',
                    value: path.join(vocabularyPath, '常春藤 Level 5', 'vocabulary(L5 Unit24).json')
                },
                {
                    name: 'Unit 25',
                    value: path.join(vocabularyPath, '常春藤 Level 5', 'vocabulary(L5 Unit25).json')
                },
            ]
    }
}
async function startQuiz(interaction, selectedValue, category, direction) {
    let vocabularyData;
    try {
        vocabularyData = JSON.parse(fs.readFileSync(selectedValue, 'utf8'));
    } catch (error) {
        console.error('Error reading JSON file:', error);
        console.error('Attempted to read file:', selectedValue);
        return interaction.update({
            content: `讀取檔案時發生錯誤。檔案路徑: ${selectedValue}`,
            components: []
        });
    }

    const vocabularies = vocabularyData.vocabularies;
    const totalQuestions = vocabularies.length;
    let correctAnswers = 0;

    const quizEmbed = new EmbedBuilder()
        .setTitle(`單字測驗 - ${category}`)
        .setColor(`#${getRandomColor()}`);

    await interaction.update({
        content: '測驗開始',
        embeds: [quizEmbed],
        components: []
    });

    const usedIndexes = new Set();

    async function askNextQuestion(index) {
        if (index >= totalQuestions) {
            const resultEmbed = new EmbedBuilder()
                .setTitle('測驗結束')
                .setColor(`#${getRandomColor()}`);

            await interaction.followUp({
                embeds: [resultEmbed]
            });
            return;
        }

        const randomIndex = getRandomUniqueIndex(vocabularies.length, usedIndexes);
        const randomWord = vocabularies[randomIndex];
        let question;
        let answer;
        let options = [];

        if (direction === 'ch_to_en') {
            question = `問題 ${index + 1}: 中文 - ${randomWord.chinese}`;
            answer = randomWord.vocabulary;
            options = getUniqueOptions(vocabularies, answer, 'vocabulary');
        } else {
            question = `問題 ${index + 1}: 英文 - ${randomWord.vocabulary}`;
            answer = randomWord.chinese;
            options = getUniqueOptions(vocabularies, answer, 'chinese');
        }

        options = shuffleArray(options);

        const buttons = new ActionRowBuilder()
            .addComponents(
                options.map((option, index) =>
                    new ButtonBuilder()
                    .setCustomId(`option_${index}_${answer}`)
                    .setLabel(option)
                    .setStyle(ButtonStyle.Primary)
                )
            );

        await interaction.followUp({
            content: question,
            components: [buttons]
        });

        const filter = i => i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            componentType: 'BUTTON',
            max: 1,
            time: 7000
        });

        collector.on('collect', async i => {
            const [_, selectedIndex, correctAnswer] = i.customId.split('_');
            if (i.component.label === correctAnswer) {
                correctAnswers++;
                await i.reply({
                    content: '答對了！🎉',
                    ephemeral: true
                });
                askNextQuestion(index + 1);

            } else {
                await i.reply({
                    content: `錯誤！正確答案是：${correctAnswer}`,
                    ephemeral: true
                });
                askNextQuestion(index + 1);

            }
            askNextQuestion(index + 1);
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                interaction.followUp({
                    content: '時間到！',
                    ephemeral: true
                });
                askNextQuestion(index + 1);
            }
        });
    }

    askNextQuestion(0);
}


function getRandomUniqueIndex(max, usedIndexes) {
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * max);
    } while (usedIndexes.has(randomIndex));
    usedIndexes.add(randomIndex);
    return randomIndex;
}

function getUniqueOptions(vocabularies, correctAnswer, field) {
    const options = [correctAnswer];
    while (options.length < 4) {
        const randomIndex = Math.floor(Math.random() * vocabularies.length);
        const option = vocabularies[randomIndex][field];
        if (!options.includes(option)) {
            options.push(option);
        }
    }
    return options;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

client.login(token);
