import { Form } from 'antd';
import React from 'react';
import { generateJob } from 'services/jobService';
import JobGenerator from './JobGenerator';
import StepWizard from 'react-step-wizard';
import FieldsEditor from './FieldsEditor';
import AutoDocEditor from './AutoDocEditor';
import { merge } from 'lodash';
import { Button, Divider, Skeleton, Radio, Space, Typography } from 'antd';

const JobFormWizard = props => {
  const { value } = props;

  const [loading, setLoading] = React.useState(false);
  const [job, setJob] = React.useState(value);
  const [variables, setVariables] = React.useState({});
  const wizardRef = React.useRef(null);

  const handleJobGenerated = async (values) => {
    setLoading(true);
    const { jobTemplateId, portfolioId } = values;
    const job = await generateJob(jobTemplateId, portfolioId);
    setJob(job);
    setLoading(false);
    wizardRef.current.nextStep();
  }

  const handleFieldsChange = job => {
    const variables = job.fields.map(f => ({name: f.name, value: f.value}));
    setJob(job);
    setVariables(variables);
    wizardRef.current.nextStep();
  }

  const handleVariablesChange = variables => {
    setVariables(variables);
  }

  const handleStepCancel = () => {
    wizardRef.current.previousStep();

  }

  const handleDocFinish = (signDoc, usedVariables) => {
    setVariables(merge({}, variables, usedVariables));
    job.signDocs = [...job.signDocs, signDoc];
    wizardRef.current.nextStep();
  }

  if (loading) {
    return <Skeleton active />
  }

  return <StepWizard
    ref={wizardRef}
  >
    {!job && <JobGenerator onChange={handleJobGenerated} />}
    {job && <>
      <FieldsEditor job={job} onChange={handleFieldsChange} />
      {job.docTemplateIds.map((docTempId, i) => <AutoDocEditor
        key={i}
        docTemplateId={docTempId}
        variables={variables}
        onVariablesChange={handleVariablesChange}
        onFinish={handleDocFinish}
        onCancel={handleStepCancel}
      />)}
    </>}
  </StepWizard>
}
export default JobFormWizard;