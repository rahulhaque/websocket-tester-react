import React from 'react';

import AppLayout from './layouts/AppLayout';

import { Provider } from './Store';

import 'rsuite/dist/styles/rsuite-dark.css';
import './App.css';

const App = () => (
  <Provider>
    <AppLayout />
  </Provider>
);

export default App;
