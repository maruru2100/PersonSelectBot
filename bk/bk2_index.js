const { Client, Intents } = require('discord.js');
const client = new Client({ intents: Object.keys(Intents.FLAGS) });
const dotenv = require('dotenv');
const selectPersonService = require('../selectPersonService.js');
const check = require('../check.js')
const errorCheckMsg = '入力値がおかしいです。 「メンション 数字」で連絡ください。';
const check_OK = '0';
const inputCheck_number_NG = '1';
const inputCheck_specification_NG = '2';


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
    console.log(msg.content);
    // msg.content の内容が「"ID" "メッセージ"」のため、メッセージだけ取り出す
    const splitMsg = msg.content.split(' ');
    console.log('splitMsg-> ' + splitMsg);
    const inputDrawingCount = splitMsg[1]; // 抽選人数
    console.log('抽選人数-> ' + drawingCount);

    // メッセージを送ったテキストチャンネル内のメンバー一覧を取得
    // let members = msg.channel.members; // メンバー一覧(Collection)
    // let allMemberSize = members.size; // メンバー全体人数

    // メッセージを送ったメンバーが参加しているボイスチャンネルのメンバー一覧取得
    let voiceChannel = msg.member.voice.channel;
    let members = voiceChannel.members;
    let allMemberSize = members.size;

    let checkResult = check_OK;

    // 引数チェック
    if (!check.isCheckInput(inputDrawingCount)) {
      checkResult = inputCheck_number_NG;
    }

    let drawingCount = Number(inputDrawingCount);

    if (!check.isCheckChannelCount(drawingCount, allMemberSize)) {
      checkResult = inputCheck_specification_NG;
    }

    switch (checkResult) {
      case inputCheck_number_NG:
        console.log("引数が数字じゃない。");
        msg.reply(errorCheckMsg);
        break;

      case inputCheck_specification_NG:
        console.log("引数が参加人数を超えてる。");
        msg.reply("引数が参加人数を超えてる。");
        break;

      case check_OK:
        console.log("引数チェックOK");
        // 抽選
        let drawingResultArray = new Array();
        for (let index = 0; index < drawingCount; index++) {
          drawingResultArray.push(selectPersonService.randomNum(allMemberSize));
        }

        let drawingNo2NameArray = drawingResultArray.map(x => x.map(y => members.at(y).displayName)); // 抽選結果名前変換配列
        console.log('drawingNo2NameArray-> ' + drawingNo2NameArray);


        let results = drawingNo2NameArray.map(x => x.join(' & '));
        console.log(results);

        for (const result of results) {
          console.log(result);
          msg.reply(result);
        }
        break;

      default:
        console.log("違う値が入ってるんだが、、-> " + checkResult);
    }


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