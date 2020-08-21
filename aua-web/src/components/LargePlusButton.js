
import React from 'react';
import styled from 'styled-components';
import { Tabs, Typography, Layout, Button, Row, Card } from 'antd';
import {
  ExclamationCircleOutlined, PlusOutlined
} from '@ant-design/icons';

const StyledButton = styled(Button)`
font-size: 3rem;
height: 160px;
box-shadow: 0px 2px 8px #888888;

`;

export const LargePlusButton = (props) => (
  <StyledButton block type="secondary" onClick={props.onClick}>
    <PlusOutlined />
  </StyledButton>
);