import { Form } from 'antd';
import React from 'react';
import { generateJob, saveJob } from 'services/jobService';
import JobGenerator from './JobGenerator';
import StepWizard from 'react-step-wizard';
import JobFieldsEditor from './JobFieldsEditor';
import GenDocFieldStep from './GenDocFieldStep';
import { merge } from 'lodash';
import { Collapse, Spin, Affix, Button, Progress, Space, Typography } from 'antd';
import GenDocLinkStep from './GenDocLinkStep';
import UploadDocStep from './UploadDocStep';
import FinalReviewStep from './FinalReviewStep';
import { withRouter } from 'react-router-dom';
import { getPortfolio } from 'services/portfolioService';
import * as queryString from 'query-string';
import JobChat from 'pages/AdminJob/JobChat';
import styled from 'styled-components';
import { BellOutlined, MessageOutlined } from '@ant-design/icons';
import JobNameStep from './JobNameStep';
const { Panel } = Collapse;

const { Text } = Typography;

const AffixContactButton = styled(Button)`
width: 60px;
height: 60px;
display: flex;
align-items: center;
justify-content: center;
border: none;
background-color: rgba(255,77,79, 0.8);
color: white;
// box-shadow: 1px 1px 5px #222222;
border: 2px solid white;

&:focus,&:hover,&:active {
color: white;
background-color: rgba(20, 62, 134, 0.8);
border: 2px solid white;
}
`;

const JobFormWizard = props => {
  const { value } = props;
  const { chat } = queryString.parse(props.location.search);

  const [loading, setLoading] = React.useState(false);
  const [job, setJob] = React.useState(value);
  const [variableContextDic, setVariableContextDic] = React.useState({});
  const [chatVisible, setChatVisible] = React.useState(Boolean(chat));
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

  const handleUpdateJobName = name => {
    job.name = name;
    setJob({ ...job });
    handleNext();
  }

  const getGenDocSteps = () => {
    const steps = [];
    if (job?.genDocs) {
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
    }
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
    {!!job?.id && <>
      <JobChat visible={chatVisible} onClose={() => setChatVisible(false)} jobId={job.id} />
      <Affix style={{ position: 'fixed', bottom: 30, right: 30 }}>
        <AffixContactButton type="primary" shape="circle" size="large"
          onClick={() => setChatVisible(true)}
          style={{ fontSize: 24 }}
        >
          <MessageOutlined />
        </AffixContactButton>
      </Affix>
    </>}
  </Spin>


}
export default withRouter(JobFormWizard);