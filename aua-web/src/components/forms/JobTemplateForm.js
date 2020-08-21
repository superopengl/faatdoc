import React from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Input, Button, Form, Select, DatePicker, Checkbox, Table, Space, Typography } from 'antd';
import { FileUploader } from '../FileUploader';
import * as moment from 'moment';
import { GlobalContext } from 'contexts/GlobalContext';
import { Menu, Dropdown, message, Tooltip } from 'antd';
import { UpOutlined, DownOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Divider } from 'antd';

const { Text } = Typography;

const StyledFormItem = styled(Form.Item)`
  // padding: 2rem;
  // margin: 1rem 0;
  // border: 1px solid #eeeeee;
  // border-radius: 8px;
  // background-color: #ffffff;
`

const getInputFor = (type, props) => {
  switch (type) {
    case 'text':
      return <Input allowClear={true} type="text" {...props} />;
    case 'number':
      return <Input allowClear={true} type="number" {...props} />;
    case 'paragraph':
      return <Input.TextArea maxLength={1000} allowClear={true} {...props} />;
    case 'date':
      return <DatePicker style={{ display: 'block' }} format="YYYY-MM-DD" {...props} />;
    case 'upload':
      return <FileUploader {...props} />;
    default:
      throw new Error(`Unsupported job template field type '${type}`);
  }
}


const JobTemplateField = (props) => {
  const { label, name, required, type } = props;
  const InputComponent = getInputFor(type, props);
  return (
    <StyledFormItem label={label} name={name} rules={[{ required, whitespace: true, message: ' ' }]}>
      <InputComponent />
    </StyledFormItem>
  );
}




const EMPTY_ROW = {
  label: '',
  name: '',
  required: true,
  type: 'text'
}



const JobTemplateForm = (props) => {

  const { initialValue } = props;

  const [data, setData] = React.useState(initialValue?.fields || []);
  const [jobName, setJobName] = React.useState(initialValue?.name);


  const goBack = () => {
    props.history.goBack();
  }

  const handleSubmit = async values => {
    if (values.dob) {
      values.dob = values.dob.utc().format('YYYY-MM-DD');
    }
    await props.onOk(values);
  }


  const { mode, initialValues, loading } = props;
  const isSignUp = mode === 'signup';
  const isEditProfile = mode === 'profile';

  const formInitValues = {
    ...initialValues,
    dob: initialValues && initialValues.dob ? moment(initialValues.dob) : undefined
  };

  const isEmailDisable = isEditProfile || loading;

  const addNewRow = () => {
    data.push({ ...EMPTY_ROW });
    setData([...data]);
  }

  const moveUp = (index) => {
    if (index <= 0) return;
    const current = data[index];
    data[index] = data[index - 1];
    data[index - 1] = current;
    setData([...data]);
  }

  const moveDown = (index) => {
    if (index >= data.length - 1) return;
    const current = data[index];
    data[index] = data[index + 1];
    data[index + 1] = current;
    setData([...data]);
  }

  const deleteRow = (index) => {
    data.splice(index, 1);
    setData([...data]);
  }

  const changeValue = (index, name, v) => {
    data[index][name] = v;
    setData([...data]);
  }

  const handleOk = () => {
    const job = {
      ...initialValue,
      name: jobName,
      fields: data
    }
    props.onOk(job);
  }

  const handleCancel = () => {
    props.onCancel();
  }

  const columns = [
    {
      title: 'No',
      render: (text, records, index) => <>{index + 1}</>
    },
    {
      title: 'Label',
      dataIndex: 'label',
      render: (text, records, index) => {
        return <Input placeholder="label" type="text" allowClear={true} maxLength={50} value={text} onChange={(e) => changeValue(index, 'label', e.target.value)} />
      }
    },
    {
      title: 'Name',
      dataIndex: 'name',
      render: (text, records, index) => <Input placeholder="name" type="text" allowClear={true} maxLength={50} value={text} onChange={(e) => changeValue(index, 'name', e.target.value)} />
    },
    {
      title: 'Required',
      dataIndex: 'required',
      render: (value, records, index) => <Checkbox checked={value} onChange={(e) => changeValue(index, 'required', e.target.checked)} />
    },
    {
      title: 'Type',
      dataIndex: 'type',
      render: (value, records, index) => <Select value={value} style={{ width: 120 }} onChange={(v) => changeValue(index, 'type', v)}>
        <Select.Option value="text">Text</Select.Option>
        <Select.Option value="paragraph">Paragraph</Select.Option>
        <Select.Option value="number">Number</Select.Option>
        <Select.Option value="date">Date</Select.Option>
        <Select.Option value="upload">Upload Files</Select.Option>
      </Select>
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record, index) => (
        <Space size="middle">
          <Button type="link" icon={<UpOutlined />} onClick={() => moveUp(index)} />
          <Button type="link" icon={<DownOutlined />} onClick={() => moveDown(index)} />
          <Button type="link" icon={<DeleteOutlined />} onClick={() => deleteRow(index)} />
        </Space>
      ),
    },
  ];


  return (<>
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <Text>Job Template Name</Text>
        <Input placeholder="Job Template Name" value={jobName} onChange={e => setJobName(e.target.value)} />
      </Space>
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <Text>Job Fields</Text>
      <Table
        style={{ width: '100%' }}
        columns={columns}
        dataSource={[...data]}
        pagination={false}
        footer={() => <>
          <Button icon={<PlusOutlined />} onClick={addNewRow}>Add New Row</Button>
        </>}
      />
      </Space>
      {/* <Divider/> */}
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <Button block type="primary" onClick={() => handleOk()}>Save</Button>
        <Button block type="link" onClick={() => handleCancel()}>Cancel</Button>
      </Space>
    </Space>
  </>
  );
};

JobTemplateForm.propTypes = {};

JobTemplateForm.defaultProps = {};

export default withRouter(JobTemplateForm);
