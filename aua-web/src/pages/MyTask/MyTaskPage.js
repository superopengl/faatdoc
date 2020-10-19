import React from 'react';

import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Layout, Spin, Affix, Button } from 'antd';
import HomeHeader from 'components/HomeHeader';
import { getTask } from 'services/taskService';
import MyTaskSign from './MyTaskSign';
import TaskFormWizard from './TaskFormWizard';
import MyTaskReadView from './MyTaskReadView';
import * as queryString from 'query-string';
import { MessageOutlined } from '@ant-design/icons';
import TaskChat from 'pages/AdminTask/TaskChat';
import TaskChatPanel from 'pages/AdminTask/TaskChatPanel';

const ContainerStyled = styled.div`
margin: 4rem auto 0 auto;
padding: 2rem 1rem;
// text-align: center;
max-width: 1000px;
width: 100%;

.ant-layout-sider-zero-width-trigger {
  top: 0;
}
`;


const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;
`;

const MyTaskPage = (props) => {
  const id = props.match.params.id;
  const isNew = !id || id === 'new';

  const { chat } = queryString.parse(props.location.search);
  const [chatVisible, setChatVisible] = React.useState(Boolean(chat));
  const [loading, setLoading] = React.useState(true);
  const [task, setTask] = React.useState();

  const loadEntity = async () => {
    setLoading(true);
    if (id && !isNew) {
      const task = await getTask(id);
      setTask(task);
    }
    setLoading(false);
  }

  React.useEffect(() => {
    loadEntity();
  }, [])

  const onOk = () => {
    props.history.push('/task');
  }
  const onCancel = () => {
    props.history.goBack();
  }

  const showsEditableForm = isNew || task?.status === 'todo';
  const showsSign = task?.status === 'to_sign';
  const showsChat = !!task?.id;

  return (<>
    <LayoutStyled>
      <HomeHeader />
      <ContainerStyled>
        <Layout>
          <Layout.Content style={{padding: 16}}>
            {loading ? <Spin /> :
              showsEditableForm ? <TaskFormWizard onOk={onOk} onCancel={onCancel} value={task} /> :
                showsSign ? <MyTaskSign value={task} /> :
                  <MyTaskReadView value={task} />}

          </Layout.Content>
          {showsChat && <Layout.Sider reverseArrow={true} collapsedWidth={0} width={400} collapsible={true} theme="light" style={{padding: 16}}>
            <TaskChatPanel onClose={() => setChatVisible(false)} taskId={task.id} />
          </Layout.Sider>}
        </Layout>
      </ContainerStyled>
    </LayoutStyled>
  </>
  );
};

MyTaskPage.propTypes = {
  // id: PropTypes.string.isRequired
};

MyTaskPage.defaultProps = {
  // id: 'new'
};

export default withRouter(MyTaskPage);
