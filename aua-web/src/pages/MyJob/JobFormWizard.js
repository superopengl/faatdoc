import React from 'react';
import { generateJob, saveJob } from 'services/jobService';
import JobGenerator from './JobGenerator';
import StepWizard from 'react-step-wizard';
import JobFieldsEditor from './JobFieldsEditor';
import GenDocFieldStep from './GenDocFieldStep';
import { Collapse, Spin, Progress, Space, Typography } from 'antd';
import GenDocLinkStep from './GenDocLinkStep';
import UploadDocStep from './UploadDocStep';
import FinalReviewStep from './FinalReviewStep';
import { withRouter } from 'react-router-dom';
import { getPortfolio } from 'services/portfolioService';
import JobNameStep from './JobNameStep';

const { Text } = Typography;

const JobFormWizard = props => {
  const { value } = props;

  const [loading, setLoading] = React.useState(false);
  const [job, setJob] = React.useState(value);
  const [variableContextDic, setVariableContextDic] = React.useState({});
  const [progess, setProgress] = React.useState({ current: 0, total: 0 });
  const wizardRef = React.useRef(null);
  const generatorRef = React.useRef(null);

  React.useEffect(() => {
    setProgress({
      current: wizardRef?.current?.currentStep || 0,
      total: wizardRef?.current?.totalSteps || 0
    })
  }, [wizardRef?.current?.currentStep, wizardRef?.current?.totalSteps])

  const handleStepChange = (info) => {
    setProgress({
      current: info.activeStep || 0,
      total: wizardRef.current.totalSteps
    });
  }

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
    job.docs = job.docs.map(d => d.docTemplateId === doc.docTemplateId ? doc : d);
    setJob({ ...job });
    handleNext();
  }

  const handleUploadDocsChange = docs => {
    job.docs = docs;
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

  const handleUpdateJobName = name => {
    job.name = name;
    setJob({ ...job });
    handleNext();
  }

  const getGenDocSteps = () => {
    const steps = [];
    const genDocs = job?.docs.filter(d => d.docTemplateId) || [];
    genDocs.forEach((doc, i) => {
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


  return <Spin spinning={loading}>
    <StepWizard ref={generatorRef} >
      {!job && <JobGenerator onChange={handleJobGenerated} />}
      {job && <><Space size="large" direction="vertical" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center', fontSize: '2rem' }}>
          <Text type="secondary">{progess.current} / {progess.total}</Text>
          <Progress strokeColor="#143e86" strokeLinecap="square" type="line" percent={progess.total ? 100 * progess.current / progess.total : 0} showInfo={false} />
        </div>
        <StepWizard ref={wizardRef} onStepChange={handleStepChange}>
          <JobNameStep
            job={job}
            onFinish={handleUpdateJobName}
          />
          <JobFieldsEditor job={job}
            onSkip={handleSkip}
            onBack={handleStepBack}
            onFinish={handleJobFieldsChange} />
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
      </Space></>}
    </StepWizard>
{/* <pre>{JSON.stringify(job, null, 2)}</pre> */}
  </Spin>


}
export default withRouter(JobFormWizard);