const electron = require('electron');
const app = electron.app;
const Menu = electron.Menu;
const Tray = electron.Tray;
const ipcMain = require('electron').ipcMain;

const Ping = require('ping-lite');
const path = require('path');
const menubar = require('menubar')

const iconBlack = path.join(__dirname, 'img', 'icon.png');
const iconRed = path.join(__dirname, 'img', 'iconred.png');

var mb = menubar({
  icon: iconBlack,
  preloadWindow: true,
  //width: 300,
  width: 3000,
  height: 500,
  //height: 300,
});

var settings = {
  server: '8.8.8.8',
}


mb.on('ready', () => {
  var ping = new Ping(settings.server);
  var pings = [];
  const pingsStored = 30; //total number of pings to average and show on graph
  const pingDelay = 1000; //delay in ms between pings
  const slowFactor = 2; //ping has to be greater than slowFactor * rolling average for it to be considered slowed

  mb.showWindow();
  mb.window.openDevTools()

  function update(array, value) {
    if (array.length + 1 > pingsStored) {
      array.shift();
    }
    array.push(value);

    //change icon to red only if current icon is black and vice versa
    if (pings[pings.length - 2] && pings[pings.length - 1]) {
      mb.tray.setImage(iconBlack);
    } else if (!pings[pings.length - 2] && !pings[pings.length - 1]) {
      mb.tray.setImage(iconRed);
    }

    var total = 0;
    var count = 0;
    var packetsDropped = 0;
    for (var i = 0; i < array.length; i++) {
      if (array[i]) {
        total += array[i];
        count++;
      } else {
        packetsDropped++;
      }
    }

    var average = (total/count).toFixed(2);
    var packetLoss = (packetsDropped/array.length).toFixed(2);
    var status;
    if (!value) {
      status = 'disconnected';
    } else if (value > average * slowFactor) {
      status = 'slowed';
    } else {
      status = 'connected';
    }

    var pingData = {
      pingsStored,
      pings,
      average,
      packetsDropped,
      packetLoss,
      status
    }

    mb.window.webContents.send('pingData', pingData);
  }

  setInterval(() => {
    ping.send(function (err, ms) {
      update(pings, ms);
    });
  }, pingDelay);
});
