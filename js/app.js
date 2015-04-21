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
// document.getElementById('Data').addEventListener('click', bmTest());
document.getElementById('bm').addEventListener('click', bmTest);
document.getElementById('fxosutest').addEventListener('click', fxosuTest);

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

function bmTest() {
  // performance goal: CPU, memory, battery, network activities
  // constraints: 5 apps, 10 requests
  var start = performance.now();
  var result = runBenchmark()
  var end = performance.now();
  var time = end - start;
  var content = "Time: " + time.toPrecision(3) + " milliseconds<br \>Memory usage: " + result.mem_usage + "<br \>Battery usage: " + result.bat_usage + "%<br \>Network usage: " + result.net_usage + " bytes";
  document.getElementById("bmcontent").innerHTML = content;
}

function runBenchmark() {
  var bat = navigator.battery;
  var bat_start = bat.level;
  var bat_end = bat.level;
  var result = {};
  result.mem_usage = 0;
  result.bat_usage = (bat_end - bat_start) * 100;
  result.net_usage = 0;
  
  return result
}