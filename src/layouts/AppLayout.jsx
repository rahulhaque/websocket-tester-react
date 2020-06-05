import React from 'react'

import {
  Grid,
  Row,
  Nav,
  Navbar,
  Toggle
} from 'rsuite';

import WsClient from './../components/WsClient';

import { useTracked } from './../Store';

const app_name = process.env.REACT_APP_APP_NAME;

const AppLayout = (props) => {

  const [state, setState] = useTracked();

  return (
    <Grid fluid>
      <Row>
        <Navbar>
          <Navbar.Header>
            <span className="navbar-brand logo"><img src="./assets/android-chrome-192x192.png" alt="logo" height="25px" /> <b>{app_name}</b></span>
          </Navbar.Header>
          <Navbar.Body>
            <Nav pullRight>
              Auto Reconnect
              <Toggle
                style={{ margin: '16px 20px', width: '50px' }}
                checkedChildren="On"
                unCheckedChildren="Off"
                checked={state.autoConnect}
                onChange={() => setState(prev => ({ ...prev, autoConnect: !state.autoConnect }))}
              />
            </Nav>
          </Navbar.Body>
        </Navbar>
      </Row>
      <Row>
        <WsClient />
      </Row>
    </Grid >
  )
}

export default React.memo(AppLayout)
