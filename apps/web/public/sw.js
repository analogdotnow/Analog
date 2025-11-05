/* eslint-disable no-undef */
// Service Worker for Analog Calendar PWA

self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || "/icon.png",
      badge: "/icon-192x192.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        url: data.url || "/",
      },
      actions: data.actions || [],
      requireInteraction: false,
      tag: data.tag || "notification",
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener("notificationclick", function (event) {
  console.log("Notification click received.");

  event.notification.close();

  // Open the app at the specified URL or default to home
  const urlToOpen = new URL(event.notification.data?.url || "/", self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      // Check if there's already a window/tab open with the target URL
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }

      // If no window/tab is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

self.addEventListener("notificationclose", function (event) {
  console.log("Notification closed", event);
});

// Handle service worker installation
self.addEventListener("install", function (event) {
  console.log("Service Worker installing.");
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Handle service worker activation
self.addEventListener("activate", function (event) {
  console.log("Service Worker activating.");
  // Claim all clients immediately
  event.waitUntil(clients.claim());
});
