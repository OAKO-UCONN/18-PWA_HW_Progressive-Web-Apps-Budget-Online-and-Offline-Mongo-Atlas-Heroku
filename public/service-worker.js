//const e = require("express");

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

//Call Install Event
self.addEventListener("install", function(event) {
  console.log('Service Worker: Installed');
  // Perform install steps
  event.waitUntil(
    caches
      .open(cacheName)
      .then(cache => {
        console.log("Service Worker: Caching Files");
        cache.addAll(cacheAssets);
      })
      .then(() => self.skipWaiting())
  );
});

//Call Activate Event
self.addEventListener('activate', e => {
  console.log('Service Worker Installed')
  //Remove unwanted caches
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if(cache !== cacheName) {
            console.log('Service Worker: Purge old Cache');
            return caches.delete(cache);
          }
        })
      )
    })
  )
});

// Call the Fetch Event
//self.addEventListener("fetch", function(event) {
self.addEventListener("fetch", event => {
  // cache all get requests to /api routes
  console.log('Service Worker: is Fetching=True');
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  )
});
