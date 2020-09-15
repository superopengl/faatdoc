import { Alert, Badge, Button, Layout, List, Modal, Space, Tabs, Typography, Row, Col, Card } from 'antd';
import Text from 'antd/lib/typography/Text';
import HomeHeader from 'components/HomeHeader';
import { TaskProgressBar } from 'components/TaskProgressBar';
import { TimeAgo } from 'components/TimeAgo';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { listJobTemplate } from 'services/jobTemplateService';
import { listTask } from 'services/taskService';
import { listPortofolio } from 'services/portofolioService';
import { PlusOutlined, EditOutlined, ZoomInOutlined, SyncOutlined, HighlightOutlined } from '@ant-design/icons';
import styled from 'styled-components';


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


const ClientDashboardPage = (props) => {

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

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <Row>
<Col>

</Col>

        </Row>
        <Space size="large" direction="vertical" style={{ width: '100%' }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }} >
            {/* <Button type="link" onClick={() => loadList()} icon={<SyncOutlined />}></Button> */}
            <Button type="primary" icon={<PlusOutlined />} onClick={() => createNewTask()}>New Task</Button>
          </Space>

        </Space>
      </ContainerStyled>
    </LayoutStyled >
  );
};

ClientDashboardPage.propTypes = {};

ClientDashboardPage.defaultProps = {};

export default withRouter(ClientDashboardPage);
