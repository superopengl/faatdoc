import { BellOutlined, MessageOutlined } from '@ant-design/icons';
import { Button, Divider, Skeleton, Radio, Space, Typography } from 'antd';
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
import { applyDocTemplate, pdfDocTemplate } from 'services/docTemplateService';
import MarkdownIt from 'markdown-it'
import MdEditor from 'react-markdown-editor-lite'
import 'react-markdown-editor-lite/lib/index.css';
import { saveAs } from 'file-saver';
import PDFViewer from 'mgr-pdf-viewer-react';
import { Alert } from 'antd';
import PdfViewer from 'components/PdfViewer';

const { Paragraph } = Typography;

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
  const { docTemplateId, variables, onChange, onCancel } = props;
  const [loading, setLoading] = React.useState(true);
  const [usedVariables, setUsedVariables] = React.useState({});
  const [file, setFile] = React.useState();
  const [name, setName] = React.useState();
  const [fileUrl, setFileUrl] = React.useState();
  const [description, setDescription] = React.useState();

  const downloadPdf = async () => {
    const data = await pdfDocTemplate(docTemplateId, variables);
    const fileUrl = URL.createObjectURL(data);
    setFileUrl(fileUrl);
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
    const { name, description, usedVariables } = await applyDocTemplate(docTemplateId, variables);
    await downloadPdf();
    setName(name);
    setUsedVariables(usedVariables);
    setDescription(description);
    setLoading(false);
  };


  React.useEffect(() => {
    loadEntity();
  }, []);

  const handleConfirmAndSign = async () => {
    onChange(usedVariables);
  }

  if (loading) {
    return <Skeleton active />
  }

  return <Space direction="vertical" style={{ width: '100%' }}>
    <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
      <Button type="link" onClick={onCancel}>Cancel</Button>
      <Button type="primary" onClick={handleConfirmAndSign}>Confirm and Sign</Button>
    </Space>
    <Button type="link" href={fileUrl} target="_blank">{name}.pdf</Button>
    <Alert message="Notes" description={description} type="warning" showIcon closable />
    <Divider />

    {/* {file && <PdfViewer file={file} width={500}/>} */}
    {/* {file && <PdfViewer data={file} width={500} />} */}
  </Space>
}

AutoDocEditor.propTypes = {
  docTemplateId: PropTypes.string.isRequired,
  variables: PropTypes.object.isRequired,
  disabled: PropTypes.bool.isRequired,
};

AutoDocEditor.defaultProps = {
  disabled: false
};

export default AutoDocEditor;