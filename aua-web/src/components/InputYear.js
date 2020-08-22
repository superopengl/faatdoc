
import React from 'react';
import styled from 'styled-components';
import { Select, Typography, Layout, Button, Row, Card, Input } from 'antd';
import {
  ExclamationCircleOutlined, PlusOutlined
} from '@ant-design/icons';

const StyledButton = styled(Button)`
font-size: 3rem;
height: 160px;
box-shadow: 0px 2px 8px #888888;

`;

export const InputYear = (props) => {
  const thisYear = new Date().getFullYear();
  const options = [0, -1, -2].map(x => `${thisYear + x - 1} - ${thisYear + x}`);

  return (
    <Select onChange={props.onChange} disabled={props.disabled}>
      {options.map(x => <Select.Option key={x} value={x}>{x}</Select.Option>)}
    </Select>
  )
};