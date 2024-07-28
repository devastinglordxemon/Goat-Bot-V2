const fs = require("fs");
const fruitIcons = [
  "🍒", "🍊", "🍋", "🍇", "🍓", "🍍"
];

function getTopUsers(bankData, count) {
  const entries = Object.entries(bankData);

  return entries
    .sort((a, b) => b[1].bank - a[1].bank)
    .slice(0, count);
}

function getTotalMoney(topUsers) {
  let totalMoney = 0;
  for (const [userID, data] of topUsers) {
    totalMoney += data.bank;
  }
  return totalMoney;
}

function deductMoneyFromTopUsers(topUsers, amount) {
  const deductedUsers = [];
  for (const [userID, data] of topUsers) {
    if (amount <= 0) break;

    const deduction = Math.min(amount, data.bank);
    data.bank -= deduction;
    amount -= deduction;

    deductedUsers.push({
      userID,
      deduction,
    });
  }
  return deductedUsers;
}

module.exports = {
config: {
    name: "bank",
    version: "1.0",
    author: "Aryan Chauhan", //dont change my name
    countDown: 0,
    role: 0,
    shortDescription: {
      vi: "",
      en: "bank bot system"
    },
    longDescription: {
      vi: "",
      en: "bank ni lia"
    },
    category: "banking",
    guide: {
      vi: "",
      en: ""
    }
},

  onStart: async function ({ args, message, event, usersData, api }) {
    const { getPrefix } = global.utils;
  const p = getPrefix(event.threadID);
    const userMoney = await usersData.get(event.senderID, "money");
    const user = parseInt(event.senderID);
    const bankData = JSON.parse(fs.readFileSync("bank.json", "utf8"));
    const lianeBank = "🏦 𝗛𝗜𝗠𝗔 𝗕𝗔𝗡𝗞 🏦"; //do not change
    const getUserInfo = async (api, userID) => {
      try {
        const name = await api.getUserInfo(userID);
        return name[userID].firstName;
      } catch (error) {
        console.error(error);
      }
    };

    let { messageID, threadID, senderID } = event;
    const userName = await getUserInfo(api, senderID);

    if (!bankData[user]) {
       bankData[user] = { bank: 0, lastInterestClaimed: Date.now() };
      fs.writeFile("bank.json", JSON.stringify(bankData), (err) => {
        if (err) throw err;
      });
    }
 const command = args[0];
    const amount = parseInt(args[1]);
    const recipientUID = parseInt(args[2]);



  if (command === "richest") {
  let page = parseInt(args[1]);

  if (isNaN(page) || page <= 0) {
    page = 1; // Set the default page to 1 if not a valid number
  }

  const pageSize = 20;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  const entries = Object.entries(bankData);
  const totalEntries = entries.length;

  const topTen = entries
    .sort((a, b) => b[1].bank - a[1].bank)
    .slice(start, end);

  const messageText = `👑|𝗧𝗢𝗣 𝗥𝗜𝗖𝗛𝗘𝗦𝗧 𝗨𝗦𝗘𝗥𝗦 𝗟𝗜𝗦𝗧: \n\n${(await Promise.all(
    topTen.map(async ([userID, data], index) => {
      const userData = await usersData.get(userID);
      return `${index + start + 1}. 👑 𝗨𝗦𝗘𝗥𝗡𝗔𝗠𝗘:  ⬇️ \n    【 ${userData.name} 】\n🏦 𝗕𝗔𝗡𝗞 𝗕𝗔𝗟𝗔𝗡𝗖𝗘: ⬇️ \n    【 $${data.bank} 】`;
    })
  )).join("\n\n")}`;

  const totalPages = Math.ceil(totalEntries / pageSize);
  const currentPage = Math.min(page, totalPages);

  const nextPage = currentPage + 1;
  const nextPageMessage = nextPage <= totalPages ? `⦿ Type bank richest ${nextPage} to view the next page.\n` : "";
  const pageInfo = `page ${currentPage}/${totalPages}`;

  return message.reply(`${messageText}\n\n${nextPageMessage}${pageInfo}`);
}


    if (command === "deposit") {
      if (isNaN(amount) || amount <= 0) {
        return message.reply(`${lianeBank}\n\n✧ Hello ${userName}! Please enter the amount you wish to deposit in the bank.\n\nMore Options:\n⦿ Balance`);
      }
      if (userMoney < amount) {
        return message.reply(`${lianeBank}\n\n✧ Hello ${userName}, The amount you wished is greater than your balance.\n\nMore Options:\n⦿ Balance`);
      }

      bankData[user].bank += amount;
      await usersData.set(event.senderID, {
        money: userMoney - amount
      });

      fs.writeFile("bank.json", JSON.stringify(bankData), (err) => {
        if (err) throw err;
      });
      return message.reply(`${lianeBank}\n\n✧ Congratulations ${userName}! ${amount}💵 has been deposited into your bank account.\n\nMore Options:\n⦿ Balance\n⦿ Bank Balance\n⦿ Bank Interest\n⦿ Bank Transfer`);
    } else if (command === "withdraw") {
      const balance = bankData[user].bank || 0;

      if (isNaN(amount) || amount <= 0) {
        return message.reply(`${lianeBank}\n\n✧ Hello ${userName}! Please enter the amount you wish to withdraw from the bank.\n\nMore Options:\n⦿ Bank Balance\n⦿ Balance\n⦿ Bank Interest`);
      }
      if (amount > balance) {
        return message.reply(`${lianeBank}\n\n✧ Hello ${userName}, the amount you wished is greater than your bank balance.\n\nMore Options:\n⦿ Bank Balance`);
      }
      bankData[user].bank = balance - amount;
      const userMoney = await usersData.get(event.senderID, "money");
      await usersData.set(event.senderID, {
        money: userMoney + amount
      });
      fs.writeFile("bank.json", JSON.stringify(bankData), (err) => {
        if (err) throw err;
      });
      return message.reply(`${lianeBank}\n\n✧ Congratulations ${userName}! ${amount}💵 has been succesfully withdrawn from your bank account. Use it wisely! \n\nMore Options:\n⦿ Balance\n⦿ Bank Balance`);
    } else if (command === "dice") {
  // Simulate rolling a dice with numbers from 1 to 6
  const userDice = Math.floor(Math.random() * 6) + 1;
  const cassidyBotDice = Math.floor(Math.random() * 6) + 1;

  // Map dice roll results to their respective emojis
  const diceEmojis = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
  const userDiceEmoji = diceEmojis[userDice - 1];
  const cassidyBotDiceEmoji = diceEmojis[cassidyBotDice - 1];

  // Determine the outcome
  let outcomeMessage = `You got: ${userDiceEmoji}\nCassidy bot got: ${cassidyBotDiceEmoji}\n\n`;

  if (userDice > cassidyBotDice) {
    outcomeMessage += `Congratulations! You won $100 with a result of ${userDice}.`;
    bankData[user].bank += 100;
  } else if (userDice < cassidyBotDice) {
    outcomeMessage += `Cassidy bot won $100 with a result of ${cassidyBotDice}.`;
    bankData[user].bank -= 100;
  } else {
    outcomeMessage += `It's a tie! No money exchanged.`;
  }

  fs.writeFile("bank.json", JSON.stringify(bankData), (err) => {
    if (err) throw err;
  });

  return message.reply(`${lianeBank}\n\n✧ Let's roll the dice!\n\n${outcomeMessage}`);

} else if (command === "heist") {
  const lastHeistTime = bankData[user].lastHeistTime || 0;
  const cooldown = 0 * 5 * 60 * 1000; // 24 hours cooldown
  const userMoney = await usersData.get(event.senderID, "money"); // 


  if (args[1] === "confirm") {

    if (Date.now() - lastHeistTime < cooldown) {
      const remainingTime = cooldown - (Date.now() - lastHeistTime);
      const hours = Math.floor(remainingTime / (60 * 60 * 1000));
      const minutes = Math.ceil((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
      const userMoney = await usersData.get(event.senderID, "money");

      return message.reply(`${lianeBank}\n\n✧ Sorry ${userName}, you need to wait ${hours} hours and ${minutes} minutes before starting another heist.`);
    }

    // Calculate the amount to steal (random between 1000 and 5000)
    const amountToSteal = Math.floor(Math.random() * (500 - 100 + 1)) + 100;

    // Check if the user is successful in the heist
    const successRate = Math.random();
    if (successRate < 0.7) {
      // Failed heist
      const loanAmount = (bankData[user].bank + amountToSteal) * 0.2;
      const userMoney = await usersData.get(event.senderID, "money");


      bankData[user].loan += loanAmount;
      await usersData.set(event.senderID, {
        money: userMoney - loanAmount,
      });
      return message.reply(`${lianeBank}\n\n✧ Oops you got caught, ${userName}! Your bank heist was unsuccessful. You couldn't steal anything this time. However, 10% of the total heist amount has been added to your bank loan, ${loanAmount} has been deducted from your balance and bank balance`);
    }

    // Successful heist
    const userMoney = await usersData.get(event.senderID, "money");
    const topUsers = getTopUsers(bankData, 5); // Implement a function to get the top 5 users
    const totalMoneyToDeduct = Math.floor(Math.random() * (0.1 * getTotalMoney(topUsers)));
    const deductedUsers = deductMoneyFromTopUsers(topUsers, totalMoneyToDeduct);
    const winAmount = Math.floor(Math.random() * (0.1 * getTotalMoney(topUsers)));

    bankData[user].bank += amountToSteal;
    await usersData.set(event.senderID, {
      money: userMoney + winAmount,
    });
    bankData[user].lastHeistTime = Date.now();

    // Prepare a message about the deducted money from top users
    let deductedUsersMessage = "Money deducted from the top 1-5 users:\n";
    for (const { userID, deduction } of deductedUsers) {
      const deductedUserName = await getUserInfo(api, userID);
      deductedUsersMessage += `${deductedUserName}: ${deduction}💵\n`;
    }

    fs.writeFile("bank.json", JSON.stringify(bankData), (err) => {
      if (err) throw err;
    });

    return message.reply(`${lianeBank}\n\n✧ Congratulations, ${userName}! You successfully completed a bank heist and stole ${amountToSteal}💵. You also won ${winAmount}💵.\n\n${deductedUsersMessage}`);
  } else {
    // User wants to start a heist, provide information about the heist
    return message.reply(`${lianeBank}\n\n✧ Welcome, ${userName}! You are about to start a bank heist. Here's what you need to know:\n\n✧ If you win, you can steal a random amount between 1000 and 5000💵 from the bank, and you have a 35% chance of winning.\n\n✧ If you lose, 10% of the total heist amount will be added to your bank loan, regardless of the bank loan limit. There is a chance that you will lost all your cash and got negative cash! Proceed with caution. To confirm the heist, use the command "bank heist confirm".`);
  }

} else if (command === "check") {
  const userIDToCheck = parseInt(args[1]);

  if (isNaN(userIDToCheck)) {
    return message.reply(`${lianeBank}\n\n✧ Hello ${userName}! Please provide a valid user ID to check their bank balance.`);
  }

  if (bankData[userIDToCheck]) {
    const userBankBalance = bankData[userIDToCheck].bank || 0;
    const userDataToCheck = await usersData.get(userIDToCheck);
    const userNameToCheck = userDataToCheck.name;
    return message.reply(`${lianeBank}\n\n✧ User: ${userNameToCheck}\n✧ Bank Balance: ${userBankBalance}💵`);
  } else {
    return message.reply(`${lianeBank}\n\n✧ User with UID ${userIDToCheck} does not have a bank account.`);
  }

} else if (command === "balance") {

      const balance = bankData[user].bank !== undefined && !isNaN(bankData[user].bank) ? bankData[user].bank :0;

  return message.reply(`${lianeBank}\n\n✧ Greetings ${userName}!, Your bank account balance is ${balance}💵\n\n⦿ To earn interest. Type bank interest.\n\n⦿ To loan, Type bank loan <amount>`);

} else if (command === "bet") {
  // Check if a valid bet amount is specified
  const betAmount = parseInt(args[1]);
  if (isNaN(betAmount) || betAmount <= 0) {
    return message.reply(`${lianeBank}\n\n✧ Please enter a valid bet amount. You need to withdraw your bank balance first to use your bank balance as the bet.`);
  }

  // Check if the user has enough balance for the bet
  if (userMoney < betAmount) {
    return message.reply(`${lianeBank}\n\n✧ You don't have enough balance for this bet. Try to withdraw your bank balance.`);
  }

  // Randomly select three fruit icons
  const slotResults = [];
  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * fruitIcons.length);
    slotResults.push(fruitIcons[randomIndex]);
  }

  // Check for winning combinations
  let winnings = 0;
  if (slotResults[0] === slotResults[1] && slotResults[1] === slotResults[2]) {
    // All three fruits are the same
    winnings = betAmount * 3;
  } else if (slotResults[0] === slotResults[1] || slotResults[1] === slotResults[2] || slotResults[0] === slotResults[2]) {
    // Two fruits are the same
    winnings = betAmount * 2;
  }

  // Update the user's balance
  if (winnings > 0) {
    await usersData.set(event.senderID, {
      money: userMoney + winnings,
    });
  } else {
    await usersData.set(event.senderID, {
      money: userMoney - betAmount,
    });
  }

  // Generate the response message with fruit icons
  const slotResultText = slotResults.join(" ");
  const outcomeMessage = winnings > 0 ? `Congratulations! You won ${winnings}💵.` : `You lost ${betAmount}💵.`;
  const responseMessage = `${lianeBank}\n\n ${slotResultText}\n\n✧ ${outcomeMessage}`;

  return message.reply(responseMessage);

} else if (command === "interest") {

  const interestRate = 0.0001; 

  const lastInterestClaimed = bankData[user].lastInterestClaimed || Date.now();

  const currentTime = Date.now();

  const timeDiffInSeconds = (currentTime - lastInterestClaimed) / 1000;


  const interestEarned = bankData[user].bank * (interestRate / 365) * timeDiffInSeconds;


bankData[user].lastInterestClaimed = currentTime;

  bankData[user].bank += interestEarned;



  fs.writeFile("bank.json", JSON.stringify(bankData), (err) => {

    if (err) throw err;

  });
  return message.reply(`${lianeBank}\n\n✧ Congratulations ${userName}! You earned ${interestEarned.toFixed(2)}💵 of interest. It is successfully added into your bank balance.`);
        } else if (command === "transfer") {

  const balance = bankData[user].bank || 0;
  if (isNaN(amount) || amount <= 0) {
    return message.reply(`${lianeBank}\n\n✧ Hello ${userName}! Please enter the amount and the recipient ID of the user.\n\nMore Options:\n⦿ Bank Balance\n⦿ Balance\n⦿ UID`);
  }
  if (balance < amount) {
    return message.reply(`${lianeBank}\n\n✧ Sorry ${userName}, The amount you want to transfer is greater than your bank balance.\n\nMore Options:\n⦿ Bank Balance\n⦿ Balance`);
  }
  if (isNaN(recipientUID)) {
    return message.reply(`${lianeBank}\n\n✧ Hello ${userName}, Please enter the correct recipient ID.\n\nMore Options:\n⦿ Bank Balance\n⦿ Balance\n⦿ UID`);
  }
  if (!bankData[recipientUID]) {
    bankData[recipientUID] = { bank: 0, lastInterestClaimed: Date.now() };
    fs.writeFile("bank.json", JSON.stringify(bankData), (err) => {
      if (err) throw err;
    });
  }
  bankData[user].bank -= amount;
  bankData[recipientUID].bank += amount;
  fs.writeFile("bank.json", JSON.stringify(bankData), (err) => {
    if (err) throw err;
  });
  return message.reply(`${lianeBank}\n\n✧ Greetings [ ${userName}! ] The amount you wished has been successfully transfered!\n\n✧ 𝗔𝗠𝗔𝗨𝗡𝗧: ➡️ 【 ${amount}💵 】\n𝗥𝗘𝗖𝗜𝗣𝗜𝗘𝗡𝗧 𝗨𝗜𝗗: ⬇️ \n【 ${recipientUID} 】\n\n✧ HIMA BANK TRANSACTION ✅`);
    } else if (command === "loan") {
 if (isNaN(amount) || amount <= 0) {
 return message.reply(`${lianeBank}\n\n✧ Hello ${userName}! Please enter the amount you wished to borrow.\n\nMore Options:\n⦿ Bank Balance\n⦿ Balance`);
 }
 if (bankData[user].loan > 0) {
 return message.reply(`${lianeBank}\n\n✧ Sorry ${userName} but you already had existing loan.\n\nMore Options:\n⦿ Bank Payloan\n⦿ Bank Balance`);
 }
 if (amount > 1000000) {
 return message.reply(`${lianeBank}\n\n✧ Sorry ${userName}, The maximum loan amount is 1000000.\n\nMore Options:\n⦿ Bank Payloan\n⦿ Bank Balance`);
 }
 bankData[user].loan = amount;
 bankData[user].loanDueDate = Date.now() + 7 * 24 * 60 * 60 * 1000; // due date after 1 week
 bankData[user].bank += amount;
 await usersData.set(event.senderID, {
 money: userMoney + amount
 });
 fs.writeFile("bank.json", JSON.stringify(bankData), (err) => {
 if (err) throw err;
 });
 return message.reply(`${lianeBank}\n\n✧ Hello ${userName}, You have successfully borrowed ${amount}💵, The loan amount will be deducted from your bank account balance after 1 week .\n\nMore Options:\n⦿ Bank Payloan\n⦿ Bank Balance`);
} else if (command === "payloan") {
 const loan = bankData[user].loan || 0;
 const loanDueDate = bankData[user].loanDueDate || 0;

 if (loan <= 0 || loanDueDate <= 0) {
 return message.reply(`${lianeBank}\n\n✧ Sorry ${userName}, You do not have existing loan.\n\nMore Options:\n⦿ Bank Balance\n⦿ Balance`);
 }
 const daysLate = Math.ceil((Date.now() - loanDueDate) / (24 * 60 * 60 * 1000));
 const interestRate = 0.002; // 0.01% per day
 const interest = loan * interestRate * daysLate;
 const totalAmountDue = loan + interest;


 if (isNaN(amount) || amount <= 0) {
 return message.reply(`${lianeBank}\n\n✧ Welcome back ${userName}! Please enter the amount you wished to pay. The total amount due is ${totalAmountDue}💵.\n\nMore Options:\n⦿ Bank Balance\n⦿ Balance`);
 }
 if (amount > userMoney) {
 return message.reply(`${lianeBank}\n\n✧ Sorry ${userName}, You do not have enough money to pay the existing loan.\n\nMore Options:\n⦿ Bank Balance\n⦿ Balance`);
 }
 if (amount < totalAmountDue) {
 return message.reply(`${lianeBank}\n\n✧ Sorry ${userName}, The amount you entered is less then the total amount due which is ${totalAmountDue}💵.\n\nMore Options:\n⦿ Bank Balance\n⦿ Bank Payloan`);
 }
 bankData[user].loan = 0;
 bankData[user].loanDueDate = 0;
 bankData[user].bank -= loan;
 await usersData.set(event.senderID, {
 money: userMoney - amount
 });
 fs.writeFile("bank.json", JSON.stringify(bankData), (err) => {
 if (err) throw err;
 });
 return message.reply(`${lianeBank}\n\n✧ Congatulations ${userName}, You have paid your loan of ${loan}💵 plus interest of ${interest.toFixed(2)} $. The total amount paid is ${totalAmountDue}💵.\n\nMore Options:\n⦿ Bank Balance\n⦿ Bank Loan`);
} else {
 return message.reply(`${lianeBank}\n💼 Welcome 💼\n
💰 Greetings, esteemed ${userName}! 💰 Please select from a range of bespoke financial services offered by our institution. 💼\n\n💳【 𝗯𝗮𝗻𝗸 𝗯𝗮𝗹𝗮𝗻𝗰𝗲 】 - Ascertain the current standing of your bank account 💳\n\n💸 【 𝗯𝗮𝗻𝗸 𝗱𝗲𝗽𝗼𝘀𝗶𝘁 】 - Transfer funds from your wallet to your bank account 🏦\n\n💳 【 𝗯𝗮𝗻𝗸 𝘄𝗶𝘁𝗵𝗱𝗿𝗮𝘄 】 - Retrieve money from your bank account 💵\n\n💹 【 𝗯𝗮𝗻𝗸 𝗶𝗻𝘁𝗲𝗿𝗲𝘀𝘁 】 - Explore our innovative bank interest system 💹\n\n💸 【 𝗯𝗮𝗻𝗸 𝘁𝗿𝗮𝗻𝘀𝗳𝗲𝗿 】 - Seamlessly send money to another account 📤\n\n💰 【 𝗯𝗮𝗻𝗸 𝗹𝗼𝗮𝗻 】 - Access our exclusive bank loans 💰\n\n👑 【 𝗯𝗮𝗻𝗸 𝗿𝗶𝗰𝗵𝗲𝘀𝘁  】 - Discover the Bank richest users 👑\n\n💰 【 𝗯𝗮𝗻𝗸 𝗵𝗶𝗲𝘀𝘁 】 - (This option is for informational purposes only and not to be exercised) 🛡\n\n🎰 【 𝗯𝗮𝗻𝗸 𝗯𝗲𝘁 】 - A chance to multiply your fortune with our slot system 🎰\n\n🎲 【 𝗯𝗮𝗻𝗸 𝗱𝗶𝗰𝗲 】- Embrace the thrill of our dice-based banking system 🎲\n\n💸 【 𝗯𝗮𝗻𝗸 𝗰𝗵𝗲𝗰𝗸 】 - Verify the account balances of other banks 💸`);
} 
}
}
