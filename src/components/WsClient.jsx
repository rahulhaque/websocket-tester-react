import React, { useState, useRef, useEffect, useCallback } from 'react'
import dayjs from 'dayjs';
import Prism from 'prismjs';

import {
  Col,
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
  //
  const [connected, setConnected] = useState({ connected: false, connecting: false });

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

  const onOpen = (event) => {
    updateLog({
      datetime: dayjs().format('YYYY-MM-DD hh:mm:ss A'),
      message: `Connected to "${wsUrl}"`
    });
    setConnected({ ...connected, connected: true, connecting: false });
    payload.current.focus();
  };

  const onMessage = (message) => {
    console.log(message);
    updateLog({
      datetime: dayjs().format('YYYY-MM-DD hh:mm:ss A'),
      message: `Message received from "${message.origin}"`,
      payload: message.data,
      dataflow: 'incoming'
    });
  };

  const onError = (error) => {
    // Error handling
    console.log('websocket_error', error);

    updateLog({
      datetime: dayjs().format('YYYY-MM-DD hh:mm:ss A'),
      message: `Could not connect to "${wsUrl}". You may be able to find more information using inspector.`
    });
    setConnected({ ...connected, connected: false, connecting: false });
  };

  const onClose = (event) => {
    // Close handling
    // console.log(event);
    updateLog({
      datetime: dayjs().format('YYYY-MM-DD hh:mm:ss A'),
      message: `Connection closed "${wsUrl}"`
    });
    setConnected({ ...connected, connected: false, connecting: false });
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
        setConnected({ ...connected, connecting: true });

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
        }

        Alert.error('Payload is empty.');

        break;

      default:
        Alert.error('Please, connect to websocket first.');
        break;
    }

  };

  return (
    <PanelGroup>
      <Panel>
        <InputGroup>
          <InputGroup.Addon>
            <Icon icon="circle" style={{ color: (connected.connected ? 'rgba(0, 235, 0, 1)' : 'rgba(235, 0, 0, 1)') }} />
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
            connected.connected ? (
              <InputGroup.Button
                color="red"
                onClick={() => disconnect()}
                loading={connected.connecting}
              >
                <Icon icon="unlink" /> Disconnect
              </InputGroup.Button>
            ) : (
                <InputGroup.Button
                  color="blue"
                  onClick={() => connect()}
                  loading={connected.connecting}
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
          style={{ borderColor: connected.connected ? "rgba(0, 235, 0, 1)" : "" }}
          inputRef={payload}
          defaultValue={state.payload}
          componentClass="textarea"
          rows={6}
          placeholder="Payload to send"
        />
        <br />
        <Button appearance="primary" block onClick={() => sendMessage(payload.current.value)}><Icon icon="realtime" /> Send</Button>
      </Panel>
      <Panel>
        <Col xs={24}>
          <Timeline>
            {
              state.connectionLog.map((item, index) => {
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
                        <pre>
                          <code className="language-json">
                            {item?.payload}
                          </code>
                        </pre>
                      </div> : ""
                  }
                </Timeline.Item>
              })
            }
          </Timeline>
        </Col>
      </Panel>
    </PanelGroup>
  )
}

export default React.memo(WsClient)
