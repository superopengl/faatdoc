import { BellOutlined, MessageOutlined } from '@ant-design/icons';
import { Affix, Button, Form, Input, Radio, Space, Typography } from 'antd';
import { DateInput } from 'components/DateInput';
import { RangePickerInput } from 'components/RangePickerInput';
import JobChat from 'pages/AdminJob/JobChat';
import PropTypes from 'prop-types';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { generateJob, getJob, saveJob } from 'services/jobService';
import styled from 'styled-components';
import { varNameToLabelName } from 'util/varNameToLabelName';
import { FileUploader } from '../../components/FileUploader';
import JobGenerator from './JobGenerator';
import * as queryString from 'query-string';


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

const MyJobForm = (props) => {
  const { id, showsAll } = props;

  const { chat } = queryString.parse(props.location.search);

  const [loading, setLoading] = React.useState(true);
  const [chatVisible, setChatVisible] = React.useState(Boolean(chat));
  const [form] = Form.useForm();

  const [job, setJob] = React.useState();

  const loadEntity = async () => {
    setLoading(true);
    if (id) {
      const job = await getJob(id);
      setJob(job);
    }
    setLoading(false);
  }

  React.useEffect(() => {
    loadEntity();
  }, [])

  const updateLodgmentWithFormValues = values => {
    job.name = values.name;

    job.fields.forEach(field => {
      field.value = values[field.name];
    })

    return job;
  }

  const handleValuesChange = (changedValues, allValues) => {
    const lodgment = updateLodgmentWithFormValues(allValues);
    setJob({ ...lodgment });
  }

  const handleSubmit = async (values) => {
    // debugger;
    setLoading(true);
    try {
      await saveJob({ ...job, ...values, status: 'todo' });
      // form.resetFields();
      setLoading(false);
      props.onChange();
    } catch {
      setLoading(false);
    }
  }

  const handleSelectedTemplate = async (values) => {
    setLoading(true);
    const { jobTemplateId, portofolioId } = values;
    const job = await generateJob(jobTemplateId, portofolioId);
    setJob(job);
    setLoading(false);
  }

  const getFormInitialValues = () => {
    const values = {
      name: job?.name || 'New Job',
      status: job?.status || 'todo'
    };
    if (job && job.fields) {
      for (const f of job.fields) {
        values[f.name] = f.value;
      }
    }
    return values;
  }

  const checkIfCanEdit = (job) => {
    if (loading) return false;
    if (!job) return false;
    const { status } = job;
    return status === 'todo';
  }

  const canEdit = checkIfCanEdit(job);
  const disabled = !canEdit || loading;

  // console.log('value', formInitValues);
  const showsGenerator = !loading && !job;

  return (<>
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {showsGenerator && <JobGenerator onChange={handleSelectedTemplate} />}

      {job && <>
        <Form form={form} layout="vertical"
          onValuesChange={handleValuesChange}
          onFinish={handleSubmit}
          style={{ textAlign: 'left' }} initialValues={getFormInitialValues()}>
          <Form.Item label="Job Name" name="name" rules={[{ required: true }]}>
            <Input disabled={disabled} />
          </Form.Item>

          {job.fields.filter(field => showsAll || !field.officialOnly).map((field, i) => {
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
    {!!job?.id && <>
      <JobChat visible={chatVisible} onClose={() => setChatVisible(false)} jobId={job.id} />
      <Affix style={{ position: 'fixed', bottom: 30, right: 30 }}>
        <AffixContactButton type="primary" shape="circle" size="large"
          onClick={() => setChatVisible(true)}
          style={{ fontSize: 24 }}
        >
          <MessageOutlined />
        </AffixContactButton>
      </Affix>
    </>}
  </>
  );
};

MyJobForm.propTypes = {
  id: PropTypes.string,
  showsAll: PropTypes.bool.isRequired
};

MyJobForm.defaultProps = {
  showsAll: false
};

export default withRouter(MyJobForm);
