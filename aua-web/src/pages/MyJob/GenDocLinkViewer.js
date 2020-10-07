import { Button, Divider, Alert, Space, Typography, Spin } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { pdfDocTemplate } from 'services/docTemplateService';
import MarkdownIt from 'markdown-it'
import 'react-markdown-editor-lite/lib/index.css';
import { computeVariablesHash } from 'util/computeVariableHash';
import FileLink from 'components/FileLink';


const { Title } = Typography;


const GenDocLinkViewer = props => {
  const { doc, variableDic, onFinish, onBack, onSkip, isActive } = props;
  const [loading, setLoading] = React.useState(isActive);
  const [pdfData, setPdfData] = React.useState({
    id: doc.fileId,
    name: doc.fileName,
  });

  const { docTemplateId, docTemplateName, docTemplateDescription } = doc;


  const loadEntity = async () => {
    setLoading(true);
    const variables = doc.variables.map(x => x.name).filter(x => x !== 'now').reduce((pre, cur) => {
      pre[cur] = variableDic[cur];
      return pre;
    }, {});
    const varHash = computeVariablesHash(variables);

    if (doc.varHash !== varHash) {
      const pdfData = await pdfDocTemplate(docTemplateId, variables);
      setPdfData(pdfData);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    if (isActive) {
      loadEntity();
    }
  }, [isActive]);

  const handleBack = () => {
    onBack();
  }

  const handleNext = () => {
    const genDoc = {
      ...doc,
      fileId: pdfData.id,
      fileName: pdfData.name,
      signedAt: new Date(),
    }
    onFinish(genDoc);
  }

  const handleSkipDoc = () => {
    onSkip();
  }

  if (!isActive) {
    return null;
  }

  return <>
    <Space direction="vertical" style={{ width: '100%' }}>
      <Title level={4}>{docTemplateName}</Title>
      {docTemplateDescription && <Alert description={docTemplateDescription} type="warning" closable />}
      {pdfData.name ? <FileLink id={pdfData.id} name={pdfData.name} location={pdfData.location} /> : <Spin>Generating doc</Spin>}
      <Divider />
      <Space style={{ width: '100%' }}>
        <Button block onClick={handleBack}>Back</Button>
        <Button block onClick={handleSkipDoc} disabled={loading}>Skip</Button>
        <Button block type="primary" onClick={handleNext} disabled={loading || !pdfData}>Next</Button>
      </Space>
    </Space>
  </>
}

GenDocLinkViewer.propTypes = {
  doc: PropTypes.any.isRequired,
  variableDic: PropTypes.object.isRequired,
  disabled: PropTypes.bool.isRequired,
};

GenDocLinkViewer.defaultProps = {
  disabled: false,
  variableDic: {},
};

export default GenDocLinkViewer;