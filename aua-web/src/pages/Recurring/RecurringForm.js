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
import { listJobTemplate, getJobTemplate } from 'services/jobTemplateService';
import { deleteLodgement, generateLodgement, sendLodgementMessage, listLodgementMessages } from 'services/lodgementService';
import { listPortofolio } from 'services/portofolioService';
import { getDisplayNameFromVarName } from 'util/getDisplayNameFromVarName';
import { InputYear } from 'components/InputYear';
import { DateInput } from 'components/DateInput';
import 'react-chat-elements/dist/main.css';
import { Button as ChatButton, Input as ChatInput, ChatItem, MessageBox } from 'react-chat-elements'
import { getRecurring } from 'services/recurringService';
import { PortofolioAvatar } from 'components/PortofolioAvatar';

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
  background-color: #143e86;
  color: rgba(255,255,255,0.9);

  .rce-mbox-time {
    color: rgba(255,255,255,0.7);
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

const RecurringForm = (props) => {
  const { id, visible } = props;
  // const { name, id, fields } = value || {};

  const isNew = !id;
  const [loading, setLoading] = React.useState(true);
  const [form] = Form.useForm();
  const [recurring, setRecurring] = React.useState([]);
  const [jobTemplateList, setJobTemplateList] = React.useState([]);
  const [portofolioList, setPortofolioList] = React.useState([]);

  const loadRecurring = async () => {
    setLoading(true);
    const jobTemplateList = await listJobTemplate();
    const portofolioList = await listPortofolio();
    if (id) {
      const recurring = await getRecurring(id);
      setRecurring(recurring);
    }
    setJobTemplateList(jobTemplateList);
    setPortofolioList(portofolioList);
    setLoading(false);
  }

  const saveRecurring = async (values) => {
    const { jobTemplateId, portofolioId, cron } = values;
    const recurring = {
      jobTemplateId,
      portofolioId,
      cron,
    }

    await saveRecurring(recurring);
    props.onClose();
  }

  React.useEffect(() => {
    loadRecurring();
  }, []);


  const onClose = () => {
    props.onClose();
  }


  return (
    <StyledDrawer
      title={isNew ? 'New Recurring' : 'Edit Recurring'}
      placement="right"
      closable={true}
      visible={visible}
      onClose={() => onClose()}
      width={400}
      // bodyStyle={{ padding: '0 10px' }}
      footer={null}
    >
      <Form layout="vertical" onFinish={saveRecurring} form={form}>
        <Form.Item label="Job Template" name="jobTemplateId" rules={[{ required: true, message: ' ' }]}>
          <Select allowClear loading={loading}>
            {jobTemplateList.map((x, i) => (<Select.Option key={i} value={x.id}>
              {x.name}
            </Select.Option>))}
          </Select>
        </Form.Item>
        <Form.Item label="Client Portofolio" name="portofolioId" rules={[{ required: true, message: ' ' }]}>
          <Select allowClear loading={loading}>
            {portofolioList.map((x, i) => (<Select.Option key={i} value={x.id}>
              <PortofolioAvatar value={x.name} size={40}/> {x.name} <Text type="secondary"><small>{x.email}</small></Text>
            </Select.Option>))}
          </Select>
        </Form.Item>
        <Form.Item label="Period" name="cron" rules={[{ required: true, message: ' ' }]}>
          <Input autoSize={{ minRows: 3, maxRows: 20 }} maxLength={20} placeholder="Type here ..." allowClear disabled={loading} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" block htmlType="submit" disabled={loading} >Save</Button>
        </Form.Item>
      </Form>
    </StyledDrawer>
  );
};

RecurringForm.propTypes = {
  id: PropTypes.string.isRequired,
  visible: PropTypes.bool.isRequired,
};

RecurringForm.defaultProps = {
  visible: false,
};

export default withRouter(RecurringForm);
