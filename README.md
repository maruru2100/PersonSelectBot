# PersonSelectBot
DiscordBotでくじ引き的な人選びを実施するbot

---

## つくりメモ

ざっくりやりたいことのメモ

1. 範囲内の数字をランダムで一つ返すメソッド作成
2. 渡したDiscordのニックネームをランダムで一つ返すように変更

これらをISSUESで管理したい。

## 今後のアップデートでやりたいこと

1. 総当たりで取得したニックネームで対戦表作成
2. 複数人選出(被り無しで)できるように引数を増やす。

## メモ

- ランダムで選出するために、ランダム数字を返す関数(randomNum())が必要。
- randomNum()にCollection.sizeでそのチャンネルに参加しているメンバー数を取得して渡す。
- sizeは受信したmessageから、message.channel.members.sizeでチャンネル内のメンバーのsizeを返す。
- randomNum() の戻り値がintで0 ～ size-1 になっているので、Collection.at(戻り値).nickname で選ばれた人のニックネームを取得する。
- messageに対してreplyで取得したニックネームを返却する。