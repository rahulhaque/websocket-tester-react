import React, { useRef } from 'react';

import { Whisper, Popover, Tooltip, Input, InputGroup, Icon } from 'rsuite';

import { useTracked } from './../Store';

let payloadPopupTrigger = null;

const PayloadPopup = (props) => {

  const [state, setState] = useTracked();

  const protocols = useRef();

  return (
    <Whisper
      placement="bottom"
      trigger="click"
      triggerRef={ref => (payloadPopupTrigger = ref)}
      speaker={
        <Popover title={
          <div>
            Websocket Protocol
            <Whisper
              speaker={
                <Tooltip>Enter protocols separated by comma.</Tooltip>
              }
              trigger="hover"
              placement="bottomEnd"
            >
              <span className="rs-help-block rs-help-block-tooltip" style={{ marginTop: 0 }}>
                <Icon icon="question-circle2" />
              </span>
            </Whisper>
          </div>
        }>
          <Input inputRef={protocols} placeholder="Enter protocols" defaultValue={state.protocols} onPressEnter={() => payloadPopupTrigger.hide()} />
        </Popover>
      }
      onOpen={() => protocols.current.focus()}
      onExit={() => {
        setState(prev => ({ ...prev, protocols: protocols.current.value }))
      }}
    ><InputGroup.Button color={state.protocols ? "violet" : null}>
        <Icon icon="sliders" />
      </InputGroup.Button>
    </Whisper>
  )
};

export default React.memo(PayloadPopup);
