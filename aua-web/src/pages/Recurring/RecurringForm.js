import React from 'react';
import PropTypes from 'prop-types';

import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Input, Button, Form, Select, DatePicker, Layout, Drawer, Space, Typography, InputNumber, Row, Col } from 'antd';
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
import { deleteLodgement, generateLodgement, notifyLodgement, listLodgementNotifies } from 'services/lodgementService';
import { listPortofolio } from 'services/portofolioService';
import { varNameToLabelName } from 'util/varNameToLabelName';
import { InputYear } from 'components/InputYear';
import { DateInput } from 'components/DateInput';
import 'react-chat-elements/dist/main.css';
import { Button as ChatButton, Input as ChatInput, ChatItem, MessageBox } from 'react-chat-elements'
import { getRecurring, saveRecurring } from 'services/recurringService';
import { PortofolioAvatar } from 'components/PortofolioAvatar';
import { CronInput } from 'components/CronInput';

const { Text, Paragraph, Title } = Typography;


const StyledReceivedMessageBox = styled(MessageBox)`
.rce-mbox {
  // background-color: #143e86;
  // color: rgba(255,255,255,0.9);
}
`;

const StyledPortofolioSelect = styled(Select)`
  .ant-select-selector {
    height: 50px !important;
    padding-top: 4px !important;
    padding-bottom: 4px !important;
  }
`;

const RecurringForm = (props) => {
  const { id } = props;
  // const { name, id, fields } = value || {};

  const isNew = !id;
  const [loading, setLoading] = React.useState(false);
  const [form] = Form.useForm();
  const [recurring, setRecurring] = React.useState();
  const [jobTemplateList, setJobTemplateList] = React.useState([]);
  const [portofolioList, setPortofolioList] = React.useState([]);
  const [initialValues, setInitialValues] = React.useState(null);

  const loadEntity = async () => {
    setLoading(true);
    const jobTemplateList = await listJobTemplate();
    const portofolioList = await listPortofolio();
    if (id) {
      const recurring = await getRecurring(id);
      setRecurring(recurring);
      setInitialValues(recurring);
    }
    setJobTemplateList(jobTemplateList);
    setPortofolioList(portofolioList);
    setLoading(false);
  }

  const handleSaveRecurring = async (values) => {
    const { jobTemplateId, portofolioId, nameTemplate, cron } = values;
    const recurring = {
      id,
      ...values
    }

    await saveRecurring(recurring);
    props.onOk();
  }

  React.useEffect(() => {
    loadEntity();
  }, [id]);

  return <>
     {!loading && <Form layout="vertical" onFinish={handleSaveRecurring} form={form} initialValues={initialValues}>
       <Space direction="vertical" size="middle">
        <Form.Item label="Job Template" name="jobTemplateId" rules={[{ required: true, message: ' ' }]}>
          <Select allowClear>
            {jobTemplateList.map((x, i) => (<Select.Option key={i} value={x.id}>
              {x.name}
            </Select.Option>))}
          </Select>
        </Form.Item>
        <Form.Item label="Client Portofolio" name="portofolioId" rules={[{ required: true, message: ' ' }]}>
          <StyledPortofolioSelect allowClear>
            {portofolioList.map((x, i) => (<Select.Option key={i} value={x.id}>
              <PortofolioAvatar value={x.name} size={40}/> {x.name} <Text type="secondary"><small> - {x.email}</small></Text>
            </Select.Option>))}
          </StyledPortofolioSelect>
        </Form.Item>
        <Form.Item label="Lodgement Name Template" 
        help={<>The information is being validated... The supported date time formats are <Text code>DD MMM YYYY</Text></>}
        name="nameTemplate" 
        rules={[{ required: true, message: ' ', max: 100, whitespace: true }]}>
          <Input maxLength={100}/>
        </Form.Item>
        <Form.Item 
        label="Creation Period" name="cron" rules={[{ required: true, message: ' ' }]}
        // help={`Preview: ${cornPreview}`}
        >
          {/* <Input autoSize={{ minRows: 3, maxRows: 20 }} maxLength={20} placeholder="Type here ..." allowClear disabled={loading} /> */}
          <CronInput/>
        </Form.Item>
        <Form.Item 
        label="Due Day (+N days after the recurring executes)" name="dueDay" rules={[{ required: false, message: ' ', type: 'number', min: 1, max: 31 }]}
        help="When the recurring executes, this value will be used to automatically populate the 'Due Date' field (if defined) on the job template."
        >
          {/* <Input autoSize={{ minRows: 3, maxRows: 20 }} maxLength={20} placeholder="Type here ..." allowClear disabled={loading} /> */}
          {/* <Text type="secondary"><small>This will automatically fill the 'Due Date' field if it's defined on the job template when the recurring creates one.</small></Text> */}
          <Select>
            <Select.Option value={null}> </Select.Option>
            {new Array(31).fill(null).map((x, i) => <Select.Option key={i} value={i + 1}>{i + 1}</Select.Option>)}
          </Select>
          {/* <InputNumber min={1} max={31} /> */}

        </Form.Item>
        <Form.Item>
          <Button type="primary" block htmlType="submit" disabled={loading} >Save</Button>
        </Form.Item>
        </Space>
      </Form>}
  </>;
};

RecurringForm.propTypes = {
  id: PropTypes.string,
  visible: PropTypes.bool.isRequired,
};

RecurringForm.defaultProps = {
  visible: false,
};

export default withRouter(RecurringForm);
