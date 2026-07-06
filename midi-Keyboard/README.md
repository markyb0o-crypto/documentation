# MIDI Keyboard Mapper

Einfaches 3D-Tool zum Zuweisen von Axiom-Bedienelementen an FL Studio – **ohne technische Vorkenntnisse**.

## Warum dieser Ansatz?

FL Studio hat keine einfache Schnittstelle für Web-Apps. Der bewährte Weg (auch für Profis) heißt **„Link to controller"**:

1. Du sagst dem Tool, welches Bedienelement was steuern soll
2. In FL verknüpfst du den Regler mit einem Rechtsklick – fertig

Genau so funktionieren bei dir schon **Klavier** und **Oktave** im Generic-Modus.

## Schnellstart

1. Axiom per USB anschließen
2. GLB-Datei nach `public/models/m-audio_axiom_pro_25.glb` legen
3. `npm install && npm run dev`
4. In **Chrome oder Edge** öffnen (für Web MIDI)
5. „Keyboard verbinden" klicken
6. 3D-Bauteil anklicken → Ziel wählen oder „MIDI lernen"
7. Anleitung unten links in FL Studio ausführen

## Lernmodus

„MIDI lernen" → Regler am Axiom bewegen → Ziel wählen (z.B. Track 1 Lautstärke).
So musst du keine CC-Nummern kennen.

## Architektur

| Layer | Aufgabe |
|-------|---------|
| View | 3D-Modell, Klicks → `meshId` |
| UI | Anleitung, Presets, Lernmodus |
| State | `meshId` → MIDI + FL-Ziel |
| Controller | Web MIDI, Export |
