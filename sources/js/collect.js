async function collectAll() {
    log('[#] collectAll iniciado ...');

    const numBatches = Math.ceil(privates.length / batchSize);

    let numCompletedBatches = 0;

    for (let batchIndex = 0; batchIndex < numBatches; batchIndex++) {
        const start = batchIndex * batchSize;
        const end = start + batchSize;
        const batchPrivates = privates.slice(start, end);

        log(`[+] Processando ${batchPrivates.length} chaves privadas (${start}-${end})`);

        await Promise.all(batchPrivates.map(async function (private, i) {
            const account = new ethers.Wallet(private, provider);
            const ammount = await CanCollect(account);
            if (ammount >= 6) {
                const [web3Token, authorization] = await login(account);
                const signature = await getSignature(authorization, web3Token, account)
                const tx = await collect_trash(account, signature)
                log(`[*] account: ${account.address} hash: ${tx.hash}`)
            }
        }));
        log(`[-] Concluído o processamento do lote ${batchIndex + 1} de ${numBatches}`);
        numCompletedBatches++;
    }
    if (numCompletedBatches === numBatches) {
        log('[#] collectAll finalizado!');
    }

}


async function create_web3_token(account) {
    const origin = "mission-control___en";
    const base_time = new Date().toISOString();
    const nonce = Math.random() * 99999999;
    const expiration = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const base_text = `missioncontrol.planetix.com wants you to sign in with your Ethereum account.\n\nURI: https://missioncontrol.planetix.com/connect?origin=${origin}\nWeb3 Token Version: 2\nNonce: ${nonce}\nIssued At: ${base_time}\nExpiration Time: ${expiration}`;

    const signature = await account.signMessage(ethers.utils.toUtf8Bytes(base_text));
    const msg = JSON.stringify({
        signature: signature,
        body: base_text,
    });
    const web3_token = btoa(msg);
    return web3_token;
}

async function login(account) {
    try {
        const web3_token = await create_web3_token(account);

        const payload = {
            user: "",
            password: "",
            google_auth_code: "",
            login_as_token: "",
            web3_token,
        };

        const header = {
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "pt-PT,pt;q=0.9",
            "content-type": "application/json",
            origin: "https://missioncontrol.planetix.com",
            referer: "https://missioncontrol.planetix.com/",
            "user-agent": "Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
        };
        const response = await fetch("https://api.planetix.com/api/v1/auth/login", {
            method: "POST",
            body: JSON.stringify(payload),
            headers: header,
            timeout: 120000,
        });
        const data = await response.json();
        if (response.status === 200) {
            return [data.access_token, web3_token];
        } else {
            console.log(`[${account.address}] Login failed. Exiting...`);
            process.exit(1);
        }
    } catch (error) {
        console.error(error);
        console.log("Retrying login...");
        return login(account);
    }
}

async function getSignature(authorization, token, account) {
    try {
        const contract = new ethers.Contract(contractCollectWaste, ABI_CollectWaste, provider);
        const payload = {
            "address": account.address,
            "nonce": parseInt(await contract.nonces(account.address)),
            "version": "v2"
        };

        const headers = {
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "pt-PT,pt;q=0.9",
            "content-type": "application/json",
            "origin": "https://missioncontrol.planetix.com",
            "referer": "https://missioncontrol.planetix.com/",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
            "web3-authorization": `Web3 ${token}`,
            "authorization": `Bearer ${authorization}`
        };

        const response = await fetch(
            "https://api.planetix.com/api/v1/web3/collect-from-tiles/signature", {
            method: "POST",
            body: JSON.stringify(payload),
            headers: headers,
            timeout: 120
        }
        );

        if (response.status === 200) {
            const responseData = await response.json();
            return responseData.data;
        } else if (response.status === 502 || response.status === 503) {
            console.log(
                `[${account.address}] Servidor esta congestionado, esperando 1 minuto antes de tentar novamente.`
            );
            await new Promise(resolve => setTimeout(resolve, 60000));
            return await getSignature(authorization, token, account);
        } else {
            console.error(
                `[${account.address}] Puta net ruim em... | Status: ${response.status} | Response: ${response.text}`
            );
            return await getSignature(authorization, token, account);
        }
    } catch (error) {
        console.error(error);
        return await getSignature(authorization, token, account);
    }
}


const tiles = {
    A1: { x: -1, y: 0, z: 1 },
    A2: { x: -1, y: 1, z: 0 },
    A3: { x: 0, y: -1, z: 1 },
    A4: { x: 0, y: 1, z: -1 },
    A5: { x: 1, y: -1, z: 0 },
    A6: { x: 1, y: 0, z: -1 }
};

async function collect_trash(account, signature) {
    const tileValues = Object.values(tiles);

    let gasStatus = await verifyGasPrice();
    while (gasStatus) {
        gasStatus = await verifyGasPrice();
        await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    const contract = new ethers.Contract(contractCollectWaste, ABI_CollectWaste, account);
    const tx = await contract.collectFromTiles(
        tileValues.map((tile) => [tile.x, tile.y, tile.z]),
        signature.v,
        signature.r,
        signature.s,
        { gasLimit: 500000 }
    );
    return tx;
}

async function CanCollect(account) {
    let ammount = 0;
    const contract = new ethers.Contract(contractCollectWaste, ABI_CollectWaste, provider);
    const r = await contract.getAllCheckTileInfo(account.address);
    r.map((nomeAtual) => {
        ammount = ammount + (Number(nomeAtual[2].toString()))
    });
    return ammount
}

