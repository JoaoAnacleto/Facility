async function sendAll() {
  log('[#] SendAll iniciado ...');

  const numBatches = Math.ceil(privates.length / batchSize);

  let numCompletedBatches = 0;

  for (let batchIndex = 0; batchIndex < numBatches; batchIndex++) {
    const start = batchIndex * batchSize;
    const end = start + batchSize;
    const batchPrivates = privates.slice(start, end);

    log(`[+] Processando ${batchPrivates.length} chaves privadas (${start}-${end})`);

    await Promise.all(batchPrivates.map(async function (private, i) {
      const signer = new ethers.Wallet(private, provider);
      const signerAddress = await signer.getAddress();
      await Promise.all(tokensId.map(async function (tokenid, i) {
        const balance = await getTokenBalance(signerAddress, tokenid);
        if (balance > 0) {
          const val = Number(balance.toString());
          try {
            const tx = await _sendToken(signer, val, tokenid);
            //const r_tx = await tx.wait();
            log(`[*] tx para ${signerAddress}: ${tx.hash} (TokenID: ${tokenid}, Valor: ${val})`);
          } catch (err) {
            await verifyTx(err);
          }
        }
      }));
    }));

    log(`[-] Concluído o processamento do lote ${batchIndex + 1} de ${numBatches}`);
    numCompletedBatches++;
  }

  if (numCompletedBatches === numBatches) {
    log('[#] SendAll finalizado!');
  }
}


async function _sendToken(signer, ammount, tokenId) {
  let gasStatus = await verifyGasPrice();
  while (gasStatus) {
    gasStatus = await verifyGasPrice();
    await new Promise(r => setTimeout(r, 2000));
  }
  const byte = new Uint8Array();
  const contract = new ethers.Contract(contractTokensAddress, ABI_Tokens, signer);
  const tx = await contract.safeTransferFrom(signer.getAddress(), privateMainAddress, tokenId, ammount, byte, { gasLimit: 100000 });
  return tx;
}
