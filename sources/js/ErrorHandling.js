const errorLib = [
    'insufficient funds for intrinsic transaction cost ',
    'cannot estimate gas; transaction may fail or may require manual gas limit '
]


async function verifyTx(err, address) {
    const FullerrorMessage = err.toString();
    const errorMessage = await getMessageError(FullerrorMessage);
    log(`[*] account: ${address} - Error: ${errorMessage}`);
}

async function getMessageError(errorMessage) {
    const messageStartIndex = errorMessage.indexOf("Error: ") + "Error: ".length;
    const messageEndIndex = errorMessage.indexOf("(");
    const message = errorMessage.substring(messageStartIndex, messageEndIndex);
    return message
}
