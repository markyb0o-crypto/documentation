import { useCallback, useEffect, useState } from 'react';
import {
  isWebMidiSupported,
  listInputNames,
  onMidiStateChange,
  requestMidiAccess,
  startLearnMode,
} from '../controller/webMidi.js';

export default function useWebMidi() {
  const [supported] = useState(isWebMidiSupported);
  const [access, setAccess] = useState(null);
  const [devices, setDevices] = useState([]);
  const [error, setError] = useState(null);
  const [isLearning, setIsLearning] = useState(false);

  const refreshDevices = useCallback((midiAccess) => {
    setDevices(listInputNames(midiAccess));
  }, []);

  const connect = useCallback(async () => {
    try {
      setError(null);
      const midiAccess = await requestMidiAccess();
      setAccess(midiAccess);
      refreshDevices(midiAccess);
    } catch (connectError) {
      setError(connectError instanceof Error ? connectError.message : 'Verbindung fehlgeschlagen');
    }
  }, [refreshDevices]);

  useEffect(() => {
    if (!access) return undefined;
    return onMidiStateChange(access, () => refreshDevices(access));
  }, [access, refreshDevices]);

  const startLearning = useCallback(
    (onLearned) => {
      if (!access) {
        setError('Bitte zuerst das Keyboard verbinden.');
        return () => {};
      }

      setIsLearning(true);
      setError(null);

      const stop = startLearnMode(access, (midi) => {
        onLearned(midi);
        setIsLearning(false);
        stop();
      });

      return () => {
        setIsLearning(false);
        stop();
      };
    },
    [access],
  );

  return {
    supported,
    connected: Boolean(access),
    devices,
    error,
    isLearning,
    connect,
    startLearning,
  };
}
