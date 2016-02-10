const electron = require('electron');
const app = electron.app;
const Menu = electron.Menu;
const Tray = electron.Tray;

const Ping = require('ping-lite');
const path = require('path');
const menubar = require('menubar')

const iconBlack = path.join(__dirname, 'img', 'icon.png');
const iconRed = path.join(__dirname, 'img', 'iconred.png');

var mb = menubar({
  icon: iconBlack,
  width: 250,
  height: 300,
});

//mb.tray.setImage(iconRed);

var settings = {
  server: '8.8.8.8',
}


mb.on('ready', function ready () {
  var ping = new Ping(settings.server);
  setInterval(() => pingServer(ping), 500);
});

function pingServer(obj) {
  obj.send(function(err, ms) {
    console.log('#'.repeat(ms) + '   ' + ms);
  });
}
