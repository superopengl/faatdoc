import React from 'react';
import PropTypes from 'prop-types';

import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Input, Button, Form, Select, DatePicker, Layout, Drawer, Space, Typography, Radio, Row, Col } from 'antd';
import { FileUploader } from 'components/FileUploader';
import HomeHeader from 'components/HomeHeader';

import * as moment from 'moment';
import { GlobalContext } from 'contexts/GlobalContext';
import { Menu, Dropdown, message, Tooltip } from 'antd';
import { UpOutlined, DownOutlined, DeleteOutlined, SendOutlined } from '@ant-design/icons';
import { Divider } from 'antd';
import { BuiltInFieldDef } from "components/FieldDef";
import { normalizeFieldNameToVar } from 'util/normalizeFieldNameToVar';
import { listJobTemplate } from 'services/jobTemplateService';
import { deleteLodgement, generateLodgement, sendLodgementMessage, listLodgementMessages } from 'services/lodgementService';
import { listPortofolio } from 'services/portofolioService';
import { getDisplayNameFromVarName } from 'util/getDisplayNameFromVarName';
import { InputYear } from 'components/InputYear';
import { DateInput } from 'components/DateInput';
import 'react-chat-elements/dist/main.css';
import { Button as ChatButton, Input as ChatInput, ChatItem, MessageBox } from 'react-chat-elements'

const { Text, Paragraph, Title } = Typography;
const ContainerStyled = styled.div`
  margin: 5rem auto 2rem auto;
  padding: 1rem;
  // max-width: 700px;
  width: 100%;
`;

const Container = styled(Space)`
// padding-top: 2rem;
width: 100%;
height: 100%;
// position: relative;
// display: flex;
// flex-direction: column-reverse;
`
const ChatInputContainer = styled.div`
// position: absolute;
bottom: 0;
right: 0;
left: 0;
width: 100%;
// background-color: white;
// border: 1px solid rgb(217, 217, 217);
// border-radius: 4px;
// padding: 4px;
`;

const MessageListContainer = styled.div`

// padding: 1rem;
overflow-x: hidden;
overflow-y: auto;
background-color: #143e86;
border: 1px solid #eeeeee;

.rce-mbox {
  margin-right: 5px;
}
`;

const MessageListInner = styled.div`
display: flex;
flex-direction: column-reverse;
// height: 100%;
`;

const StyledMessage = (props) => <MessageBox {...props} />

const LodgementChat = (props) => {
  const { lodgementId, visible, onClose, readonly } = props;
  // const { name, id, fields } = value || {};

  const [loading, setLoading] = React.useState(true);
  const [form] = Form.useForm();

  const [list, setList] = React.useState([]);
  const [jobTemplateId, setJobTemplateId] = React.useState();
  const [portofolioId, setPortofolioId] = React.useState();


  const loadMessages = async () => {
    setLoading(true);
    const list = await listLodgementMessages(lodgementId);
    setList(list);
    setLoading(false);
  }

  React.useEffect(() => {
    loadMessages();
  }, [])

  const sendMessage = async (values) => {
    const { content } = values;
    if (!content?.trim()) return;
    setList([...list, { createdAt: new Date(), content, status: 'waiting' }]);
    form.resetFields();
    setLoading(true);
    await sendLodgementMessage(lodgementId, content);
    await loadMessages();
    setLoading(false);
  }

  return (
    <Drawer
      title="Communication"
      placement="right"
      closable={true}
      visible={visible}
      onClose={() => onClose()}
      width={800}
      bodyStyle={{padding: '0 10px'}}
      footer={readonly ? null : <Form onFinish={sendMessage} form={form}>
        <Form.Item name="content" style={{ marginBottom: 4 }}>
          <Input.TextArea autoSize={{ minRows: 3, maxRows: 20 }} maxLength={2000} placeholder="Type here ..." allowClear disabled={loading} />
        </Form.Item>
        <Button type="primary" ghost block icon={<SendOutlined />} htmlType="submit" disabled={loading} >Send</Button>
      </Form>}
    >
      <Space direction="vertical" style={{ width: '100%', backgroundColor: '#143e86', padding: '10px 0', flexDirection: 'column-reverse' }}>
        {list.map((x, i) => <StyledMessage
          key={i}
          position="right"
          type="text"
          text={x.content}
          date={moment(x.createdAt).toDate()}
          status={x.status || 'sent'} // waiting, sent, received, read
          notch={false}
        />)}
        {/* <ChatInputContainer>
          <Form onFinish={sendMessage} form={form}>
            <Form.Item name="content" style={{ marginBottom: 4 }}>
              <Input.TextArea autoSize={{ minRows: 3, maxRows: 20 }} maxLength={2000} placeholder="Type here ..." allowClear disabled={loading} />
            </Form.Item>
            <Button type="primary" ghost block icon={<SendOutlined />} htmlType="submit" disabled={loading} >Send</Button>
          </Form>
        </ChatInputContainer> */}
      </Space>
    </Drawer>
  );
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
