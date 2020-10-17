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

const ContainerStyled = styled.div`
margin: 4rem auto 0 auto;
padding: 2rem 1rem;
// text-align: center;
max-width: 500px;
width: 100%;
`;


const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;
`;

const AffixContactButton = styled(Button)`
width: 60px;
height: 60px;
display: flex;
align-items: center;
justify-content: center;
border: none;
background-color: rgba(255,77,79, 0.8);
color: white;
// box-shadow: 1px 1px 5px #222222;
border: 2px solid white;

&:focus,&:hover,&:active {
color: white;
background-color: rgba(20, 62, 134, 0.8);
border: 2px solid white;
}
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

  return (<>
    <LayoutStyled>
      <HomeHeader />
      <ContainerStyled>
        {loading ? <Spin/> : 
          showsEditableForm ? <TaskFormWizard
            onOk={onOk}
            onCancel={onCancel}
            value={task} /> :
            showsSign ? <MyTaskSign value={task} /> :
              <MyTaskReadView value={task} />}

        
      </ContainerStyled>
      {!!task?.id && <>
      <TaskChat visible={chatVisible} onClose={() => setChatVisible(false)} taskId={task.id} />
      <Affix style={{ position: 'fixed', bottom: 30, right: 30 }}>
        <AffixContactButton type="primary" shape="circle" size="large"
          onClick={() => setChatVisible(true)}
          style={{ fontSize: 24 }}
        >
          <MessageOutlined />
        </AffixContactButton>
      </Affix>
    </>}
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
