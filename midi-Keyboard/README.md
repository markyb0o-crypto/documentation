# Axiom FL Mapper

3D anklicken → sagen was es macht → fertig.

## Online testen

**https://cdn.statically.io/gh/markyb0o-crypto/documentation@gh-pages/index.html**

(Axiom per USB, Chrome/Edge, MIDI-Zugriff erlauben, Internet für 3D-Modell)

Alternativ (einmalig in GitHub aktivieren):  
https://markyb0o-crypto.github.io/documentation/

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
