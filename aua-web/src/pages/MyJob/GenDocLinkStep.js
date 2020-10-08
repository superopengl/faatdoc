import { Button, Divider, Alert, Space, Typography, Spin } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { pdfDocTemplate } from 'services/docTemplateService';
import MarkdownIt from 'markdown-it'
import 'react-markdown-editor-lite/lib/index.css';
import { computeVariablesHash } from 'util/computeVariableHash';
import FileLink from 'components/FileLink';
import StepButtonSet from './StepBottonSet';


const { Title, Paragraph } = Typography;


const GenDocLinkStep = props => {
  const { doc, variableDic, onFinish, onBack, onSkip, isActive } = props;
  const [loading, setLoading] = React.useState(isActive);
  const [pdfData, setPdfData] = React.useState({
    id: doc.fileId,
    name: doc.fileName,
  });

  const { docTemplateId, docTemplateName, docTemplateDescription } = doc;

  const computeDocVarHash = (doc) => {
    const variables = doc.variables.filter(x => x.name !== 'now').reduce((pre, cur) => {
      pre[cur.name] = cur.value;
      return pre;
    }, {});
    const varHash = computeVariablesHash(variables);
    return varHash;
  }

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
      fileName: pdfData.fileName,
      varHash: computeDocVarHash(doc),
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
      {docTemplateDescription && <Paragraph type="secondary">{docTemplateDescription}</Paragraph>}
      <FileLink placeholder={`${docTemplateName}.pdf`} id={pdfData.id} name={pdfData.fileName} location={pdfData.location} />
      <Divider />
      <StepButtonSet onBack={onBack} loading={loading}/>
    </Space>
  </>
}

GenDocLinkStep.propTypes = {
  doc: PropTypes.any.isRequired,
  variableDic: PropTypes.object.isRequired,
  disabled: PropTypes.bool.isRequired,
};

GenDocLinkStep.defaultProps = {
  disabled: false,
  variableDic: {},
};

export default GenDocLinkStep;