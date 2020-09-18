import { SendOutlined } from '@ant-design/icons';
import { Button, Drawer, Form, Input } from 'antd';
import { GlobalContext } from 'contexts/GlobalContext';
import * as moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { MessageBox } from 'react-chat-elements';
import 'react-chat-elements/dist/main.css';
import { withRouter } from 'react-router-dom';
import { ChatService } from 'services/ChatService';
import styled from 'styled-components';
import { listTaskNotifies, notifyTask, markTaskNotifyRead } from '../../services/taskService';

const StyledDrawer = styled(Drawer)`

.ant-drawer-content-wrapper {
  max-width: 90vw;
}

.ant-drawer-body {
  display: flex;
  flex-direction: column-reverse;
  overflow-x: hidden;
  overflow-y: scroll;
}

.rce-mbox {
  padding-bottom: 2rem;

  .rce-mbox-text {
    white-space: pre-line;
  }

  .rce-mbox-time {
    bottom: -1.5rem;
  }
}
`;

const StyledSentMessageBox = styled(MessageBox)`
.rce-mbox {
  margin-right: 5px;
  background-color:#95de64;
  margin-left: 20px;
  // color: rgba(255,255,255,0.9);

  .rce-mbox-time {
    // color: rgba(255,255,255,0.7);
  }
}
`;

const StyledReceivedMessageBox = styled(MessageBox)`
.rce-mbox {
  margin-left: 5px;
  margin-right: 20px;
  background-color: #f0f0f0;
  // color: rgba(255,255,255,0.9);
}
`;

const SentMessage = (props) => <StyledSentMessageBox {...props} position="right" />

const ReceivedMessage = (props) => <StyledReceivedMessageBox {...props} position="left" />

const TaskChat = (props) => {
  const { taskId, visible, onClose, readonly } = props;
  // const { name, id, fields } = value || {};

  const context = React.useContext(GlobalContext);
  const [loading, setLoading] = React.useState(true);
  const [form] = Form.useForm();
  const textareaRef = React.useRef(null);
  const [list, setList] = React.useState([]);
  const ws = React.useRef(null);

  React.useEffect(() => {
    ws.current = new ChatService(taskId);

    return () => {
      ws.current.close();
    }
  }, []);

  React.useEffect(() => {
    if (!ws.current) return;
    ws.current.onReceiveMessage = item => {
      setList([{ ...item }, ...list]);
    }
  });

  const myUserId = context.user.id;

  const loadList = async () => {
    setLoading(true);
    const list = await listTaskNotifies(taskId);
    setList(list);
    setLoading(false);
  }


  React.useEffect(() => {
    loadList();
    if (visible && context.user.role === 'client') {
      markTaskNotifyRead(taskId);
    }
  }, [taskId, visible]);

  const sendMessage = async (values) => {
    const { content } = values;
    form.resetFields();
    if (!content?.trim()) return;

    const newMessage = {
      createdAt: new Date(),
      sender: myUserId,
      content
    };

    const others = [...list];
    setList([{ ...newMessage, status: 'waiting' }, ...others]);
    ws.current.send(newMessage);
    await notifyTask(taskId, content);
    setList([{ ...newMessage, status: 'sent' }, ...others]);
    // loadList();

    form.resetFields();
    textareaRef.current.focus();
  }


  const handleAfterVisibleChange = visible => {
    if (visible) {
      ws.current.open();
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    } else {
      ws.current.close();
    }
  }

  return <StyledDrawer
    title="Task Notification"
    placement="right"
    closable={true}
    visible={visible}
    destroyOnClose={true}
    onClose={() => onClose()}
    width={500}
    bodyStyle={{ padding: '10px', verticalAlign: 'bottom' }}
    afterVisibleChange={handleAfterVisibleChange}
    footer={readonly ? null : <Form onFinish={sendMessage}
      form={form}>
      <Form.Item name="content" style={{ marginBottom: 4 }}>
        <Input.TextArea
          autoSize={{ minRows: 3, maxRows: 20 }}
          maxLength={2000}
          placeholder="Type here and press enter to send"
          allowClear
          autoFocus={true}
          disabled={loading}
          onPressEnter={e => sendMessage({ content: e.target.value })}
          ref={textareaRef}
        />
      </Form.Item>
      {/* <Space>
        <Button icon={<ArrowLeftOutlined />} onClick={() => handleGoBack()}></Button>
      </Space> */}
      <Button type="primary" block icon={<SendOutlined />} htmlType="submit" disabled={loading} >Send</Button>
    </Form>}
  >
    {list.map((x, i) => {
      const MessageComponent = x.sender === myUserId ? SentMessage : ReceivedMessage;
      return <div key={i}>
        <MessageComponent
          type="text"
          text={x.content}
          date={moment(x.createdAt).toDate()}
          status={x.status || 'sent'} // waiting, sent, received, read
          notch={false}
        /></div>
    })}
  </StyledDrawer>
};

TaskChat.propTypes = {
  taskId: PropTypes.string.isRequired,
  visible: PropTypes.bool.isRequired,
  readonly: PropTypes.bool.isRequired,
};

TaskChat.defaultProps = {
  visible: false,
  readonly: false
};

export default withRouter(TaskChat);
