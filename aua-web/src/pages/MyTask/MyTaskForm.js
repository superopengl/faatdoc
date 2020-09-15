import { BellOutlined } from '@ant-design/icons';
import { Affix, Button, Form, Input, Radio, Space, Typography } from 'antd';
import { DateInput } from 'components/DateInput';
import { RangePickerInput } from 'components/RangePickerInput';
import TaskChat from 'pages/AdminTask/TaskChat';
import PropTypes from 'prop-types';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { generateTask, getTask, saveTask } from 'services/taskService';
import styled from 'styled-components';
import { varNameToLabelName } from 'util/varNameToLabelName';
import { FileUploader } from '../../components/FileUploader';
import { TaskGenerator } from './TaskGenerator';


const { Text } = Typography;

const AffixContactButton = styled(Button)`
width: 60px;
height: 60px;
display: flex;
align-items: center;
justify-content: center;
border: none;
background-color: rgba(255,77,79, 0.8);
color: white;
// box-shadow: 1px 1px 5px #222222;
border: 2px solid white;

&:focus,&:hover,&:active {
color: white;
background-color: rgba(20, 62, 134, 0.8);
border: 2px solid white;
}
`;

const MyTaskForm = (props) => {
  const { id, jobTemplateList, portofolioList, showsAll } = props;

  const isNew = !id;
  // const { name, id, fields } = value || {};

  const [loading, setLoading] = React.useState(true);
  const [showsMessage, setShowsMessage] = React.useState(false);
  const [form] = Form.useForm();

  const [task, setTask] = React.useState();

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

  const handleSubmit = async (values) => {
    // debugger;
    setLoading(true);
    try {
      await saveTask({ ...task, ...values, status: 'todo' });
      // form.resetFields();
      await props.onChange();
    } finally {
      setLoading(false);
    }
  }

  const handleSelectedTemplate = async (values) => {
    setLoading(true);
    const { jobTemplateId, portofolioId } = values;
    const task = await generateTask(jobTemplateId, portofolioId);
    setTask(task);
    setLoading(false);
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

  const checkIfCanEdit = (task) => {
    if (loading) return false;
    if (!task) return false;
    const { status } = task;
    return status === 'todo';
  }

  const canEdit = checkIfCanEdit(task);
  const disabled = !canEdit || loading;

  // console.log('value', formInitValues);
  const showsGenerator = !loading && !task && jobTemplateList && portofolioList;

  return (<>
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {showsGenerator && <TaskGenerator onChange={handleSelectedTemplate} jobTemplateList={jobTemplateList} portofolioList={portofolioList} />}

      {task && <>
        <Form form={form} layout="vertical"
          onValuesChange={handleValuesChange}
          onFinish={handleSubmit}
          style={{ textAlign: 'left' }} initialValues={getFormInitialValues()}>
          <Form.Item label="Task Name" name="name" rules={[{ required: true }]}>
            <Input disabled={disabled} />
          </Form.Item>

          {task.fields.filter(field => showsAll || !field.officialOnly).map((field, i) => {
            const { name, description, type, required } = field;
            const formItemProps = {
              label: <>{varNameToLabelName(name)}{description && <Text type="secondary"> ({description})</Text>}</>,
              name,
              rules: [{ required }]
            }
            return (
              <Form.Item key={i} {...formItemProps}>
                {type === 'text' ? <Input disabled={disabled} /> :
                  type === 'year' ? <DateInput picker="year" placeholder="YYYY" disabled={disabled} /> :
                    type === 'monthRange' ? <RangePickerInput picker="month" disabled={disabled} /> :
                      type === 'number' ? <Input disabled={disabled} type="number" pattern="[0-9.]*" /> :
                        type === 'paragraph' ? <Input.TextArea disabled={disabled} /> :
                          type === 'date' ? <DateInput picker="date" disabled={disabled} placeholder="DD/MM/YYYY" style={{ display: 'block' }} format="YYYY-MM-DD" /> :
                            type === 'upload' ? <FileUploader disabled={disabled} /> :
                              type === 'select' ? <Radio.Group disabled={disabled} buttonStyle="solid">
                                {field.options?.map((x, i) => <Radio key={i} style={{ display: 'block', height: '2rem' }} value={x.value}>{x.label}</Radio>)}
                              </Radio.Group> :
                                null}
              </Form.Item>
            );
          })}
          {/* {canEdit && <Form.Item>
            <Button key="save" block ghost type="primary" disabled={disabled} onClick={() => saveDraft()}>Save</Button>
          </Form.Item>} */}
          {canEdit && <Form.Item>
            <Button key="submit" block type="primary" htmlType="submit" disabled={disabled}>Save and Submit</Button>
          </Form.Item>}
        </Form>
      </>}
    </Space>
    {task && <TaskChat visible={showsMessage} onClose={() => setShowsMessage(false)} taskId={task?.id} />}
    <Affix style={{ position: 'fixed', bottom: 30, right: 30 }}>
      <AffixContactButton type="primary" shape="circle" size="large" 
      onClick={() => setShowsMessage(true)}
      style={{fontSize: 24}}
      >
        <BellOutlined />
      </AffixContactButton>
    </Affix>
  </>
  );
};

MyTaskForm.propTypes = {
  id: PropTypes.string,
  showsAll: PropTypes.bool.isRequired
};

MyTaskForm.defaultProps = {
  showsAll: false
};

export default withRouter(MyTaskForm);
