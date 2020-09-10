import { SendOutlined } from '@ant-design/icons';
import { Button, Divider, Drawer, Form, Input, Space, Typography } from 'antd';
import { GlobalContext } from 'contexts/GlobalContext';
import * as moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { MessageBox } from 'react-chat-elements';
import 'react-chat-elements/dist/main.css';
import { withRouter } from 'react-router-dom';
import { listLodgementNotifies, notifyLodgement } from 'services/lodgementService';
import styled from 'styled-components';

const { Text } = Typography;

const StyledDrawer = styled(Drawer)`

.ant-drawer-content-wrapper {
  max-width: 90vw;
}

.rce-mbox {
  padding-bottom: 2rem;

  .rce-mbox-time {
    bottom: -1.5rem;
  }
}
`;

const StyledSentMessageBox = styled(MessageBox)`
.rce-mbox {
  margin-right: 5px;
  background-color: #f0f0f0;
  // color: rgba(255,255,255,0.9);

  .rce-mbox-time {
    // color: rgba(255,255,255,0.7);
  }
}
`;

const StyledReceivedMessageBox = styled(MessageBox)`
.rce-mbox {
  // background-color: #143e86;
  // color: rgba(255,255,255,0.9);
}
`;

const SentMessage = (props) => <StyledSentMessageBox {...props} position="right" />

const ReceivedMessage = (props) => <StyledReceivedMessageBox {...props} position="left" />

const LodgementChat = (props) => {
  const { lodgementId, visible, onClose, readonly } = props;
  // const { name, id, fields } = value || {};

  const context = React.useContext(GlobalContext);
  const [loading, setLoading] = React.useState(true);
  const [form] = Form.useForm();

  const [list, setList] = React.useState([]);

  const myUserId = context.user.id;

  const loadList = async () => {
    setLoading(true);
    const list = await listLodgementNotifies(lodgementId);
    setList(list);
    setLoading(false);
  }

  React.useEffect(() => {
    loadList();
  }, [lodgementId, visible])

  const sendMessage = async (values) => {
    const { content } = values;
    form.resetFields();
    if (!content?.trim()) return;
    setList([...list, { createdAt: new Date(), content, status: 'waiting' }]);
    setLoading(true);
    await notifyLodgement(lodgementId, content);
    await loadList();
    setLoading(false);
  }

  return <StyledDrawer
    title="Lodgement Notification"
    placement="right"
    closable={true}
    visible={visible}
    destroyOnClose={true}
    onClose={() => onClose()}
    width={500}
    bodyStyle={{ padding: '0 10px', verticalAlign: 'bottom' }}
    footer={readonly ? null : <Form onFinish={sendMessage} form={form}>
      <Form.Item name="content" style={{ marginBottom: 4 }}>
        <Input.TextArea autoSize={{ minRows: 3, maxRows: 20 }} maxLength={2000} placeholder="Type here ..." allowClear disabled={loading} />
      </Form.Item>
      <Button type="primary" ghost block icon={<SendOutlined />} htmlType="submit" disabled={loading} >Send</Button>
    </Form>}
  >
    <Space direction="vertical" style={{ width: '100%', padding: '10px 0', flexDirection: 'column-reverse' }}>
      {/* {!list.length && <Text type="secondary">No communication yet</Text>} */}
      {readonly && <Divider>
        <Text type="secondary" strong={false}><small>The communication for this lodgement is closed.</small></Text>
      </Divider>}
      {list.map((x, i) => {
        const MessageComponent = x.sender === myUserId ? SentMessage : ReceivedMessage;
        return <MessageComponent
          key={i}
          type="text"
          text={x.content}
          date={moment(x.createdAt).toDate()}
          status={x.status || 'sent'} // waiting, sent, received, read
          notch={false}
        />
      })}
    </Space>
  </StyledDrawer>
};

LodgementChat.propTypes = {
  lodgementId: PropTypes.string.isRequired,
  visible: PropTypes.bool.isRequired,
  readonly: PropTypes.bool.isRequired,
};

LodgementChat.defaultProps = {
  visible: false,
  readonly: false
};

export default withRouter(LodgementChat);
