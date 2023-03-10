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