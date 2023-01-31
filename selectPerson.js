module.exports.hello = function () {
    console.log('hello world!!');
    return "hoge hoge";
}

module.exports.randomNum = function (size) {
    console.log('指定サイズ-> ' + size);
    let result = Math.floor(Math.random() * size );
    console.log(result);
    return result;
}
