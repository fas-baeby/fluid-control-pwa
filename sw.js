/**
 * App shell precache. Incrementer CACHE_VERSION a chaque deploiement : GitHub Pages sert les
 * fichiers avec un cache navigateur agressif et seule une nouvelle version evince l'ancienne.
 */
const CACHE_VERSION = "v5";
const CACHE_NAME = `fluid-control-${CACHE_VERSION}`;

const APP_SHELL = [
    "./",
    "./index.html",
    "./manifest.webmanifest",
    "./assets/css/app.css",
    "./assets/icons/icon.svg",
    "./assets/icons/icon-maskable.svg",
    "./src/app.js",
    "./src/firmware-file.js",
    "./src/firmware-service.js",
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()),
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
            .then(() => self.clients.claim()),
    );
});

self.addEventListener("fetch", (event) => {
    const { request } = event;
    if (request.method !== "GET") return;

    // Navigation : reseau d'abord pour recuperer un deploiement recent, cache en repli hors ligne.
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put("./index.html", copy));
                    return response;
                })
                .catch(() => caches.match("./index.html")),
        );
        return;
    }

    const sameOrigin = new URL(request.url).origin === self.location.origin;

    event.respondWith(
        caches.open(CACHE_NAME).then(async (cache) => {
            const cached = await cache.match(request);

            // Le CDN est immuable : cache d'abord, sans revalidation.
            if (cached && !sameOrigin) return cached;

            const network = fetch(request)
                .then((response) => {
                    if (response.ok && (response.type === "basic" || response.type === "cors")) {
                        cache.put(request, response.clone());
                    }
                    return response;
                })
                .catch(() => cached);

            // Code applicatif : reponse immediate depuis le cache, mise a jour en arriere-plan
            // pour que le chargement suivant serve la derniere version deployee.
            return cached ?? network;
        }),
    );
});
