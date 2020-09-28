import { Form } from 'antd';
import React from 'react';
import { generateJob } from 'services/jobService';
import JobGenerator from './JobGenerator';
import StepWizard from 'react-step-wizard';
import FieldsEditor from './FieldsEditor';

const JobFormWizard = props => {
  const { value } = props;

  const [, setLoading] = React.useState(false);
  const [job, setJob] = React.useState(value);
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

  return <Form>
    <StepWizard
      ref={wizardRef}
    >
      <JobGenerator onChange={handleSelectedTemplate} />
      <FieldsEditor job={job} onChange={handleFieldsChange} />
      <div>2</div>
    </StepWizard>
  </Form>
}
export default JobFormWizard;