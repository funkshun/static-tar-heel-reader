importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js"
);

declare const workbox: any;

workbox.loadModule("workbox-strategies");
workbox.loadModule("workbox-precaching");

// route for fetching images
workbox.routing.registerRoute(
  /\.(?:jpg|png)$/,
  new workbox.strategies.CacheFirst({
    cacheName: "img-cache",
    plugins: [
      new workbox.expiration.Plugin({
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
      })
    ]
  })
);

// route for html, css, js, or json files
workbox.routing.registerRoute(
  /\.(?:html|css|js|json)$/,
  new workbox.strategies.CacheFirst({
    cacheName: "html-cache",
    plugins: [
      new workbox.expiration.Plugin({
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
      })
    ]
  })
);

workbox.precaching.precacheAndRoute([]);

// cache the all available file
workbox.routing.registerRoute(/.\/content\/index\/AllAvailable$/, async () => {
  let ids = getAllAvailableIDs();
  return new Response(await ids);
});

workbox.routing.registerRoute(/.\/content\/index\/ALLWORDS$/, async () => {
  const words = getWords();
  return new Response(await words);
})

workbox.routing.registerRoute(
  /.\/content\/index/,
  new workbox.strategies.CacheFirst({
    cacheName: "index-cache",
    plugins: [
      new workbox.expiration.Plugin({
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
      })
    ]
  })
);

// Fetches the available IDs.
async function getAllAvailableIDs(): Promise<string> {
  if (navigator.onLine) {
    let id_req = await fetch("./content/index/AllAvailable");
    if (id_req.ok) {
      return id_req.text();
    }
  }

  // Offline case.
  let ids: string = "";

  let cache = await caches.open("html-cache");
  let keys = await cache.keys();

  if (keys.length == 0) {
    return "";
  }

  keys.forEach((request, index, array) => {
    let url = request.url;
    if (!url.includes("content")) {
      return;
    }

    let tokens = url
      .substring(url.search("content") + "content".length)
      .split("/");

    if (!tokens[tokens.length - 1].match(/\d.html/)) {
      return;
    }

    let id = tokens.join("");
    id = id.substring(0, id.length - 5);
    ids += id;
  });

  return ids;
}

/* Function to get all the index words (stemmed forms), or, if offline, get all those that are in the cache */
async function getWords(): Promise<string> {
  if (navigator.onLine) {
    let allWordsRequest = await fetch("./content/index/ALLWORD");
    if (allWordsRequest.ok) {
      return allWordsRequest.text();
    }
  }

  // if offline
  let words = '';

  const cache = await caches.open('index-cache');
  const keys = await cache.keys();

  if (keys.length == 0) {
    return '';
  }

  keys.forEach((request, index, array) => {
    const url = request.url;
    const word = url.split('/').slice(-1)[0];
    words += word + ' ';
  });

  return words;
}