import React from 'react';
import { Typography } from 'antd';
import { Progress } from 'antd';
import PropTypes from 'prop-types';
import { Tag } from 'antd';
import { PortfolioAvatar } from './PortfolioAvatar';

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

export const TaskStatus = ({ status, shape, name, portfolioId, avatar, ...props }) => {
  const label = getLabelFromStatus(status);
  if (shape === 'circle') {
    return <Progress
      type="circle"
      percent={percentage[status]}
      // steps={4}
      strokeWidth={3}
      status={progressStatus[status]}
      format={() => avatar ? <PortfolioAvatar value={name} id={portfolioId} size={52} /> : <Text type="secondary"><small>{label}</small></Text>}
      {...props}
    />
  }

  return <Tag color={tagColor[status]}>{label}</Tag>
}

TaskStatus.propTypes = {
  status: PropTypes.string.isRequired,
  name: PropTypes.string,
  portfolioId: PropTypes.string,
  shape: PropTypes.string.isRequired,
  avatar: PropTypes.bool.isRequired,
  width: PropTypes.number,
};

TaskStatus.defaultProps = {
  shape: 'circle',
  avatar: true,
}