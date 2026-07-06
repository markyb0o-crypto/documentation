# MIDI Keyboard Mapper

Interaktives 3D-MIDI-Mapping-Tool für das M-Audio Axiom Pro 25.

## Modell-Datei

Lege deine GLB-Datei hier ab:

```
public/models/m-audio_axiom_pro_25.glb
```

Die Datei war in dieser Cloud-Umgebung nicht vorhanden. Bitte die von dir an Claw geschickte Datei manuell in diesen Ordner kopieren.

## Entwicklung

```bash
npm install
npm run dev
```

## Architektur

- **View** (`src/components/view/`) – 3D-Rendering (R3F)
- **State** (`src/state/`) – Mapping-Daten als JSON
- **Controller** (`src/controller/`) – Export-Logik
- **UI** (`src/components/ui/`) – 2D-Overlay, getrennt vom Canvas
