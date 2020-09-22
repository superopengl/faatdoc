
import React from 'react';
import styled from 'styled-components';
import { Button, Form, Radio, Space, Steps, Typography } from 'antd';
import { DoubleRightOutlined } from '@ant-design/icons';
import { PortofolioAvatar } from 'components/PortofolioAvatar';
import { Spin } from 'antd';
import { listJobTemplate } from 'services/jobTemplateService';
import { listPortofolio } from 'services/portofolioService';

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

  &.portofolio {
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
  const [portofolioList, setPortofolioList] = React.useState([]);
  const [jobTemplateId, setJobTemplateId] = React.useState();

  const loadData = async () => {
    setLoading(true);
    const jobTemplateList = await listJobTemplate() || [];
    const portofolioList = await listPortofolio() || [];

    setJobTemplateList(jobTemplateList);
    setPortofolioList(portofolioList);
    setLoading(false);
  }

  React.useEffect(() => {
    loadData();
  }, []);

  const handleChange = (values) => {
    props.onChange(values);
  }

  const handleJobTypeChange = e => {
    setCurrentStep(1);
    setJobTemplateId(e.target.value);
  }

  const handlePortofolioChange = e => {
    const data = {
      jobTemplateId,
      portofolioId: e.target.value
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
        <Steps.Step title="Choose portofolio" />
      </Steps> */}
      <Space size="middle" direction="vertical" style={{width:'100%'}}>
      {currentStep === 0 && <>
      <Text type="secondary">Choose job type</Text>
        <Radio.Group buttonStyle="outline" style={{ width: '100%' }} onChange={handleJobTypeChange}>
          {jobTemplateList.map((item, i) => <Radio.Button key={i} value={item.id}>{item.name}</Radio.Button>)}
        </Radio.Group>
      </>}
      {currentStep === 1 && <>
        <Text type="secondary">Choose portofolio to fill the job automatically</Text>
        <Radio.Group buttonStyle="outline" style={{ width: '100%' }} onChange={handlePortofolioChange}>
          {portofolioList.map((item, i) => <Radio.Button className="portofolio" key={i} value={item.id}>
            <Space>
              <PortofolioAvatar value={item.name} size={40} />
              {item.name}
            </Space>
          </Radio.Button>)}
        </Radio.Group>
      </>}
      </Space>

    </Container>
  );
};

export default JobGenerator;