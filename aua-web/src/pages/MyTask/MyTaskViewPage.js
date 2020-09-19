import { Alert, Button, Layout, Space, Tabs, Typography } from 'antd';
import HomeHeader from 'components/HomeHeader';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { getTask } from 'services/taskService';
import styled from 'styled-components';
import TaskForm from './MyTaskForm';
import ReviewSignPage from './ReviewSignPage';

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

  .task-count .ant-badge-count {
    background-color: #143e86;
    color: #eeeeee;
    // box-shadow: 0 0 0 1px #143e86 inset;
  }
`;

const MyTaskViewPage = (props) => {
  const { id } = props.match.params;

  const [loading, setLoading] = React.useState(true);
  const [task, setTask] = React.useState({});

  const loadEntity = async () => {
    setLoading(true);
    const entity = await getTask(id);
    setTask(entity);
    setLoading(false);
  }

  React.useEffect(() => {
    loadEntity();
  }, [])

  const goToTaskList = () => {
    props.history.push(`/task`);
  }

  const { status } = task || {};
  const defaultActiveKey = status && status === 'to_sign' ? 'sign' : 'view';

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <Space size="large" direction="vertical" style={{ width: '100%' }}>
          <StyledTitleRow>
            <Title level={2} style={{ margin: 'auto' }}>Review Task</Title>
          </StyledTitleRow>
          {status === 'signed' && <Alert
            message="The task has been signed."
            description="Please wait for the task to be completed by us."
            type="success"
            showIcon
          />}
          {status === 'to_sign' && <Alert
            message="The task requires signature."
            description="All below documents have been viewed and the task is ready to e-sign."
            type="warning"
            showIcon
          />}
          {!loading && <Tabs defaultActiveKey={defaultActiveKey}>
            <Tabs.TabPane tab="Application" key="view">
              <TaskForm showsAll={status === 'complete'} id={id} onFinish={() => goToTaskList()} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Sign" key="sign">
              <ReviewSignPage id={id} onFinish={() => goToTaskList()} />
            </Tabs.TabPane>
          </Tabs>}
          {/* <Button block type="link" onClick={() => props.history.goBack()}>Cancel</Button> */}
        </Space>
      </ContainerStyled>
    </LayoutStyled >
  );
};

MyTaskViewPage.propTypes = {
  // id: PropTypes.string.isRequired
};

MyTaskViewPage.defaultProps = {};

export default withRouter(MyTaskViewPage);
