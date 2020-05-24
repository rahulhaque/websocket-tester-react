import { useState, useEffect } from 'react';
import { createContainer } from 'react-tracked';
import dayjs from 'dayjs';

import { loadState, saveState } from './Helpers';

const globalState = {
  // Declare your global variables here
  host: 'localhost:6001',
  payload: '',
  secure: true,
  autoConnect: false,
  connectionLog: [{
    datetime: dayjs().format('YYYY-MM-DD hh:mm:ss A'),
    message: `App started`
  }]
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
