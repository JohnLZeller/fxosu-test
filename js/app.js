// DOMContentLoaded is fired once the document has been loaded and parsed,
// but without waiting for other external resources to load (css/images/etc)
// That makes the app more responsive and perceived as faster.
// https://developer.mozilla.org/Web/Reference/Events/DOMContentLoaded
window.addEventListener('DOMContentLoaded', function() {

  // We'll ask the browser to use strict code to help us catch errors earlier.
  // https://developer.mozilla.org/Web/JavaScript/Reference/Functions_and_function_scope/Strict_mode
  'use strict';

  var mockjaxDefaults = $.extend({}, $.mockjaxSettings);
  var url = 'https://example.com';
  var request = null;
  var attemptsWith = 0;
  var attemptsWithout = 0;
  var interrupt = 0;
  var translate = navigator.mozL10n.get;
  var benchmarkLevel = document.getElementById('benchmarkLevel');

  var fxosutest = document.getElementById('fxosutest');
  fxosutest.addEventListener('click', function(e) {
    fxosuTest();
  }, false);

  var runbenchmark = document.getElementById('runbenchmark');
  runbenchmark.addEventListener('click', function(e) {
    runBenchmark();
  }, false);

  function fxosuTest() {

    if ('mozFxOSUService' in navigator) {
      var fxosu = navigator.mozFxOSUService;
      var linkType = "";
      switch (fxosu.connectionType()) {
        case 0:
          linkType = "Unknown";
          break;
        case 1:
          linkType = "Ethernet";
          break;
        case 2:
          linkType = "USB";
          break;
        case 3:
          linkType = "WiFi";
          break;
        case 4:
          linkType = "WiMax";
          break;
        case 5:
          linkType = "2G";
          break;
        case 6:
          linkType = "3G";
          break;
        case 7:
          linkType = "4G";
          break;
        default:
          linkType = "Unknown";
          break;
      }
      var netlat = fxosu.latencyInfo();
      var sucRate = fxosu.successRate();
      var batLevel = fxosu.batteryLevel();
      var batCha = fxosu.batteryCharging();
      document.getElementById('batlevel').innerHTML = batLevel * 100 + "%";
      document.getElementById('batcharge').innerHTML = (batCha === true ? 'Yes' : 'No');
      if (batLevel == 1.0 && !batCha) {
        document.getElementById('batcharge').innerHTML += " (battery is 100%, so might be charging)";
      }
      document.getElementById('connected').innerHTML = (fxosu.connectionUp() === true ? 'Yes' : 'No');
      // TODO: Do a network request, to get some latency info
      document.getElementById('latency').innerHTML = netlat.networkLatency;
      document.getElementById('ctype').innerHTML = linkType;
      document.getElementById('recbytes').innerHTML = fxosu.receivedBytes();
      document.getElementById('cstable').innerHTML = (fxosu.isConnectionStable() === true ? 'Yes' : 'No');
      document.getElementById('successrate').innerHTML = (sucRate.rate * 100) + "% (" + sucRate.successes + "/" + sucRate.attempted + ")";
      document.getElementById('high').innerHTML = (fxosu.mozIsNowGood(1) === true ? 'Go' : 'No-Go');
      document.getElementById('mod').innerHTML = (fxosu.mozIsNowGood(2) === true ? 'Go' : 'No-Go');
      document.getElementById('low').innerHTML = (fxosu.mozIsNowGood(3) === true ? 'Go' : 'No-Go');
    } else {
      console.log("mozFxOSUService does not exist");
    }

  }

  function runBenchmark() {
    var level = 2;
    switch (benchmarkLevel) {
      case "1 - High":
        level = 1;
        break;
      case "2 - Moderate":
        level = 2;
        break;
      case "3 - Low":
        level = 3;
        break;
      default:
        level = 2;
        break;
    }

    getReq();
  }


  function getReq() {
    // Reset our counters
    attemptsWith = 0;
    attemptsWithout = 0;
    var n = 10;
    
    for (var i = 0; i < n; i ++) { // Grab the website 10 times
      interrupt = parseInt(Math.random() * 2);

      sendRequestWithout();
      sendRequestWith();
    }

    // Set Labels
    document.getElementById('sucWithout').innerHTML = ((n / attemptsWithout) * 100).toFixed(2) + "%<br> (" + 
                                                      n + "/" + attemptsWithout + ")";
    document.getElementById('sucWith').innerHTML = ((n / attemptsWith) * 100).toFixed(2) + "%<br> (" + 
                                                      n + "/" + attemptsWith + ")";
  }


  function sendRequestWith() {
    console.log("#" + (attemptsWith + 1) + ": sendRequestWith");
    var result = null;
    var tries = 0;

    // Continue attempting to make request, until it is successful
    while (!result) {
      if (navigator.mozFxOSUService.mozIsNowGood()) {
        if (tries === 0) {
          result = sendReq(0);
        } else {
          result = sendReq(1); // retry
        }
        attemptsWith += 1;
        tries += 1;
      }
    }
  }


  function sendRequestWithout() {
    console.log("#" + (attemptsWithout + 1) + ": sendRequestWithout");
    var result = null;
    var tries = 0;

    // Continue attempting to make request, until it is successful
    while (!result) {
      if (tries === 0) {
        result = sendReq(0);
      } else {
        result = sendReq(1); // retry
      }
      attemptsWithout += 1;
      tries += 1;
    }
  }


  function sendReq(retry) {
    retry = typeof retry !== 'undefined' ? retry : 0; // 0 is no, 1 is yes

    // Are we searching already? Then stop that search
    if(request && request.abort) {
      request.abort();
    }

    // If you don't set the mozSystem option, you'll get CORS errors (Cross Origin Resource Sharing)
    // You can read more about CORS here: https://developer.mozilla.org/docs/HTTP/Access_control_CORS
    request = new XMLHttpRequest({ mozSystem: true });

    request.open('get', url, true);
    request.responseType = 'document';

    // We're setting some handlers here for dealing with both error and data received.
    request.addEventListener('error', onRequestError);
    request.addEventListener('load', onRequestLoad);

    // Randomly decide if there is a network interruption
    var retryInterrupt = 0;
    if (retry) {
      retryInterrupt = parseInt(Math.random() * 2);
    }

    if (interrupt === 0 && !retry) { // success, first try
      request.send();
      return true;
    } else if (interrupt === 1 && !retry){ // fail, first try
      request.timeout = 1; // Unrealistic for request to take 1ms, so it'll timeout
      request.send();
      return false;
    } else if (retryInterrupt === 0 && retry) { // success, retry
      request.send();
      return true;
    } else if (retryInterrupt === 1 && retry){ // fail, retry
      request.timeout = 1; // Unrealistic for request to take 1ms, so it'll timeout
      request.send();
      return false;
    }
  }

  function onRequestError() {

    showError(request.error);

  }


  function onRequestLoad() {

    var response = request.response;
    var statusCode = request.status;
    var statusText = request.statusText;
    var timeout = request.timeout;

  }


  function showError(text) {
    alert(text);
  }

});
