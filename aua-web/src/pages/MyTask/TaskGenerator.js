
import React from 'react';
import styled from 'styled-components';
import { Radio, Space, Typography } from 'antd';
import { PortfolioAvatar } from 'components/PortfolioAvatar';
import { Spin } from 'antd';
import { listTaskTemplate } from 'services/taskTemplateService';
import { listPortfolio } from 'services/portfolioService';
import StepWizard from 'react-step-wizard';

const { Title, Text } = Typography;

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

const TaskGenerator = props => {
  const [] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [taskTemplateList, setTaskTemplateList] = React.useState([]);
  const [portfolioList, setPortfolioList] = React.useState([]);
  const [taskTemplateId, setTaskTemplateId] = React.useState();
  const wizardRef = React.useRef(null);

  const loadData = async () => {
    setLoading(true);
    const taskTemplateList = await listTaskTemplate() || [];
    const portfolioList = await listPortfolio() || [];

    setTaskTemplateList(taskTemplateList);
    setPortfolioList(portfolioList);
    setLoading(false);
  }

  React.useEffect(() => {
    loadData();
  }, []);

  const handleTaskTypeChange = e => {
    wizardRef.current.nextStep();
    setTaskTemplateId(e.target.value);
  }

  const handlePortfolioChange = e => {
    const data = {
      taskTemplateId,
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
        <Title level={2} style={{ margin: 'auto' }}>Tasks</Title>
      </StyledTitleRow>
      {/* <Steps progressDot current={currentStep}>
        <Steps.Step title="Choose task type" />
        <Steps.Step title="Choose portfolio" />
      </Steps> */}
      <StepWizard ref={wizardRef}>
        <div>
          <Space size="middle" direction="vertical" style={{ width: '100%' }}>
            <Text type="secondary">Choose task type</Text>
            <Radio.Group buttonStyle="outline" style={{ width: '100%' }} onChange={handleTaskTypeChange}>
              {taskTemplateList.map((item, i) => <Radio.Button key={i} value={item.id}>{item.name}</Radio.Button>)}
            </Radio.Group>
          </Space>
        </div>
        <div>
          <Space size="middle" direction="vertical" style={{ width: '100%' }}>
            <Text type="secondary">Choose portfolio to fill the task automatically</Text>
            <Radio.Group buttonStyle="outline" style={{ width: '100%' }} onChange={handlePortfolioChange}>
              {portfolioList.map((item, i) => <Radio.Button className="portfolio" key={i} value={item.id}>
                <Space>
                  <PortfolioAvatar value={item.name} id={item.portfolioId} size={40} />
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

export default TaskGenerator;