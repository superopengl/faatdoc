import React from 'react';
import { Steps, Popover, Typography } from 'antd';
import { Progress } from 'antd';
import PropTypes from 'prop-types';
import { Tag } from 'antd';

const { Step } = Steps;
const {Text} = Typography;

const percentage = {
  'draft': 0,
  'submitted': 33,
  'to_sign': 67,
  'signed': 67,
  'done': 100,
  'archive': 0
}

const progressStatus = {
  'draft': 'normal',
  'submitted': 'active',
  'to_sign': 'exception',
  'signed': 'active',
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
    return <Progress type="circle"
      percent={percentage[status]}
      status={progressStatus[status]}
      format={() => <Text ellipsis={true}><small>{label}</small></Text>}
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