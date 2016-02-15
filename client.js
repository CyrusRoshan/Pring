const ipcRenderer = require('electron').ipcRenderer;

Chart.defaults.global.animation = true;
Chart.defaults.global.animationSteps = 5;
Chart.defaults.global.animationEasing = 'easeInExpo';
Chart.defaults.global.tooltipTitleFontSize = 5;

var data = {
  labels: [],
  datasets: [{
    label: '',
    fillColor: 'rgba(151,187,205,0.2)',
    strokeColor: 'rgba(151,187,205,1)',
    pointColor: '#fff',
    pointStrokeColor: 'rgba(151,187,205,1)',
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
  pointDotRadius : 2,
  pointDotStrokeWidth : 2,
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

  if (pingGraph.datasets[0].points.length < pingData.pingsStored) {
    pingGraph.addData([pingData.pings[pingData.pings.length - 1]], ''); //add the last ping to the graph
  } else {
    for (var i = 0; i < pingData.pingsStored - 1; i++) {
      pingGraph.datasets[0].points[i].value = pingGraph.datasets[0].points[i + 1].value; //shift values down
    }
    pingGraph.datasets[0].points[i].value = pingData.pings[i]; //update the rightmost value
  }

  pingGraph.update();



});
