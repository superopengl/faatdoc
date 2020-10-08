import { Form } from 'antd';
import React from 'react';
import { generateJob, saveJob } from 'services/jobService';
import JobGenerator from './JobGenerator';
import StepWizard from 'react-step-wizard';
import FieldsEditor from './FieldsEditor';
import GenDocFieldStep from './GenDocFieldStep';
import { merge } from 'lodash';
import { Collapse, Spin, Divider, Skeleton, Radio, Space, Typography } from 'antd';
import GenDocLinkStep from './GenDocLinkStep';
import UploadDocStep from './UploadDocStep';
import FinalReviewStep from './FinalReviewStep';
import { withRouter } from 'react-router-dom';
import { getPortfolio } from 'services/portfolioService';
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
    const portfolio = await getPortfolio(portfolioId);

    setJob(job);
    setVariableContextDic(portfolio.fields.reduce((pre, cur) => {
      pre[cur.name] = cur.value
      return pre;
    }, {}));
    setLoading(false);
  }

  const handleJobFieldsChange = job => {
    const variables = job.fields.reduce((pre, cur) => {
      pre[cur.name] = cur.value;
      return pre;
    }, {});
    setJob(job);
    setVariableContextDic({
      ...variableContextDic, 
      ...variables
    });
    wizardRef.current.nextStep();
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

  const handleUploadDocsChange = fileIds => {
    job.uploadDocs = fileIds;
    setJob({ ...job });
    handleNext();
  }

  const goToJobList = () => {
    props.history.push(`/job`);
  }

  const handlePostSubmit = async () => {
    setLoading(true);
    try {
      await saveJob({ ...job, status: 'todo' });
      // form.resetFields();
      setLoading(false);
      goToJobList();
    } catch {
      setLoading(false);
    }
  }

  const getGenDocSteps = () => {
    const steps = [];
    job.genDocs.forEach((doc, i) => {
      if (doc.variables.length) {
        steps.push(<GenDocFieldStep key={`field_${i}`}
          doc={doc}
          variableDic={variableContextDic}
          onSkip={handleSkip}
          onBack={handleStepBack}
          onFinish={handleGenDocFieldChange}
        />);
      }
      steps.push(<GenDocLinkStep key={`doc_${i}`}
        doc={doc}
        variableDic={variableContextDic}
        onSkip={handleSkip}
        onBack={handleStepBack}
        onFinish={handleGenDocViewConfirmed}
      />);
    });
    return steps;
  }

  console.log('wizard var dic', variableContextDic);

  if (!job) {
    return <JobGenerator onChange={handleJobGenerated} />
  }

  return <Spin spinning={loading}>
    <StepWizard ref={wizardRef} >
      {/* <JobGenerator onChange={handleJobGenerated} /> */}
      <FieldsEditor job={job} onChange={handleJobFieldsChange} />
      {getGenDocSteps()}
      <UploadDocStep
        job={job}
        onSkip={handleSkip}
        onBack={handleStepBack}
        onFinish={handleUploadDocsChange}
      />
      <FinalReviewStep
        job={job}
        onBack={handleStepBack}
        onFinish={handlePostSubmit}
      />
    </StepWizard>
  </Spin>


}
export default withRouter(JobFormWizard);