# VST UI Asset Generator (Prototyp)

Webbasierter Prototyp zum Erstellen von **PNG** und **SVG** UI-Elementen für VST-Plugins.

## Features

- **Asset-Typen:** Knob, Button, Slider, Fader, Panel, LED, VU-Meter
- **Styles:** Flat, Neumorphism, Glassmorphism, Skeuomorph, Minimal Dark
- **Materialien:** Plastik, Gummi, Glas, Metall, gebürstetes Metall, Holz, Carbon
- **Anpassbar:** Farben, Größe, Eckenradius, Skala, Schatten, Blur, Glanz, Rauheit
- **Positionen/Frames:** Jede Regler-Position wird als eigenes Bild exportiert
- **Export:** Freigestellte PNGs/SVGs als ZIP (`Asset_001.png`, `Asset_002.png`, …)

## Starten

```bash
cd vst-ui-generator
python -m http.server 8080
```

Dann im Browser öffnen: http://localhost:8080

> Hinweis: Muss über einen lokalen Webserver laufen (ES Modules).

## Bedienung

1. Asset-Typ, Style und Material wählen
2. Größe, Farben und Effekte per Regler anpassen
3. **Anzahl Frames** festlegen (z. B. 8 für Knob-Positionen)
4. Mit dem Positions-Regler einzelne Frames in der Vorschau prüfen
5. **PNG Export (ZIP)** oder **SVG Export (ZIP)** klicken

Alle Frames werden automatisch nummeriert in einem ZIP-Ordner exportiert.

## Export-Beispiel

Bei 8 Frames und Präfix `Knob`:
```
Knob/
  Knob_001.png  ← Position 0
  Knob_002.png  ← Position 1
  ...
  Knob_008.png  ← Position 7
```

## Technik

- HTML5 Canvas für gerenderte PNG-Vorschau und Export
- SVG-Generator für skalierbare Assets
- JSZip für Batch-Download

## Einschränkungen (Prototyp)

- Keine echten 3D-Materialien, sondern simulierte 2D-Effekte
- Kein direkter Ordner-Zugriff im Browser → Export als ZIP
- Keine Speicherung von Projekten (noch nicht)
