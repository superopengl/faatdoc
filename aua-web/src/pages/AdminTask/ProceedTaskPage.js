import React from 'react';
import PropTypes from 'prop-types';

import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Input, Button, Form, PageHeader, Space, Layout, Drawer, Typography, Radio, Row, Col } from 'antd';
import { FileUploader } from 'components/FileUploader';
import HomeHeader from 'components/HomeHeader';

import { Divider } from 'antd';
import { getTask, saveTask } from '../../services/taskService';
import { varNameToLabelName } from 'util/varNameToLabelName';
import { DateInput } from 'components/DateInput';
import TaskChat from './TaskChat';
import { RangePickerInput } from 'components/RangePickerInput';
import { Select } from 'antd';
import FieldEditor from 'components/FieldEditor';
import { SyncOutlined } from '@ant-design/icons';

const { Text } = Typography;
const ContainerStyled = styled.div`
  margin: 5rem auto 0 auto;
  padding: 1rem;
  max-width: 900px;
  width: 100%;
  display: flex;
`;


const StyledDrawer = styled(Drawer)`
.ant-drawer-content-wrapper {
  max-width: 90vw;
}
`;

const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;

  .ant-page-header {
    padding: 0;
  }
`;

const StatusSelect = styled(Select)`
&.archive {
  .ant-select-selector {
    background: #ff4d4f;
    border-color: #ff4d4f;
  }

  * {
    color: #ffffff;
  }
}

&.complete {
  .ant-select-selector {
    background: #52c41a;
    border-color: #52c41a;
  }

  * {
    color: #ffffff;
  }
}

