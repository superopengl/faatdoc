import React from 'react';
import { Typography } from 'antd';
import { Progress } from 'antd';
import PropTypes from 'prop-types';
import { Tag } from 'antd';

const {Text} = Typography;

const percentage = {
  'draft': 0,
  'submitted': 25,
  'to_sign': 50,
  'signed': 75,
  'done': 100,
  'archive': 0
}

const progressStatus = {
  'draft': 'normal',
  'submitted': 'normal',
  'to_sign': 'exception',
  'signed': 'normal',
  'done': 'success',
  'archive': 'normal'
}

const tagColor = {
  'draft': undefined,
  'submitted': 'blue',
  'to_sign': 'red',
  'signed': 'blue',
  'done': 'green',
  'archive': undefined
}

function getLabelFromStatus(status) {
  return <small>{(status || '').replace(/_/g, ' ')}</small>
}

export const LodgementProgressBar = ({ status, shape, ...props }) => {
  const label = getLabelFromStatus(status);
  if (shape === 'circle') {
    return <Progress 
    type="circle"
      percent={percentage[status]}
      // steps={4}
      strokeWidth={3}
      status={progressStatus[status]}
      format={() => <Text type="secondary"><small>{label}</small></Text>}
      {...props}
    />
  }

  return <Tag color={tagColor[status]}>{label}</Tag>
}

LodgementProgressBar.propTypes = {
  status: PropTypes.string.isRequired,
  shape: PropTypes.string.isRequired
};

LodgementProgressBar.defaultProps = {
  shape: 'circle',
}