async function verifyTimeOrder(order) {
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