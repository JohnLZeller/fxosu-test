'use strict';

var task = 'reqsynctest';

function log(msg) {
  var el = document.createElement('div');
  el.innerHTML = Array.prototype.join.call(arguments, '<br />');
  document.getElementById('js-log').appendChild(el);
  console.log(msg);
}

if ('sync' in navigator) {
  document.getElementById('reglist').addEventListener('click', function() {
    navigator.sync.registrations().then(function(results) {
      for (var i = 0; i < results.length; ++i) {
        console.log('Registered Task: ' + results[i].task);
      }
    }).catch(function(err) {
      log('RequestSync registration failed: ' + err);
    });
  });

  document.getElementById('regsync').addEventListener('click', function() {
    navigator.sync.register(task,
    { minInterval: 15,
      oneShot: false,
      data: { accountID: 1234 },
      wifiOnly: false,
      wakeUpPage: location.href })
    .then(function() {
      log('Task: ' + task + ' registered');
    }).catch(function(err) {
      log('Task registration failed: ' + err);
    });
  });

  document.getElementById('unregsync').addEventListener('click', function() {
    navigator.sync.unregister(task)
    .then(function() {
      log('Task: ' + task + ' unregistered');
    }).catch(function(err) {
      log('Task unregistration failed ' + err);
    });
  });
} else {
  log('navigator.sync does not exist');
}
