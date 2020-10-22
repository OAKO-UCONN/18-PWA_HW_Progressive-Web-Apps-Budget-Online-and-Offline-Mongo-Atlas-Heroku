const e = require("express");

var CACHE_NAME = "my-site-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";

var urlsToCache = [
  "/",
  "/index.js",
  "/manifest.json",
  "/styles.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png"
];

self.addEventListener("install", function(event) {
  // Perform install steps
  event.waitUntil(caches.open(CACHE_NAME).then(function(cache){
    return cache.addAll(urlsToCache)
  }));
});

self.addEventListener("fetch", function(event) {
  // cache all get requests to /api routes
  event.respondWith(fetch(event.reqest).catch(function(){
    return caches.match(event.request).then(function(response){
      if (response){
        return response;
      } else if (event.request.headers.get("accept").includes("text/html")) {
        caches.match("/");
      }
    })
  }))

});
