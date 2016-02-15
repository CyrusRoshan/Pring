const ipcRenderer = require('electron').ipcRenderer;

var data = {
  labels: [],
  datasets: [{
    label: '',
    fillColor: "rgba(220,220,220,0.2)",
    strokeColor: "rgba(220,220,220,1)",
    pointColor: "rgba(220,220,220,1)",
    pointStrokeColor: "#fff",
    pointHighlightFill: "#fff",
    pointHighlightStroke: "rgba(220,220,220,1)",
    data: []
  }]
}

var ctx = document.getElementById('pingGraph').getContext('2d');
var pingGraph = new Chart(ctx).Line(data);//, options);

ipcRenderer.on('pingData', function(event, arg) {
  console.log(arg);
  // arg is [pingsStored, pingTimes, average, packetLoss, connected]

  if (pingGraph.datasets[0].points.length < arg[0]) {
    pingGraph.addData([arg[1][arg[1].length - 1]], ''); //add the last item in pingsTime to the graph
  } else {
    for (var i = 0; i < arg[0] - 1; i++) {
      pingGraph.datasets[0].points[i].value = pingGraph.datasets[0].points[i + 1].value;
    }
    pingGraph.datasets[0].points[arg[0] - 1].value = arg[1][arg[0] - 1];
  }
  pingGraph.update();
});
