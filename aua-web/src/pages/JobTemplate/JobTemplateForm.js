import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Input, Button, Form, Select, DatePicker, Checkbox, Table, Space, Typography, AutoComplete, Modal } from 'antd';
import { FileUploader } from '../../components/FileUploader';
import * as moment from 'moment';
import { GlobalContext } from 'contexts/GlobalContext';
import { Menu, Dropdown, message, Tooltip } from 'antd';
import { UpOutlined, DownOutlined, DeleteOutlined, PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { Divider } from 'antd';
import { BuiltInFieldName } from 'components/FieldDef';
import { normalizeFieldNameToVar } from 'util/normalizeFieldNameToVar';
import { displayNameAsLabel } from 'util/displayNameAsLabel';
import { listJobTemplate, deleteJobTemplate, saveJobTemplate, getJobTemplate } from 'services/jobTemplateService';
import { notify } from 'util/notify';

const { Text } = Typography;

const StyledFormItem = styled(Form.Item)`
  // padding: 2rem;
  // margin: 1rem 0;
  // border: 1px solid #eeeeee;
  // border-radius: 8px;
  // background-color: #ffffff;
`

const EMPTY_ROW = {
  name: '',
  required: true,
  type: 'text'
}


const JobTemplateForm = (props) => {

  const { id } = props;

  const [entity, setEntity] = React.useState();
  const [name, setName] = React.useState('');
  const [fields, setFields] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const loadEntity = async () => {
    if(!id) return;
    const entity = await getJobTemplate(id);
    setEntity(entity);
    setName(entity.name);
    setFields(entity.fields);
    setLoading(false);
  }

  React.useEffect(() => {
    loadEntity();
  }, [])

  const handleSubmit = async values => {
    if (values.dob) {
      values.dob = values.dob.utc().format('YYYY-MM-DD');
    }
    await props.onOk(values);
  }


  const addNewRow = () => {
    fields.push({ ...EMPTY_ROW });
    setFields([...fields]);
  }

  const moveUp = (index) => {
    if (index <= 0) return;
    const current = fields[index];
    fields[index] = fields[index - 1];
    fields[index - 1] = current;
    setFields([...fields]);
  }

  const moveDown = (index) => {
    if (index >= fields.length - 1) return;
    const current = fields[index];
    fields[index] = fields[index + 1];
    fields[index + 1] = current;
    setFields([...fields]);
  }

  const deleteRow = (index) => {
    fields.splice(index, 1);
    setFields([...fields]);
  }

  const changeValue = (index, name, v) => {
    fields[index][name] = v.target.value;
    setFields([...fields]);
  }

  const handleSave = async () => {
    const newEntity = {
      ...entity,
      name,
      fields
    }
    await saveJobTemplate(newEntity);
    props.onOk();
  notify.success(<>Successfully saved job template <strong>{name}</strong></>)
  }

  const nameOptions = BuiltInFieldName.map(x => ({ value: displayNameAsLabel(x) }));

  const columns = [
    {
      title: 'No',
      key: 'no',
      render: (text, records, index) => <>{index + 1}</>
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, records, index) => {
        return <AutoComplete
          placeholder="Name"
          options={nameOptions}
          allowClear={true}
          maxLength={50}
          defaultValue={displayNameAsLabel(text)}
          style={{ width: 200 }}
          allowClear={true}
          autoComplete="off"
          onBlur={(value) => changeValue(index, 'name', value)}
        />
      }
    },
    {
      title: 'Required',
      dataIndex: 'required',
      key: 'required',
      render: (value, records, index) => <Checkbox checked={value} onChange={(e) => changeValue(index, 'required', e.target.checked)} />
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
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
        <Text>Name</Text>
        <Input placeholder="Job Template Name" value={name} onChange={e => setName(e.target.value)} />
      </Space>
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <Text>Field Definitions</Text>
        <Table
          style={{ width: '100%' }}
          size="small"
          columns={columns}
          dataSource={fields}
          pagination={false}
          rowKey={record => record.name}
          footer={() => <>
            <Button icon={<PlusOutlined />} onClick={addNewRow}>Add New Field</Button>
          </>}
        />
      </Space>
      {/* <Divider/> */}
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <Button block type="primary" onClick={() => handleSave()}>Save</Button>
        <Button block type="link" onClick={() => loadEntity()}>Reset and Cancel All Changes</Button>
      </Space>
    </Space>
  </>
  );
};

JobTemplateForm.propTypes = {
  id: PropTypes.string.isRequired
};

JobTemplateForm.defaultProps = {};

export default withRouter(JobTemplateForm);
