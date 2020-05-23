import React from 'react';
import {
  HashRouter,
  Route,
  Switch,
  Redirect
} from 'react-router-dom';

import AppLayout from './layouts/AppLayout';

import { isLoggedIn } from './Helpers';

export const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      isLoggedIn() ? (
        <Component {...props} />
      ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: props.location }
            }}
          />
        )
    }
  />
);

export const GuestRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      !isLoggedIn() ? (
        <Component {...props} />
      ) : (
          <Redirect
            to={{
              pathname: '/dashboard',
              state: { from: props.location }
            }}
          />
        )
    }
  />
);

const Routes = () => (
  <HashRouter>
    <Switch>
      <Route exact path={'/'} component={AppLayout} />
    </Switch>
  </HashRouter>
);

export default React.memo(Routes);
