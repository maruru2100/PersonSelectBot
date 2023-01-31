module.exports.hello = function () {
    console.log('hello world!!');
    return "hoge hoge";
}

// 指定されたサイズの範囲からランダムに数字を一つ返す。
module.exports.randomNum = function (size) {
    // console.log('指定サイズ-> ' + size);
    let result = Math.floor(Math.random() * size );
    console.log('randomNumResult -> ' + result);
    return result;
}
