async function getTokenBalance(address, tokenId){
    const contract = new ethers.Contract(contractTokensAddress, ABI_Tokens, provider);
    const balance = await contract.balanceOf(address, tokenId)
    return balance
}


function chunkArray(myArray, chunkSize) {
    var results = [];
    while (myArray.length) {
      results.push(myArray.splice(0, chunkSize));
    }
    return results;
  }
  

  async function getAllBalances() {
    log("[#] getAllBalances iniciado ...");
    let totalBalances = [0, 0, 0, 0, 0, 0, 0];
    const chunks = chunkArray(privates, 100);
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      log(`[+] Iniciando lote ${i + 1} de ${chunks.length}...`);
      let balances = [0, 0, 0, 0, 0, 0, 0];
      await Promise.all(
        chunk.map(async function (private) {
          const signer = new ethers.Wallet(private, provider);
          const signerAddress = signer.getAddress();
          await Promise.all(
            tokensId.map(async function (tokenid, i) {
              const balance = await getTokenBalance(signerAddress, tokenid);
              balances[i] += Number(balance.toString());
            })
          );
        })
      );
      totalBalances = totalBalances.map((balance, i) => balance + balances[i]);
      
      if (i < chunks.length - 1) {
        await sleep(1000); // espera 1 segundo entre os lotes
      }
    }
    log(`[#] Balances das contas:`);
    log(`    AstroCredit: ${totalBalances[0]}`);
    log(`    Blueprint: ${totalBalances[1]}`);
    log(`    Outlier: ${totalBalances[2]}`);
    log(`    Common: ${totalBalances[3]}`);
    log(`    Uncommon: ${totalBalances[4]}`);
    log(`    Rare: ${totalBalances[5]}`);
    log(`    Legendary: ${totalBalances[6]}`);
    log("[#] getAllBalances finalizado!");
  }
  
  function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
  
  

async function getBalanceGas() {
    log('[#] getBalanceGas iniciado ...');
    const privatePromises = privates.map(async function(private, i) {
      const signer = new ethers.Wallet(private, provider);
      const signerAddress = await signer.getAddress();
      const signerBalance = await signer.getBalance();
      const value = ethers.utils.formatUnits(signerBalance);
      log(`[#] Conta: ${signerAddress}  -  BalanceMatic: ${value}`)
      });
    await Promise.all(privatePromises); 
    log('[#] getBalanceGas finalizado!');
}


async function getBalancesWaste() {
  log("[#] getAllBalances iniciado ...");
  const chunks = chunkArray(privates, 100);
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    log(`[+] Iniciando lote ${i + 1} de ${chunks.length}...`);
    await Promise.all(
      chunk.map(async function (private) {
        const signer = new ethers.Wallet(private, provider);
        const signerAddress = await signer.getAddress();
        const balance = await getTokenBalance(signerAddress, 7);
        log(`[#] Conta: ${signerAddress.toString()}  Balance waste: ${balance}`);
      })
    );
    
    if (i < chunks.length - 1) {
      await sleep(1000); // espera 1 segundo entre os lotes
    }
  }
  log("[#] getAllBalances finalizado!");
}