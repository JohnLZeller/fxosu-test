window.addEventListener('message', function() {
  debugger;
});

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

  navigator.sync.registrations().then(function(results) {
    for (var i = 0; i < results.length; ++i) {
      console.log('Registered Task: ' + results[i].task);
    }
  }).catch(function(err) {
    log('RequestSync registration failed: ' + err);
  });
}

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
      serviceWorker.addEventListener('stateachange', function(event) {
        log("Worker state is now "+event.target.state);
      });
    }, function(error) {
      log('ServiceWorker registration failed with: ' + error);
    });
  });
} else {
  log("Browser does not support Service Worker");
}

document.getElementById('test').addEventListener('click', function() {
  var level = 3;
  var good = true;
  // good = fxosu.mozIsNowGood(level)
  log("Certainty level " + level + ': Is moz now good?');
  if (good == true) {
    log('Yes');
    startreqsync('test15sec');
  }
  else {
    log('No');
  }
});

document.getElementById('fxosactivate').addEventListener('click', function() {
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
    log("mozFxOSUService does not exists");
  }
});