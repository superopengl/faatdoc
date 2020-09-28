import { BellOutlined, MessageOutlined } from '@ant-design/icons';
import { Button, Divider, Input, Radio, Space, Typography } from 'antd';
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
import { applyDocTemplate , pdfDocTemplate} from 'services/docTemplateService';
import MarkdownIt from 'markdown-it'
import MdEditor from 'react-markdown-editor-lite'
import 'react-markdown-editor-lite/lib/index.css';
import { saveAs } from 'file-saver';

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
  const [content, setContent] = React.useState();
  const [usedVariables, setUsedVariables] = React.useState({});

  const downloadPdf = async () => {
    const data = await pdfDocTemplate(docTemplateId, variables);
    // console.log(data);
    const file = new Blob([data], { type: 'application/pdf' });
    const fileURL = URL.createObjectURL(file);
//Open the URL on new Window
    window.open(fileURL);
    // saveAs(blob);

  }
  const loadEntity = async () => {
    setLoading(true);
    const { content, usedVariables } = await applyDocTemplate(docTemplateId, variables);
    await downloadPdf();
    setContent(content);
    setUsedVariables(usedVariables);
    setLoading(false);
  };


  React.useEffect(() => {
    loadEntity();
  }, []);

  const handleConfirmAndSign = async () => {
    onChange(usedVariables);
  }

  if (loading) {
    return <Spin />
  }

  const config = {
    view: {
      menu: false, 
      md: false, 
      html: true, 
    },
    canView: {
      menu: false, 
      md: false, 
      html: true, 
      fullScreen: true,
      hideMenu: false,
    }
  };

  return <Space direction="vertical" style={{ width: '100%' }}>
    <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
      <Button type="link" onClick={onCancel}>Cancel</Button>
      <Button type="primary" onClick={handleConfirmAndSign}>Confirm and Sign</Button>
    </Space>
    <Divider />
    <DocViewerContainer>
      {/* <DocViewerInner dangerouslySetInnerHTML={{__html:md.render(content)}}></DocViewerInner> */}
      <MdEditor
        value={content}
        renderHTML={(text) => mdParser.render(text)}
        readonly={true}
        config={config}
      />
    </DocViewerContainer>
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