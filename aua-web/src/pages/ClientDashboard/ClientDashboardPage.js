import { Button, Layout, Modal, Space, Typography, Row, Col } from 'antd';
import HomeHeader from 'components/HomeHeader';
import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { listUnreadTask, searchTask } from 'services/taskService';
import { listPortofolio } from 'services/portofolioService';
import { PlusOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { listNotification } from 'services/notificationService';
import NotificationList from 'components/NotificationList';
import { GlobalContext } from 'contexts/GlobalContext';
import { Divider } from 'antd';
import MyTaskList from 'pages/MyTask/MyTaskList';


const { Title, Paragraph } = Typography;


const ContainerStyled = styled.div`
  margin: 6rem auto 2rem auto;
  padding: 0 1rem;
  width: 100%;
  max-width: 1000px;

  .ant-divider {
    margin: 8px 0 24px;
  }
`;

const StyledCol = styled(Col)`
// margin-bottom: 2rem;
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
  const [toSignTaskList, setToSignTaskList] = React.useState([]);
  const [unreadTaskList, setUnreadTaskList] = React.useState([]);
  const [portofolioList, setPortofolioList] = React.useState([]);
  const [, setHasNotification] = React.useState(false);
  const context = React.useContext(GlobalContext);
  const { notifyCount } = context;

  const loadList = async () => {
    setLoading(true);
    const portofolioList = await listPortofolio() || [];
    const { data: toSignTaskList } = await searchTask({ status: ['to_sign'] });
    const unreadTaskList = await listUnreadTask();

    setToSignTaskList(toSignTaskList);
    setPortofolioList(portofolioList);
    setUnreadTaskList(unreadTaskList);
    setLoading(false);
    if (!portofolioList.length) {
      showNoPortofolioWarn();
    }
  }


  React.useEffect(loadList, [])

  const goToEditTask = (id) => {
    props.history.push(`/task/${id || 'new'}`);
  }


  const showNoPortofolioWarn = () => {
    Modal.confirm({
      title: 'No portofolio',
      content: 'Please create portofolio before creating task. Go to create protofolio now?',
      okText: 'Yes, go to create portofolio',
      maskClosable: true,
      onOk: () => props.history.push('/portofolio')
    });
  }

  const createNewTask = e => {
    e.stopPropagation();
    if (portofolioList.length) {
      goToEditTask();
    } else {
      showNoPortofolioWarn();
    }
  }

  const handleFetchNextPage = async (page, size) => {
    const data = await listNotification({ page, size, unreadOnly: true });
    setHasNotification(!!data.length);
    return data;
  }

  const hasPortofolio = !!portofolioList.length;

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <Row gutter={80}>
          <StyledCol {...span}>
            <Space size="small" direction="vertical" style={{ width: '100%' }}>
              <Title type="secondary" level={4}>My Tasks</Title>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Link to="/task">All tasks</Link>
                <Button type="link" onClick={createNewTask} style={{ padding: 0 }}><PlusOutlined /> Create New Task</Button>
              </Space>
              <Divider />
              {!hasPortofolio && <>
                <Title type="secondary" level={4}>My Portofolio</Title>
                <Paragraph >Portofolios are predefined information that can be used to automatically fill in your task application. You can save the information like name, phone, address, TFN, and etc. for future usage.</Paragraph>
                <Link to="/portofolio"><Button size="large" type="primary" ghost block icon={<PlusOutlined />}>New Portofolio</Button></Link>
                <Divider />
              </>}
              {toSignTaskList.length > 0 && <>
                <Title type="secondary" level={4}>Require Sign</Title>
                <MyTaskList data={toSignTaskList} />
                <Divider />
              </>}
              {unreadTaskList.length > 0 && <>
                <Title type="secondary" level={4}>Latest 5 tasks with new notifications</Title>
                <MyTaskList data={unreadTaskList.slice(0, 5)} />
                <Divider />
              </>}
            </Space>
          </StyledCol>

          <StyledCol {...span}>
            <Space size="small" direction="vertical" style={{ width: '100%' }}>
              <Title type="secondary" level={4}>Latest 10 Unread Notification</Title>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Link to="/notification"><Button type="link" style={{ padding: 0 }}>All notifications ({notifyCount} unread)</Button></Link>
                {/* <Button type="link" icon={<SyncOutlined />} onClick={() => window.location.reload(false)}></Button> */}
              </Space>
              <NotificationList
                onFetchNextPage={handleFetchNextPage}
                // onItemRead={}
                max={10}
                size={10}
              />

            </Space>
          </StyledCol>
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
