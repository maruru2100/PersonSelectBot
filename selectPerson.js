module.exports.hello = function () {
    console.log('hello world!!');
    return "hoge hoge";
}

module.exports.randomNum = function (size) {
    let result = Math.floor(Math.random() * size );
    console.log(result);
    return "procces end"
}
