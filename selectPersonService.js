module.exports.hello = function () {
    console.log('hello world!!');
    return "hoge hoge";
}

/**
 * チャンネル内のメンバーから、指定人数抽選する。
 * 
 * @param {number} drawingCount 抽選人数
 * @param {number} allMemberSize チャンネル内メンバー数
 * @returns 選ばれたメンバー名(ニックネーム)一覧(List形式)
 */
module.exports.selectPerson = function(drawingCount, allMemberSize) {

    ret = new Array();
    return ret;
}

/**
 * 指定されたサイズの範囲からランダムに数字を一つ返す。
 * 
 * @param {number} size 
 * @returns 0～size-1 の範囲でランダムなnumber
 */
module.exports.randomNum = function (size) {
    // console.log('指定サイズ-> ' + size);
    let result = Math.floor(Math.random() * size );
    console.log('randomNumResult -> ' + result);
    return result;
}
