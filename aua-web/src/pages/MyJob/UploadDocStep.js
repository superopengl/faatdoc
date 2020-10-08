import { Button, Form, Input, Divider, Space, Typography } from 'antd';
import { DateInput } from 'components/DateInput';
import { RangePickerInput } from 'components/RangePickerInput';
import PropTypes from 'prop-types';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { varNameToLabelName } from 'util/varNameToLabelName';
import { merge } from 'lodash';
import { FileUploader } from 'components/FileUploader';

const { Text } = Typography;

const UploadDocStep = (props) => {
  const { job, onChange, onFinish, onBack, onSkip, isActive } = props;
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (values) => {
    const {uploadDocs} = values;
    onFinish(uploadDocs);
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
      label="Client Uploaded Docs"
      name="uploadDocs"
    // rules={[{ required: true, message: 'Please upload files' }]}
    >
      <FileUploader disabled={loading} />
    </Form.Item>
    <Divider />
    <Space style={{ width: '100%' }}>
      <Button block onClick={() => onBack()}>Back</Button>
      <Button block onClick={() => onSkip()} disabled={loading}>Skip</Button>
      <Button block type="primary" htmlType="submit" disabled={loading}>Next</Button>
    </Space>
  </Form>
};

UploadDocStep.propTypes = {
  job: PropTypes.any.isRequired,
  disabled: PropTypes.bool.isRequired,
};

UploadDocStep.defaultProps = {
  disabled: false
};

export default withRouter(UploadDocStep);
