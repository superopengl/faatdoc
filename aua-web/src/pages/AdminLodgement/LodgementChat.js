import React from 'react';
import PropTypes from 'prop-types';

import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Input, Button, Form, Select, DatePicker, Layout, Modal, Space, Typography, Radio, Row, Col } from 'antd';
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

const Container = styled.div`
padding-top: 64px;
width: 100%;
height: 100%;
position: relative;
display: flex;
flex-direction: column-reverse;
`
const ChatInputContainer = styled.div`
// position: absolute;
bottom: 0;
right: 0;
left: 0;
width: 100%;
background-color: white;
border: 1px solid rgb(217, 217, 217);
// border-radius: 4px;
// padding: 4px;
`;

const MessageListContainer = styled.div`
display: flex;
flex-direction: column-reverse;
// padding: 1rem;
overflow-x: hidden;
overflow-y: auto;
// background-color: #143e86;
`;

const StyledMessage = (props) => <div style={{ margin: '0.5rem 0' }}><MessageBox {...props} /></div>

const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
`;

const LodgementChat = (props) => {
  const { lodgementId } = props;
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

  return (<Container>
    <ChatInputContainer>
      <Form onFinish={sendMessage} form={form}>
        <Form.Item name="content" style={{marginBottom: 4}}>
          <Input.TextArea autoSize={{ minRows: 2, maxRows: 20 }} placeholder="Type here ..." allowClear disabled={loading} />
        </Form.Item>
        <Button type="primary" ghost icon={<SendOutlined />} htmlType="submit" disabled={loading} >Send</Button>
      </Form>
      {/* <ChatInput
        style={{ position: 'absolute', bottom: 0 }}
        placeholder="Type here..."
        multiline={true}
        autoHeight={true}
        minHeight={40}
        maxHeight={120}
        rightButtons={
          <ChatButton
            color='white'
            backgroundColor='black'
            text='Send' />
        } /> */}

    </ChatInputContainer>
    <MessageListContainer>
      {list.map((x, i) => <StyledMessage
        key={i}
        position="right"
        type="text"
        text={x.content}
        date={moment(x.createdAt).toDate()}
        status={x.status || 'sent'} // waiting, sent, received, read
        notch={false}
      />)}
    </MessageListContainer>
  </Container>

  );
};

LodgementChat.propTypes = {
  lodgementId: PropTypes.string.isRequired
};

LodgementChat.defaultProps = {};

export default withRouter(LodgementChat);
