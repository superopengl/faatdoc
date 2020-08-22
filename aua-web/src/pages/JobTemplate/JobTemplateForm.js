import React from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Input, Button, Form, Select, DatePicker, Checkbox, Table, Space, Typography, AutoComplete } from 'antd';
import { FileUploader } from '../../components/FileUploader';
import * as moment from 'moment';
import { GlobalContext } from 'contexts/GlobalContext';
import { Menu, Dropdown, message, Tooltip } from 'antd';
import { UpOutlined, DownOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Divider } from 'antd';
import { BuiltInFieldName } from 'components/FieldDef';
import { normalizeFieldNameToVar } from 'util/normalizeFieldNameToVar';
import { displayNameAsLabel } from 'util/displayNameAsLabel';

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


const EMPTY_ROW = {
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

  const nameOptions = BuiltInFieldName.map(x => ({value: displayNameAsLabel(x)}));

  const columns = [
    {
      title: 'No',
      render: (text, records, index) => <>{index + 1}</>
    },
    {
      title: 'Name',
      dataIndex: 'name',
      render: (text, records, index) => {
        return <AutoComplete 
        placeholder="Name" 
        options={nameOptions} allowClear={true} 
        maxLength={50} 
        value={displayNameAsLabel(text)} 
        style={{width: 200}}
        allowClear={true}
        onChange={(value) => changeValue(index, 'name', value)} />
      }
    },
    {
      title: 'Required',
      dataIndex: 'required',
      render: (value, records, index) => <Checkbox checked={value} onChange={(e) => changeValue(index, 'required', e.target.checked)} />
    },
    {
      title: 'Type',
      dataIndex: 'type',
      render: (value, records, index) => <Select value={value} style={{ width: '100%' }} onChange={(v) => changeValue(index, 'type', v)}>
        <Select.Option value="text">Text</Select.Option>
        <Select.Option value="paragraph">Paragraph</Select.Option>
        <Select.Option value="number">Number</Select.Option>
        <Select.Option value="date">Date</Select.Option>
        <Select.Option value="year">Year</Select.Option>
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
        size="small"
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
