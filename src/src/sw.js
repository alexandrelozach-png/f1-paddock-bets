import { precacheAndRoute } from 'workbox-precaching';

// Précache automatique géré par vite-plugin-pwa
precacheAndRoute(self.__WB_MANIFEST);

// Réception des notifications push
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();

  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: '🏁 Ouvrir l\'appli' },
      { action: 'close', title: 'Fermer' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Clic sur la notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si l'appli est déjà ouverte, focus dessus
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // Sinon ouvre un nouvel onglet
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url || '/');
        }
      })
  );
});