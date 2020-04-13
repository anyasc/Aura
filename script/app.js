// Window Load Event
const tempMax = document.querySelector("#tempMax");
const tempMin = document.querySelector("#tempMin");
const semana = ["Domingo", "Segunda-feira", "Terça-Feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
const semanaAbr = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom", "Seg", "Ter", "Qua"];
const mes = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const configChar = ["Q", "F", "S", "U", "A", "P", "q", "f", "s", "u", "a", "p"]
let localConfig = {
  tempAlta: document.querySelector("#tempAltaCheck"),
  tempBaixa: document.querySelector("#tempBaixaCheck"),
  seco: document.querySelector("#secoCheck"),
  umido: document.querySelector("#umidoCheck"),
  beberAgua: document.querySelector("#aguaCheck"),
  pulseira: document.querySelector("#pulseiraCheck")
}
let ultimoAlerta = ["", 0]


// Bluetooth

// WebBluetooth

const updateBtn = document.querySelector("#update-btn");
updateBtn.addEventListener("click", e => {
  e.preventDefault();
  send("u");
})

// Storing Device and Characteristics info
let deviceCache = null;
let characteristicCache = null;
let readBuffer = '';

function log(data) {
  console.log(data);
}

let connect_bt = document.querySelector('#connect-bt');
connect_bt.addEventListener('click', function e() {
  connect();
  connect_bt.removeEventListener('click', e);
});

function update_connect_bt(action_type) {
  if (action_type.toLowerCase() === 'connect') {
    connect_bt.querySelector('span.text').textContent = 'Connect';
    connect_bt.addEventListener('click', function e() { connect(); connect_bt.removeEventListener('click', e); });
  }
  else if (action_type.toLowerCase() === 'disconnect') {
    connect_bt.querySelector('span.text').textContent = 'Disconnect';
    connect_bt.addEventListener('click', function e() { disconnect(); connect_bt.removeEventListener('click', e); });
  }
}

function connect() {
  return (deviceCache ? Promise.resolve(deviceCache) :
    requestBluetoothDevice()).
    then(device => connectDeviceAndCacheCharacteristic(device)).
    then(characteristic => startNotifications(characteristic)).
    then(() => {
      update_connect_bt('disconnect');
    }).
    then(() => send("l")).
    catch(error => log(error));
}

function requestBluetoothDevice() {
  log('Requesting bluetooth device...');

  return navigator.bluetooth.requestDevice({
    filters: [{ services: [0xFFE0] }]
  }).then(device => {
    log('"' + device.name + '" bluetooth device selected');
    deviceCache = device;

    deviceCache.addEventListener('gattserverdisconnected',
      handleDisconnection);

    return deviceCache;
  })
}

function connectDeviceAndCacheCharacteristic(device) {
  if (device.gatt.connected && characteristicCache) {
    return Promise.resolve(characteristicCache);
  }

  log('Connecting to GATT server...');

  return device.gatt.connect().
    then(server => {
      log('GATT server connected, getting service...');

      return server.getPrimaryService(0xFFE0);
    }).
    then(service => {
      log('Service found, getting characteristic...');

      return service.getCharacteristic(0xFFE1);
    }).
    then(characteristic => {
      log('Characteristic found');
      characteristicCache = characteristic;

      return characteristicCache;
    });
}

function startNotifications(characteristic) {
  log('Starting notifications...');

  return characteristic.startNotifications().
    then(() => {
      log('Notifications started');

      characteristic.addEventListener('characteristicvaluechanged',
        handleCharacteristicValueChanged);
    });
}

function handleCharacteristicValueChanged(event) {
  let value = new TextDecoder().decode(event.target.value);

  for (let c of value) {
    if (c === '\n') {
      let data = readBuffer.trim();
      readBuffer = '';

      if (data) {
        evaluateData(data);
      }
    }
    else {
      readBuffer += c;
    }
  }
}

function evaluateData(data) {
  console.log(data);
  let info = data.split(';');

  if (info[0].toUpperCase() === 'TEMP') {
    // update_temperature(info[1]);
    let temperature = document.querySelector('span.temperature');
    temperature.textContent = Math.round(Number(info[1]));
  } else if (info[0].toUpperCase() === 'UMID') {
    // update_umidade
    let umidade = document.querySelector('span.humidity');
    umidade.textContent = Math.round(Number(info[1]));
  } else if (info[0].toUpperCase() === 'UV') {
    // update_uv
    let uvIndex = Number(info[1]);
    let uvString = "";
    if (uvIndex >= 11) {
      uvString = "Extremo"
    } else if (uvIndex >= 8) {
      uvString = "Muito alto"
    } else if (uvIndex >= 6) {
      uvString = "Alto"
    } else if (uvIndex >= 3) {
      uvString = "Moderado"
    } else {
      uvString = "Baixo"
    }
    let uv = document.querySelector('span.uv');
    uv.textContent = uvString;
  } else if (info[0].toUpperCase() === "ALERT") {
    createAlert(info[1]);
  }
}

function disconnect() {
  if (deviceCache) {
    log('Disconnecting from "' + deviceCache.name + '" bluetooth device...');
    deviceCache.removeEventListener('gattserverdisconnected',
      handleDisconnection);

    if (deviceCache.gatt.connected) {
      deviceCache.gatt.disconnect();
      log('"' + deviceCache.name + '" bluetooth device disconnected');
    }
    else {
      log('"' + deviceCache.name +
        '" bluetooth device is already disconnected');
    }
  }

  if (characteristicCache) {
    characteristicCache.removeEventListener('characteristicvaluechanged',
      handleCharacteristicValueChanged);
    characteristicCache = null;
  }

  notification('Disconnected from ' + deviceCache.name)
  deviceCache = null;

  update_connect_bt('connect');
}

function handleDisconnection(event) {
  let device = event.target;

  log('"' + device.name +
    '" bluetooth device disconnected, trying to reconnect...');

  connectDeviceAndCacheCharacteristic(device).
    then(characteristic => startNotifications(characteristic)).
    catch(error => log(error));
}



// Window Load

window.addEventListener("load", function () {
  let today = new Date();
  document.querySelector("#hoje").innerText = semana[today.getDay()]
  document.querySelector("#diacompleto").innerText = semana[today.getDay()] + ", " + today.getDate() + " de " + mes[today.getMonth()].toLowerCase() + " de " + today.getFullYear();
  document.querySelector("#amanha").innerText = semanaAbr[today.getDay() + 1]
  document.querySelector("#da").innerText = semanaAbr[today.getDay() + 2]
  document.querySelector("#dda").innerText = semanaAbr[today.getDay() + 3]
  document.querySelector("#ddda").innerText = semanaAbr[today.getDay() + 4]
  updateAPI();

  localforage.getItem("config")
    .then(value => {
      if (value === null) {
        console.log("Configurações não encontradas");
        localforage.setItem("config", {
          tempAlta: 1,
          tempBaixa: 1,
          seco: 1,
          umido: 0,
          beberAgua: 1,
          pulseira: 1
        })
          .then(value => {
            Object.keys(value).forEach(item => {
              console.log(item, value[item]);
              if (value[item] === 0) {
                uncheck(localConfig[item])
              } else {
                check(localConfig[item]);
              }
            })
          })
      } else {
        Object.keys(value).forEach(item => {
          console.log(item, value[item]);
          if (value[item] === 0) {
            uncheck(localConfig[item])
          } else {
            check(localConfig[item])
          }
        })
      }
    });

});


// Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./script/sw.js')
      .then(reg => console.log(`Service Worker registered ${reg}`))
      .catch(err => console.log(`Error: ${err}`));
  });
}


