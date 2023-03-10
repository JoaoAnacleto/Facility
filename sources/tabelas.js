async function obterPrecoReal() {
    const xhr = new XMLHttpRequest();
    const url = "https://https://nft.bitkeep.com/en/collection/matic/0xba6666b118f8303f990f3519df07e160227cce87/7";
  
    xhr.open("GET", url);
  
    xhr.onload = function() {
      try {
        if (xhr.status === 200) {
          const responseHTML = xhr.responseText;
  
          const responseContainer = document.createElement("div");
          responseContainer.innerHTML = responseHTML;
  
          const realPriceElement = responseContainer.querySelector("span.text1.realPrice");
          const realPriceText = realPriceElement.textContent;
  
          console.log(realPriceText);
        } else {
          console.log("Ocorreu um erro ao fazer a requisição.");
        }
      } catch (error) {
        console.error(error);
      }
    };
  
    xhr.send();
}


async function verifyTimeOrder(order){
  //log(order.toString())
  const data1 = new Date(order[2] * 1000);
  const data2 = new Date();
  const diffEmMs = data2.getTime() - data1.getTime();
  const diffEmHoras = diffEmMs / 3600000;
 //log(diffEmHoras)
  return diffEmHoras
}

async function log(...args) {
  var logDiv = document.getElementById("log");
  var p = document.createElement("p");
  var text = args.join(" ");
  console.log(text)
  p.textContent = text;
  logDiv.appendChild(p);
}
async function limparLog() {
  var logDiv = document.getElementById("log");
  logDiv.innerHTML = "";
}