import React, { useState, useRef, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import Prism from 'prismjs';

import {
  Icon,
  Input,
  InputGroup,
  Panel,
  PanelGroup,
  Button,
  Timeline,
  Alert
} from 'rsuite';

import { useTracked } from './../Store';

let websocket = null;
let wsUrl = '';

const WsClient = (props) => {

  const [state, setState] = useTracked();
  const [connection, setConnection] = useState({ connected: false, connecting: false });

  const host = useRef();
  const payload = useRef();
  const logRef = useRef(state.connectionLog);

  useEffect(() => {
    Prism.highlightAll();
  }, [state.connectionLog]);

  const updateLog = useCallback((log) => {
    logRef.current.unshift(log);
    // connectionLog.unshift(log);
    setState(prev => ({ ...prev, connectionLog: [...logRef.current] }));
  }, [state.connectionLog]);

  const clearLog = () => {
    logRef.current = [{
      datetime: dayjs().format('YYYY-MM-DD hh:mm:ss A'),
      message: `App started`
    }];
    setState(prev => ({
      ...prev, connectionLog: logRef.current
    }));
  };

  const onOpen = (event) => {
    updateLog({
      datetime: dayjs().format('YYYY-MM-DD hh:mm:ss A'),
      message: `Connected to "${event.target.url}"`
    });
    setConnection({ ...connection, connected: true, connecting: false });
    payload.current.focus();
  };

  const onMessage = (event) => {
    // console.log(event);
    updateLog({
      datetime: dayjs().format('YYYY-MM-DD hh:mm:ss A'),
      message: `Message received from "${event.origin}"`,
      payload: event.data,
      dataflow: 'incoming'
    });
  };

  const onError = (event) => {
    // Error handling
    // console.error(event);

    updateLog({
      datetime: dayjs().format('YYYY-MM-DD hh:mm:ss A'),
      message: `Could not connect to "${event.target.url}". You may be able to find more information using inspector.`
    });
    setConnection({ ...connection, connected: false, connecting: false });
  };

  const onClose = (event) => {
    // Close handling
    // console.log(event);
    updateLog({
      datetime: dayjs().format('YYYY-MM-DD hh:mm:ss A'),
      message: `Connection closed "${event.target.url}"`
    });
    setConnection({ ...connection, connected: false, connecting: false });
  };

  const connect = () => {
    if (host.current.value === '') {
      Alert.error('Websocket host is missing.');
    }
    else {
      wsUrl = `${state.secure ? 'wss://' : 'ws://'}${host.current.value}`;

      setState(prev => ({ ...prev, host: host.current.value }));
      if (websocket?.readyState !== 1) {
        updateLog({
          datetime: dayjs().format('YYYY-MM-DD hh:mm:ss A'),
          message: `Connecting to "${wsUrl}"`
        });
        setConnection({ ...connection, connecting: true });

        websocket = new WebSocket(wsUrl);
      }

      websocket.onopen = onOpen;
      websocket.onmessage = onMessage;
      websocket.onerror = onError;
      websocket.onclose = onClose;
    }
  };

  const disconnect = () => {
    if (websocket?.readyState === 1) {
      websocket.close();
    }
  };

  const sendMessage = (message) => {
    // console.log(websocket?.readyState);
    setState(prev => ({ ...prev, payload: message }));
    switch (websocket?.readyState) {
      case 1:

        if (message) {
          websocket.send(message);
          updateLog({
            datetime: dayjs().format('YYYY-MM-DD hh:mm:ss A'),
            message: `Payload send to "${wsUrl}"`,
            payload: message,
            dataflow: 'outgoing'
          });

          break;
        }

        Alert.error('Payload is empty.');

        break;

      default:
        Alert.error('Please, connect to websocket first.');
        break;
    }

  };

  // Render functions
  const renderConnectionLog = useCallback(() => {
    return state.connectionLog.map((item, index) => {
      return <Timeline.Item
        className="rs-timeline-item-last"
        key={index}
      >
        <p style={{ color: '#969696' }}>{item.datetime}</p>
        <p>{item.message}</p>
        {
          item?.payload ?
            <div>
              {
                item.dataflow === 'incoming' ?
                  <Icon icon="arrow-down2" style={{ color: 'rgba(224, 142, 0, 1)' }} /> :
                  <Icon icon="arrow-up2" style={{ color: 'rgba(0, 235, 0, 1)' }} />
              }
              <pre style={{padding: '.5em'}}>
                <code className="language-json">
                  {item?.payload}
                </code>
              </pre>
            </div> : ""
        }
      </Timeline.Item>
    })
  });

  return (
    <PanelGroup>
      <Panel>
        <InputGroup>
          <InputGroup.Addon>
            <Icon icon="circle" style={{ color: (connection.connected ? 'rgba(0, 235, 0, 1)' : 'rgba(235, 0, 0, 1)') }} />
          </InputGroup.Addon>
          <InputGroup.Button
            style={{ width: '60px' }}
            onClick={() => setState(prev => ({ ...prev, secure: !state.secure }))}
            color={state.secure ? 'green' : 'orange'}
          >
            {state.secure ? 'wss://' : 'ws://'}
          </InputGroup.Button>
          <Input defaultValue={state.host} inputRef={host} />
          {
            connection.connected ? (
              <InputGroup.Button
                color="red"
                onClick={() => disconnect()}
                loading={connection.connecting}
              >
                <Icon icon="unlink" /> Disconnect
              </InputGroup.Button>
            ) : (
                <InputGroup.Button
                  color="blue"
                  onClick={() => connect()}
                  loading={connection.connecting}
                >
                  <Icon icon="link" /> Connect
                </InputGroup.Button>
              )
          }
        </InputGroup>
      </Panel>
      <Panel>
        <Input
          className="language-json"
          style={{ borderColor: connection.connected ? "rgba(0, 235, 0, 1)" : "" }}
          inputRef={payload}
          defaultValue={state.payload}
          componentClass="textarea"
          rows={6}
          placeholder="Payload to send"
        />
        <br />
        <Button appearance="primary" block onClick={() => sendMessage(payload.current.value)}><Icon icon="realtime" /> Send</Button>
      </Panel>
      <Panel header={
        <div>
          <Icon icon="building2" /> Connection Log
          <Button color="red" onClick={() => clearLog()} style={{ float: 'right' }}><Icon icon="trash" /> Clear Log</Button>
        </div>
      }>
        <Timeline>
          {
            renderConnectionLog()
          }
        </Timeline>
      </Panel>
    </PanelGroup>
  )
}

export default React.memo(WsClient)
