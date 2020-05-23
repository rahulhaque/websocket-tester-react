import { useState, useEffect } from 'react';
import { createContainer } from 'react-tracked';

import { loadState, saveState } from './Helpers';

const globalState = {
  // Declare your global variables here
  host: 'localhost:6001',
  payload: '',
  secure: true,
  autoConnect: false
};

// Returns state from localstorage if exists
const useLocalState = () => {
  const [processedState, setProcessedState] = useState((loadState() || globalState));
  useEffect(() => {
    saveState(processedState);
  }, [processedState]);
  return [processedState, setProcessedState];
};

export const { Provider, useTracked } = createContainer(useLocalState);
