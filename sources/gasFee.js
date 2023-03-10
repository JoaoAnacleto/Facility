function httpGet(theUrl){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

async function getGasPrice(type){
    const gasJson = await httpGet('https://gasstation-mainnet.matic.network/v2');
    const safeGas = JSON.parse(gasJson)[type]['maxFee'];
    return safeGas
}

async function verifyGasPrice(){
    const price = await getGasPrice('safeLow');
    if(price < maxGas){
        return false
    }else{
        log('Gas price:',price)
        return true
    }
}
