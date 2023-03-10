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
  console.log('Configurações salvas com sucesso!');
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

  // limpa as opções anteriores
  selectOption.innerHTML = "";

  // adiciona as opções relevantes
  let options = [];
  let values = [];
  switch (selectedFunction) {
    case "refinoAstro":
      options = ["Orders Astro Ativas", "Orders Astro Prontas", "Claim Astro Orders", "Place Astro Orders"];
      values = ["getAllAstroOrders", "getAllAstroOrdersR", "claimAstroOrders", "placeWasteOrder"];
      break;
    case "refinoTokens":
      options = ["Orders Tokens Ativas", "Orders Tokens Prontas", "Claim Tokens Orders", "Place Tokens Orders"];
      values = ["getAllOrders", "getAllOrdersR", "claimOrders", "placeProspectingOrders"];
      break;
    case "balances":
      options = ["Balances Gas", "Balances Waste", "Balances Tokens"];
      values = ["getBalancesGas", "getBalancesWaste", "getAllBalances"];
      break;
    case "facilitys":
      options = ["Build Facility", "Place Facility", "SpeedUp Facility Order", "Claim Facility Order"];
      values = ["BuildFacility", "placeFacility", "speedUpFacilityOrder", "claimFacilityOrder"];
      break;
    case "outros":
      options = ["Completar Wastes", "Enviar Tokens"];
      values = ["CompleteWaste", "sendAll"];
      break;
    default:
      options = ["Selecione uma função primeiro"];
  }

  options.forEach((option, index) => {
    selectOption.add(new Option(option, values[index]));
  });

  // exibe o container das opções
  selectOptionContainer.style.display = "block";
}

