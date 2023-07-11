const { Client, Intents } = require('discord.js');
const client = new Client({ intents: Object.keys(Intents.FLAGS) });
const dotenv = require('dotenv');
const selectPersonService = require('./selectPersonService.js');
const check = require('./check.js')

// エラーメッセージ
const errorCheckMsg = '入力値がおかしいです。 「メンション 数字」で連絡ください。';
const errorOverChannelJoin = '指定した抽選人数がチャンネル参加人数を超えています。';


dotenv.config();

// 起動時処理実装部
client.on('ready', async () => {
  // TODO: スラッシュコマンドの実装
  // スラッシュコマンドの設定値
  // const data  = [{
  //   name: '1d6',
  //   description: '6面ダイスを1回振ります。',
  // },
  // {
  //   name: '2d6',
  //   description: '6面ダイスを2回振ります。',
  // }];
  // const data = [{
  //   name: '1',
  //   description: '一人選びます'
  // },
  // {
  //   name: 'error',
  //   description: 'エラーになる奴'
  // }]
  // await client.application.commands.set(data, process.env.SERVER_ID);
  console.log(`${client.user.tag} でログインしています。`)
});

// メッセージ受取実装部
client.on('messageCreate', async msg => {
  // チャンネルに !ping って打たれたら速攻で Pong! を返す。
  if (msg.content === '!ping') {
    msg.channel.send('Pong!')
  }

  // Botに対してメンションが張られた際に動く
  if (msg.mentions.users.has(process.env.SELECT_PERSON_BOTID)) {
    let result;
    console.log(msg.content);
    // msg.content の内容が「"BotID" "メッセージ"」のため、メッセージだけ取り出す
    const splitMsg = msg.content.split(' ');
    console.log('splitMsg-> ' + splitMsg);

    // 引数必須チェック
    if (splitMsg.length >= 2) {
      const inputDrawingCount = splitMsg[1]; // 抽選人数
      console.log('抽選人数-> ' + inputDrawingCount);

      // メッセージを送ったメンバーが参加しているボイスチャンネルのメンバー一覧取得
      let voiceChannel = msg.member.voice.channel;
      let members = voiceChannel.members;
      let allMemberSize = members.size;
      console.log("voice all member size -> " + allMemberSize);

      // 引数の有効性チェック
      if (check.isCheckInput(inputDrawingCount)) {
        let drawingCount = Number(inputDrawingCount);

        // 引数がチャンネル参加人数を超えてないかチェック
        if (check.isCheckChannelCount(inputDrawingCount, allMemberSize)) {

          // 抽選
          let drawingResultArray = new Array();
          for (let index = 0; index < drawingCount; index++) {
            let drawingFlag = true;
            while (drawingFlag) {
              let drawingNum = selectPersonService.randomNum(allMemberSize);
              if (!drawingResultArray.includes(drawingNum)) {
                drawingResultArray.push(drawingNum);
                drawingFlag = false;
              }
            }
          }

          let drawingNo2NameArray = drawingResultArray.map(y => members.at(y).displayName); // 抽選結果名前変換配列
          console.log('drawingNo2NameArray-> ' + drawingNo2NameArray);

          result = drawingNo2NameArray.join(" & ");
          console.log(result);
        } else {
          result = errorOverChannelJoin;
        }
      } else {
        result = errorCheckMsg;
      }

    } else {
      result = errorCheckMsg;
    }

    msg.reply(result);

  }
});

// TODO: スラッシュコマンドの実装
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