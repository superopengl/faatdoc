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

  const handleSelectedTemplate = async (values) => {
    setLoading(true);
    const { jobTemplateId, portfolioId } = values;
    const job = await generateJob(jobTemplateId, portfolioId);
    setJob(job);
    setLoading(false);
    wizardRef.current.nextStep();
  }

  const handleFieldsChange = job => {
    setJob(job);
    wizardRef.current.nextStep();
  }

  const handleStepCancel = () => {
    wizardRef.current.previousStep();

  }

  const handleDocTemplateChange = (usedVariables) => {
    setVariables(merge({}, variables, usedVariables));
    wizardRef.current.nextStep();
  }

  if (loading) {
    return <Skeleton active />
  }

  return <StepWizard
      ref={wizardRef}
    >
      <JobGenerator onChange={handleSelectedTemplate} />
      {job && <FieldsEditor job={job} onChange={handleFieldsChange} />}
      {job?.docTemplateIds.map((docTempId, i) => <AutoDocEditor
        key={i}
        docTemplateId={docTempId}
        variables={variables}
        onChange={handleDocTemplateChange}
        onCancel={handleStepCancel}
      />)}
      <div>2</div>
    </StepWizard>
}
export default JobFormWizard;