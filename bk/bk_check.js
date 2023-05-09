module.exports.isCheckInput = function (input, allMemberSize) {

    if (isNaN(Number(input))) {
        console.log('引数が数字じゃないです');
        return false;
    }

    if (allMemberSize%input !== 0) {
        console.log('全体人数に対して割り切れないです');
        return false;
    }

    return true;
    
}