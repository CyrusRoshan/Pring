const ipcRenderer = require('electron').ipcRenderer;

Chart.defaults.global.animation = true;
Chart.defaults.global.animationSteps = 2;
Chart.defaults.global.animationEasing = 'easeInExpo';
Chart.defaults.global.tooltipTitleFontSize = 5;
Chart.defaults.global.scaleFontFamily = 'lato';

var data = {
  labels: [],
  datasets: [{
    label: '',
    fillColor: 'rgba(151,187,205,0.2)',
    strokeColor: 'rgb(68, 115, 139)',
    pointColor: 'rgb(213, 227, 234)',
    pointStrokeColor: 'rgb(10, 45, 62)',
    pointHighlightFill: '#fff',
    pointHighlightStroke: 'rgba(151,187,205,1)',
    data: []
  }]
}

var options = {
  scaleShowGridLines : true,
  scaleGridLineColor : 'rgba(0,0,0,.05)',
  scaleGridLineWidth : 1,
  scaleShowHorizontalLines: true,
  scaleShowVerticalLines: true,
  bezierCurve : true,
  bezierCurveTension : 0.4,
  pointDot : true,
  pointDotRadius : 1,
  pointDotStrokeWidth : 1,
  pointHitDetectionRadius : 2,
  datasetStroke : true,
  datasetStrokeWidth : 1,
  datasetFill : true,
  legendTemplate : ''
}

var ctx = document.getElementById('pingGraph').getContext('2d');
var pingGraph = new Chart(ctx).Line(data, options);

ipcRenderer.on('pingData', function(event, pingData) {
  console.log(pingData);

  var lastPing = pingData.pings[pingData.pings.length - 1];

  document.getElementById('current').innerHTML = `Curr: ${lastPing ? lastPing.toFixed(2) + ' ms' : 'none'}`;
  document.getElementById('average').innerHTML = `Avg: ${pingData.average} ms`;
  document.getElementById('packetLoss').innerHTML = `Loss: ${pingData.packetsDropped} of ${pingData.pings.length}, or ${pingData.packetLoss}%`;
  document.getElementById('status').innerHTML = `<div class='${pingData.status}'>${pingData.status}</div>`;

  if (pingGraph.datasets[0].points.length < pingData.pingsStored) {
    pingGraph.addData([lastPing], ''); //add the last ping to the graph
  } else {
    for (var i = 0; i < pingData.pingsStored - 1; i++) {
      pingGraph.datasets[0].points[i].value = pingGraph.datasets[0].points[i + 1].value; //shift values down
    }
    pingGraph.datasets[0].points[i].value = pingData.pings[i]; //update the rightmost value
  }

  pingGraph.update();
});
