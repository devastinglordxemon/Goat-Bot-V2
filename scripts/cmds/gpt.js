const axios = require('axios');


const apiKey = "sk-proj-lH04YtxAR01gl17fLAooT3BlbkFJa01snMVzHKljZo7qDh8u";
const maxTokens = 500;
const maxStorageMessage = 4;
const requiredAuthor = "Redwan"; // Required author name

if (!global.temp.openAIUsing)
    global.temp.openAIUsing = {};
if (!global.temp.openAIHistory)
    global.temp.openAIHistory = {};

const { openAIUsing, openAIHistory } = global.temp;

module.exports = {
    config: {
        name: "gpt",
        version: "1.0",
        author: "Redwan", //do not change author or the code won't work
        countDown: 5,
        role: 0,
        description: {
            vi: "GPT chat và tạo hình ảnh",
            en: "GPT chat and image creation"
        },
        category: "ai",
        guide: {
            vi: "{pn} <nội dung> - chat với gpt\n{pn} create a picture <prompt> - tạo hình ảnh",
            en: "{pn} <content> - chat with gpt\n{pn} create a picture <prompt> - create an image"
        }
    },

    langs: {
        vi: {
            apiKeyEmpty: "Vui lòng cung cấp api key cho openai tại file scripts/cmds/gpt.js",
            yourAreUsing: "Bạn đang sử dụng gpt, vui lòng chờ quay lại sau khi yêu cầu trước kết thúc",
            processingRequest: "Đang xử lý yêu cầu của bạn, quá trình này có thể mất vài phút, vui lòng chờ",
            invalidContent: "Vui lòng nhập nội dung bạn muốn chat hoặc vẽ",
            error: "Đã có lỗi xảy ra\n%1",
            addContent: "Vui lòng thêm nội dung.",
            replyWithNumber: "Vui lòng trả lời với số hình ảnh (1, 2, 3, 4) để nhận hình ảnh tương ứng với độ phân giải cao."
        },
        en: {
            apiKeyEmpty: "Please provide api key for openai at file scripts/cmds/gpt.js",
            yourAreUsing: "You are using gpt, please wait until the previous request ends",
            processingRequest: "Processing your request, this process may take a few minutes, please wait",
            invalidContent: "Please enter the content you want to chat or draw",
            error: "An error has occurred\n%1",
            addContent: "Please add some content.",
            replyWithNumber: "Please reply with the image number (1, 2, 3, 4) to get the corresponding image in high resolution."
        }
    },

    onStart: async function ({ api, event, args, message, getLang, prefix }) {
        if (this.config.author !== requiredAuthor) {
            return message.reply("Unauthorized author. The script will not run.");
        }

        if (!apiKey)
            return message.reply(getLang('apiKeyEmpty', prefix));

        if (!args[0])
            return message.reply(getLang('invalidContent'));

        const info = args.join(' ');
        if (info.startsWith('create a picture')) {
            const promptPart = info.replace('create a picture', '').trim();
            if (!promptPart) return message.reply(getLang('addContent'));

            return this.createImage(api, event, promptPart, message, getLang);
        } else {
            return this.handleGpt(event, message, args, getLang);
        }
    },

    onReply: async function ({ api, event, Reply, usersData, args, message, getLang }) {
        if (this.config.author !== requiredAuthor) {
            return message.reply("Unauthorized author. The script will not run.");
        }

        const { author, imageUrls } = Reply;

        if (event.senderID !== author) return;

        const reply = parseInt(args[0]);
        try {
            if (reply >= 1 && reply <= 4) {
                const img = imageUrls[`image${reply}`];
                message.reply({ attachment: await global.utils.getStreamFromURL(img) });
            } else {
                message.reply("❌ | Invalid number. Please try again.");
            }
        } catch (error) {
            console.error(error);
            message.reply(`${error}`, event.threadID);
        }
        await message.unsend(Reply.messageID);
    },

    handleGpt: async function (event, message, args, getLang) {
        if (this.config.author !== requiredAuthor) {
            return message.reply("Unauthorized author. The script will not run.");
        }

        try {
            openAIUsing[event.senderID] = true;

            if (!openAIHistory[event.senderID] || !Array.isArray(openAIHistory[event.senderID]))
                openAIHistory[event.senderID] = [];

            if (openAIHistory[event.senderID].length >= maxStorageMessage)
                openAIHistory[event.senderID].shift();

            openAIHistory[event.senderID].push({
                role: 'user',
                content: args.join(' ')
            });

            const response = await axios({
                url: "https://api.openai.com/v1/chat/completions",
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                data: {
                    model: "gpt-3.5-turbo",
                    messages: openAIHistory[event.senderID],
                    max_tokens: maxTokens,
                    temperature: 0.7
                }
            });

            const text = response.data.choices[0].message.content;
            openAIHistory[event.senderID].push({
                role: 'assistant',
                content: text
            });

            return message.reply(text, (err, info) => {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: 'gpt',
                    author: event.senderID,
                    messageID: info.messageID
                });
            });
        } catch (err) {
            const errorMessage = err.response?.data.error.message || err.message || "";
            return message.reply(getLang('error', errorMessage));
        } finally {
            delete openAIUsing[event.senderID];
        }
    },

    createImage: async function (api, event, prompt, message, getLang) {
        if (this.config.author !== requiredAuthor) {
            return message.reply("Unauthorized author. The script will not run.");
        }

        if (openAIUsing[event.senderID])
            return message.reply(getLang('yourAreUsing'));

        openAIUsing[event.senderID] = true;

        message.reply(getLang('processingRequest'), async (err, info) => {
            let ui = info.messageID;
            try {
                const modelParam = '9';  // Default model parameter
                const apiUrl = `https://turtle-apis.onrender.com/api/imagine?prompt=${encodeURIComponent(prompt)}&model=${modelParam}&key=b9d4442cc8168ddb0cc082d9b51252e7`;
                const response = await axios.get(apiUrl);
                const combinedImg = response.data.combinedImage;
                message.unsend(ui);
                message.reply({
                    body: getLang('replyWithNumber'),
                    attachment: await global.utils.getStreamFromURL(combinedImg)
                }, async (err, info) => {
                    global.GoatBot.onReply.set(info.messageID, {
                        commandName: this.config.name,
                        messageID: info.messageID,
                        author: event.senderID,
                        imageUrls: response.data.imageUrls
                    });
                });
            } catch (error) {
                console.error(error);
                message.reply(`${error}`, event.threadID);
            } finally {
                delete openAIUsing[event.senderID];
            }
        });
    }
};
