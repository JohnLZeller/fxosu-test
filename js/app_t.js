window.addEventListener('message', function() {
  debugger;
});

function log(msg) {
  var el = document.createElement('div');
  el.innerHTML = Array.prototype.join.call(arguments, '<br />');
  document.getElementById('js-log').appendChild(el);
  console.log(msg);
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
  if ('mozFxOSUService' in navigator) {
    var fxosu = navigator.mozFxOSUService;
    var level = 3;
    var good = false;
    good = fxosu.mozIsNowGood(level)
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
});

document.getElementById('fxosactivate').addEventListener('click', function() {
  if ('mozFxOSUService' in navigator) {
    var fxosu = navigator.mozFxOSUService;
    document.getElementById('batlevel').innerHTML = fxosu.batteryLevel() * 100 + "%";
    document.getElementById('batcharge').innerHTML = (fxosu.batteryCharging() == true ? 'Yes' : 'No');
    if (fxosu.batteryLevel() == 1) {
      document.getElementById('batcharge').innerHTML += " (battery is 100%, so might be charging)";
    }
    document.getElementById('connected').innerHTML = (fxosu.connectionUp() == true ? 'Yes' : 'No');
    document.getElementById('latency').innerHTML = fxosu.getLatency();
    document.getElementById('ctype').innerHTML = fxosu.connectionType();
    // document.getElementById('rx').innerHTML = nsinfo.rx;
    // document.getElementById('tx').innerHTML = nsinfo.tx;

    document.getElementById('high').innerHTML = fxosu.mozIsNowGood(1);
    document.getElementById('mod').innerHTML = fxosu.mozIsNowGood(2);
    document.getElementById('low').innerHTML = fxosu.mozIsNowGood(3);
  } else {
    log("mozFxOSUService does not exists");
  }
});

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

if ('mozNetworkStats' in navigator) {
  var rate = navigator.mozNetworkStats.sampleRate;
  var max  = navigator.mozNetworkStats.maxStorageSample;
  var types = navigator.mozNetworkStats.connectionTypes;
  var manageWifi   = navigator.mozNetworkStats.connectionTypes.indexOf('wifi')   > -1;
  var manageMobile = navigator.mozNetworkStats.connectionTypes.indexOf('mobile') > -1;

  var config = {
    start: new Date() - (rate * max), // This allows to get all the available data chunks.
    end  : new Date(),
    connectionType: manageWifi ? 'wifi' : null
  };
  var request = navigator.mozNetworkStats.getNetworkStats(config);
  request.onsuccess = function () {
    var total = {
      receive: 0,
      send   : 0
    };
    this.result.forEach(function (chunk) {
      total.receive += chunk.rxBytes;
      total.send    += chunk.txBytes;
    });
    log("-----Getting network status-----");
    log("Connection type: " + types);
    log("Since: " + config.start.toString());
    log("Data received: " + (total.receive * 1000).toFixed(2) + "Ko");
    log("Data sent: " + (total.send * 1000).toFixed(2) + "Ko")
  }
  request.onerror = function () {
    log("Error on getting network status: ", request.error);
  }
} else {
  log("mozNetworkStats does not exists");
}