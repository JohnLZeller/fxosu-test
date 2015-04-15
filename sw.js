(function() {
  "use strict";
  /* global importScripts */
  /* global self */
  /* global caches */
  /* global fetch */
  /* global URL */
  importScripts("javascripts/serviceworker-cache-polyfill.js");

  self.addEventListener('install', function(event) {
    console.log("ServiecWorker installed");
    // event.waitUntil(
    //   somethingThatReturnsAPromise().then(function() {
    //     console.log("Installed");
    //   })
    // );
  });

  self.addEventListener('activate', function(event) {
    console.log("ServiecWorker activated");
    // event.waitUntil(
    //   somethingThatReturnsAPromise().then(function() {
    //     console.log("Activated");
    //   })
    // );
  });

  self.addEventListener('fetch', function(event) {
    console.log("ServiecWorker caught a fetch");
    console.log(event.request);
    event.respondWith(
      caches.match(event.request).catch(function() {
        return event.default();
      })
    );
  });
})();
