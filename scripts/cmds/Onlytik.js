const fetch = require('node-fetch');

async function g() {
    try {
        const r = await fetch('https://onlytik.com/api/new-videos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ limit: 10 })
        });

        if (!r.ok) {
            throw new Error('Network response was not ok');
        }

        const b = await r.json();

        if (!Array.isArray(b) || b.length === 0) {
            throw new Error('Unexpected response format or empty array');
        }

        const selectedVideos = [];
        const selectedIndexes = new Set();

        while (selectedVideos.length < 4 && selectedIndexes.size < b.length) {
            const i = Math.floor(Math.random() * b.length);
            if (!selectedIndexes.has(i)) {
                selectedIndexes.add(i);
                selectedVideos.push({
                    url: b[i].url,
                    likes: b[i].likes
                });
            }
        }

        if (selectedVideos.length < 4) {
            throw new Error('Not enough videos available');
        }

        return selectedVideos;

    } catch (e) {
        console.error('Error fetching videos:', e);
        throw e;
    }
}

function checkAuthor(author) {
    const allowedAuthors = ["Redwan"];
    return allowedAuthors.includes(author);
}

module.exports = {
    config: {
        name: "onlytik",
        aliases: ["sexvid"],
        version: "1.0",
        author: "Redwan",
        role: 0,
        shortDescription: "Get 4 OnlyTik videos",
        longDescription: "Fetches 4 OnlyTik videos",
        category: "media",
        guide: {
            en: "{pn}"
        }
    },

    onStart: async function ({ message }) {
        if (!checkAuthor(this.config.author)) {
            return message.reply("Unauthorized author.");
        }

        try {
            const videos = await g();

            const attachments = [];
            for (const video of videos) {
                const stream = await global.utils.getStreamFromURL(video.url);
                if (stream) {
                    attachments.push({
                        body: `Here's an OnlyTik video with ${video.likes} likes:`,
                        attachment: stream
                    });
                }
            }

            if (attachments.length === 0) {
                return message.reply("Failed to retrieve the videos. Please try again.");
            }

            for (const attachment of attachments) {
                await message.reply(attachment);
            }

        } catch (e) {
            console.error("Error fetching or sending the videos:", e);
            return message.reply("An error occurred while fetching the videos. Please try again later.");
        }
    }
};
