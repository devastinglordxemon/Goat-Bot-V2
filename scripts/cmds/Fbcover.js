const axios = require('axios');
const fs = require('fs');

module.exports = {
  config: {
    name: "fbcover",
    aliases: ['fbc3'],
    version: "2.1",
    author: "ArYAN",
    shortDescription: "Create a custom Facebook Cover photo",
    longDescription: "Create a custom Facebook Cover photo based on user-provided information.",
    category: "cover",
    guide: {
      en: "Create a custom Facebook cover photo by providing specific information such as birthday, love, location, hometown, name, followers, and gender separated by dashes (-).\n\nExample usage:\n$p}fbcover 24-02-2009 | divorced  | Bangladesh | Rangpur  | Red wan | 99999999 | male"
    }
  },

  onStart: async function ({ message, args, event, api, getLang }) {
    try {
      const info = args.join(" ");

      if (!info) {
        await api.sendMessage("ℹ️ | Please provide the required information.\n\nFor Example:\n$p}fbcover3 05-01-2008 | Single | India | Himachal Pradesh | Aryan Chauhan | 99999999 | male", event.threadID, event.messageID);
        return;
      }

      let uid;
      if (event.type === 'message_reply') {
        uid = event.messageReply.senderID;
      } else {
        uid = Object.keys(event.mentions)[0] || event.senderID;
      }

      const loadingMessage = await api.sendMessage("🖼️ | Creating Your Facebook Cover...", event.threadID, event.messageID);

      const [birthday = "DefaultName", love = "DefaultName", location = "DefaultAddress", hometown = "DefaultName", name = "DefaultName", followers = "DefaultSubname", gender = "DefaultNumber"] = info.split("|").map(item => item.trim());

      const baseURL = `https://global-sprak.onrender.com/canvas/fbcover3?uid=${uid}&birthday=${birthday}&love=${love}&location=${location}&hometown=${hometown}&name=${name}&followers=${followers}&gender=${gender}`;

      const response = await axios.get(baseURL, { responseType: 'stream' });

      const attachmentPath = './temp/uptime_${event.senderID}.png'; 

      const writer = fs.createWriteStream(attachmentPath);
      response.data.pipe(writer);

      writer.on('finish', async () => {
        const form = {
          body: "📒 𝗙𝗕 𝗖𝗼𝘃𝗲𝗿\n━━━━━━━━━━━━━\n\nHere is your Facebook Cover.",
          attachment: fs.createReadStream(attachmentPath)
        };

        const completionMessage = await api.sendMessage(form, event.threadID, event.messageID);

        if (loadingMessage && loadingMessage.messageID) {
          await api.unsendMessage(loadingMessage.messageID);
        }

        fs.unlinkSync(attachmentPath);
      });

    } catch (error) {
      console.error('Error:', error);
      let errorMessage = "❌ | An error occurred while processing your request. Please try again later.";
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = "❌ | The requested resource was not found.";
        } else if (error.response.status === 401) {
          errorMessage = "❌ | Unauthorized access. Please check your credentials.";
        } else if (error.response.data && error.response.data.error && error.response.data.error.message) {
          errorMessage = `⚠️ | Server error details:\n\n${error.response.data.error.message}`;
        }
      }
      await api.sendMessage(errorMessage, event.threadID, event.messageID);
    }
  }
};
