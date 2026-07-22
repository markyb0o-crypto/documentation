# Klarsicht — Fake-Video-Check

Mini-App, die Videos lokal im Browser auf Spuren von KI-Generierung und Manipulation prüft.

## Start

```bash
cd fake-video-detector
npm install
npm run dev
```

Dann im Browser die angezeigte URL öffnen (Standard: `http://localhost:5174`).

## Was die App macht

1. Video auswählen oder per Drag & Drop laden  
2. Frames extrahieren  
3. Sechs forensische Heuristiken auswerten (Zeit, Schärfe, Farbe, Frequenz, Kanten, Textur)  
4. KI-Score + Konfidenz + Verdikt anzeigen  

**Kein Upload:** Die Analyse läuft vollständig im Browser. Es werden keine Dateien an einen Server geschickt.

## Hinweis

Klarsicht ist ein Heuristik-Schnellcheck, kein forensisches Gutachten. Starke Kompression und hochwertige Deepfakes können das Ergebnis verfälschen.
