import { BellOutlined, MessageOutlined } from '@ant-design/icons';
import { Button, Divider, Skeleton, Alert, Space, Typography, Input, Form } from 'antd';
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

const GenDocFieldEditor = props => {
  const { doc, variableDic, onFinish, onBack, onSkip, isActive } = props;
  const { variables: docVariables, docTemplateName, docTemplateDescription } = doc;

  const handleSubmit = async values => {
    onFinish(values);
  };

  const handleBack = () => {
    onBack();
  }

  const handleSkipDoc = () => {
    onSkip();
  }

  const variableKvps = docVariables.filter(x => x.name !== 'now').map(x => ({
    ...x,
    value: variableDic[x.name]
  }));

  if (!isActive) {
    return null;
  }

  return <>
    <Space direction="vertical" style={{ width: '100%' }}>
      <Title level={4}>{docTemplateName}</Title>
      {docTemplateDescription && <Alert description={docTemplateDescription} type="warning" closable />}
      <Form
        layout="vertical"
        // labelCol={{ span: 8 }}
        // wrapperCol={{ span: 16 }}
        onFinish={handleSubmit}
        initialValues={variableKvps}
      >
        {variableKvps.map((x, i) => <Form.Item label={varNameToLabelName(x.name)} name={x.name} key={i} rules={[{ required: true, message: ' ' }]}>
          <Input allowClear />
        </Form.Item>)}
        <Divider />
        <Space style={{ width: '100%' }}>
          <Button onClick={handleBack}>Back</Button>
          <Button onClick={handleSkipDoc}>Skip</Button>
          <Button htmlType="submit" type="primary">Next</Button>
        </Space>
      </Form>
    </Space>
  </>
}

GenDocFieldEditor.propTypes = {
  doc: PropTypes.any.isRequired,
  variableDic: PropTypes.object.isRequired,
  disabled: PropTypes.bool.isRequired,
};

GenDocFieldEditor.defaultProps = {
  disabled: false,
  variableDic: {},
};

export default GenDocFieldEditor;