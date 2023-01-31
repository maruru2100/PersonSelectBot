const { Client, Intents } = require('discord.js');
const client = new Client({ intents: Object.keys(Intents.FLAGS) });
const dotenv = require('dotenv');
const selectPerson = require('./selectPerson.js');
const errorCheckMsg = '入力値がおかしい';


dotenv.config();

// 起動時処理実装部
client.on('ready', async () => {
  //スラッシュコマンドの設定値
  // const data  = [{
  //   name: '1d6',
  //   description: '6面ダイスを1回振ります。',
  // },
  // {
  //   name: '2d6',
  //   description: '6面ダイスを2回振ります。',
  // }];
  // await client.application.commands.set(data, process.env.SERVER_ID);
  console.log(`${client.user.tag} でログインしています。`)
});

// メッセージ受取実装部
client.on('messageCreate', async msg => {
  if (msg.content === '!ping') {
    msg.channel.send('Pong!')
  }
  if (msg.mentions.users.has(process.env.SELECT_PERSON_BOTID)) {
    console.log(msg.content);
    // msg.content の内容が「"ID" "メッセージ"」のため、メッセージだけ取り出す
    let splitMsg = msg.content.split(' ');
    let allMemberSize = msg.channel.members.size;
    let selectMemberNum = selectPerson.randomNum(allMemberSize);
    let results = msg.channel.members.at(selectMemberNum).displayName;
    console.log(results);
    msg.reply(results);
    // for (let index = 0; index < allMemberSize; index++) {
    //   console.log('処理総数' + allMemberSize);
    //   console.log('処理index->' + index);
    //   let displayName = msg.channel.members.at(index).displayName
    //   msg.reply('index= '+ index + '->' + displayName);
    // }
  }
});

// スラッシュコマンド実装部
// client.on("interactionCreate", async (interaction) => {
//   if (!interaction.isCommand()) {
//       return;
//   }
//   if (interaction.commandName === command1d6) {
//     let results = dice.roleDice(command1d6)
//       await interaction.reply(results);
//   } else if (interaction.commandName === command2d6) {
//     let results = dice.roleDice(command2d6)
//     await interaction.reply(results);
//   }
// });

client.login(process.env.DISCORD_TOKEN);