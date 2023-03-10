var btn = false
function toggle() {
    if (btn == false) {
        btn = true
    } else {
        btn = false
    }
}
  
async function _atualizaGas() {
    var divAtualizacao = document.getElementById("gas");
    var obj = await getGasPrice("safeLow");  
    divAtualizacao.innerHTML = obj.toFixed(2).toString() + '  Gwei';
}

async function _verificaOrdensProntas() {
    if(btn == true){
        var ord = await getAllOrders(1);
        if(ord > 0){
            alert(`Existem ${ord} ordens prontas!`);
        } 
    }
}

var intervaloAtualizacao1 = 3000;
var intervaloAtualizacao2 = 30000;
setInterval(_atualizaGas, intervaloAtualizacao1);
setInterval(_verificaOrdensProntas, intervaloAtualizacao2);


function iniciarCiclo() {
    log('Ciclo iniciado. Collect a cada 4 horas.')
    collectAll();
    function chamarFuncaoPeriodicamente() {
      setInterval(collectAll, 14400000); // 4 horas em milissegundos
    }
  
    chamarFuncaoPeriodicamente(); // inicia a chamada da função a cada 4 horas
}
  
  