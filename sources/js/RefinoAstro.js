async function placeWasteOrder() {
  log('[#] PlaceOrders Astro iniciado ...');
  const batchInterval = 100; // intervalo entre cada lote em milissegundos
  const numBatches = Math.ceil(privates.length / batchSize); // número total de lotes

  for (let i = 0; i < numBatches; i++) {
    const batchStartIndex = i * batchSize;
    const batchEndIndex = Math.min(batchStartIndex + batchSize, privates.length);
    const batchPrivates = privates.slice(batchStartIndex, batchEndIndex);
    log(`[+] Processando lote ${i + 1}/${numBatches} com ${batchPrivates.length} privates`);

    const batchPromises = batchPrivates.map(async function (private, i) {
      const signer = new ethers.Wallet(private, provider);
      const signerAddress = signer.getAddress();
      const wasteBalance = await getTokenBalance(signerAddress, 7);

      if (wasteBalance >= 50) {
        const ammount = 50;
        try {
          const tx = await _placeAstro(signer, ammount);
          log(`[*] tx: `, tx.hash);
        } catch (err) {
          await verifyTx(err, signerAddress);
        }
      }
    });

    await Promise.all(batchPromises);
    await new Promise(r => setTimeout(r, batchInterval));
  }

  log('[#] PlaceOrders Astro finalizado!');
}


async function _placeAstro(signer, ammount) {
  let gasStatus = await verifyGasPrice();
  while (gasStatus) {
    gasStatus = await verifyGasPrice();
    await new Promise(r => setTimeout(r, 2000));
  }
  const contract = new ethers.Contract(contractRefinoAstroAddress, ABI_RefinoAstro, signer)
  const gas = await getGasPrice('standard');
  //const gasPrice = ethers.utils.parseUnits(gas, "gwei");
  const tx = await contract.placeWasteOrder(ammount, { gasLimit: 600000 });
  return tx
}

async function claimAstroOrders() {
  log('[#] Claim iniciado ...');
  const ammountToclaim = await getAllAstroOrders(1);
  if (ammountToclaim > 0) {
    const numBatches = Math.ceil(privates.length / batchSize);
    let numCompletedBatches = 0;

    for (let batchIndex = 0; batchIndex < numBatches; batchIndex++) {
      const start = batchIndex * batchSize;
      const end = start + batchSize;
      const batchPrivates = privates.slice(start, end);

      log(`[+] Processando ${batchPrivates.length} chaves privadas (${start}-${end})`);

      const privatePromises = batchPrivates.map(async function (private, i) {
        const signer = new ethers.Wallet(private, provider);
        const orders = await getAstroOrders(signer.getAddress());

        const orderPromises = orders.map(async function (order, i) {
          const n = await verifyTimeOrder(order);
          if (n >= 6) {
            try {
              const tx = await _claimAstroOrder(signer, order[0]);
              //const r_tx = await tx.wait();
              log(`[*] tx para ${signer.address}: ${tx.hash} (OrdemID: ${order[0]})`);
            } catch (err) {
              await verifyTx(err, signer.address);
            }
          }
        });

        return Promise.all(orderPromises);
      });

      await Promise.all(privatePromises);

      log(`[-] Concluído o processamento do lote ${batchIndex + 1} de ${numBatches}`);
      numCompletedBatches++;
    }

    if (numCompletedBatches === numBatches) {
      log('[#] Claim finalizado!');
    }
  } else {
    log('[#] Não há ordens para resgatar.');
  }
}



async function _claimAstroOrder(signer, order) {
  let gasStatus = await verifyGasPrice();
  while (gasStatus) {
    gasStatus = await verifyGasPrice();
    await new Promise(r => setTimeout(r, 2000));
  }
  const contract = new ethers.Contract(contractRefinoAstroAddress, ABI_RefinoAstro, signer)
  const tx = await contract.claimOrder(order, { gasLimit: 300000 });
  return tx
}



async function getAllAstroOrders(type) {
  totalOrders = 0;
  const privatePromises = privates.map(async function (private) {
    const signer = new ethers.Wallet(private, provider);
    const orders = await getAstroOrders(signer.getAddress());

    if (orders.length > 0) {
      const orderPromises = orders.map(async function (order) {
        if (type == 1) {
          const n = await verifyTimeOrder(order);
          if (n >= 6) {
            totalOrders++;
          }
        } else {
          totalOrders++;
        }
      });
      await Promise.all(orderPromises);
    }
  });

  await Promise.all(privatePromises);
  log(`[#] Ordens: ${totalOrders}`);
  return totalOrders;
}



async function getAstroOrders(address) {
  const contract = new ethers.Contract(contractRefinoAstroAddress, ABI_RefinoAstro, provider);
  const orders = await contract.getOrders(address)
  return orders
}