import { useEffect, useState } from 'react';

export function useTypewriter(text: string, speedMs = 28) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(text.length === 0);

    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speedMs);

    return () => clearInterval(interval);
  }, [text, speedMs]);

  function skip() {
    setDisplayed(text);
    setDone(true);
  }

  return { displayed, done, skip };
}
