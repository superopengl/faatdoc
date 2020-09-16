import React from 'react';
import { Typography } from 'antd';
import { Progress } from 'antd';
import PropTypes from 'prop-types';
import { Tag } from 'antd';
import { PortofolioAvatar } from './PortofolioAvatar';

const { Text } = Typography;

const percentage = {
  'todo': 25,
  'to_sign': 50,
  'signed': 75,
  'complete': 100,
  'archive': 0
}

const progressStatus = {
  'todo': 'normal',
  'to_sign': 'exception',
  'signed': 'normal',
  'complete': 'success',
  'archive': 'normal'
}

const tagColor = {
  'todo': 'blue',
  'to_sign': 'red',
  'signed': 'blue',
  'complete': 'green',
  'archive': undefined
}

function getLabelFromStatus(status) {
  return <small>{(status || '').replace(/_/g, ' ')}</small>
}

export const TaskStatus = ({ status, shape, name, ...props }) => {
  const label = getLabelFromStatus(status);
  if (shape === 'circle') {
    return <Progress
      type="circle"
      percent={percentage[status]}
      // steps={4}
      strokeWidth={3}
      status={progressStatus[status]}
      format={() => {
        return (
          // <Text type="secondary"><small>{label}</small></Text>
          <PortofolioAvatar value={name} size={52} />
        )
      }
      }
      {...props}
    />
  }

  return <Tag color={tagColor[status]}>{label}</Tag>
}

TaskStatus.propTypes = {
  status: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  shape: PropTypes.string.isRequired
};

TaskStatus.defaultProps = {
  shape: 'circle',
}