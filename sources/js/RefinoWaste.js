async function placeProspectingOrders() {
  log('[#] PlaceOrders iniciado ...');
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
      const orders = await getOrders(signerAddress);
      const wasteBalance = await getTokenBalance(signerAddress, 7);

      if (orders.length < 2 && wasteBalance >= 50) {
        const ammount = 2 - orders.length;
        try {
          const tx = await _place(signer, ammount);
          //const r_tx = await tx.wait();
          log(`[*] tx: `, tx.hash);
        } catch (err) {
          await verifyTx(err);
        }
      }
    });

    await Promise.all(batchPromises);
    await new Promise(r => setTimeout(r, batchInterval));
  }

  log('[#] PlaceOrders finalizado!');
}

async function runBatch(promises, interval) {
  await Promise.all(promises);
  await new Promise(r => setTimeout(r, interval));
}



async function _place(signer, ammount) {
  let gasStatus = await verifyGasPrice();
  while (gasStatus) {
    gasStatus = await verifyGasPrice();
    await new Promise(r => setTimeout(r, 2000));
  }
  const contract = new ethers.Contract(contractRefinoWasteAddress, ABI_RefinoWaste, signer)
  const gas = await getGasPrice('standard');
  //const gasPrice = ethers.utils.parseUnits(gas, "gwei");
  const tx = await contract.placeProspectingOrders(ammount, { gasLimit: 600000 });
  return tx
}

async function claimOrders() {
  log('[#] Claim iniciado ...');
  const ammountToclaim = await getAllOrders(1);
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
        const orders = await getOrders(signer.getAddress());

        const orderPromises = orders.map(async function (order, i) {
          const n = await verifyTimeOrder(order);
          if (n >= 6) {
            try {
              const tx = await _claimOrder(signer, order[0]);
              //const r_tx = await tx.wait();
              log(`[*] tx para ${signer.address}: ${tx.hash} (OrdemID: ${order[0]})`);
            } catch (err) {
              await verifyTx(err);
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



async function _claimOrder(signer, order) {
  let gasStatus = await verifyGasPrice();
  while (gasStatus) {
    gasStatus = await verifyGasPrice();
    await new Promise(r => setTimeout(r, 2000));
  }
  const contract = new ethers.Contract(contractRefinoWasteAddress, ABI_RefinoWaste, signer)
  const tx = await contract.claimOrder(order, { gasLimit: 400000 });
  return tx
}

let totalOrders;

async function getAllOrders(type) {
  totalOrders = 0;
  const privatePromises = privates.map(async function (private) {
    const signer = new ethers.Wallet(private, provider);
    const orders = await getOrders(signer.getAddress());

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



async function getOrders(address) {
  const contract = new ethers.Contract(contractRefinoWasteAddress, ABI_RefinoWaste, provider);
  const orders = await contract.getOrders(address)
  return orders
}
