
import React from 'react';
import styled from 'styled-components';
import { Tabs, Typography, Layout, Button, Row, Card } from 'antd';
import {
  ExclamationCircleOutlined, PlusOutlined
} from '@ant-design/icons';

const {Title} = Typography;

const StyledButton = styled(Button)`
font-size: 40px;
height: 68px;
box-shadow: 0px 1px 4px #cccccc;

`;

export const LargePlusButton = (props) => (
  <StyledButton block type="secondary" onClick={props.onClick}>
    <PlusOutlined />
  </StyledButton>
);