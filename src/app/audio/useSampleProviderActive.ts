import { useEffect, useState } from 'react';
import { SampleProvider } from './SampleProvider';

export function useSampleProviderActive(sampleProvider: SampleProvider) {
  const [active, setActive] = useState(sampleProvider.active);
  useEffect(() => {
    setActive(sampleProvider.active);
    const unsubscribe = sampleProvider.onActiveChange(setActive);
    return () => unsubscribe();
  }, [sampleProvider]);
  return active;
}
