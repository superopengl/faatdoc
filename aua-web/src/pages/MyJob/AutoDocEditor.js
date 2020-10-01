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


const { Paragraph, Title } = Typography;

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

const AutoDocEditor = props => {
  const { docTemplateId, variables, onVariablesChange, onFinish, onCancel } = props;
  const wizardRef = React.useRef(null);
  const [loading, setLoading] = React.useState(true);
  const [docVariables, setDocVariables] = React.useState({});
  const [file, setFile] = React.useState();
  const [name, setName] = React.useState();
  const [fileUrl, setFileUrl] = React.useState();
  const [description, setDescription] = React.useState();
  const [pdfData, setPdfData] = React.useState();

  const downloadPdf = async () => {

    // const blob = new Blob([data], { type: 'application/pdf' });
    // const reader = new FileReader();
    // reader.readAsDataURL(data);
    // reader.onload = () => {
    //   const pureBase64 = reader.result.split(';base64,')[1];
    //   setFile(pureBase64);
    // }
  }

  const loadEntity = async () => {
    setLoading(true);
    const { name, description, variables: variableDefs } = await getDocTemplate(docTemplateId);
    // await downloadPdf();
    setName(name);
    setDocVariables(variableDefs.filter(x => x !== 'now').map(name => ({ name, value: variables[name] })));
    setDescription(description);
    setLoading(false);
  };

  const handleVariableDone = async values => {
    const newVariables = {
      ...variables,
      ...values
    };
    onVariablesChange(newVariables);
    wizardRef.current.nextStep();
    const pdfData = await pdfDocTemplate(docTemplateId, newVariables);
    setPdfData(pdfData);
  }


  React.useEffect(() => {
    loadEntity();
  }, []);

  const handleBackToVariables = () => {
    wizardRef.current.previousStep();
  }

  const handleFinish = () => {
    onFinish(pdfData.id);
  }

  if (loading) {
    return <Skeleton active />
  }

  return <>
    <Space direction="vertical" style={{ width: '100%' }}>
      <Title level={4}>{name}</Title>
      <Alert message="Notes" description={description} type="warning" showIcon closable />
      <StepWizard ref={wizardRef}>
        <div>
          <Form
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            onFinish={handleVariableDone}
          >
            {docVariables.map((x, i) => <Form.Item label={varNameToLabelName(x.name)} name={x.name} key={i} rules={[{ required: true, message: ' ' }]}>
              <Input />
            </Form.Item>)}
            <Form.Item wrapperCol={{ offset: 0, span: 24 }}>
              <Button block type="primary" htmlType="submit">Next</Button>
            </Form.Item>
          </Form>
        </div>
        <div>
          <Space direction="vertical" style={{width: '100%'}}>
            {!pdfData ? <Spin style={{margin: 'auto'}} /> : <>
              <Button type="link" href={pdfData.location} target="_blank">{pdfData.name}</Button>
              <Button block onClick={handleBackToVariables}>Back</Button>
              <Button block type="primary" onClick={handleFinish}>Next</Button>
            </>}
          </Space>
        </div>
      </StepWizard>
    </Space>
  </>
}

AutoDocEditor.propTypes = {
  docTemplateId: PropTypes.string.isRequired,
  variables: PropTypes.object.isRequired,
  disabled: PropTypes.bool.isRequired,
};

AutoDocEditor.defaultProps = {
  disabled: false,
  variables: {},
};

export default AutoDocEditor;