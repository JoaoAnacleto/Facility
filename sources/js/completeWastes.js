async function CompleteWaste() {
  log('[#] CompleteWaste iniciado ...');
  let recipients = [];
  let ids = ["7"];
  let values = ["18"];
  let mainPool = await getTokenBalance(privateMainAddress, 7);
  mainPool = Number(mainPool.toString());

  await Promise.all(privates.map(async function (private, i) {
    const signer = new ethers.Wallet(private, provider);
    const signerAddress = await signer.getAddress();
    const balance = await getTokenBalance(signerAddress, 7);
    if (balance < 50) {
      const val = Number(balance.toString());
      //const ammount = 50 - val;
      recipients.push(signerAddress.toString());
    }
  })
  );
  const need = recipients.length * Number(values[0]);
  if (mainPool > need) {
    tx = await _sendWaste(recipients, ids, values);
    log(`[*] tx: `, tx.hash);
  } else {
    log(`Total waste em conta: ${mainPool}, precisa de ${need}`)
  }
  log('[#] CompleteWaste finalizado!');
}


async function _sendWaste(recipients, ids, values) {
  let gasStatus = await verifyGasPrice();
  while (gasStatus) {
    gasStatus = await verifyGasPrice();
    await new Promise(r => setTimeout(r, 2000));
  }
  const signer = new ethers.Wallet(privateMainAcc, provider);
  const signerAddress = signer.getAddress();
  const byte = new Uint8Array();
  const contract = new ethers.Contract(contractDispenserTokensAddress, ABI_DISPENSERTokens, signer)
  const tx = await contract.disperse(contractTokensAddress, recipients, ids, values, byte);
  return tx
}