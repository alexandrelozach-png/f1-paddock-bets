import { precacheAndRoute } from 'workbox-precaching';

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('push', (event) => {
  console.log('🔔 Push reçu !', event.data?.text());
  
  if (!event.data) {
    console.log('❌ Pas de data dans le push');
    return;
  }

  let data;
  try {
    data = event.data.json();
    console.log('📦 Data parsée:', data);
  } catch(e) {
    console.error('❌ Erreur parsing JSON:', e);
    return;
  }

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

  console.log('📤 Affichage notification avec options:', options);

  event.waitUntil(
    self.registration.showNotification(data.title, options)
      .then(() => console.log('✅ Notification affichée !'))
      .catch(err => console.error('❌ Erreur affichage notification:', err))
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'close') return;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow('/');
      })
  );
});