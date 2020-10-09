import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Layout, Spin } from 'antd';
import HomeHeader from 'components/HomeHeader';
import MyJobForm from './MyJobForm';
import { listJobTemplate } from 'services/jobTemplateService';
import { listPortfolio } from 'services/portfolioService';
import { generateJob, getJob, saveJob } from 'services/jobService';
import MyJobSign from './MyJobSign';
import JobFormWizard from './JobFormWizard';
import FinalReviewStep from './FinalReviewStep';
import { Button } from 'antd';
import { Divider } from 'antd';

const ContainerStyled = styled.div`
margin: 4rem auto 0 auto;
padding: 2rem 1rem;
// text-align: center;
max-width: 500px;
width: 100%;
`;


const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;
`;

const MyJobReadView = (props) => {
  const { value, showsSignDoc } = props;

  const handleOk = () => {
    props.history.goBack();
  }

  return (<>
    <FinalReviewStep job={value} showsFooter={false} showsSignDoc={showsSignDoc} />
    <Divider/>
    <Button block type="primary" onClick={handleOk}>OK</Button>
  </>
  );
};

MyJobReadView.propTypes = {
  value: PropTypes.any.isRequired,
  showsSignDoc: PropTypes.bool.isRequired,
};

MyJobReadView.defaultProps = {
  // id: 'new'
  showsSignDoc: true
};

export default withRouter(MyJobReadView);
