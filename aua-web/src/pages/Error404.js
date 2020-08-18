import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Typography } from 'antd';
import { HomeOutlined, CloseCircleOutlined } from '@ant-design/icons';
const ContainerStyled = styled.div`
  margin: 2rem;
  text-align: center;
`;
const { Title } = Typography;
const Error404 = () => (
  <ContainerStyled>
    <Title type="danger"><CloseCircleOutlined/></Title>
    <Title>404 Page Not Found</Title>
    <Link to="/"><HomeOutlined /> Back to home</Link>
  </ContainerStyled>

);

Error404.propTypes = {};

Error404.defaultProps = {};

export default Error404;
