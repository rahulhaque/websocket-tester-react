import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Prism from 'prismjs';

import {
  Icon,
  Timeline,
} from 'rsuite';

const LogItem = (props) => {

  useEffect(() => {
    Prism.highlightAll();
  }, [props.logs]);

  return (
    <Timeline>
      {
        props.logs.map((item, index) => {
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
                  <pre style={{ padding: '.5em' }}>
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
  )
}

LogItem.propTypes = {
  logs: PropTypes.array
};

export default React.memo(LogItem);
