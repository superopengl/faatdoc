import React from 'react';
import { Steps, Popover } from 'antd';
import { Progress } from 'antd';

const { Step } = Steps;

const percentage = {
  'draft': 0,
  'submitted': 33,
  'to_sign': 67,
  'done': 100
}

const progressStatus = {
  'draft': 'normal',
  'submitted': 'active',
  'to_sign': 'exception',
  'done': 'success'
}

function getLabelFromStatus(status) {
  return <small>{(status || '').replace(/_/g, ' ')}</small>
}

export const LodgementProgressBar = ({ status, ...props }) => {
  return <Progress type="circle"
    percent={percentage[status]}
    status={progressStatus[status]}
    format={() => getLabelFromStatus(status)} 
    {...props}
    />
}