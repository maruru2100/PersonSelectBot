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
  // チャンネルに !ping って打たれたら速攻で Pong! を返す。
  if (msg.content === '!ping') {
    msg.channel.send('Pong!')
  }

  // Botに対してメンションが張られた際に動く
  if (msg.mentions.users.has(process.env.SELECT_PERSON_BOTID)) {
    console.log(msg.content);
    // msg.content の内容が「"ID" "メッセージ"」のため、メッセージだけ取り出す
    let splitMsg = msg.content.split(' ');
    console.log('splitMsg-> ' + splitMsg);
    let drawingSetNumber = splitMsg[1]; // 抽選組数
    let members = msg.channel.members; // メンバー一覧(Collection)
    let allMemberSize = members.size; // メンバー全体人数
    let drawingResultArray = []; // 抽選結果配列

    // 全体抽選繰り返し処理
    for (let index = 0; index < drawingSetNumber; index++) {
      const drawingCount = allMemberSize / drawingSetNumber;
      console.log('抽選組数-> ' + drawingSetNumber);
      console.log('抽選数-> ' + drawingCount);
      let drawingResultNumArray = []; // 抽選結果番号の定義
      console.log('arrsize -> ' + drawingResultNumArray.length);

      // 各組の抽選
      while (drawingCount > drawingResultNumArray.length) {
        console.log('抽選結果サイズ -> ' + drawingResultNumArray.length);
        let drawingNo = selectPerson.randomNum(allMemberSize);
        if (drawingResultNumArray.some(item => item === drawingNo) || drawingResultArray.flat().some(item => item === drawingNo)) {
          continue;
        } else {
          drawingResultNumArray.push(drawingNo);
        }
      }
      console.log(index + '回目抽選-> ' + drawingResultNumArray);
      // let drawingNo2NameArray = drawingResultNumArray.map(x => members.at(x).displayName); // 抽選結果名前変換配列
      if (drawingResultArray.some(item => JSON.stringify(item.sort()) == JSON.stringify(drawingResultNumArray.sort()))) {
        continue;
      } else {
        drawingResultArray.push(drawingResultNumArray);
      }
    }

    // TODO: x=> のところが本来配列なのに考慮されてない。
    let drawingNo2NameArray = drawingResultArray.map(x => members.at(x).displayName); // 抽選結果名前変換配列
    console.log('drawingNo2NameArray-> ' + drawingNo2NameArray);


    let results = drawingNo2NameArray.map(x => x.join(' VS '));
    console.log(results);

    for (const result of results) {
      console.log(result);
      msg.reply(result)
    }
    // let drawnMemberNumber = selectPerson.randomNum(allMemberSize);
    // let results = members.at(drawnMemberNumber).displayName;
    // console.log(results);
    // msg.reply(results);


    // for (let index = 0; index < allMemberSize; index++) {
    //   console.log('処理総数' + allMemberSize);
    //   console.log('処理index->' + index);
    //   let displayName = members.at(index).displayName
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