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

function bmTest() {
  // var p = document.createElement("P");
  // var c = document.createTextNode("This is a paragraph.");
  // p.appendChild(c);
  // document.getElementById("benchmark").appendChild(p);
  var content = "Content";
  document.getElementById("bmcontent").innerHTML = content;
}