&.signed, &.to_sign, &.todo {
  .ant-select-selector {
    background: #1890ff;
    border-color: #1890ff;
  }

  * {
    color: #ffffff;
  }
}
`

const ProceedTaskPage = (props) => {
  const id = props.match.params.id;
  // const { name, id, fields } = value || {};

  const [loading, setLoading] = React.useState(true);
  const [drawerVisible, setDrawerVisible] = React.useState(false);
  const [form] = Form.useForm();

  const [task, setTask] = React.useState();
  const [showsNotify, setShowsNotify] = React.useState(false);


  const loadEntity = async () => {
    setLoading(true);
    if (id) {
      const task = await getTask(id);
      setTask(task);
    }
    setLoading(false);
  }

  const initialLoadEntity = React.useCallback(() => loadEntity());

  React.useEffect(() => {
    initialLoadEntity();
  }, [])

  const updateLodgmentWithFormValues = values => {
    task.name = values.name;

    task.fields.forEach(field => {
      field.value = values[field.name];
    })

    return task;
  }

  const handleValuesChange = (changedValues, allValues) => {
    const lodgment = updateLodgmentWithFormValues(allValues);
    setTask({ ...lodgment });
  }

  const handleSubmit = async () => {

    // debugger;
    setLoading(true);
    await saveTask({ ...task });
    // form.resetFields();
    setLoading(false);
  }

  const handleCancel = () => {
    goToListPage();
  }

  const goToListPage = () => {
    props.history.push('/task');
  }

  const getFormInitialValues = () => {
    const values = {
      name: task?.name || 'New Task',
      status: task?.status || 'todo'
    };
    if (task && task.fields) {
      for (const f of task.fields) {
        values[f.name] = f.value;
      }
    }
    return values;
  }

  const handleMessage = () => {
    setShowsNotify(true);
  }

  const handleStatusChange = async option => {
    const value = option?.value;
    if (!value) return;
    if (value !== task.status) {
      task.status = value;
      setLoading(true);
      await saveTask(task);
      loadEntity();
    }
  }

  const status = task?.status;
  const defaultStatus = {
    todo: 'To Do',
    to_sign: 'To Sign',
    signed: 'Signed',
    complete: 'Complete',
    archive: 'Archive'
  }[status];

  const options = [
    { value: 'todo', label: 'To Do' },
    { value: 'to_sign', label: 'To Sign' },
    { value: 'signed', label: 'Signed' },
    { value: 'complete', label: <Text type="success">Complete</Text> },
    { value: 'archive', label: <Text type="danger">Archive</Text> },
  ];

  const handleModifyFields = () => {
    setDrawerVisible(true);
  }

  const handleFieldChange = async value => {
    task.fields = value;
    setDrawerVisible(false);
    await handleSubmit();
    await loadEntity();
  }

  return (<LayoutStyled>
    <HomeHeader></HomeHeader>
    <ContainerStyled>
      {task && <Form form={form} layout="vertical"
        onValuesChange={handleValuesChange}
        onFinish={handleSubmit}
        style={{ textAlign: 'left', width: '100%' }} initialValues={getFormInitialValues()}>
        <PageHeader
          onBack={() => handleCancel()}
          title={task.name}
          // subTitle={<TaskProgressBar status={task.status} width={60} />}
          extra={[
            <Space key="1" style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button type="primary" ghost disabled={loading} icon={<SyncOutlined />} onClick={() => loadEntity()}></Button>
              <Button type="primary" ghost disabled={loading} onClick={() => handleMessage()}>Notify</Button>
              <Button type="primary" ghost disabled={loading} onClick={() => handleModifyFields()}>Modify Fields</Button>
              <Button type="primary" htmlType="submit" disabled={loading}>Save</Button>
              <StatusSelect defaultValue={{ value: defaultStatus }}
                labelInValue={true}
                style={{ width: 120 }}
                className={status}
                onChange={handleStatusChange}
              >
                {options
                  .filter(x => x.value !== status)
                  .map((x, i) => <Select.Option key={i} value={x.value}>{x.label}</Select.Option>)}
              </StatusSelect>
            </Space>
          ]}
        >
        </PageHeader>

        <Divider />
        <Row gutter={32}>
          <Col span={12}>
            {task.fields.filter(f => f.type !== 'upload').map((field, i) => {
              const { name, description, type } = field;
              const formItemProps = {
                label: <>{varNameToLabelName(name)}{description && <Text type="secondary"> ({description})</Text>}</>,
                name,
                // rules: [{ required }]
              }
              return (
                <Form.Item key={i} {...formItemProps}>
                  {type === 'text' ? <Input disabled={loading} /> :
                    type === 'year' ? <DateInput picker="year" placeholder="YYYY" disabled={loading} /> :
                      type === 'monthRange' ? <RangePickerInput picker="month" disabled={loading} /> :
                        type === 'number' ? <Input disabled={loading} type="number" /> :
                          type === 'paragraph' ? <Input.TextArea disabled={loading} /> :
                            type === 'date' ? <DateInput picker="date" disabled={loading} placeholder="DD/MM/YYYY" style={{ display: 'block' }} format="YYYY-MM-DD" /> :
                              type === 'select' ? <Radio.Group disabled={loading} buttonStyle="solid">
                                {field.options?.map((x, i) => <Radio key={i} style={{ display: 'block', height: '2rem' }} value={x.value}>{x.label}</Radio>)}
                              </Radio.Group> :
                                null}
                </Form.Item>
              );
            })}
          </Col>
          <Col span={12}>
            {task.fields.filter(f => f.type === 'upload').map((field, i) => {
              const { name, description } = field;
              const formItemProps = {
                label: <>{varNameToLabelName(name)}{description && <Text type="secondary"> ({description})</Text>}</>,
                name,
                // rules: [{ required }]
              }
              return (
                <Form.Item key={i} {...formItemProps} >
                  <FileUploader disabled={loading} />
                </Form.Item>
              );
            })}
          </Col>
        </Row>

      </Form>
      }
      {/* <Divider type="vertical" style={{ height: "100%" }} /> */}
    </ContainerStyled>

    {(task && showsNotify) && <TaskChat visible={showsNotify} onClose={() => setShowsNotify(false)} taskId={task?.id} />}

    <StyledDrawer
      title="Modify Task Fields"
      placement="right"
      closable={true}
      visible={drawerVisible}
      onClose={() => setDrawerVisible(false)}
      destroyOnClose={true}
      width={900}
      footer={null}
    >
      <FieldEditor value={task?.fields} onChange={handleFieldChange} onCancel={() => setDrawerVisible(false)} />
    </StyledDrawer>
  </LayoutStyled >

  );
};

ProceedTaskPage.propTypes = {
  id: PropTypes.string
};

ProceedTaskPage.defaultProps = {};

export default withRouter(ProceedTaskPage);