// Hamburguer
const index = document.querySelector("#index")
const config = document.querySelector("#config")
const hamburguerIndex = document.querySelector("#hamburguer-index");
const hamburguerConfig = document.querySelector("#hamburguer-config");

hamburguerIndex.addEventListener('click', openConfig)
hamburguerConfig.addEventListener('click', openConfig)

function openConfig() {
  index.classList.toggle('inactive');
  config.classList.toggle('inactive');
}

// API
const darksky = "https://api.darksky.net/forecast/9d783ced70007d510216381c3579ba6a/-23.5489,-46.6388?lang=pt&units=si&exclude=minutely,hourly,flags"
const proxy = "https://cors-anywhere.herokuapp.com/"

const previsao = document.querySelector("#previsao");

function updateAPI() {
  fetch(proxy + darksky)
    .then(res => {
      return res.json()
    }
    )
    .then(data => {
      document.querySelector("#tempMax").innerText = Math.round(data.daily.data[0].temperatureHigh);
      document.querySelector("#tempMin").innerText = Math.round(data.daily.data[0].temperatureLow);
      document.querySelector("#chuva").innerText = Math.round(data.daily.data[0].precipProbability * 100);
      document.querySelector("#umidHoje").innerText = data.daily.data[0].humidity * 100;
      
      document.querySelector("#compTempMax").innerText = Math.round(data.daily.data[0].temperatureHigh);
      document.querySelector("#compTempMin").innerText = Math.round(data.daily.data[0].temperatureLow);
      document.querySelector("#compChuva").innerText = Math.round(data.daily.data[0].precipProbability * 100);
      
      document.querySelector("#amanhaTempMax").innerText = Math.round(data.daily.data[1].temperatureHigh);
      document.querySelector("#amanhaTempMin").innerText = Math.round(data.daily.data[1].temperatureLow);
      
      document.querySelector("#daTempMax").innerText = Math.round(data.daily.data[1].temperatureHigh);
      document.querySelector("#daTempMin").innerText = Math.round(data.daily.data[1].temperatureLow);
      
      document.querySelector("#ddaTempMax").innerText = Math.round(data.daily.data[1].temperatureHigh);
      document.querySelector("#ddaTempMin").innerText = Math.round(data.daily.data[1].temperatureLow);
      
      document.querySelector("#dddaTempMax").innerText = Math.round(data.daily.data[1].temperatureHigh);
      document.querySelector("#dddaTempMin").innerText = Math.round(data.daily.data[1].temperatureLow);
      
      document.querySelector("#iconPrevHoje").innerHTML = iconSwitch(data.daily.data[0].icon) + ' class="climaIcon">';
      document.querySelector("#iconPrevHojeModal").innerHTML = iconSwitch(data.daily.data[0].icon) + ' class="climaIcon">';
      document.querySelector("#iconPrevAmanha").innerHTML = iconSwitch(data.daily.data[1].icon) + ' style="padding-left: 15%;" class="climaSemana">';
      document.querySelector("#iconPrevDA").innerHTML = iconSwitch(data.daily.data[2].icon) + ' class="climaSemana">';
      document.querySelector("#iconPrevDDA").innerHTML = iconSwitch(data.daily.data[3].icon) + ' style=" padding-left: 0;" class="climaSemana">';
      document.querySelector("#iconPrevDDDA").innerHTML = iconSwitch(data.daily.data[4].icon) + ' class="climaSemana">';
    })
    .catch(err => console.log("Não foi possível acessar a API"))
}

