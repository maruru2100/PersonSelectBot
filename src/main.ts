import { Message, Client, GuildMember, Activity, Collection } from 'discord.js'
import dotenv from 'dotenv'
import {canStr2Nan, isCheckChannelCount} from './check'
import { ActivityTypes } from 'discord.js/typings/enums';
import { log } from 'console';

// エラーメッセージ
const errorNotEnoughArgument = '引数が指定されていません。「act」,「draw」,「actdraw」のいずれかを設定してください。'
const errorCheckNumMsg = '入力値がおかしいです。 抽選人数は数字で入力ください。';
const errorOverChannelJoin = '指定した抽選人数がVoiceVhannel内の同アクティビティ人数を超えています。';
const errorNotExitsActivity = '指定したActivityをしている人はボイスチャット内にいません。'

// 定数定義
const ACTIONS = 'act';
const DRAW = 'draw';
const ACTDRAW = 'actdraw'


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
        let result: string = '';
        console.log(msg.content);
        // msg.content の内容が「"BotID" "メッセージ"」のため、メッセージだけ取り出す
        const splitMsg = msg.content.split(' ');
        console.log('splitMsg-> ' + splitMsg);

        // 引数必須チェック
        if (splitMsg.length >= 2) {
            const inputSpecifiedAction = splitMsg[1] // 指定アクション
            
            const runMember = msg.member;
            if (!runMember) {
                console.error('runMemberが null です。');
                return;
            }
            console.log('runMember -> ' + runMember.displayName);
            

            // メッセージを送ったメンバーが参加しているボイスチャンネルのメンバー一覧取得
            let voiceChannel = await runMember.voice.channel?.fetch();
            if (!voiceChannel) {
                console.error('voiceChannelが null です。');
                return;
            }
            let members = voiceChannel.members;
            let allMemberSize = members.size;
            console.log("voice all member size -> " + allMemberSize);

            // メッセージを送ったメンバーのアクティビティを取得
            const runMemberActivity = selectPersonService.getMemberActivity(runMember);
            console.log('起動メンバーのアクティビティ: ' + runMemberActivity);
            if (runMemberActivity == null) {
                console.error('runMemberActivity が' + runMemberActivity + 'です');
                return;
            }

            const membersActivityMap = selectPersonService.collectMemberActivity(members);

            switch (inputSpecifiedAction) {
                case ACTIONS:
                    const keys: IterableIterator<string> = membersActivityMap.keys();
                    for (const key of keys) {
                        result += key + ' ';
                    }
                    break;
                
                case DRAW:
                    const inputDrawingCount = splitMsg[2]; // 抽選人数
                    console.log('抽選人数-> ' + inputDrawingCount);
                    result =  selectPersonService.checkAndDraw(membersActivityMap, inputDrawingCount, runMemberActivity.name)
                    break;
                
                case ACTDRAW:
                    const specifiedActivity = splitMsg[2]; // 指定アクティビティ
                    console.log('指定Activity-> ' + specifiedActivity);
                    const inputDrawingCountForAct = splitMsg[3]; // 抽選人数
                    console.log('抽選人数-> ' + inputDrawingCountForAct);
                    result = selectPersonService.checkAndDraw(membersActivityMap, inputDrawingCountForAct, specifiedActivity);
                    break;

                default:
                    result = '一昨日きやがれ！！'
                    break;
            }

        } else {
            result = errorNotEnoughArgument;
        }

        console.log('------------------------------');
        
        msg.reply(result);

    }
})

client.login(process.env.DISCORD_TOKEN)

class selectPersonService {

    /**
     * メンバーのアクティビティーマップから指定されたアクティビティーの一覧を取得し、そこから指定された人数を抽選する。
     * 抽選前に以下のチェックを実施し、問題がある場合はエラーメッセージを返却する。
     * 1. 指定Activityがmapのkeyの中に存在しているか。
     * 2. 指定人数が数字か？
     * 
     * @param membersActivityMap Map<string, GuildMember[]> アクティビティ名をKeyにしたGuildMemberのList
     * @param inputDrawingCount string numberに変更して使用する。
     * @param specifiedActivity string 指定activity
     * @returns 
     */
    static checkAndDraw(membersActivityMap: Map<string, GuildMember[]>, inputDrawingCount: string, specifiedActivity: string): string {
        // Activity存在チェック
        if (!membersActivityMap.has(specifiedActivity)) {
            return errorNotExitsActivity;
        }
        if (!canStr2Nan(inputDrawingCount)) {
            return errorCheckNumMsg;
        }
        const drawingCount = Number(inputDrawingCount);
        const sameActMemList = membersActivityMap.get(specifiedActivity);
        if (sameActMemList == null) {
            return 'keyがあるのに、配列がundifindになってます。なんで？？？？'
        }

        // ログ出力
        for (let index = 0; index < sameActMemList.length; index++) {
            const sameActMem = sameActMemList[index];
            console.log('id[' + index + '] : ' + sameActMem);
            console.log('メンバー[' + index + '] : ' + sameActMem.displayName);
        }

        if (isCheckChannelCount(drawingCount,sameActMemList.length)) {
            return selectPersonService.draw(drawingCount,sameActMemList);
        } else {
            // 抽選人数が抽選母数を超えている場合は全件を返却
            return selectPersonService.draw(sameActMemList.length, sameActMemList);
        }
    }
    /**
     * 指定した範囲内のランダムな数字を返却する。
     * 
     * @param size number
     * @returns number
     */
    static randomNum(size: number) {
        const result = Math.floor(Math.random() * (size));
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
                    console.error('memberList が' + memberList + 'です。');
                    return;
                }
                memberList.push(member);
                console.log(member.displayName + 'を' + mapKey + 'に追加します');
                
                membersActivityMap.set(mapKey, memberList)
            } else {
                console.log(member.displayName + 'にて' + mapKey + 'を新規に追加します');
                membersActivityMap.set(mapKey, [member]);
            }
        });
        return membersActivityMap;
    }

    /**
     * メンバー一覧から、指定したActivityと同じメンバーの配列を返却する。
     * 
     * @param members GuildMemberのCollection
     * @param memberActivity Activityまたはundifined
     * @returns Activityまたはundifinedに一致するGuildMember[]
     */
    static selectSameActMemList(members: Collection<string, GuildMember>, memberActivity: Activity | undefined) {
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
                if (memberActivity == null && activity == null) {
                    // status無しのパターンのリスト作成
                    sameActMemList.push(member);
                }
                continue;
            }
            // console.log(member.displayName + ' の ' + activity);
            // status有りの場合のリスト作成
            if (memberActivity?.equals(activity)) {
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