import { Alert, Badge, Button, Divider, Layout, List, Modal, Space, Tabs, Typography } from 'antd';
import Text from 'antd/lib/typography/Text';
import HomeHeader from 'components/HomeHeader';
import { TaskProgressBar } from 'components/TaskProgressBar';
import { TimeAgo } from 'components/TimeAgo';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { listJobTemplate } from 'services/jobTemplateService';
import { deleteTask, listTask } from 'services/taskService';
import { listPortofolio } from 'services/portofolioService';
import { PlusOutlined, DeleteOutlined, EditOutlined, ZoomInOutlined, SyncOutlined, HighlightOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import TaskForm from './MyTaskForm';
import ReviewSignPage from './ReviewSignPage';

const { Title } = Typography;
const { TabPane } = Tabs;


const ContainerStyled = styled.div`
  margin: 6rem auto 2rem auto;
  padding: 0 0.5rem;
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

  const [loading, setLoading] = React.useState(true);
  const [signModalVisible, setSignModalVisible] = React.useState(false);
  const [taskList, setTaskList] = React.useState([]);
  const [, setJobTemplateList] = React.useState([]);
  const [portofolioList, setPortofolioList] = React.useState([]);
  const [currentTask, setCurrentTask] = React.useState();


  const loadList = async () => {
    setLoading(true);
    const portofolioList = await listPortofolio() || [];

    const list = await listTask();
    const jobTemplateList = await listJobTemplate() || [];

    setTaskList(list);
    setJobTemplateList(jobTemplateList);
    setPortofolioList(portofolioList);
    setLoading(false);
  }


  React.useEffect(() => {
    loadList();
  }, [])

  const goToTask = (id) => {
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
    goToTask();
  }

  const actionOnTask = task => {
    setCurrentTask(task);
    if (['to_sign', 'signed', 'complete'].includes(task.status)) {
      setSignModalVisible(true);
    } else {
      goToTask(task.id);
    }
  }

  const handleModalExit = async () => {
    setSignModalVisible(false);
    await loadList();
  }

  const getActionIcon = status => {
    switch (status) {
      case 'todo':
        return <EditOutlined />
      case 'to_sign':
        return <HighlightOutlined />
      case 'signed':
      case 'complete':
      case 'archive':
      default:
        return <ZoomInOutlined />
    }
  }

  const handleDelete = async (e, item) => {
    e.stopPropagation();
    Modal.confirm({
      title: <>To delete task <strong>{item.name}</strong>?</>,
      onOk: async () => {
        setLoading(true);
        await deleteTask(item.id);
        await loadList();
        setLoading(false);
      },
      maskClosable: true,
      okButtonProps: {
        danger: true
      },
      okText: 'Yes, delete it!'
    });
  }

  const RenderListFilteredByStatus = (statuses = []) => {
    const data = taskList.filter(x => statuses.includes(x.status));

    return <List
      itemLayout="horizontal"
      dataSource={data}
      size="large"
      renderItem={item => (
        <List.Item
          style={{ paddingLeft: 0, paddingRight: 0 }}
          key={item.id}
          onClick={() => actionOnTask(item)}
        >
          <List.Item.Meta
            avatar={<TaskProgressBar key="1" status={item.status} width={60} style={{ marginTop: 6 }} />}

            title={<Text style={{ fontSize: '1rem' }}>{item.name}</Text>}
            description={<Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <TimeAgo value={item.lastUpdatedAt} surfix="Last Updated" />
              <Space>
                <Button shape="circle" key="action" onClick={() => actionOnTask(item)} icon={getActionIcon(item.status)}></Button>
                {/* {item.status === 'draft' && <>
                  <Button key="delete" shape="circle" danger disabled={loading} onClick={e => handleDelete(e, item)} icon={<DeleteOutlined />}></Button>
                </>} */}
              </Space>
            </Space>
            }
          />
        </List.Item>
      )}
    />
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

          <Tabs defaultActiveKey="ongoing" type="card" tabBarExtraContent={{ right: <Button type="link" onClick={() => loadList()} icon={<SyncOutlined />}></Button> }}>
            <TabPane tab={"To Do"} key="todo">
              {RenderListFilteredByStatus(['todo'])}
            </TabPane>
            <TabPane tab={<>In Progress <Badge count={taskList.filter(x => ['to_sign'].includes(x.status)).length} showZero={false} /></>} key="ongoing">
              {RenderListFilteredByStatus(['to_sign', 'signed'])}
            </TabPane>
            <TabPane tab={"Completed"} key="complete">
              {RenderListFilteredByStatus(['complete'])}
            </TabPane>
          </Tabs>
        </Space>

      </ContainerStyled>
      <Modal
        title={currentTask?.name || 'New Task'}
        visible={signModalVisible}
        destroyOnClose={true}
        onCancel={() => setSignModalVisible(false)}
        onOk={() => setSignModalVisible(false)}
        footer={null}
        width={700}
      >
        {currentTask?.status === 'signed' ? <Alert message="The task has been signed." description="Please wait for the task to be completed by us." type="success" showIcon /> : null}
        {currentTask?.status === 'to_sign' ? <Alert message="The task requires signature." description="All above documents have been viewed and the task is ready to e-sign." type="warning" showIcon /> : null}
        <Tabs>
          <Tabs.TabPane tab="Review and Sign" key="sign">
            <ReviewSignPage id={currentTask?.id} onFinish={() => handleModalExit()} onCancel={() => setSignModalVisible(false)} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Task" key="view">
            <TaskForm id={currentTask?.id} onFinish={() => handleModalExit()} onCancel={() => setSignModalVisible(false)} />
          </Tabs.TabPane>
        </Tabs>
      </Modal>
    </LayoutStyled >
  );
};

MyTaskListPage.propTypes = {};

MyTaskListPage.defaultProps = {};

export default withRouter(MyTaskListPage);
