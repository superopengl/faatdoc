import { Form } from 'antd';
import React from 'react';
import { generateJob } from 'services/jobService';
import JobGenerator from './JobGenerator';
import StepWizard from 'react-step-wizard';
import FieldsEditor from './FieldsEditor';
import GenDocFieldEditor from './GenDocFieldEditor';
import { merge } from 'lodash';
import { Collapse, Button, Divider, Skeleton, Radio, Space, Typography } from 'antd';
import GenDocLinkViewer from './GenDocLinkViewer';
const { Panel } = Collapse;

const JobFormWizard = props => {
  const { value } = props;

  const [loading, setLoading] = React.useState(false);
  const [job, setJob] = React.useState(value);
  const [variableContextDic, setVariableContextDic] = React.useState({});
  const wizardRef = React.useRef(null);

  const handleJobGenerated = async (values) => {
    setLoading(true);
    const { jobTemplateId, portfolioId } = values;
    const job = await generateJob(jobTemplateId, portfolioId);
    setJob(job);
    setLoading(false);
  }

  const handleJobFieldsChange = job => {
    const variables = job.fields.reduce((pre, cur) => {
      pre[cur.name] = cur.value;
      return pre;
    }, {});
    setJob(job);
    setVariableContextDic(variables);
    wizardRef.current.nextStep();
  }

  const handleVariablesChange = variables => {
    setVariableContextDic(variables);
  }

  const handleStepBack = () => {
    wizardRef.current.previousStep();

  }

  const handleSkip = () => {
    handleNext();
  }

  const handleNext = () => {
    wizardRef.current.nextStep();
  }

  const handleGenDocFieldChange = values => {
    setVariableContextDic({
      ...variableContextDic,
      ...values,
    });
    handleNext();
  }

  const handleGenDocViewConfirmed = doc => {
    job.genDocs = job.genDocs.map(d => d.docTemplateId === doc.docTemplateId ? doc : d);
    setJob({ ...job });
    handleNext();
  }

  if (loading) {
    return <Skeleton active />
  }

  if (!job) {
    return <JobGenerator onChange={handleJobGenerated} />
  }

  const genDocSteps = [];
  job.genDocs.forEach((doc) => {
    if (doc.variables.length) {
      genDocSteps.push(<GenDocFieldEditor doc={doc} onSkip={handleSkip} onBack={handleStepBack} onFinish={handleGenDocFieldChange} />);
    }
    genDocSteps.push(<GenDocLinkViewer doc={doc} onSkip={handleSkip} onBack={handleStepBack} onFinish={handleGenDocViewConfirmed} />);
  });

  return <StepWizard ref={wizardRef} >
    <FieldsEditor job={job} onChange={handleJobFieldsChange} />
    {genDocSteps}
  </StepWizard>


}
export default JobFormWizard;