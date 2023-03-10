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
    console.log(...args); // chama o console.log() padrão
    logContent.textContent += args.join(' ') + '\n';
    logPopup.style.display = 'block';
}

