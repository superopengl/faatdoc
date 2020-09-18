import { Alert, Badge, Button, Layout, List, Modal, Space, Tabs, Typography, Row, Col, Card } from 'antd';
import Text from 'antd/lib/typography/Text';
import HomeHeader from 'components/HomeHeader';
import { TaskStatus } from 'components/TaskStatus';
import { TimeAgo } from 'components/TimeAgo';
import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { listJobTemplate } from 'services/jobTemplateService';
import { listTask } from 'services/taskService';
import { listPortofolio } from 'services/portofolioService';
import { PlusOutlined, EditOutlined, ZoomInOutlined, SyncOutlined, HighlightOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { listNotification } from 'services/notificationService';
import NotificationList from 'components/NotificationList';
import { GlobalContext } from 'contexts/GlobalContext';
import { Divider } from 'antd';


const { Title } = Typography;
const { TabPane } = Tabs;


const ContainerStyled = styled.div`
  margin: 6rem auto 2rem auto;
  padding: 0 1rem;
  width: 100%;
  max-width: 1000px;
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

const span = {
  xs: 24,
  sm: 24,
  md: 12,
  lg: 12,
  xl: 12,
  xxl: 12
}

const ClientDashboardPage = (props) => {

  const [, setLoading] = React.useState(true);
  const [taskList, setTaskList] = React.useState([]);
  const [portofolioList, setPortofolioList] = React.useState([]);
  const context = React.useContext(GlobalContext);
  const { notifyCount } = context;

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

  const goToViewTask = (id) => {
    props.history.push(`/task/${id}/view`);
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

  const actionOnTask = task => {
    if (['to_sign', 'signed', 'complete'].includes(task.status)) {
      goToViewTask(task.id);
    } else {
      goToEditTask(task.id);
    }
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
  const handleFetchNextPage = async (page, size) => {
    return await listNotification({ page, size, unreadOnly: true });
  }

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <Row gutter={80}>
          <Col {...span}>
            <Space size="middle" direction="vertical" style={{ width: '100%'}}>
              <Title level={4}>My Tasks</Title>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Link to="/task">All tasks</Link>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => createNewTask()}>New Task</Button>
              </Space>
              <Divider/>
              <Title level={5}>Require Sign</Title>
              <Divider/>
              <Title level={5}>Require Action</Title>
            </Space>
          </Col>
          <Col {...span}>
            <Space size="middle" direction="vertical" style={{ width: '100%' }}>
              <Title level={4}>Top 10 Unread Notification</Title>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Link to="/notification">All notifications ({notifyCount} unread)</Link>
                <Button type="link" icon={<SyncOutlined />} onClick={() => window.location.reload(false)}></Button>
              </Space>
              <NotificationList
                onFetchNextPage={handleFetchNextPage}
                // onItemRead={}
                max={10}
                size={10}
              />

            </Space>
          </Col>
        </Row>
        <Space size="large" direction="vertical" style={{ width: '100%' }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }} >
            {/* <Button type="link" onClick={() => loadList()} icon={<SyncOutlined />}></Button> */}
          </Space>

        </Space>
      </ContainerStyled>
    </LayoutStyled >
  );
};

ClientDashboardPage.propTypes = {};

ClientDashboardPage.defaultProps = {};

export default withRouter(ClientDashboardPage);
