async function placeFacility(){
    log(`[*] Iniciando Place Facility...`)
    const signer = new ethers.Wallet(privateMainAcc, provider);
    let gasStatus = await verifyGasPrice();
    while(gasStatus) {
        gasStatus = await verifyGasPrice();
        await new Promise(r => setTimeout(r, 2000));
    }
    const contract = new ethers.Contract(contractFacilitysAddress, ABI_Facility, signer);
    const gas = await getGasPrice('standard');
    //const gasPrice = ethers.utils.parseUnits(gas, "gwei");
    const tx = await contract.placeFacilityOrder(["0","0","0","0","0"], {gasLimit: 600000});
    await tx.wait();
    log(`[*] tx: ${tx.hash}`)
    log(`[*] Place Facility Finalizado!`)
    return tx
}


async function speedUpFacilityOrder(){
    log(`[*] Iniciando SpeedUp Facility...`)
    const signer = new ethers.Wallet(privateMainAcc, provider);
    const orders = await getFacilityOrders();
    const order = orders[0];
    let gasStatus = await verifyGasPrice();
    while(gasStatus) {
        gasStatus = await verifyGasPrice();
        await new Promise(r => setTimeout(r, 2000));
    }
    const contract = new ethers.Contract(contractFacilitysAddress, ABI_Facility, signer);
    const tx = await contract.speedUpOrder(48, order[0], {gasLimit: 300000});
    await tx.wait();
    log(`[*] tx: ${tx.hash}`)
    log(`[*] SpeedUp Facility Finalizado!`)
    return tx
}


async function claimFacilityOrder(){
    log(`[*] Iniciando Claim Facility...`)
    const signer = new ethers.Wallet(privateMainAcc, provider);
    const orders = await getFacilityOrders();
    const order = orders[0];
    let gasStatus = await verifyGasPrice();
    while(gasStatus) {
        gasStatus = await verifyGasPrice();
        await new Promise(r => setTimeout(r, 2000));
    }
    const contract = new ethers.Contract(contractFacilitysAddress, ABI_Facility, signer);
    const tx = await contract.claimOrder(order[0], {gasLimit: 300000});
    await tx.wait();
    log(`[*] tx: ${tx.hash}`)
    log(`[*] Claim Facility Finalizado!`)
    return tx
}


async function getFacilityOrders(){
    const signer = new ethers.Wallet(privateMainAcc, provider);
    const contract = new ethers.Contract(contractFacilitysAddress, ABI_Facility, signer);
    const orders = await contract.getOrders(signer.getAddress())
    
    return orders
}



async function BuildFacility(){
    log(`[*] Iniciando craft Facility...`)
    await placeFacility();
    await new Promise(r => setTimeout(r, 1000));
    await speedUpFacilityOrder();
    await new Promise(r => setTimeout(r, 1000));
    await claimFacilityOrder();
    log(`[*] Craft Facility Finalizado!`)
}