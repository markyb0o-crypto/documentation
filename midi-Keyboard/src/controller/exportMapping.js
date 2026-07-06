import { countMappings, formatMidiLabel } from '../state/mappingStore.js';

/**
 * @param {Record<string, import('../state/mappingStore.js').ControlAssignment>} mappings
 */
export function exportMappingToJson(mappings) {
  const exportPayload = {
    version: 2,
    target: 'fl-studio',
    method: 'link-to-controller',
    description:
      'Diese Datei dokumentiert deine Zuweisungen. In FL verbindest du jeden Regler per Rechtsklick → Link to controller.',
    assignments: Object.entries(mappings).map(([meshId, assignment]) => ({
      meshId,
      label: assignment.label,
      category: assignment.category,
      midi: assignment.midi,
      midiLabel: formatMidiLabel(assignment.midi),
      flSteps: assignment.flSteps,
    })),
  };

  return JSON.stringify(exportPayload, null, 2);
}

/**
 * @param {Record<string, import('../state/mappingStore.js').ControlAssignment>} mappings
 */
export function exportMappingGuide(mappings) {
  const lines = [
    '=== FL Studio Mapping-Anleitung ===',
    '',
    'So verbindest du jedes Bedienelement in FL Studio:',
    '1. Rechtsklick auf den gewünschten Regler',
    '2. „Link to controller" wählen',
    '3. Physisches Bedienelement am Axiom bewegen',
    '4. In FL „Accept" klicken',
    '',
    `Gespeicherte Zuweisungen: ${countMappings(mappings)}`,
    '',
  ];

  for (const [meshId, assignment] of Object.entries(mappings)) {
    lines.push(`--- ${assignment.label} (${meshId}) ---`);
    lines.push(`MIDI: ${formatMidiLabel(assignment.midi)}`);
    assignment.flSteps.forEach((step, index) => {
      lines.push(`${index + 1}. ${step}`);
    });
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * @param {string} content
 * @param {string} filename
 */
export function downloadTextFile(content, filename) {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