function iconSwitch(icon) {
  switch (icon) {
    case "clear-day":
      return '<img src="./img/sol.svg" alt="Dia limpo"';
    case "clear-night":
      return '<img src="./img/lua.svg" alt="Noite limpa"';
    case "rain":
      return '<img src="./img/tempestade.svg" alt="Chuva"';
     case "cloudy":
       return '<img src="./img/sol_nublado.svg" alt="Nublado"';
    case "partly-cloudy-day":
      return '<img src="./img/sol_nublado.svg" alt="Dia parcialmente nublado"';
    case "partly-cloudy-night":
      return '<img src="./img/lua_nublado.svg" alt="Noite parcialmente nublada"';
    default:
      return '<img src=".img/sol.svg alt="Dia limpo"';
  }
}


// Config

function check(box) {
  box.checked = true;
}

function uncheck(box) {
  box.checked = false
}

Object.keys(localConfig).forEach(item => {
  localConfig[item].addEventListener("click", e => {
    let el = e.srcElement;
    let i;
    if (el.checked) {
      if (el.id == "tempAltaCheck") {
        i = 0;
      } else if (el.id == "tempBaixaCheck") {
        i = 1;
      } else if (el.id == "secoCheck") {
        i = 2;
      } else if (el.id == "umidoCheck") {
        i = 3;
      } else if (el.id == "aguaCheck") {
        i = 4;
      } else if (el.id == "pulseiraCheck") {
        i = 5;
      }
    } else {
      if (el.id == "tempAltaCheck") {
        i = 6;
      } else if (el.id == "tempBaixaCheck") {
        i = 7;
      } else if (el.id == "secoCheck") {
        i = 8;
      } else if (el.id == "umidoCheck") {
        i = 9;
      } else if (el.id == "aguaCheck") {
        i = 10;
      } else if (el.id == "pulseiraCheck") {
        i = 11;
      }
    }
    send(configChar[i]);
    updateConfig();
  })
})

function updateConfig() {
  let newConfig = {};
  Object.keys(localConfig).forEach(item => {
    if (localConfig[item].checked === true) {
      newConfig[item] = 1;
    } else {
      newConfig[item] = 0
    }
  })
  localforage.setItem("config", newConfig)
    .then(value => console.log(value))
}

function createAlert(categoria) {
  if (categoria !== ultimoAlerta[0] || Date.now() - ultimoAlerta[1] > 10800000) {

    let alert = document.createElement("div");
    let arr = alertFilter(categoria);
    alert.innerHTML = `
    <div class="alert  alert-${arr[0]} alert-dismissible fade show" style="padding-right: 10%;">
    <h4 class="alert-heading"> ${arr[1]}</h4>
    ${arr[2]}
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
    <span aria-hidden="true">&times;</span>
    </button>
    </div>
    `;
    document.querySelector("#alert-div").appendChild(alert);
    ultimoAlerta = [categoria, Date.now()]
  }
}

function alertFilter(str) {
  switch (str) {
    case "TALTA":
      return ["warning", "Temperatura alta!", "Evite a exposição direta ao sol e mantenha-se hidratada(o)."];
    case "TBAIXA":
      return ["warning", "Temperatura baixa!", "Mantenha-se agasalhada(o)."];
    case "UALTA":
      return ["warning", "Umidade do ar alta!", "Lembre-se de levar seu guarda-chuva!"];
    case "UBAIXA":
      return ["danger", "Umidade do ar baixa!", "Evite a prática de atividades ao ar livre e mantenha-se hidratada(o)."];
    case "AGUA":
      return ["info", "Beba água!", "", "Mantenha-se hidratada(o)!"];
  }
}


// Send Data

function send(data) {
  data = String(data);

  if (!data || !characteristicCache) {
    return;
  }

  writeToCharacteristic(characteristicCache, data);

  console.log(data, 'out');
}

function writeToCharacteristic(characteristic, data) {
  characteristic.writeValue(new TextEncoder().encode(data));
}