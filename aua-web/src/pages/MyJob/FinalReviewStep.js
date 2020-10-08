import { BellOutlined, MessageOutlined } from '@ant-design/icons';
import { Button, Divider, Skeleton, Alert, Space, Typography, Popover, Tooltip } from 'antd';
import { DateInput } from 'components/DateInput';
import { RangePickerInput } from 'components/RangePickerInput';
import JobChat from 'pages/AdminJob/JobChat';
import PropTypes from 'prop-types';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { generateJob, getJob, saveJob } from 'services/jobService';
import styled from 'styled-components';
import { varNameToLabelName } from 'util/varNameToLabelName';
import { FileUploader } from '../../components/FileUploader';
import JobGenerator from './JobGenerator';
import * as queryString from 'query-string';
import { Spin } from 'antd';
import { applyDocTemplate, pdfDocTemplate, getDocTemplate } from 'services/docTemplateService';
import MarkdownIt from 'markdown-it'
import MdEditor from 'react-markdown-editor-lite'
import 'react-markdown-editor-lite/lib/index.css';
import { saveAs } from 'file-saver';
import PDFViewer from 'mgr-pdf-viewer-react';
import PdfViewer from 'components/PdfViewer';
import StepWizard from 'react-step-wizard';
import FileLink from 'components/FileLink';
import { QuestionCircleTwoTone, StarFilled, StarTwoTone } from '@ant-design/icons';
import { BsFillInfoCircleFill } from 'react-icons/bs';

const { Paragraph, Title, Text } = Typography;

const mdParser = new MarkdownIt(/* Markdown-it options */);

const DocViewerContainer = styled.div`
  background-color: #333333;
  padding: 1rem;
  height: 300px;
  overflow-x: auto;
  overflow-y: auto;
`;

const DocViewerInner = styled.div`
  background-color: white;
  margin: auto;
  padding: 1rem;
`;

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
          const { docTemplateName, docTemplateDescription, fileId, fileName } = doc;
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