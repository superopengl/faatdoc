import { Button, Divider, Alert, Space, Typography, Popover } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { varNameToLabelName } from 'util/varNameToLabelName';
import FileLink from 'components/FileLink';
import { BsFillInfoCircleFill } from 'react-icons/bs';

const { Title, Text } = Typography;


const PopoverContent = styled.div`
  max-width: 500px;
`;

const JobReviewItem = props => {
  const { text, description, value } = props;
  return <Space style={{ width: '100%', justifyContent: 'space-between' }}>
    {text && <Text strong>{varNameToLabelName(text)}</Text>}
    <div>{value}</div>
    {description && <Popover
      title={text}
    content={<PopoverContent>{description}</PopoverContent>}
      trigger="click"
    >
      <BsFillInfoCircleFill size={20} style={{fill: '#143e86'}}/>
    </Popover>}
  </Space>
}

const FinalReviewStep = props => {
  const { job, onFinish, onBack, isActive, okText } = props;

  const handleSave = async () => {
    onFinish();
  };

  const handleBack = () => {
    onBack();
  }

  if (!isActive) {
    return null;
  }

  return <>
    <Space direction="vertical" style={{ width: '100%' }}>
      <Title level={4}>{job.name}</Title>
      {job.docTemplateDescription && <Alert description={job.docTemplateDescription} type="warning" closable />}
      {job.fields.length > 0 && <>
        <Divider>Fields</Divider>
        {job.fields.map((field, i) => {
          const { name, description, value } = field;
          return <JobReviewItem key={i} text={varNameToLabelName(name)} description={description} value={value} />
        })}
      </>}
      {job.genDocs?.length > 0 && <>
        <Divider>Auto Gen Docs</Divider>
        {job.genDocs.map((doc, i) => {
          const { docTemplateDescription, fileId, fileName } = doc;
          return <JobReviewItem key={i} description={docTemplateDescription} value={<FileLink id={fileId} name={fileName} />}
          />
        })}
      </>}
      {job.uploadDocs?.length > 0 && <>
        <Divider>Uploaded Docs</Divider>
        {job.uploadDocs.map((fileId, i) => {
          return <JobReviewItem key={i} value={<FileLink id={fileId} />}
          />
        })}
      </>}
      {job.signDocs?.length > 0 && <>
        <Divider>Signed Docs</Divider>
        {job.signDocs.map((fileId, i) => {
          return <JobReviewItem key={i} value={<FileLink id={fileId} />}
          />
        })}
      </>}
      {job.feedbackDocs?.length > 0 && <>
        <Divider>Feedback Docs</Divider>
        {job.feedbackDocs.map((fileId, i) => {
          return <JobReviewItem key={i} value={<FileLink id={fileId} />}
          />
        })}
      </>}
      <Divider />
      <Space style={{ width: '100%' }}>
        <Button onClick={handleBack}>Back</Button>
        <Button onClick={handleSave} type="primary">{okText || 'Save and Submit'}</Button>
      </Space>
    </Space>
  </>
}

FinalReviewStep.propTypes = {
  job: PropTypes.any.isRequired,
};

FinalReviewStep.defaultProps = {
};

export default FinalReviewStep;