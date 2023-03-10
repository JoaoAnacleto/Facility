const errorLib = [
    'insufficient funds for intrinsic transaction cost ',
    'cannot estimate gas; transaction may fail or may require manual gas limit '
]


async function verifyTx(err){
    const FullerrorMessage = err.toString();
    const errorMessage = await getMessageError(FullerrorMessage);
    log(errorMessage);
}

async function getMessageError(errorMessage){
    const messageStartIndex = errorMessage.indexOf("Error: ") + "Error: ".length;
    const messageEndIndex = errorMessage.indexOf("(");
    const message = errorMessage.substring(messageStartIndex, messageEndIndex);
    return message
}
