import { Button, Layout, Modal, Space, Typography, Row, Col, Spin, Tabs } from 'antd';
import HomeHeader from 'components/HomeHeader';
import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { listTask } from 'services/taskService';
import { listPortfolio } from 'services/portfolioService';
import { PlusOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { Divider } from 'antd';
import MyTaskList from 'pages/MyTask/MyTaskList';
import { Alert } from 'antd';
import { GlobalContext } from 'contexts/GlobalContext';
import { PortfolioAvatar } from 'components/PortfolioAvatar';
import { groupBy } from 'lodash';

const { Title, Paragraph } = Typography;


const ContainerStyled = styled.div`
  margin: 6rem auto 2rem auto;
  padding: 0 1rem;
  width: 100%;
  max-width: 600px;

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
    background-color: #183e91;
    color: #eeeeee;
    // box-shadow: 0 0 0 1px #183e91 inset;
  }
`;


const ClientDashboardPage = (props) => {

  const [loading, setLoading] = React.useState(true);
  const [toSignTaskList, setToSignTaskList] = React.useState([]);
  const [unreadTaskList, setUnreadTaskList] = React.useState([]);
  const [completeList, setCompleteList] = React.useState([]);
  const [todoList, setTodoList] = React.useState([]);
  const [portfolioList, setPortfolioList] = React.useState([]);
  const [taskListByPortfolioMap, setTaskListByPortfolioMap] = React.useState({});
  const context = React.useContext(GlobalContext);
  const [] = React.useState(false);

  const loadList = async () => {
    setLoading(true);
    const portfolioList = await listPortfolio() || [];
    // const { data: toSignTaskList } = await searchTask({ status: ['to_sign'] });
    const list = await listTask();
    setTaskListByPortfolioMap(groupBy(list, 'portfolioId'));

    setPortfolioList(portfolioList);
    setToSignTaskList(list.filter(x => x.status === 'to_sign'));
    setUnreadTaskList(list.filter(x => x.lastUnreadMessageAt));
    setCompleteList(list.filter(x => x.status === 'complete'));
    setTodoList(list.filter(x => x.status === 'todo'));
    setLoading(false);
    if (!portfolioList.length) {
      showNoPortfolioWarn();
    }
  }

  React.useEffect(() => {
    loadList()
  }, []);

  const goToEditTask = (id) => {
    props.history.push(`/tasks/${id || 'new'}`);
  }


  const showNoPortfolioWarn = () => {
    Modal.confirm({
      title: 'No portfolio',
      maskClosable: true,
      content: 'Please create portfolio before creating task. Go to create protofolio now?',
      okText: 'Yes, go to create portfolio',
      maskClosable: true,
      onOk: () => props.history.push('/portfolios?create=1')
    });
  }

  const createNewTask = e => {
    e.stopPropagation();
    if (portfolioList.length) {
      goToEditTask();
    } else {
      showNoPortfolioWarn();
    }
  }


  const handleGoToTaskWithMessage = task => {
    props.history.push(`/tasks/${task.id}?chat=true`)
  }

  const handleGoToTask = task => {
    props.history.push(`/tasks/${task.id}`)
  }

  const hasPortfolio = !!portfolioList.length;
  const hasNotableTasks = toSignTaskList.length || unreadTaskList.length || completeList.length;
  const showsTodoList = !hasNotableTasks && todoList.length > 0;
  const hasNothing = !hasNotableTasks && !todoList.length

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Link to="/tasks">All tasks</Link>
          <Button type="primary" onClick={createNewTask} icon={<PlusOutlined />}>New Task</Button>
        </Space>
        <Divider />
        <Paragraph type="secondary">This page lists out all tasks grouped by portfolio. You can go to the <Link to="/tasks">Tasks</Link> page to see all the tasks and go to the <Link to="/portfolios">Portfolios</Link> page to manage all your portfolios.</Paragraph>
        <Spin spinning={loading}>
          <Tabs type="card" tabBarExtraContent={<Button onClick={() => props.history.push(`/portfolios?create=1`)} icon={<PlusOutlined />}>New Portfolio</Button>}>
            {portfolioList.map((p, i) => <Tabs.TabPane key={i} tab={<Space size="small" direction="vertical" style={{ alignItems: 'center' }}>
              <PortfolioAvatar value={p.name} email={context.user.email} size={36} />
              {p.name}
            </Space>}>
              <MyTaskList data={taskListByPortfolioMap[p.id]} onItemClick={handleGoToTask} avatar={false} />
            </Tabs.TabPane>)}
          </Tabs>
        </Spin>
      </ContainerStyled>
    </LayoutStyled >
  );
};

ClientDashboardPage.propTypes = {};

ClientDashboardPage.defaultProps = {};

export default withRouter(ClientDashboardPage);
