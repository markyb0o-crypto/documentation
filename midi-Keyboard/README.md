# Axiom FL Mapper

3D anklicken → sagen was es macht → fertig.

## Online testen

### Option A – GitHub Pages (empfohlen, mit MIDI)

Die App liegt fertig auf dem `gh-pages`-Branch. **Einmalig** in GitHub aktivieren:

1. https://github.com/markyb0o-crypto/documentation/settings/pages
2. **Source:** Deploy from a branch
3. **Branch:** `gh-pages` → `/ (root)` → **Save**
4. Nach ~1 Minute öffnen: **https://markyb0o-crypto.github.io/documentation/**

(Axiom per USB, Chrome/Edge, MIDI-Zugriff erlauben)

### Option B – StackBlitz (UI testen, MIDI eingeschränkt)

https://stackblitz.com/github/markyb0o-crypto/documentation/tree/cursor/midi-keyboard-34ed/midi-Keyboard?startScript=start

## Lokal starten

**Voraussetzungen:** M-Audio Axiom Pro 25 per USB, **Chrome** oder **Edge**, Internet (für das 3D-Modell von Sketchfab).

```bash
cd midi-Keyboard
npm install
npm start
```

Browser öffnet sich auf `http://localhost:5173`. Beim ersten Start ggf. **MIDI-Zugriff erlauben**.

### Test-Ablauf

1. Oben links: Status muss **grün** sein (Keyboard erkannt)
2. **Teil im 3D-Keyboard anklicken** (Mausrad zoomen, ziehen dreht)
3. **Regler einmal bewegen** → „✓ MIDI erkannt“
4. **FL-Funktion wählen** → Zuweisung wird gespeichert
5. Oben links: **Zuweisungen** zählen hoch, **Export** lädt `axiom-fl-mappings.json`

### Desktop-App (optional)

```bash
npm run desktop
```

Speichert automatisch unter `Dokumente/AxiomFL/mappings.json`. Button **Datenordner** öffnet den Ordner.

### Hinweise

- 3D-Modell: [Sketchfab – M-Audio Axiom Pro 25](https://sketchfab.com/3d-models/m-audio-axiom-pro-25-b284625fd02d4dd28cf56fd84188d0a2) (CC BY, -=EDWARD GLEKOV=-)
- FL Studio wird nicht direkt verknüpft – die App merkt sich deine Zuweisungen
- Bereits zugewiesene Teile brauchen kein erneutes MIDI-Lernen
