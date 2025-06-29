self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || "You have a new notification",
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: data.tag || "default",
      data: data.data || {},
      actions: data.actions || [],
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false,
    };

    event.waitUntil(
      self.registration.showNotification(
        data.title || "Analog Calendar",
        options,
      ),
    );
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  if (event.action) {
    console.log("Action clicked:", event.action);
  } else {
    event.waitUntil(
      clients.matchAll({ type: "window" }).then(function (clientList) {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(self.location.origin) && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow("/");
        }
      }),
    );
  }
});

self.addEventListener("notificationclose", function (event) {
  console.log("Notification closed:", event.notification.tag);
});
