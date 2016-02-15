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
  width: 2500,
  height: 300,
});

var settings = {
  server: '8.8.8.8',
}


mb.on('ready', function ready () {
  var ping = new Ping(settings.server);
  var pingTimes = [];
  const pingsStored = 30;

  mb.showWindow();
  mb.window.openDevTools();

  function update(array, value) {
    if (array.length + 1 > pingsStored) {
      array.shift();
    }
    array.push(value);

    //change icon to red only if current icon is black and vice versa
    if (pingTimes[pingTimes.length - 2] && pingTimes[pingTimes.length - 1]) {
      mb.tray.setImage(iconBlack);
    } else if (!pingTimes[pingTimes.length - 2] && !pingTimes[pingTimes.length - 1]) {
      mb.tray.setImage(iconRed);
    }

    var total = 0;
    var count = 0;
    var dropped = 0;
    for (var i = 0; i < array.length; i++) {
      if (array[i]) {
        total += array[i];
        count++;
      } else {
        dropped++;
      }
    }

    var average = total/count;
    var packetLoss = dropped/array.length;

    mb.window.webContents.send('pingData', [pingsStored, pingTimes, average, packetLoss, Boolean(pingTimes[pingTimes.length - 1])]);
  }


  setInterval(() => {
    ping.send(function (err, ms) {
      update(pingTimes, ms);
    });
  }, 1000);


});
