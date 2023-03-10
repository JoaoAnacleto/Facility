function updateText() {
    const configJson = document.getElementById("configJson").value;
    let config;
    try {
      config = JSON.parse(configJson);
    } catch (error) {
      alert("Erro ao processar JSON de configurações!");
      return;
    }
    console.log(config);
  }
  