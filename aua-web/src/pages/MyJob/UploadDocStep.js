import { Form, Divider, Typography } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { FileUploader } from 'components/FileUploader';
import StepButtonSet from './StepBottonSet';

const { Title } = Typography;

const UploadDocStep = (props) => {
  const { job, onFinish, onBack, isActive } = props;
  const [loading, setLoading] = React.useState(false);

  const initialValues = { fileIds: job.docs.filter(d => d.isByClient).map(d => d.fileId) };

  const handleSubmit = async () => {
    onFinish(job.docs);
  }

  if (!isActive) {
    return null;
  }

  const handleUploadingChange = uploading => {
    setLoading(uploading);
  }

  const handleRemove = (fileId) => {
    job.docs = job.docs.filter(d => d.fileId !== fileId);
  }

  const handleAdd = (fileId) => {
    job.docs = [...job.docs, { fileId, isByClient: true }];
  }
  return <Form
    layout="vertical"
    onFinish={handleSubmit}
    style={{ textAlign: 'left' }}
    initialValues={initialValues}
  >
    <Form.Item
      label={<Title level={4}>Client Uploaded Docs</Title>}
      name="fileIds"
    // rules={[{ required: true, message: 'Please upload files' }]}
    >
      <FileUploader disabled={loading} onRemove={handleRemove} onAdd={handleAdd} onUploadingChange={handleUploadingChange} />
    </Form.Item>
    <Divider />
    <StepButtonSet onBack={onBack} loading={loading} />
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
