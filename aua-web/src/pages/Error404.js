import React from 'react';
import styled from 'styled-components';
import { Link, withRouter } from 'react-router-dom';
import { Typography, Result, Button } from 'antd';
import { HomeOutlined, CloseCircleOutlined } from '@ant-design/icons';
const ContainerStyled = styled.div`
  margin: 2rem;
  text-align: center;
`;
const { Title } = Typography;
const Error404 = props => {
  const handleGoBack = () => {
    props.history.goBack();
  };

  return <Result
    status="error"
    title="404 Page Not Found"
    subTitle="Oops! The page you visited does not exist."
    extra={<Button type="link" onClick={handleGoBack}>Go Back</Button>}
  />
};

Error404.propTypes = {};

Error404.defaultProps = {};

export default withRouter(Error404);
