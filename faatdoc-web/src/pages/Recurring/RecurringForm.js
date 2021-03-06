import { Button, Form, Select, Space, Typography, InputNumber } from 'antd';
import { CronInput } from 'components/CronInput';
import { PortfolioAvatar } from 'components/PortfolioAvatar';
import PropTypes from 'prop-types';
import React from 'react';
// import 'pages/AdminTask/node_modules/react-chat-elements/dist/main.css';
import { withRouter } from 'react-router-dom';
import { listTaskTemplate } from 'services/taskTemplateService';
import { listPortfolio } from 'services/portfolioService';
import { getRecurring, saveRecurring } from 'services/recurringService';
import styled from 'styled-components';

const { Text } = Typography;

const StyledPortfolioSelect = styled(Select)`
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
  const [taskTemplateList, setTaskTemplateList] = React.useState([]);
  const [portfolioList, setPortfolioList] = React.useState([]);
  const [initialValues, setInitialValues] = React.useState();

  const loadEntity = async () => {
    setLoading(true);
    const taskTemplateList = await listTaskTemplate();
    const portfolioList = await listPortfolio();
    if (id) {
      const recurring = await getRecurring(id);
      setInitialValues(recurring);
    }
    setTaskTemplateList(taskTemplateList);
    setPortfolioList(portfolioList);
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
        <Form.Item label="Task Template" name="taskTemplateId" rules={[{ required: true, message: ' ' }]}>
          <Select allowClear>
            {taskTemplateList.map((t, i) => (<Select.Option key={i} value={t.id}>
              {t.name}
            </Select.Option>))}
          </Select>
        </Form.Item>
        <Form.Item label="Client Portfolio" name="portfolioId" rules={[{ required: true, message: ' ' }]}>
          <StyledPortfolioSelect allowClear>
            {portfolioList.map((p, i) => (<Select.Option key={i} value={p.id}>
              <Space>
                <PortfolioAvatar value={p.name} id={p.id} size={40} />
                <div style={{display: 'flex', flexDirection: 'column'}}>
                  <div style={{margin: 0, lineHeight: '1rem'}}>{p.name}</div>
                  <Text style={{margin: 0, lineHeight: '0.8rem'}} type="secondary"><small>{p.email}</small></Text>
                </div>
              </Space>
            </Select.Option>))}
          </StyledPortfolioSelect>
        </Form.Item>
        <Form.Item
          label="Creation Period" name="cron" rules={[{ required: true, message: ' ' }]}
        // help={`Preview: ${cornPreview}`}
        >
          {/* <Input autoSize={{ minRows: 3, maxRows: 20 }} maxLength={20} placeholder="Type here ..." allowClear disabled={loading} /> */}
          <CronInput />
        </Form.Item>
        <Form.Item
          label="Due Day (+N days after the recurring executes)" name="dueDay" rules={[{ required: false, message: ' ', type: 'number', min: 1, max: 366 }]}
          help="When the recurring executes, this value will be used to automatically populate the 'Due Date' field (if defined) on the task template."
        >
          {/* <Input autoSize={{ minRows: 3, maxRows: 20 }} maxLength={20} placeholder="Type here ..." allowClear disabled={loading} /> */}
          {/* <Text type="secondary"><small>This will automatically fill the 'Due Date' field if it's defined on the task template when the recurring creates one.</small></Text> */}
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
