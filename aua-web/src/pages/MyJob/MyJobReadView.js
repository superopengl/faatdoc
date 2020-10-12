import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Layout } from 'antd';
import FinalReviewStep from './FinalReviewStep';
import { Button } from 'antd';
import { Divider } from 'antd';




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
