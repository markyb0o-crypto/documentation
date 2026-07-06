/**
 * Web MIDI API – Keyboard verbinden und Signale im Lernmodus erfassen.
 */

/** @typedef {import('../state/mappingStore.js').MidiBinding} MidiBinding */

/**
 * @returns {boolean}
 */
export function isWebMidiSupported() {
  return typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator;
}

/**
 * @returns {Promise<MIDIAccess>}
 */
export async function requestMidiAccess() {
  if (!isWebMidiSupported()) {
    throw new Error('Dein Browser unterstützt Web MIDI nicht. Nutze Chrome oder Edge.');
  }

  return navigator.requestMIDIAccess({ sysex: false });
}

/**
 * @param {MIDIAccess} access
 * @returns {string[]}
 */
export function listInputNames(access) {
  return [...access.inputs.values()].map((input) => input.name || 'Unbekanntes Gerät');
}

/**
 * @param {Uint8Array} data
 * @returns {MidiBinding | null}
 */
export function parseMidiMessage(data) {
  const status = data[0];
  const data1 = data[1];
  const messageType = status & 0xf0;
  const channel = (status & 0x0f) + 1;

  if (messageType === 0xb0) {
    return { type: 'cc', channel, number: data1 };
  }

  if (messageType === 0x90 && data[2] > 0) {
    return { type: 'note', channel, number: data1 };
  }

  return null;
}

/**
 * @param {MIDIAccess} access
 * @param {(midi: MidiBinding) => void} onLearned
 * @returns {() => void}
 */
export function startLearnMode(access, onLearned) {
  const handler = (event) => {
    const binding = parseMidiMessage(event.data);
    if (binding) onLearned(binding);
  };

  for (const input of access.inputs.values()) {
    input.addEventListener('midimessage', handler);
  }

  return () => {
    for (const input of access.inputs.values()) {
      input.removeEventListener('midimessage', handler);
    }
  };
}

/**
 * @param {MIDIAccess} access
 * @param {() => void} onDeviceChange
 * @returns {() => void}
 */
export function onMidiStateChange(access, onDeviceChange) {
  access.addEventListener('statechange', onDeviceChange);
  return () => access.removeEventListener('statechange', onDeviceChange);
}
