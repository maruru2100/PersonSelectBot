module.exports.isCheckInput = function (input) {

    if (isNaN(Number(input))) {
        console.log('引数が数字じゃないです');
        return false;
    }

    return true;
    
}

module.exports.isCheckChannelCount  = function (drawingCount, allMemberSize) {
    
    return drawingCount <= allMemberSize;
}