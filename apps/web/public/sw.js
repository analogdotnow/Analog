self.addEventListener("push", function (event) {
  console.log("[Service Worker] Push Received.", event);
  if (event.data) {
    try {
      const pushData = event.data.json();

      const title = pushData.title || "New Notification";
      const options = {
        body: pushData.body || "You have a new update.",
        icon: pushData.icon || "/favicon.ico", // Use favicon.ico as a fallback
        badge: pushData.badge || "/favicon.ico", // Use favicon.ico as a fallback for badge
        vibrate: [100, 50, 100],
        data: pushData.data || { dateOfArrival: Date.now() }, // Pass through server data, or default
      };

      event.waitUntil(
        self.registration
          .showNotification(title, options)
          .then(() =>
            console.log("[Service Worker] Notification shown successfully"),
          )
          .catch((err) =>
            console.error("[Service Worker] Error showing notification:", err),
          ),
      );
    } catch (e) {
      console.error("[Service Worker] Error parsing push event data:", e);
      // Fallback notification if data parsing fails
      const title = "New Notification";
      const options = {
        body: "Error processing incoming message.",
        icon: "/favicon.ico",
      };
      event.waitUntil(self.registration.showNotification(title, options));
    }
  } else {
    console.log(
      "[Service Worker] Push event received but no event.data payload. Showing generic notification.",
    );
  }
});

self.addEventListener("notificationclick", function (event) {
  console.log(
    "[Service Worker] Notification click Received.",
    event.notification,
  );
  event.notification.close();

  const type = event.notification.data?.type;
  const eventId = event.notification.data?.eventId;
  let urlToOpen =
    type === "event_cancellation"
      ? "/calendar"
      : `/calendar?eventId=${eventId || ""}`;

  // Example: Customize URL based on notification data
  // if (event.notification.data && event.notification.data.eventId) {
  //   urlToOpen = `/calendar/event/${event.notification.data.eventId}`;
  // } else if (event.notification.data && event.notification.data.url) {
  //   urlToOpen = event.notification.data.url;
  // }

  console.log("[Service Worker] Attempting to open window:", urlToOpen);

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          // If a window/tab with the same origin and desired path is already open, focus it.
          // You might need to refine client.url check based on your app's routing.
          if (
            client.url.startsWith(self.registration.scope) &&
            "focus" in client
          ) {
            // A simple check for root or if the specific urlToOpen matches
            if (
              client.url === new URL(urlToOpen, self.registration.scope).href
            ) {
              console.log(
                "[Service Worker] Focusing existing client:",
                client.url,
              );
              return client.focus();
            }
          }
        }
        // If not, open a new window/tab.
        if (clients.openWindow) {
          console.log("[Service Worker] Opening new window for:", urlToOpen);
          return clients.openWindow(urlToOpen);
        }
      })
      .catch((err) =>
        console.error(
          "[Service Worker] Error handling notification click:",
          err,
        ),
      ),
  );
});
