import { Form, Input, Typography } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { withRouter } from 'react-router-dom';
import StepButtonSet from './StepBottonSet';

const { Title } = Typography;

const JobNameStep = (props) => {
  const { job, onFinish, isActive } = props;

  const handleSubmit = async (values) => {
    onFinish(values.name);
  }

  if (!isActive) {
    return null;
  }

  return <Form
    layout="vertical"
    onFinish={handleSubmit}
    style={{ textAlign: 'left' }}
    initialValues={job}
  >
    <Form.Item
      label={<Title level={4}>Job Name</Title>}
      name="name"
      rules={[{ required: true, message: ' ' }]}
    >
      <Input placeholder="Job Name" autoFocus />
    </Form.Item>
    {/* <Button block type="primary" htmlType="submit">Next</Button> */}
    <StepButtonSet showsBack={false} />
  </Form>
};

JobNameStep.propTypes = {
  job: PropTypes.any.isRequired,
  disabled: PropTypes.bool.isRequired,
};

JobNameStep.defaultProps = {
  disabled: false
};

export default withRouter(JobNameStep);
