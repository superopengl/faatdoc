import React from 'react';
import { Steps, Popover } from 'antd';
import { Progress } from 'antd';

const { Step } = Steps;

const percentage = {
  'draft': 0,
  'submitted': 25,
  'to_revise': 25,
  'ready': 50,
  'to_sign': 75,
  'done': 100
}

const progressStatus = {
  'draft': 'normal',
  'submitted': 'active',
  'to_revise': 'exception',
  'ready': 'active',
  'to_sign': 'exception',
  'done': 'success'
}

function getLabelFromStatus(status) {
  return <small>{(status || '').replace(/_/g, ' ')}</small>
}

export const LodgementProgressBar = ({ status }) => {
  return <Progress type="circle"
    percent={percentage[status]}
    status={progressStatus[status]}
    format={() => getLabelFromStatus(status)} 
    />
}