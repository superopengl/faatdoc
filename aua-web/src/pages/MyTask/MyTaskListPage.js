import { Badge, Button, Layout, Modal, Space, Tabs, Typography } from 'antd';
import HomeHeader from 'components/HomeHeader';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { listTask } from 'services/taskService';
import { listPortofolio } from 'services/portofolioService';
import { PlusOutlined, SyncOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import MyTaskList from './MyTaskList';

const { Title } = Typography;
const { TabPane } = Tabs;


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


const MyTaskListPage = (props) => {

  const [, setLoading] = React.useState(true);
  const [taskList, setTaskList] = React.useState([]);
  const [portofolioList, setPortofolioList] = React.useState([]);


  const loadList = async () => {
    setLoading(true);
    const portofolioList = await listPortofolio() || [];

    const list = await listTask();

    setTaskList(list);
    setPortofolioList(portofolioList);
    setLoading(false);
  }


  React.useEffect(() => {
    loadList();
  }, [])

  const goToEditTask = (id) => {
    props.history.push(`/task/${id || 'new'}`);
  }


  const createNewTask = () => {
    if (!portofolioList.length) {
      Modal.confirm({
        title: 'No portofolio',
        content: 'Please create portofolio before creating task. Go to create protofolio now?',
        okText: 'Yes, go to create portofolio',
        onOk: () => props.history.push('/portofolio')
      });
      return;
    }
    goToEditTask();
  }




  const RenderListFilteredByStatus = (statuses = []) => {
    const data = taskList.filter(x => statuses.includes(x.status));

    return <MyTaskList data={data} />
  }

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <Space size="large" direction="vertical" style={{ width: '100%' }}>
          <StyledTitleRow>
            <Title level={2} style={{ margin: 'auto' }}>Tasks</Title>
          </StyledTitleRow>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }} >
            {/* <Button type="link" onClick={() => loadList()} icon={<SyncOutlined />}></Button> */}
            <Button type="primary" icon={<PlusOutlined />} onClick={() => createNewTask()}>New Task</Button>
          </Space>

          <Tabs defaultActiveKey="todo" type="card" tabBarExtraContent={{ right: <Button type="link" onClick={() => loadList()} icon={<SyncOutlined />}></Button> }}>
            <TabPane tab={"To Do"} key="todo">
              {RenderListFilteredByStatus(['todo'])}
            </TabPane>
            <TabPane tab={<>To Sign <Badge count={taskList.filter(x => ['to_sign'].includes(x.status)).length} showZero={false} /></>} key="ongoing">
              {RenderListFilteredByStatus(['to_sign', 'signed'])}
            </TabPane>
            <TabPane tab={"Completed"} key="complete">
              {RenderListFilteredByStatus(['complete'])}
            </TabPane>
          </Tabs>
        </Space>
      </ContainerStyled>
    </LayoutStyled >
  );
};

MyTaskListPage.propTypes = {};

MyTaskListPage.defaultProps = {};

export default withRouter(MyTaskListPage);
