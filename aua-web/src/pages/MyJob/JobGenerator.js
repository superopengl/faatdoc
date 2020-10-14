
import React from 'react';
import styled from 'styled-components';
import { Button, Form, Radio, Space, Steps, Typography } from 'antd';
import { DoubleRightOutlined } from '@ant-design/icons';
import { PortfolioAvatar } from 'components/PortfolioAvatar';
import { Spin } from 'antd';
import { listJobTemplate } from 'services/jobTemplateService';
import { listPortfolio } from 'services/portfolioService';
import StepWizard from 'react-step-wizard';
import { GlobalContext } from 'contexts/GlobalContext';

const { Title, Text, Paragraph } = Typography;

const Container = styled.div`
.ant-radio-button-wrapper:not(:first-child)::before {
  display: none;
}

.ant-radio-button-wrapper {
  border-width: 1px;
  display: block;
  margin-bottom: 1rem;
  border-radius: 6px;

  &.portfolio {
    height: 60px;
    padding-top: 10px;
  }
}
`;

const StyledTitleRow = styled.div`
 display: flex;
 justify-content: space-between;
 align-items: center;
 width: 100%;
`

const JobGenerator = props => {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [jobTemplateList, setJobTemplateList] = React.useState([]);
  const [portfolioList, setPortfolioList] = React.useState([]);
  const [jobTemplateId, setJobTemplateId] = React.useState();
  const wizardRef = React.useRef(null);

  const loadData = async () => {
    setLoading(true);
    const jobTemplateList = await listJobTemplate() || [];
    const portfolioList = await listPortfolio() || [];

    setJobTemplateList(jobTemplateList);
    setPortfolioList(portfolioList);
    setLoading(false);
  }

  React.useEffect(() => {
    loadData();
  }, []);

  const handleJobTypeChange = e => {
    wizardRef.current.nextStep();
    setJobTemplateId(e.target.value);
  }

  const handlePortfolioChange = e => {
    const data = {
      jobTemplateId,
      portfolioId: e.target.value
    };
    props.onChange(data);
  }

  if (loading) {
    return <Spin />
  }

  return (
    <Container>
      <StyledTitleRow>
        <Title level={2} style={{ margin: 'auto' }}>Jobs</Title>
      </StyledTitleRow>
      {/* <Steps progressDot current={currentStep}>
        <Steps.Step title="Choose job type" />
        <Steps.Step title="Choose portfolio" />
      </Steps> */}
      <StepWizard ref={wizardRef}>
        <div>
          <Space size="middle" direction="vertical" style={{ width: '100%' }}>
            <Text type="secondary">Choose job type</Text>
            <Radio.Group buttonStyle="outline" style={{ width: '100%' }} onChange={handleJobTypeChange}>
              {jobTemplateList.map((item, i) => <Radio.Button key={i} value={item.id}>{item.name}</Radio.Button>)}
            </Radio.Group>
          </Space>
        </div>
        <div>
          <Space size="middle" direction="vertical" style={{ width: '100%' }}>
            <Text type="secondary">Choose portfolio to fill the job automatically</Text>
            <Radio.Group buttonStyle="outline" style={{ width: '100%' }} onChange={handlePortfolioChange}>
              {portfolioList.map((item, i) => <Radio.Button className="portfolio" key={i} value={item.id}>
                <Space>
                  <PortfolioAvatar value={item.name} size={40} />
                  <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                    <div>{item.name}</div>
                    {item.email && <Text type="secondary"><small>{item.email}</small></Text>}
                  </div>
                </Space>
              </Radio.Button>)}
            </Radio.Group>
          </Space>

        </div>
      </StepWizard>
    </Container>
  );
};

export default JobGenerator;