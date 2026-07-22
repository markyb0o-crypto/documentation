# Klarsicht — Fake-Video-Check (lokal / offline)

Mini-App für iPhone & Desktop: Videos **lokal auf dem Gerät** auf KI-Spuren prüfen — **ohne Cloud, ohne Analyse-Upload**.

## iPhone: einmal einrichten, danach offline

Auf einem Computer im **gleichen WLAN**:

```bash
cd fake-video-detector
npm install
npm run start:local
```

Im Terminal erscheint eine Adresse wie `http://192.168.x.x:4173/`.

1. Auf dem iPhone **Safari** öffnen und diese URL aufrufen  
2. Teilen-Button → **Zum Home-Bildschirm**  
3. Klarsicht-Icon starten — funktioniert danach **ohne Internet/Cloud**  
4. Videos aus der Mediathek wählen und analysieren  

> Hinweis: iOS erlaubt lokale Web-Apps nur als Home-Bildschirm-PWA (kein App-Store nötig). Der Computer wird nur für die erste Installation im WLAN gebraucht.

## Entwicklung

```bash
npm run dev      # Hot-Reload
npm run build    # Offline-fähigen Build erzeugen
npm run phone    # Build im WLAN servieren
npm test
```

## Technik

- Analyse komplett im Browser (Frame-Heuristiken)
- PWA + Service Worker cachen die App offline
- Fonts sind lokal gebündelt (kein Google-Fonts-Netzwerk)
