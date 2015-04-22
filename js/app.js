window.addEventListener('message', function() {
  debugger;
});

if ('serviceWorker' in navigator) {
  log("Browser supports Service Worker");
  if (navigator.serviceWorker.current) {
    log("Current Service Worker state: \\o/");
  } else {
    log("No Service Worker active");
  }

  document.getElementById('swinstall').addEventListener('click', function() {
    log('----- Installing a Service Worker -----');
    navigator.serviceWorker.register('sw.js', { scope: './' })
    .then(function(serviceWorker) {
      log('ServiceWorker registration succeeded');
    }, function(error) {
      log('ServiceWorker registration failed with: ' + error);
    });
  });
} else {
  log("Browser does not support Service Worker");
}

document.getElementById('swreqtest').addEventListener('click', swreqTest);
// document.getElementById('Data').addEventListener('click', bmTest;
document.getElementById('fxosutest').addEventListener('click', fxosuTest);
document.getElementById('bm0').addEventListener('click', function(){ bmTest(0); });
document.getElementById('bm1').addEventListener('click', function(){ bmTest(1); });
document.getElementById('bm2').addEventListener('click', function(){ bmTest(2); });
document.getElementById('bm3').addEventListener('click', function(){ bmTest(3); });

function log(msg) {
  var el = document.createElement('div');
  el.innerHTML = Array.prototype.join.call(arguments, '<br />');
  document.getElementById('js-log').appendChild(el);
  console.log(msg);
}

function startreqsync(task) {
  navigator.sync.register(task,
  { minInterval: 15,
    oneShot: false,
    data: { accountID: 123 },
    wifiOnly: false,
    wakeUpPage: location.href })
  .then(function() {
    log('Task: ' + task + ' registered');
  }).catch(function(err) {
    log('Task registration failed: ' + err);
  });
}

function swreqTest() {
  if ('mozFxOSUService' in navigator) {
    var fxosu = navigator.mozFxOSUService;
    var level = 3;
    var good = false;
    good = fxosu.mozIsNowGood(level, false)
    log("Certainty level " + level + ': Is moz now good?');
    if (good == true) {
      log('Yes');
      startreqsync('test15sec');
    }
    else {
      log('No');
    }
  } else {
    log("mozFxOSUService does not exists");
  }
}

function fxosuTest() {
  if ('mozFxOSUService' in navigator) {
    var fxosu = navigator.mozFxOSUService;
    var netlat = fxosu.showLatency();
    document.getElementById('batlevel').innerHTML = fxosu.batteryLevel() * 100 + "%";
    document.getElementById('batcharge').innerHTML = (fxosu.batteryCharging() == true ? 'Yes' : 'No');
    if (fxosu.batteryLevel() == 1) {
      document.getElementById('batcharge').innerHTML += " (battery is 100%, so might be charging)";
    }
    document.getElementById('connected').innerHTML = (fxosu.connectionUp() == true ? 'Yes' : 'No');
    document.getElementById('latency').innerHTML = netlat.networkLatency;
    document.getElementById('ctype').innerHTML = fxosu.connectionType();
    document.getElementById('high').innerHTML = fxosu.mozIsNowGood(1);
    document.getElementById('mod').innerHTML = fxosu.mozIsNowGood(2);
    document.getElementById('low').innerHTML = fxosu.mozIsNowGood(3);
  } else {
    console.log("mozFxOSUService does not exists");
  }
}

function bmTest(level) {
  // performance goal: CPU, memory, battery, network activities
  // constraints: 5 apps, 10 requests

  var start = performance.now();
  // var bat_start = navigator.battery.level;
  // var mem_start = 0;
  // var net_start = 0;

  if (level == 0) {
    console.log("Running without mozFxOSUService");
    runBenchmark()
  } else {
    if ('mozFxOSUService' in navigator) {
      console.log("Running with mozFxOSUService");
      var fxosu = navigator.mozFxOSUService;
      var level = 3;
      var good = false;
      good = fxosu.mozIsNowGood(level, false)
      console.log("Certainty level " + level + ': Is moz now good?');
      if (good == true) {
        console.log('Yes');
        runBenchmark()
      }
      else {
        console.log('No');
      }
    } else {
      console.log("mozFxOSUService does not exists");
      console.log("Running without mozFxOSUService");
      runBenchmark()
    }
  }

  // var bat_end = navigator.battery.level;
  // var mem_end = 0;
  // var net_end = 0;
  var end = performance.now();

  var bat_usage = 0; // bat_end - bat_start) * 100;
  var mem_usage = 0; // mem_end - mem_start;
  var net_usage = 0; // net_end - net_start;
  var time = end - start;

  var content = "Time: " + time.toPrecision(3) + " milliseconds<br \>Memory usage: " + mem_usage + "<br \>Battery usage: " + bat_usage + "%<br \>Network usage: " + net_usage + " bytes";
  document.getElementById("bmcontent").innerHTML = content;
}

function runBenchmark(level) {
  // make web request
  var xmlhttp = new XMLHttpRequest();
  var url = "http://www.google.com";
  xmlhttp.open("GET", url, false);
  xmlhttp.send(null);
  if ( xmlhttp.readyState == 4 && xmlhttp.status == 200 ) {
    document.getElementById("bmresponse").innerHTML = xmlhttp.responseText;
  }
}