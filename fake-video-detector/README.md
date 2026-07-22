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

1. Video auswählen, per Drag & Drop laden **oder direkte Video-URL** einfügen  
2. Frames extrahieren  
3. Sechs forensische Heuristiken auswerten (Zeit, Schärfe, Farbe, Frequenz, Kanten, Textur)  
4. KI-Score + Konfidenz + Verdikt anzeigen  

### URL

Nur **direkte Dateilinks** funktionieren, z. B. `https://example.com/clip.mp4`.

- YouTube-, TikTok- oder Instagram-Seiten-URLs gehen **nicht**
- Der Host muss **CORS** für Browser erlauben — sonst Datei lokal speichern und hochladen

**Kein Server-Upload der Analyse:** Frames werden lokal im Browser ausgewertet. Beim URL-Laden holt der Browser die Datei direkt vom Host.

## Hinweis

Klarsicht ist ein Heuristik-Schnellcheck, kein forensisches Gutachten. Starke Kompression und hochwertige Deepfakes können das Ergebnis verfälschen.
