/*
 * GoGo Central — FCM background service worker for GoGo Company.
 * Root scope; intentionally no fetch handler so page caching/offline behaviour
 * remains untouched. FCM messages are displayed by Firebase's background
 * handler. The optional standard-push handler accepts only explicitly marked
 * non-FCM payloads, preventing duplicate FCM notifications.
 */
'use strict';

self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyCtfvrvfRSlZmiNBluRLeHCLNgaNkuY-_4',
  authDomain: 'gen-lang-client-0566323659.firebaseapp.com',
  projectId: 'gen-lang-client-0566323659',
  messagingSenderId: '388829027444',
  appId: '1:388829027444:web:5b6dee8967f6abdc520521'
});

var SAFE_FALLBACK_URL = 'https://gogocompany.in/';

function safeUrl(raw) {
  try {
    var parsed = new URL(String(raw || ''), SAFE_FALLBACK_URL);
    if (parsed.protocol === 'https:' &&
        (parsed.hostname === 'gogocompany.in' || parsed.hostname === 'www.gogocompany.in')) {
      return parsed.href;
    }
  } catch (err) { /* use fallback */ }
  return SAFE_FALLBACK_URL;
}

function notificationOptions(notification, data, notificationId) {
  var link = safeUrl(data.deepLink || data.link || notification.click_action || SAFE_FALLBACK_URL);
  return {
    body: String(notification.body || data.body || ''),
    tag: notificationId,
    renotify: false,
    icon: '/favicon.svg',
    data: { url: link, notificationId: notificationId }
  };
}

var messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  var notification = (payload && payload.notification) || {};
  var data = (payload && payload.data) || {};
  var notificationId = String(
    data.notificationId || data.campaignId || (payload && payload.messageId) || ('gogo-' + Date.now())
  );
  return self.registration.showNotification(
    String(notification.title || data.title || 'GoGo Company'),
    notificationOptions(notification, data, notificationId)
  );
});

// Optional standard Web Push support for a future non-FCM sender.
// Do not treat this subscription as an FCM token: GoGo Central's current
// /devices/register contract requires an FCM registration token.
self.addEventListener('push', function (event) {
  if (!event.data) return;
  var payload;
  try { payload = event.data.json(); } catch (err) { return; }
  var data = (payload && payload.data) || payload || {};
  if (data.gogoStandardWebPush !== true) return;

  var notification = payload.notification || data.notification || {};
  var notificationId = String(data.notificationId || data.id || ('gogo-standard-' + Date.now()));
  var title = String(notification.title || data.title || 'GoGo Company');
  var options = notificationOptions(notification, data, notificationId);

  event.waitUntil(
    self.registration.getNotifications({ tag: notificationId }).then(function (existing) {
      if (existing && existing.length) return null;
      return self.registration.showNotification(title, options);
    })
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var target = safeUrl(event.notification.data && event.notification.data.url);
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        var clientHost = '';
        try { clientHost = new URL(client.url).hostname; } catch (err) { clientHost = ''; }
        if ((clientHost === 'gogocompany.in' || clientHost === 'www.gogocompany.in') &&
            'focus' in client) {
          if (client.url !== target && 'navigate' in client) {
            return client.navigate(target).then(function () { return client.focus(); });
          }
          return client.focus();
        }
      }
      return self.clients.openWindow(target);
    })
  );
});
