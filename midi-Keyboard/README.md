# Axiom FL Mapper

Desktop-App: M-Audio Axiom Pro 25 mit FL Studio verbinden.

## Start (einmalig am PC)

```bash
cd midi-Keyboard
npm install
npm run desktop
```

Fertig. Kein Git, kein Terminal danach nötig – Doppelklick reicht, wenn du die App einmal gebaut hast.

## Was die App macht

1. **Keyboard verbindet sich automatisch** (Desktop)
2. **Auto-Scan** – du bewegst Fader/Knöpfe der Reihe nach
3. **Antippen + FL-Ziel wählen** – zwei Klicks
4. **Speichert alles** in `Dokumente/AxiomFL/` (Windows) bzw. `~/Documents/AxiomFL/` (Mac)
5. **FL-Anleitung** – ein Knopf, kopiert die Schritte

## FL Studio

Rechtsklick auf Regler → Link to controller → Hardware bewegen → Accept.

Die App sagt dir, welcher Regler zu welchem FL-Ziel gehört.

## Entwicklung

```bash
npm run desktop:dev
```
