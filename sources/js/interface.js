function updateText() {
  const configJson = document.getElementById("configJson").value;
  let config;
  try {
    config = JSON.parse(configJson);
  } catch (error) {
    alert("Erro ao processar JSON de configurações!");
    return;
  }
  privateMainAcc = config['privateMainAcc']
  privateMainAddress = config['privateMainAddress']
  privates = config['privates']
  alert('Configurações salvas com sucesso!');
}


async function _atualizaGas() {
  var divAtualizacao = document.getElementById("gas");
  var obj = await getGasPrice("safeLow");
  divAtualizacao.innerHTML = obj.toFixed(2).toString() + '  Gwei';
}

var intervaloAtualizacao1 = 3000;
setInterval(_atualizaGas, intervaloAtualizacao1);

function showOptions() {
  const selectFunction = document.getElementById("selectFunction");
  const selectedFunction = selectFunction.value;
  const selectOptionContainer = document.getElementById("selectOptionContainer");
  const selectOption = document.getElementById("selectOption");
  selectOption.innerHTML = "";
  let options = [];
  let values = [];
  switch (selectedFunction) {
    case "refinoAstro":
      options = ["Selecione...", "Orders Astro Ativas", "Orders Astro Prontas", "Claim Astro Orders", "Place Astro Orders"];
      values = ["", "getAllAstroOrders", "getAllAstroOrdersR", "claimAstroOrders", "placeWasteOrder"];
      break;
    case "refinoTokens":
      options = ["Selecione...", "Orders Tokens Ativas", "Orders Tokens Prontas", "Claim Tokens Orders", "Place Tokens Orders"];
      values = ["", "getAllOrders", "getAllOrdersR", "claimOrders", "placeProspectingOrders"];
      break;
    case "balances":
      options = ["Selecione...", "Balances Gas", "Balances Waste", "Balances Tokens"];
      values = ["", "getBalanceGas", "getBalancesWaste", "getAllBalances"];
      break;
    case "facilitys":
      options = ["Selecione...", "Build Facility", "Place Facility", "SpeedUp Facility Order", "Claim Facility Order"];
      values = ["", "BuildFacility", "placeFacility", "speedUpFacilityOrder", "claimFacilityOrder"];
      break;
    case "outros":
      options = ["Selecione...", "Completar Wastes", "Enviar Tokens"];
      values = ["", "CompleteWaste", "sendAll"];
      break;
    default:
      options = ["Selecione uma função primeiro"];
      values = [""];
  }

  options.forEach((option, index) => {
    selectOption.add(new Option(option, values[index]));
  });
  selectOptionContainer.style.display = "block";
}


async function UpdateBalancesMainAccount() {
  const priceMint = [1, 20, 15, 10, 5, 2]
  const tokensId2 = [9, 10, 11, 12, 13, 14]
  let minTiros = 0;
  await Promise.all(
    tokensId2.map(async function (tokenid, i) {
      const balance = await getTokenBalance(privateMainAddress, tokenid);
      const n = Number(balance.toString()) / priceMint[i];
      if (i == 0) {
        minTiros = n;
      } else if (n < minTiros) {
        minTiros = n;
      }
      document.getElementById(tokenid).children[3].textContent = balance.toString();
    })
  );
  document.getElementById('tiros').textContent = minTiros.toFixed(0)
}