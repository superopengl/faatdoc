import { Button, Form, Input, Select, Space, Typography, InputNumber } from 'antd';
import { CronInput } from 'components/CronInput';
import { PortofolioAvatar } from 'components/PortofolioAvatar';
import PropTypes from 'prop-types';
import React from 'react';
import 'react-chat-elements/dist/main.css';
import { withRouter } from 'react-router-dom';
import { listJobTemplate } from 'services/jobTemplateService';
import { listPortofolio } from 'services/portofolioService';
import { getRecurring, saveRecurring } from 'services/recurringService';
import styled from 'styled-components';

const { Text } = Typography;

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

  const [loading, setLoading] = React.useState(true);
  const [form] = Form.useForm();
  const [jobTemplateList, setJobTemplateList] = React.useState([]);
  const [portofolioList, setPortofolioList] = React.useState([]);
  const [initialValues, setInitialValues] = React.useState();

  const loadEntity = async () => {
    setLoading(true);
    const jobTemplateList = await listJobTemplate();
    const portofolioList = await listPortofolio();
    if (id) {
      const recurring = await getRecurring(id);
      setInitialValues(recurring);
    }
    setJobTemplateList(jobTemplateList);
    setPortofolioList(portofolioList);
    setLoading(false);
  }

  const handleSaveRecurring = async (values) => {
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
      <Space direction="vertical" size="small">
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
              <Space>
                <PortofolioAvatar value={x.name} size={40} />
                <div style={{display: 'flex', flexDirection: 'column'}}>
                  <div style={{margin: 0, lineHeight: '1rem'}}>{x.name}</div>
                  <Text style={{margin: 0, lineHeight: '0.8rem'}} type="secondary"><small>{x.email}</small></Text>
                </div>
              </Space>
            </Select.Option>))}
          </StyledPortofolioSelect>
        </Form.Item>
        {/* <Form.Item label="Task Name Template"
          help={<>Supported variables: <br /><Text code>{'{{createdDate}}'}</Text> for the creation date, like '09 Sep 2020'</>}
          name="nameTemplate"
          rules={[{ required: true, message: ' ', max: 100, whitespace: true }]}>
          <Input maxLength={100} />
        </Form.Item> */}
        <Form.Item
          label="Creation Period" name="cron" rules={[{ required: true, message: ' ' }]}
        // help={`Preview: ${cornPreview}`}
        >
          {/* <Input autoSize={{ minRows: 3, maxRows: 20 }} maxLength={20} placeholder="Type here ..." allowClear disabled={loading} /> */}
          <CronInput />
        </Form.Item>
        <Form.Item
          label="Due Day (+N days after the recurring executes)" name="dueDay" rules={[{ required: false, message: ' ', type: 'number', min: 1, max: 366 }]}
          help="When the recurring executes, this value will be used to automatically populate the 'Due Date' field (if defined) on the job template."
        >
          {/* <Input autoSize={{ minRows: 3, maxRows: 20 }} maxLength={20} placeholder="Type here ..." allowClear disabled={loading} /> */}
          {/* <Text type="secondary"><small>This will automatically fill the 'Due Date' field if it's defined on the job template when the recurring creates one.</small></Text> */}
          {/* <Select>
            <Select.Option value={null}> </Select.Option>
            {new Array(31).fill(null).map((x, i) => <Select.Option key={i} value={i + 1}>{i + 1}</Select.Option>)}
          </Select> */}
          <InputNumber min={1} max={366} />

        </Form.Item>
        <Form.Item style={{ marginTop: '1rem' }}>
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
