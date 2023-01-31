# PersonSelectBot
DiscordBotでくじ引き的な人選びを実施するbot

---

## つくりメモ

ざっくりやりたいことのメモ

1. 範囲内の数字をランダムで一つ返すメソッド作成
2. 渡したDiscordのニックネームをランダムで一つ返すように変更
3. 引数でランダムで引数人数分選んで返す要に変更
4. 引数に総当たりのtrue/falseを入れて総当たりパターンも作る。

これらを本当はISSUESで管理したい。

## 今後のアップデートでやりたいこと

1. ボイスチャット内 or スレッド内の全員のニックネーム取得し、1on1の総当たり表作成。
2. 引数で一度に何人選出するかを変更できるようにする。

## メモ

- ランダムで選出するために、ランダム数字を返す関数(randomNum())が必要。
- randomNum()にCollection.sizeでそのチャンネルに参加しているメンバー数を取得して渡す。
- sizeは受信したmessageから、message.channel.members.sizeでチャンネル内のメンバーのsizeを返す。
- randomNum() の戻り値がintで0 ～ size-1 になっているので、Collection.at(戻り値).displayName で選ばれた人のニックネームを取得する。
- messageに対してreplyで取得した displayName を返却する。