// WebBluetooth

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
    catch(error => log(error));
}

function requestBluetoothDevice() {
  log('Requesting bluetooth device...');

  return navigator.bluetooth.requestDevice({
    filters: [{ services: [0xFFE0]}]
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
    temperature.textContent = info[1];
  } else if (info[0].toUpperCase() === 'UMID') {
    // update_umidade
    let umidade = document.querySelector('span.humidity');
    umidade.textContent = info[1];
  } else if (info[0].toUpperCase() === 'UV') {
    // update_uv
    let uv = document.querySelector('span.uv');
    uv.textContent = info[1];
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

function sendData(data) {
  data = String(data);
  if (!data) {
    console.log('Nenhum dado a ser enviado');
    return;
  }
  else if (data.length > 20) {
    console.log('Mensagem deve ser limitada a 20 bytes');
    return;
  }
  // envia os dados para o device
  characteristicCache.writeValue(new TextEncoder().encode(data));
  console.log('Dados enviados: '+data)
}
