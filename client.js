const ipcRenderer = require('electron').ipcRenderer;

Chart.defaults.global.animation = true;
Chart.defaults.global.animationSteps = 5;
Chart.defaults.global.animationEasing = 'easeInExpo';
Chart.defaults.global.tooltipTitleFontSize = 5;
Chart.defaults.global.tooltipXOffset = 3;
//Chart.defaults.global.tooltipYPadding = 3;
//Chart.defaults.global.tooltipXPadding = 3;

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

ipcRenderer.on('pingData', function(event, arg) {
  console.log(arg);
  // arg is [pingsStored, pingTimes, average, packetLoss, connected]

  if (pingGraph.datasets[0].points.length < arg[0]) {
    pingGraph.addData([arg[1][arg[1].length - 1]], ''); //add the last item in pingsTime to the graph
  } else {
    for (var i = 0; i < arg[0] - 1; i++) {
      pingGraph.datasets[0].points[i].value = pingGraph.datasets[0].points[i + 1].value; //shift values down
    }
    pingGraph.datasets[0].points[arg[0] - 1].value = arg[1][arg[0] - 1]; //update the rightmost value
  }
  pingGraph.update();
});
