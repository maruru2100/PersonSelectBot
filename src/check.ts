export function canStr2Nan(input:string) {
    if (isNaN(Number(input))) {
        console.log('引数が数字じゃないです');
        return false;
    }
    return true;
}

export function isCheckChannelCount(drawingCount:number, allMemberSize:number) {
    return drawingCount <= allMemberSize;
}