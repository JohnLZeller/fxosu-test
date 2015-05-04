 // DOMContentLoaded is fired once the document has been loaded and parsed,
// but without waiting for other external resources to load (css/images/etc)
// That makes the app more responsive and perceived as faster.
// https://developer.mozilla.org/Web/Reference/Events/DOMContentLoaded

/* REMEMBER
 * - Check that internet connection is on and working
 * - 
 * 
 * 
 * 
 * 
 */
window.addEventListener('DOMContentLoaded', function() {

  // We'll ask the browser to use strict code to help us catch errors earlier.
  // https://developer.mozilla.org/Web/JavaScript/Reference/Functions_and_function_scope/Strict_mode
  'use strict';

  var urlSuccess = 'https://api.imgur.com/'; //example.com has no CORS support
  var urlFail = 'www.test-cors.org/fail'; // Returns a 404, which gets logged as a failure by the API we are testing
  var requestWith = null;
  var requestWithout = null;
  var attemptsWith = 0;
  var attemptsWithout = 0;
  var successesWith = 0;
  var successesWithout = 0;
  var level = 2;
  var r = null;
  var nWith = 30;
  var nWithout = 30;
  var translate = navigator.mozL10n.get;
  var benchmarkLevel = document.getElementById('benchmarkLevel');
  var progressBar = document.getElementById('progress');
  var atmWithout = document.getElementById('attemptsWithout');
  var atmWith = document.getElementById('attemptsWith');

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
      var mozSucRate = fxosu.successRate(2000);
      var batLevel = fxosu.batteryLevel();
      var batCha = fxosu.batteryCharging();
      document.getElementById('batlevel').innerHTML = batLevel * 100 + "%";
      document.getElementById('batcharge').innerHTML = (batCha === true ? 'Yes' : 'No');
      if (batLevel == 1.0 && !batCha) {
        document.getElementById('batcharge').innerHTML += " (battery is 100%, so might be charging)";
      }
      // TODO: Unreliable
      document.getElementById('connected').innerHTML = "Unknown"; //(fxosu.connectionUp() === true ? 'Yes' : 'No');
      // TODO: Do a network request, to get some latency info
      document.getElementById('latency').innerHTML = netlat.networkLatency;
      document.getElementById('ctype').innerHTML = linkType;
      document.getElementById('recbytes').innerHTML = fxosu.receivedBytes();
      document.getElementById('cstable').innerHTML = (fxosu.isConnectionStable() === true ? 'Yes' : 'No');
      document.getElementById('successrate').innerHTML = (sucRate.rate * 100).toFixed(2) + "% (" + sucRate.successes + "/" + sucRate.attempted + ")";
      document.getElementById('high').innerHTML = (fxosu.mozIsNowGood(1) === true ? 'Go' : 'No-Go');
      document.getElementById('mod').innerHTML = (fxosu.mozIsNowGood(2) === true ? 'Go' : 'No-Go');
      document.getElementById('low').innerHTML = (fxosu.mozIsNowGood(3) === true ? 'Go' : 'No-Go');
      document.getElementById('mozbatlevel').innerHTML = batLevel * 100 + "%";
      document.getElementById('mozbatcharge').innerHTML = (batCha === true ? 'Yes' : 'No');
      document.getElementById('mozcstable').innerHTML = (fxosu.isConnectionStable(2000) === true ? 'Yes' : 'No');
      document.getElementById('mozsuccessrate').innerHTML = (mozSucRate.rate * 100).toFixed(2) + "% (" + mozSucRate.successes + "/" + mozSucRate.attempted + ")";
    } else {
      console.log("mozFxOSUService does not exist");
    }

  }

  // Currently runs in waves of 5 secs on, 5 secs off
  function getInterrupt() {
    var num = (new Date()).getTime() % 10000;
    if (num > 5000) {
      return true;
    } else {
      return false;
    }
  }


  function runBenchmark() {
    //_sendFail();
    //return;

    // Update table
    atmWithout.innerHTML = 0;
    atmWith.innerHTML = 0;
    progressBar.setAttributeNS(null, 'width', '0%');

    switch (benchmarkLevel.value) {
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

    // Reset our counters
    attemptsWith = 0;
    attemptsWithout = 0;
    successesWith = 0;
    successesWithout = 0;

    sendRequestWithout();
    sendRequestWith();

  }

  function _sendFail () {
    // mozSystem option required to prevent CORS errors (Cross Origin Resource Sharing)
    var r = new XMLHttpRequest({ mozSystem: true });
    r.responseType = 'document';

    r.addEventListener('load', function () {
      alert(r.status);
    });

    r.open('get', urlFail + '?_=' + (new Date()).getTime(), true); // Appending a rand to tail of url, ensures no caching
    r.send();
    console.log("Did the thing!");
  }

  // TODO: Implement with Web Workers? Multi-threaded :)
  function sendRequestWithout() {
    attemptsWithout += 1;

    // mozSystem option required to prevent CORS errors (Cross Origin Resource Sharing)
    requestWithout = new XMLHttpRequest({ mozSystem: true });
    requestWithout.responseType = 'document';

    // We're setting some handlers here for dealing with both error and data received.
    requestWithout.addEventListener('error', function () {
      onRequestError(sendRequestWithout);
    });
    requestWithout.addEventListener('load', function () {
      onRequestLoad(sendRequestWithout);
    });

    // Determine if we should simulate a network interruption
    if (!getInterrupt()) { // success
      requestWithout.open('get', urlSuccess + '?_=' + (new Date()).getTime(), true); // Appending a rand to tail of url, ensures no caching
      requestWithout.send();
      console.log("Without: Sent SUCCESS request (#" + attemptsWithout + ")");
    } else { // fail
      requestWithout.open('get', urlFail + '?_=' + (new Date()).getTime(), true); // Appending a rand to tail of url, ensures no caching
      requestWithout.send();
      console.log("Without: Sent FAIL request (#" + attemptsWithout + ")");
    }

    //console.log("Without: Request #" + attemptsWithout + " was received! Woohoo! On to the next one!");
  }


  // TODO: Implement with Web Workers? Multi-threaded :)
  function sendRequestWith() {
    while (1) {
      document.getElementById('debug1').innerHTML = "Level: " + level;
      document.getElementById('debug2').innerHTML = attemptsWith + ": " + navigator.mozFxOSUService.mozIsNowGood(level);
      if (navigator.mozFxOSUService.mozIsNowGood(level)) {
        attemptsWith += 1;

        // mozSystem option required to prevent CORS errors (Cross Origin Resource Sharing)
        requestWith = new XMLHttpRequest({ mozSystem: true });
        requestWith.responseType = 'document';

        // We're setting some handlers here for dealing with both error and data received.
        requestWith.addEventListener('error', function () {
          onRequestError(sendRequestWith);
        });
        requestWith.addEventListener('load', function () {
          onRequestLoad(sendRequestWith);
        });

        // Determine if we should simulate a network interruption
        if (!getInterrupt()) { // success
          requestWith.open('get', urlSuccess + '?_=' + (new Date()).getTime(), true); // Appending a rand to tail of url, ensures no caching
          requestWith.send();
          console.log("With: Sent SUCCESS request (#" + attemptsWith + ")");
        } else { // fail
          requestWith.open('get', urlFail + '?_=' + (new Date()).getTime(), true); // Appending a rand to tail of url, ensures no caching
          requestWith.send();
          console.log("With: Sent FAIL request (#" + attemptsWith + ")");
        }

        // You did your thang, now leave
        break;
      }
    }

    //console.log("With: Request #" + attemptsWith + " was received! Woohoo! On to the next one!");
  }


  function onRequestError(func) {

    if (func === sendRequestWithout) {
      showError(requestWithout.error);
    } else if (func === sendRequestWith) {
      showError(requestWith.error);
    }

  }


  function onRequestLoad(func) {
    // TODO: Have this function check for all possible success types, not just 200
    var contentLen = null;
    var statusCode = null;

    // Update table
    atmWithout.innerHTML = attemptsWithout;
    atmWith.innerHTML = attemptsWith;
    var pro = ((successesWithout + successesWith) / (nWithout + nWith)) * 100;
    progressBar.setAttributeNS(null, 'width', pro.toString() + '%');

    if (func === sendRequestWithout) {
      contentLen = requestWithout.getResponseHeader("Content-Length");
      statusCode = requestWithout.status;

      // Check status of reply
      if (statusCode !== 200) { // If fail, retry
        console.log("Without: Response #" + attemptsWithout + " FAILED with " + statusCode);
        sendRequestWithout();
      } else if (statusCode === 0) {
        console.log("Without: Response #" + attemptsWithout + " ERROR of come kind");
      } else { // If success, let next request happen
        successesWithout += 1;
        console.log("Without: Response #" + attemptsWithout + " SUCCEEDED");
        if (successesWithout < nWithout) {
          sendRequestWithout();
        } else {
          // Set Data
          document.getElementById('sucWithout').innerHTML = ((nWithout / attemptsWithout) * 100).toFixed(2) + "% (" + 
                                                            nWithout + "/" + attemptsWithout + ")";
        }
      }
    } else if (func === sendRequestWith) {
      contentLen = requestWith.getResponseHeader("Content-Length");
      statusCode = requestWith.status;

      // Check status of reply
      if (statusCode !== 200) { // If fail, retry
        console.log("With: Response #" + attemptsWith + " FAILED with " + statusCode);
        sendRequestWith();
      } else if (statusCode === 0) {
        console.log("With: Response #" + attemptsWith + " ERROR of come kind");
      } else { // If success, let next request happen
        successesWith += 1;
        console.log("With: Response #" + attemptsWith + " SUCCEEDED");
        if (successesWith < nWith) {
          sendRequestWith();
        } else {
          document.getElementById('sucWith').innerHTML = ((nWith / attemptsWith) * 100).toFixed(2) + "% (" + 
                                                            nWith + "/" + attemptsWith + ")";
        }
      }
    }
  }


  function showError(text) {
    // Failure COULD be because there is no CORS support on requested api
    alert("ERROR: " + text);
  }

});
