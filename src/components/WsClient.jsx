import React, { useState, useRef, useEffect } from 'react';
import dayjs from 'dayjs';

import {
  Icon,
  Input,
  InputGroup,
  Panel,
  PanelGroup,
  Button,
  Alert,
  IconButton,
  Row,
  Col
} from 'rsuite';
import ResponsiveNav from '@rsuite/responsive-nav';

import LogItem from './LogItem';
import PayloadPopup from './PayloadPopup';

import { useTracked } from './../Store';

let websocket = null;
let wsHost = '';

const WsClient = (props) => {

  const [state, setState] = useTracked();
  const [connection, setConnection] = useState({ connected: false, connecting: false });

  const host = useRef();
  const payload = useRef();
  const stateRef = useRef({
    connectionLog: state.connectionLog,
    retryCount: 0,
    autoConnect: state.autoConnect
  });

  useEffect(() => {
    stateRef.current.autoConnect = state.autoConnect;
  }, [state.autoConnect]);

  useEffect(() => {
    let currentPayload = state.payloads.find(payload => payload.id === state.activePayload);
    if (!currentPayload) {
      setState(prev => ({ ...prev, activePayload: '0' }));
    }
    payload.current.value = state.payloads.find(payload => payload.id === state.activePayload)?.payload;
  }, [state.activePayload, state.payloads, setState]);

  const updateLog = (log) => {
    stateRef.current.connectionLog.unshift(log);
    setState(prev => ({ ...prev, connectionLog: [...stateRef.current.connectionLog] }));
  };

  const clearLog = () => {
    stateRef.current.connectionLog = [{
      datetime: dayjs().format('YYYY-MM-DD hh:mm:ss A'),
      message: `App started`
    }];
    setState(prev => ({
      ...prev, connectionLog: stateRef.current.connectionLog
    }));
  };

  const onOpen = (event) => {
    stateRef.current.retryCount = 0;
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
    reconnect();
  };

  const reconnect = () => {
    if (stateRef.current.autoConnect) {
      if (stateRef.current.retryCount >= 3) {
        Alert.warning(`Stopped trying to reconnect after ${stateRef.current.retryCount} attempts.`);
        stateRef.current.retryCount = 0;
      }
      else {
        stateRef.current.retryCount = stateRef.current.retryCount + 1;
        connect();
        Alert.info(`Tried to reconnect ${stateRef.current.retryCount} times.`);
      }
    }
  };

  const connect = () => {
    if (host.current.value === '') {
      Alert.error('Websocket host is missing.');
    }
    else {
      wsHost = `${state.secure ? 'wss://' : 'ws://'}${host.current.value}`;

      setState(prev => ({ ...prev, host: host.current.value }));
      if (websocket?.readyState !== 1) {
        updateLog({
          datetime: dayjs().format('YYYY-MM-DD hh:mm:ss A'),
          message: `Connecting to "${wsHost}/"`
        });
        setConnection({ ...connection, connecting: true });

        if (state.protocols === '') {
          websocket = new WebSocket(wsHost);
        }
        else {
          websocket = new WebSocket(wsHost, state.protocols.replace(/\s+/g, '').split(','));
        }
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
    setState(prev => ({
      ...prev, payloads: state.payloads.map(item => {
        if (item.id === state.activePayload) {
          return { ...item, payload: message };
        }
        return item;
      })
    }));
    switch (websocket?.readyState) {
      case 1:
        if (message) {
          websocket.send(message);
          updateLog({
            datetime: dayjs().format('YYYY-MM-DD hh:mm:ss A'),
            message: `Payload send to "${wsHost}"`,
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
          <PayloadPopup />
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
        <ResponsiveNav appearance="tabs" activeKey={state.activePayload} onSelect={key => {

          if (key === 'add_new') {
            let max = Math.max(...state.payloads.map(item => item.id)) + 1;

            setState(prev => ({
              ...prev,
              activePayload: `${max}`,
              payloads: [...prev.payloads, {
                id: `${max}`,
                label: `Payload ${max}`,
                payload: ``
              }]
            }));
          }
          else if (key) {
            payload.current.value = state.payloads.find(payload => payload.id === key).payload
            setState(prev => ({ ...prev, activePayload: key }));
          }

        }}>
          {
            state.payloads.map(payload => {
              return <ResponsiveNav.Item key={payload.id} eventKey={payload.id}>
                {payload.label}
                {
                  payload.id !== '0' ?
                    <IconButton circle
                      color="red"
                      appearance="link"
                      size="xs"
                      onClick={(event) => {
                        const slicedPayloads = [...state.payloads];
                        slicedPayloads.splice(
                          slicedPayloads.map(payload => payload.id).indexOf(payload.id), 1
                        );
                        setState(prev => ({
                          ...prev,
                          payloads: slicedPayloads
                        }))
                      }}
                      icon={<Icon icon="close" />}
                      style={{ height: '16px', width: '16px', top: '-5px', marginLeft: '4px' }}>
                    </IconButton> : ''
                }
              </ResponsiveNav.Item>
            })
          }
          <ResponsiveNav.Item
            key="add_new"
            eventKey="add_new"
            icon={<Icon icon="plus" />}
            style={{ background: '#292d33', borderRadius: '6px 6px 0 0' }}> Add New
          </ResponsiveNav.Item>
        </ResponsiveNav>
        <br />
        <Input
          style={{
            borderColor: connection.connected ? "rgba(0, 235, 0, 1)" : "",
          }}
          inputRef={payload}
          componentClass="textarea"
          rows={6}
          placeholder="Payload to send"
          onPressEnter={() => sendMessage(payload.current.value)}
        />
        <Row gutter={16} className="show-grid">
          <Col xs={24} sm={24} md={8} lg={8}>
            <Button appearance="ghost" block color="orange" onClick={() => {
              payload.current.value = '';
              setState(prev => ({
                ...prev,
                payloads: state.payloads.map(item => {
                  if (item.id === state.activePayload) {
                    return { ...item, payload: '' };
                  }
                  return item;
                })
              }));
            }}><Icon icon="eraser" /> Clear Payload</Button>
          </Col>
          <Col xs={24} sm={24} md={8} lg={8}>
            <Button appearance="ghost" block onClick={() => {
              setState(prev => ({
                ...prev,
                payloads: state.payloads.map(item => {
                  if (item.id === state.activePayload) {
                    return { ...item, payload: payload.current.value };
                  }
                  return item;
                })
              }));
            }}><Icon icon="save" /> Save Payload</Button>
          </Col>
          <Col xs={24} sm={24} md={8} lg={8}>
            <Button appearance="primary" block onClick={() => sendMessage(payload.current.value)}><Icon icon="realtime" /> Send Payload</Button>
          </Col>
        </Row>
      </Panel>
      <Panel header={
        <div>
          <Icon icon="building2" /> Connection Log
          <Button color="red" onClick={() => clearLog()} style={{ float: 'right' }}><Icon icon="trash" /> Clear Log</Button>
        </div>
      }>
        <LogItem logs={state.connectionLog} />
      </Panel>
    </PanelGroup>
  )
}

export default React.memo(WsClient);
