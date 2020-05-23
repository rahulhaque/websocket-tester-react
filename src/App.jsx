import React from 'react';
import { Helmet } from 'react-helmet';

import { Provider } from './Store';
import Routes from './Routes';

import './App.css';
import 'rsuite/dist/styles/rsuite-dark.css';

const app_name = process.env.REACT_APP_APP_NAME;

const App = () => (
  <Provider>
    <Helmet
      defaultTitle={app_name}
      titleTemplate={`%s | ${app_name}`}
      meta={[
        { name: 'title', content: 'React Web Boilerplate' },
        { name: 'description', content: 'React Web Boilerplate' },
        {
          name: 'keywords',
          content: 'react,web,boilerplate'
        },
        { name: 'og:url', content: 'domain' },
        { property: 'og:image', content: 'public_image_url' }
      ]}
    />
    {/* Go to Routes component to add routes */}
    <Routes />
  </Provider>
);

export default App;
