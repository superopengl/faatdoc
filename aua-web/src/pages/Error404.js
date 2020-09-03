import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Typography, Result, Button } from 'antd';
import { HomeOutlined, CloseCircleOutlined } from '@ant-design/icons';
const ContainerStyled = styled.div`
  margin: 2rem;
  text-align: center;
`;
const { Title } = Typography;
const Error404 = () => (
<Result
  status="error"
  title="404 Page Not Found"
  subTitle="Sorry, the page you visited does not exist."
  extra={<Link to="/"><Button type="link" icon={<HomeOutlined />}>Back Home</Button></Link>}
/>
);

Error404.propTypes = {};

Error404.defaultProps = {};

export default Error404;
