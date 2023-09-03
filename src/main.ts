import { Message, Client, GuildMember, Activity, Collection } from 'discord.js'
import dotenv from 'dotenv'
import {isCheckInput, isCheckChannelCount} from './check'
import { ActivityTypes } from 'discord.js/typings/enums';
import { log } from 'console';

// エラーメッセージ
const errorCheckMsg = '入力値がおかしいです。 「メンション 数字」で連絡ください。';
const errorOverChannelJoin = '指定した抽選人数がVoiceVhannel内の同アクティビティ人数を超えています。';


dotenv.config()

const client = new Client({
    intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'DIRECT_MESSAGES', 'MESSAGE_CONTENT', 'GUILD_PRESENCES'],
})

client.once('ready', () => {
    console.log('Ready!')
    if (client.user) {
        console.log(client.user.tag + 'でログインしています')
    }
})

client.on('messageCreate', async (msg: Message) => {
    if (msg.author.bot) return
    if (msg.content.startsWith('!ping')) {
        msg.channel.send('Pong!')
    }
    // Botに対してメンションが張られた際に動く
    if (msg.mentions.users.has(process.env.SELECT_PERSON_BOTID ?? "")) {
        let result;
        console.log(msg.content);
        // msg.content の内容が「"BotID" "メッセージ"」のため、メッセージだけ取り出す
        const splitMsg = msg.content.split(' ');
        console.log('splitMsg-> ' + splitMsg);

        // 引数必須チェック
        if (splitMsg.length >= 2) {
            const inputDrawingCount = splitMsg[1]; // 抽選人数
            console.log('抽選人数-> ' + inputDrawingCount);

            const runMember = msg.member;
            if (!runMember) {
                console.log('runMemberが null です。');
                return;
            }
            console.log('runMember -> ' + runMember.displayName);
            

            // メッセージを送ったメンバーが参加しているボイスチャンネルのメンバー一覧取得
            let voiceChannel = runMember.voice.channel;
            if (!voiceChannel) {
                console.log('voiceChannelが null です。');
                return;
            }
            let members = voiceChannel.members;
            let allMemberSize = members.size;
            console.log("voice all member size -> " + allMemberSize);

            // メッセージを送ったメンバーのアクティビティを取得
            const runMemberActivity = selectPersonService.getMemberActivity(runMember);
            console.log('起動メンバーのアクティビティ: ' + runMemberActivity);
            if (runMemberActivity == null) {
                console.log('runMemberActivity が' + runMemberActivity + 'です');
            }

            // 引数の有効性チェック
            if (isCheckInput(inputDrawingCount)) {
                let drawingCount = Number(inputDrawingCount);


                const sameActMemList = selectPersonService.selectSameActMemList(members, runMemberActivity);
                console.log('抽選されるメンバー数： ' + sameActMemList.length);
                for (let index = 0; index < sameActMemList.length; index++) {
                    const sameActMem = sameActMemList[index];
                    console.log('id[' + index + '] : ' + sameActMem);
                    console.log('メンバー[' + index + '] : ' + sameActMem.displayName);
                    
                }

                // 引数がチャンネル参加人数を超えてないかチェック
                if (isCheckChannelCount(drawingCount, sameActMemList.length)) {

                    result = selectPersonService.draw(drawingCount, sameActMemList)
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
})

client.login(process.env.DISCORD_TOKEN)

class selectPersonService {
    /**
     * 指定した範囲内のランダムな数字を返却する。
     * 
     * @param size number
     * @returns number
     */
    static randomNum(size: number) {
        const result = Math.floor(Math.random() * (size + 1));
        console.log('randomNumResult -> ' + result);
        return result;
    }

    /**
     * 指定したメンバーのアクティビティ(起動中のゲーム)を返却する。
     * 
     * @param member GuildMember
     * @returns Activity
     */
    static getMemberActivity(member: GuildMember) {
        // return member.presence?.activities.slice(-1)[0];
        return member.presence ? member.presence.activities.slice(-1)[0] : undefined;
    }

    /**
     * member一覧から同じActivityの一覧をMap化して返却する。
     * 
     * @param members GuildMember
     * @returns Map<string, GuildMember> keyはActivity.nameから設定
     */
    static collectMemberActivity(members: Collection<string, GuildMember>) {
        let membersActivityMap = new Map<string, GuildMember[]>();
        members.forEach(member => {
            const memberActivity = this.getMemberActivity(member);
            let mapKey = memberActivity == null ? 'default' : memberActivity.name;
            if (membersActivityMap.has(mapKey)) {
                let memberList = membersActivityMap.get(mapKey);
                if (memberList == null) {
                    // 多分memberListがundifindのことはないと思うけど、、、
                    console.log('memberList が' + memberList + 'です。');
                    return;
                }
                memberList?.push(member);
                membersActivityMap.set(mapKey, memberList)
            } else {
                membersActivityMap.set(mapKey, [member]);
            }
        });
        return membersActivityMap;
    }

    /**
     * メンバー一覧から、指定したActivityと同じメンバーの配列を返却する。
     * 
     * @param members GuildMemberのCollection
     * @param runMemberActivity Activityまたはundifined
     * @returns Activityまたはundifinedに一致するGuildMember[]
     */
    static selectSameActMemList(members: Collection<string, GuildMember>, runMemberActivity: Activity | undefined) {
        let sameActMemList: GuildMember[] = new Array();

        // voiceチャンネルのアクティビティ取得 & 起動したメンバーのアクティビティと同じ人のList作成
        for (let index = 0; index < members.size; index++) {
            const member = members.at(index);
            if (member == null) {
                console.log('Voiceチャンネルメンバー[' + index + ']のmemberがundifindです');
                continue;
            }

            let activity = selectPersonService.getMemberActivity(member);
            if (activity == null) {
                console.log(member.displayName + 'のactivityがundifindです');
                if (runMemberActivity == null && activity == null) {
                    // status無しのパターンのリスト作成
                    sameActMemList.push(member);
                }
                continue;
            }
            // console.log(member.displayName + ' の ' + activity);
            // status有りの場合のリスト作成
            if (runMemberActivity?.equals(activity)) {
                sameActMemList.push(member)
            }
        }
        return sameActMemList;
    }

    /**
     * 
     * @param drawingCount 抽選人数
     * @param sameActMemList bot起動者と同じアクティビティメンバーのリスト
     * @returns string 抽選にあたったメンバーの表示名リストを"&"で結合した文字列
     */
    static draw(drawingCount: number, sameActMemList: GuildMember[]) {
        let result: string;
        // 抽選
        let drawingResultArray: number[] = new Array();
        for (let index = 0; index < drawingCount; index++) {
            let drawingFlag = true;
            while (drawingFlag) {
                let drawingNum = selectPersonService.randomNum(sameActMemList.length);
                if (!drawingResultArray.includes(drawingNum)) {
                    drawingResultArray.push(drawingNum);
                    drawingFlag = false;
                }
            }
        }

        const drawingNo2NameArray = drawingResultArray.map(y => sameActMemList[y].displayName); // 抽選結果名前変換配列
        // console.log('drawingNo2NameArray-> ' + drawingNo2NameArray);

        result = drawingNo2NameArray.join(" & ");
        console.log(result);
        return result;
    }
}