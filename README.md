# PersonSelectBot
DiscordBotでくじ引き的な人選びを実施するbot

---

##  アプリ使用前メモ

- .env.sumpleの中身を確認し、設定値を記載する。
- .sumpleをファイル名から消して.envファイルにする。

### アプリ仕様

- 本アプリはDiscord内のメンバー選出を実施するために使用する。
  > 対戦の時とかメンバー決めの時とかに使ってほしいかな。
- アプリ起動はbotに対しメンションと指定された引数を設定して実行する。
  - 将来的にはスラッシュコマンドを対応させたい。。
- 「チャンネル」については以下のチャンネルを意図している。
  - ボイスチャンネル
    - リクエストを送ったメンバーが参加しているボイスチャンネル内で抽選とする。

---
### 入力仕様

以下の入力値を想定する。
```
@メンション 抽選人数
```

- 抽選人数: 数字であること

---
### Ver1.0で目指すアプリでできること

- ボイスチャンネルでニックネームが引っ張ってこれること。
- ボイスチャンネルに入っている人から一人選出できること。
- ボイスチャンネルに入っている人から複数人選出できること。
- 選出した結果はメンションで話しかけられたメッセージに返信で返すこと。

---
## 今後のアップデートでやりたいこと

1. ボイスチャット内 or スレッド内の全員のニックネーム取得し、1on1の総当たり表作成。
2. 引数無しの場合一人選出とするようにする。
3. テキストチャンネル、スレッドでも対応させる。

## 設計時メモ

- ランダムで選出するために、ランダム数字を返す関数(randomNum())が必要。
- randomNum()にCollection.sizeでそのチャンネルに参加しているメンバー数を取得して渡す。
- sizeは受信したmessageから、message.channel.members.sizeでチャンネル内のメンバーのsizeを返す。
- randomNum() の戻り値がintで0 ～ size-1 になっているので、Collection.at(戻り値).displayName で選ばれた人のニックネームを取得する。
- messageに対してreplyで取得した displayName を返却する。
- 以下のプログラムを内包するプロジェクトとする。
  - コントローラー (index.js)
    - Discordからメッセージの受け取りを実施。
  - サービス (selectPersonService.js)
    - 受け取ったメッセージから人選びと、ファクトリ的な役割も持たせる。
  - チェックロジック (check.js)
    - 入力チェックの機能を持たせる。
    - 数字チェック
    - 選出人数<=チャンネル人数

---
- ざっくりサービスの流れを書く
  - チャンネルメンバー数以下(1以上)でランダムに数字選出。
  - 選出した数字から配列番号でメンバーを取得。
  - リストに格納する。
    - 2回以上選出の場合は選出被りが無いようにする。
  - リストを返却する。