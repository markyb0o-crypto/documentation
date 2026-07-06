/** Alle Bedienelemente des Axiom Pro 25 – Positionen für die 2D-Ansicht (Prozent). */

export const CONTROLS = [
  { id: 'fader_1', label: 'Fader 1', group: 'Fader', x: 72, y: 28, w: 5, h: 22 },
  { id: 'fader_2', label: 'Fader 2', group: 'Fader', x: 78, y: 28, w: 5, h: 22 },
  { id: 'fader_3', label: 'Fader 3', group: 'Fader', x: 84, y: 28, w: 5, h: 22 },
  { id: 'fader_4', label: 'Fader 4', group: 'Fader', x: 90, y: 28, w: 5, h: 22 },

  { id: 'knob_1', label: 'Knopf 1', group: 'Knopf', x: 8, y: 22, w: 7, h: 7 },
  { id: 'knob_2', label: 'Knopf 2', group: 'Knopf', x: 17, y: 22, w: 7, h: 7 },
  { id: 'knob_3', label: 'Knopf 3', group: 'Knopf', x: 26, y: 22, w: 7, h: 7 },
  { id: 'knob_4', label: 'Knopf 4', group: 'Knopf', x: 35, y: 22, w: 7, h: 7 },
  { id: 'knob_5', label: 'Knopf 5', group: 'Knopf', x: 44, y: 22, w: 7, h: 7 },
  { id: 'knob_6', label: 'Knopf 6', group: 'Knopf', x: 53, y: 22, w: 7, h: 7 },
  { id: 'knob_7', label: 'Knopf 7', group: 'Knopf', x: 62, y: 22, w: 7, h: 7 },
  { id: 'knob_8', label: 'Knopf 8', group: 'Knopf', x: 71, y: 22, w: 7, h: 7 },

  { id: 'pad_1', label: 'Pad 1', group: 'Pad', x: 8, y: 38, w: 9, h: 10 },
  { id: 'pad_2', label: 'Pad 2', group: 'Pad', x: 19, y: 38, w: 9, h: 10 },
  { id: 'pad_3', label: 'Pad 3', group: 'Pad', x: 30, y: 38, w: 9, h: 10 },
  { id: 'pad_4', label: 'Pad 4', group: 'Pad', x: 41, y: 38, w: 9, h: 10 },
  { id: 'pad_5', label: 'Pad 5', group: 'Pad', x: 52, y: 38, w: 9, h: 10 },
  { id: 'pad_6', label: 'Pad 6', group: 'Pad', x: 63, y: 38, w: 9, h: 10 },
  { id: 'pad_7', label: 'Pad 7', group: 'Pad', x: 74, y: 38, w: 9, h: 10 },
  { id: 'pad_8', label: 'Pad 8', group: 'Pad', x: 85, y: 38, w: 9, h: 10 },

  { id: 'transport_play', label: 'Play', group: 'Transport', x: 8, y: 54, w: 8, h: 6 },
  { id: 'transport_stop', label: 'Stop', group: 'Transport', x: 18, y: 54, w: 8, h: 6 },
  { id: 'transport_record', label: 'Rec', group: 'Transport', x: 28, y: 54, w: 8, h: 6 },
  { id: 'octave_down', label: 'Okt-', group: 'Tastatur', x: 82, y: 54, w: 7, h: 6 },
  { id: 'octave_up', label: 'Okt+', group: 'Tastatur', x: 90, y: 54, w: 7, h: 6 },
];

/** Reihenfolge für den geführten Auto-Scan. */
export const SCAN_ORDER = CONTROLS.filter((c) => !c.id.startsWith('octave') && !c.id.startsWith('key'));

export function getControlById(id) {
  return CONTROLS.find((control) => control.id === id) ?? null;
}
