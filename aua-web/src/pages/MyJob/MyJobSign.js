import { Alert, Layout, Space, Tabs, Typography } from 'antd';
import HomeHeader from 'components/HomeHeader';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { getJob } from 'services/jobService';
import styled from 'styled-components';
import MyJobForm from './MyJobForm';
import MyJobReadView from './MyJobReadView';
import SignDocEditor from './SignDocEditor';

const { Title } = Typography;


const ContainerStyled = styled.div`
  margin: 6rem auto 2rem auto;
  padding: 0 1rem;
  width: 100%;
  max-width: 600px;
`;

const StyledTitleRow = styled.div`
 display: flex;
 justify-content: space-between;
 align-items: center;
 width: 100%;
`

const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;

  .job-count .ant-badge-count {
    background-color: #143e86;
    color: #eeeeee;
    // box-shadow: 0 0 0 1px #143e86 inset;
  }
`;

const MyJobSign = (props) => {
  const { value } = props;

  const [loading, setLoading] = React.useState(false);
  const [job, setJob] = React.useState(value);

  const goToJobList = () => {
    props.history.push(`/job`);
  }

  const loadEntity = async () => {
    const updatedJob = await getJob(job.id);
    setJob(updatedJob);
  }

  const { status } = job || {};
  const defaultActiveKey = status && status === 'to_sign' ? 'sign' : 'view';

  return (
    <Space size="large" direction="vertical" style={{ width: '100%' }}>
      <StyledTitleRow>
        <Title level={2} style={{ margin: 'auto' }}>Sign Job</Title>
      </StyledTitleRow>
      {status === 'signed' && <Alert
        message="The job has been signed."
        description="Please wait for the job to be completed by us."
        type="success"
        showIcon
      />}
      {status === 'to_sign' && <Alert
        message="The job requires signature."
        description="All below documents have been viewed and the job is ready to e-sign."
        type="warning"
        showIcon
      />}
      {!loading && <Tabs defaultActiveKey={defaultActiveKey}>
        <Tabs.TabPane tab="Application" key="view">
          {/* <MyJobForm showsAll={status === 'complete'} value={job} onOk={() => goToJobList()} /> */}
          <MyJobReadView value={job} showsSignDoc={false}/>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Sign" key="sign">
          <SignDocEditor value={job} onOk={() => loadEntity()} />
        </Tabs.TabPane>
      </Tabs>}
      {/* <Button block type="link" onClick={() => props.history.goBack()}>Cancel</Button> */}
    </Space>
  );
};

MyJobSign.propTypes = {
  // id: PropTypes.string.isRequired
};

MyJobSign.defaultProps = {};

export default withRouter(MyJobSign);
