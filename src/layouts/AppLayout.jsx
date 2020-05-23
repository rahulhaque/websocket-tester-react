import React from 'react'

import {
  Grid,
  Row,
  Nav,
  Navbar,
  Icon,
  Toggle
} from 'rsuite';

import WsClient from './../components/WsClient';

import { useTracked } from './../Store';

const AppLayout = (props) => {

  const [state, setState] = useTracked();

  return (
    <Grid fluid>
      <Row>
        <Navbar>
          <Navbar.Header>
            <span className="navbar-brand logo"><Icon icon="terminal-line" /> WebSocket Tester</span>
          </Navbar.Header>
          <Navbar.Body>
            <Nav pullRight>
              Auto Reconnect
              <Toggle
                style={{ margin: '16px', width: '50px' }}
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
