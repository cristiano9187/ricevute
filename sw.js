const CACHE_NAME = 'receipt-generator-cache-v1';

const urlsToCache = [
    './', // Cache la racine du dossier pour l'accès
    './programme_recu_rapide.html', // Le nom de votre fichier HTML
    './sw.js', // Le Service Worker lui-même
    // On retire le CDN de Tailwind, car il est désormais intégré dans le HTML
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap'
];

self.addEventListener('install', (event) => {
    console.log('Service Worker: Événement d\'installation...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Cache ouvert, ajout des URLs...');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
            .catch((error) => {
                console.error('Service Worker: Échec de la mise en cache pendant l\'installation', error);
            })
    );
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker: Événement d\'activation...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Suppression du vieux cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    console.log('Service Worker: Ressource trouvée dans le cache:', event.request.url);
                    return response;
                }
                console.log('Service Worker: Ressource non trouvée, récupération depuis le réseau:', event.request.url);
                return fetch(event.request);
            })
            .catch((error) => {
                console.error('Service Worker: Échec de la requête:', error);
            })
    );
});
