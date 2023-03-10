async function dispenserGas(ammountPerAccount) {
    let totalToSend = 0;
    let recipients = [];
    let values = [];
    privates.forEach(async function (private, i) {
        const signer = new ethers.Wallet(private, provider);
        const signerAddress = signer.getAddress();
        const balance = await provider.getBalance(signerAddress);
        const balanceEther = ethers.utils.formatEther(balance);
        if (balanceEther < ammountPerAccount) {
            const diff = ammountPerAccount - balanceEther;
            totalToSend += diff;
            recipients.push(signerAddress.toString());
            values.push(diff.toString());
        }
    });
    while (recipients.length < 1) {
        await new Promise(r => setTimeout(r, 1000));
    }
    const tx = await _sendDispenserGas(recipients, values);
    const r_tx = await tx.wait();
    log('[*] tx:', r_tx.transactionHash);
}


async function _sendDispenserGas(recipients, values, totalToSend) {
    let gasStatus = await verifyGasPrice();
    while (gasStatus) {
        gasStatus = await verifyGasPrice();
        await new Promise(r => setTimeout(r, 2000));
    }
    const signer = new ethers.Wallet(privateMainAcc, provider);
    const contract = new ethers.Contract(contractDispenserAddress, ABI_DISPENSER, signer)
    const tx = await contract.disperseEther(recipients, values);
    return tx

}


async function transferMatic(contractAddress) {
    const wallets = await ethers.getSigners()
    const contract = await ethers.getContractFactory("A")

    const walletWithMatics = wallets[0]
    let walletsForTransfers = []

    for (let i = 1; i < 2614; i++) {
        walletsForTransfers.push(wallets[i].address)
    }

    let amountWei = "3000000000000000"
    //mudar totalValue para a quantidade de contas que eu irei enviar
    let totalValue = (Number(amountWei) * 2614).toString()

    await contract.connect(walletWithMatics).attach(contractAddress).sendEthers(walletsForTransfers, amountWei, { value: totalValue })
}