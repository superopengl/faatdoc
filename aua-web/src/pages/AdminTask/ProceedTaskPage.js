import React from 'react';
import PropTypes from 'prop-types';

import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Input, Button, Form, PageHeader, Space, Layout, Modal, Typography, Radio, Row, Col } from 'antd';
import { FileUploader } from 'components/FileUploader';
import HomeHeader from 'components/HomeHeader';

import { Divider } from 'antd';
import { deleteTask, getTask, saveTask, completeTask, notifyTask } from '../../services/taskService';
import { varNameToLabelName } from 'util/varNameToLabelName';
import { DateInput } from 'components/DateInput';
import TaskChat from './TaskChat';
import { TaskProgressBar } from 'components/TaskProgressBar';
import { RangePickerInput } from 'components/RangePickerInput';

const { Text } = Typography;
const ContainerStyled = styled.div`
  margin: 5rem auto 0 auto;
  padding: 1rem;
  max-width: 900px;
  width: 100%;
  display: flex;
`;


const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;

  .ant-page-header {
    padding: 0;
  }
`;

const ProceedTaskPage = (props) => {
  const id = props.match.params.id;
  // const { name, id, fields } = value || {};

  const [loading, setLoading] = React.useState(true);
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

  React.useEffect(() => {
    loadEntity();
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

  const handleArchive = () => {
    const { id, name } = task;
    Modal.confirm({
      title: 'Archive this task?',
      okText: 'Yes, Archive it',
      onOk: async () => {
        await deleteTask(id);
        props.history.push('/task');
      },
      maskClosable: true,
      okButtonProps: {
        danger: true
      }
    });
  }

  const handleCompleteTask = () => {
    Modal.confirm({
      title: 'Complete this task',
      okText: 'Yes, Complete it',
      maskClosable: true,
      onOk: async () => {
        await completeTask(task.id);
        goToListPage();
      }
    })
  }

  const handleRequestSign = async () => {
    const signFiles = task.fields.find(x => x.name === 'requireSign');
    if (!signFiles?.value?.length) {
      Modal.error({
        title: 'Cannot request sign',
        maskClosable: true,
        content: `No files to require sign. Please upload files to the 'Require Sign' field before request sign.`
      });
      return;
    }
    task.status = 'to_sign';
    setLoading(true);
    await saveTask(task);
    await notifyTask(task.id, `The task is waiting for your signature. Please view the documents and sign if OK.`);
    loadEntity();
    setLoading(false);
  }

  const handleMessage = () => {
    setShowsNotify(true);
  }

  const inputDisabled = loading || ['archive', 'done'].includes(task.status);
  const archiveDisabled = loading || ['todo', 'archive', 'done'].includes(task.status);
  const completeDisabled = loading || ['todo', 'archive', 'done'].includes(task.status);
  const requiresSignDisabled = loading || 'todo' !== task.status;
  const communicateDisabled = loading;
  const saveDisabled = loading || ['archive', 'done', 'signed'].includes(task.status);

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
          subTitle={<TaskProgressBar status={task.status} width={60} />}
        >
        </PageHeader>
        <Space style={{width: '100%', justifyContent: 'flex-end'}}>
          <Button key="1" type="primary" danger disabled={archiveDisabled} onClick={() => handleArchive()}>Archive</Button>
          <Button key="2" type="primary" ghost disabled={completeDisabled} onClick={() => handleCompleteTask()}>Complete</Button>
          <Button key="3" type="primary" ghost disabled={requiresSignDisabled} onClick={() => handleRequestSign()}>Request Sign</Button>
          <Button key="4" type="primary" ghost disabled={communicateDisabled} onClick={() => handleMessage()}>Notify</Button>
          <Button key="5" type="primary" htmlType="submit" disabled={saveDisabled}>Save</Button>
        </Space>
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
                  {type === 'text' ? <Input disabled={inputDisabled} /> :
                    type === 'year' ? <DateInput picker="year" placeholder="YYYY" disabled={inputDisabled} /> :
                      type === 'monthRange' ? <RangePickerInput picker="month" disabled={inputDisabled} /> :
                        type === 'number' ? <Input disabled={inputDisabled} type="number" /> :
                          type === 'paragraph' ? <Input.TextArea disabled={inputDisabled} /> :
                            type === 'date' ? <DateInput picker="date" disabled={inputDisabled} placeholder="DD/MM/YYYY" style={{ display: 'block' }} format="YYYY-MM-DD" /> :
                              type === 'select' ? <Radio.Group disabled={inputDisabled} buttonStyle="solid">
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
                  <FileUploader disabled={inputDisabled} />
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

  </LayoutStyled >

  );
};

ProceedTaskPage.propTypes = {
  id: PropTypes.string
};

ProceedTaskPage.defaultProps = {};

export default withRouter(ProceedTaskPage);
