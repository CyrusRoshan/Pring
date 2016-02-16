const electron = require('electron');
const app = electron.app;
const Menu = electron.Menu;
const Tray = electron.Tray;
const ipcMain = require('electron').ipcMain;

const Ping = require('ping-lite');
const path = require('path');
const menubar = require('menubar')
const notifier = require('node-notifier');

const iconBlack = path.join(__dirname, 'img', 'icon.png');
const iconOrange = path.join(__dirname, 'img', 'iconOrange.png');
const iconRed = path.join(__dirname, 'img', 'iconRed.png');

var mb = menubar({
  icon: iconBlack,
  preloadWindow: true,
  width: 300,
  height: 310,
  transparent: true,
});

var settings = {
  server: '8.8.8.8',
}


mb.on('ready', () => {

  mb.tray.setToolTip('This is my application.');

  var alerts = {dc: false, slow: false, rc: false};
  var status;

  var ping = new Ping(settings.server);
  var pings = [];

  const pingsStored = 30; //total number of pings to average and show on graph
  const pingDelay = 1000; //delay in ms between pings
  const slowFactor = 1.7; //ping has to be greater than slowFactor * rolling average for it to be considered slowed

  mb.tray.on('right-click', function(){
    var contextMenu = Menu.buildFromTemplate([
      {label: 'Alert when disconnected', type: 'checkbox', checked: alerts.dc, click: () => {alerts.dc = !alerts.dc}},
      {label: 'Alert when slowed', type: 'checkbox', checked: alerts.slow, click: () => {alerts.slow = !alerts.slow}},
      {label: 'Alert when reconnected', type: 'checkbox', checked: alerts.rc, click: () => {alerts.rc = !alerts.rc}},
      {type: 'separator'},
      {label: 'Exit', click: () => {app.quit()}},
    ]);
    mb.tray.popUpContextMenu(contextMenu)
  });

  function alert(title, img) {
    notifier.notify({
      title,
      message: 'Your connection has been ' + title,
      icon: path.join(__dirname, 'img', img),
      sound: true,
      wait: false
    });
  }

  function update(array, value) {
    if (array.length + 1 > pingsStored) {
      array.shift();
    }
    array.push(value);

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

    if (!value) { //when disconnected
      if (alerts.dc && status != 'disconnected') {
        alert('Disconnected', 'iconNotifRed.png');
      }
      if (status != 'disconnected') {
        mb.tray.setImage(iconRed);
        status = 'disconnected';
      }

    } else if (value > average * slowFactor) { //when slowed
      if (alerts.rc && status != 'slowed') {
        alert('Slowed', 'iconNotifOrange.png');
      }
      if (status != 'slowed') {
        mb.tray.setImage(iconOrange);
        status = 'slowed';
      }

    } else { //when connected
      if (alerts.dc && status === 'disconnected') {
        alert('Reconnected', 'iconNotif.png');
      }
      if (status != 'connected') {
        mb.tray.setImage(iconBlack);
        status = 'connected';
      }
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
