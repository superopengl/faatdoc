import { Button, Divider, Alert, Space, Typography, Popover } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { varNameToLabelName } from 'util/varNameToLabelName';
import FileLink from 'components/FileLink';
import { BsFillInfoCircleFill } from 'react-icons/bs';
import { LeftOutlined, RightOutlined, StarTwoTone } from '@ant-design/icons';

const { Title, Text } = Typography;


const PopoverContent = styled.div`
  max-width: 500px;
`;

const JobReviewItem = props => {
  const { text, description, value } = props;
  return <Space style={{ width: '100%', justifyContent: 'space-between' }}>
    {text && <Text strong>{varNameToLabelName(text)}</Text>}
    {value}
    {description && <Popover
      title={text}
      content={<PopoverContent>{description}</PopoverContent>}
      trigger="click"
    >
      <Button type="link" style={{position: 'relative', top: 4}} icon={<BsFillInfoCircleFill size={20} style={{ fill: '#143e86' }} />} />
    </Popover>}
  </Space>
}

const PartDivider = props => <Divider><Text type="secondary">{props.text}</Text></Divider>

const FinalReviewStep = props => {
  const { job, onFinish, onBack, isActive, showsFooter, showsSignDoc } = props;

  const handleSave = async () => {
    onFinish();
  };

  const handleBack = () => {
    onBack();
  }

  if (isActive === false) {
    return null;
  }

  return <>
    <Space direction="vertical" style={{ width: '100%' }}>
      <Title level={4}>{job.name}</Title>
      {job.docTemplateDescription && <Alert description={job.docTemplateDescription} type="warning" closable />}
      {job.fields.length > 0 && <>
        <PartDivider text="Fields" />
        {job.fields.map((field, i) => {
          const { name, description, value } = field;
          return <JobReviewItem key={i} text={varNameToLabelName(name)} description={description} value={value} />
        })}
      </>}
      {job.genDocs?.length > 0 && <>
        <PartDivider text="Auto Gen Docs" />
        {job.genDocs.map((doc, i) => {
          const { docTemplateDescription, fileId, fileName } = doc;
          return <JobReviewItem key={i} description={docTemplateDescription} value={<FileLink id={fileId} name={fileName} />}
          />
        })}
      </>}
      {job.uploadDocs?.length > 0 && <>
        <PartDivider text="Uploaded Docs" />
        {job.uploadDocs.map((fileId, i) => {
          return <JobReviewItem key={i} value={<FileLink id={fileId} />}
          />
        })}
      </>}
      {(showsSignDoc && job.signDocs?.length > 0) && <>
        <PartDivider text="Signed Docs" />
        {job.signDocs.map((fileId, i) => {
          return <JobReviewItem key={i} value={<FileLink id={fileId} />}
          />
        })}
      </>}
      {job.feedbackDocs?.length > 0 && <>
        <PartDivider text="Feedback Docs" />
        {job.feedbackDocs.map((fileId, i) => {
          return <JobReviewItem key={i} value={<FileLink id={fileId} />}
          />
        })}
      </>}
      {showsFooter && <>
        <Divider />
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Button shape="circle" size="large" onClick={() => onBack()} icon={<LeftOutlined />}></Button>
          <Button onClick={handleSave} type="primary">Save and Submit</Button>
        </Space>
      </>}
    </Space>
  </>
}

FinalReviewStep.propTypes = {
  job: PropTypes.any.isRequired,
  showsFooter: PropTypes.bool,
  showsSignDoc: PropTypes.bool,
};

FinalReviewStep.defaultProps = {
  showsFooter: true,
  showsSignDoc: true,
};

export default FinalReviewStep;