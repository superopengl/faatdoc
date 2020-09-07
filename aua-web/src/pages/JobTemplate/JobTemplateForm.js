import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Input, Button, Form, Select, Drawer, Checkbox, Table, Space, Typography, AutoComplete, Modal } from 'antd';
import { FileUploader } from '../../components/FileUploader';
import * as moment from 'moment';
import { GlobalContext } from 'contexts/GlobalContext';
import { Menu, Dropdown, message, Tooltip } from 'antd';
import { UpOutlined, DownOutlined, DeleteOutlined, PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { Divider } from 'antd';
import { BuiltInFieldName, BuiltInFieldType } from 'components/FieldDef';
import { normalizeFieldNameToVar } from 'util/normalizeFieldNameToVar';
import { getDisplayNameFromVarName } from 'util/getDisplayNameFromVarName';
import { listJobTemplate, deleteJobTemplate, saveJobTemplate, getJobTemplate } from 'services/jobTemplateService';
import { notify } from 'util/notify';
import { getVarNameFromDisplayName } from 'util/getVarNameFromDisplayName';

const { Text } = Typography;

const StyledDrawer = styled(Drawer)`

.ant-drawer-content-wrapper {
  max-width: 90vw;
}

.rce-mbox {
  padding-bottom: 2rem;

  .rce-mbox-time {
    bottom: -1.5rem;
  }
}
`;

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

  const { id, visible } = props;

  const [entity, setEntity] = React.useState();
  const [name, setName] = React.useState('');
  const [fields, setFields] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const isNew = !id;

  const loadEntity = async () => {
    if (!id) {
      setEntity(undefined);
      setName('');
      setFields([]);
      return;
    }
    setLoading(true);
    const entity = await getJobTemplate(id);
    setEntity(entity);
    setName(entity.name);
    setFields(entity.fields);
    setLoading(false);
  }

  React.useEffect(() => {
    loadEntity();
  }, [id])


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

    fields[index][name] = v;
    setFields([...fields]);
  }

  const validField = (field) => {
    return field && field.name?.trim() && field.type?.trim();
  }

  const handleSave = async () => {
    const newEntity = {
      ...entity,
      name,
      fields: fields.filter(f => validField(f)).map(f => ({ name: getVarNameFromDisplayName(f.name), ...f })),
    }
    await saveJobTemplate(newEntity);
    await loadEntity();
    props.onOk();
    notify.success(<>Successfully saved job template <strong>{name}</strong></>)
  }

  const nameOptions = BuiltInFieldName.map(x => ({
    value: x,
    // label: getDisplayNameFromVarName(x) 
  }));

  const handleClose = () => {
    props.onClose();
  }

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
          defaultValue={text}
          // defaultValue={getDisplayNameFromVarName(text)}
          style={{ width: 200 }}
          autoComplete="off"
          onBlur={(e) => changeValue(index, 'name', e.target.value)}
        />
      }
    },
    {
      title: 'Required ?',
      dataIndex: 'required',
      key: 'id',
      render: (value, records, index) => <Checkbox checked={value} onChange={(e) => changeValue(index, 'required', e.target.checked)} />
    },
    {
      title: 'Official Only ?',
      dataIndex: 'officialOnly',
      key: 'id',
      render: (value, records, index) => <Checkbox checked={value} onChange={(e) => changeValue(index, 'officialOnly', e.target.checked)} />
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'id',
      render: (value, records, index) => <Select value={value} style={{ width: '100%' }} onChange={(v) => changeValue(index, 'type', v)}>
        {BuiltInFieldType.map((f, i) => <Select.Option key={i} value={f}>{f}</Select.Option>)}
      </Select>
    },
    {
      title: 'Action',
      key: 'id',
      render: (text, record, index) => (
        <Space size="small">
          <Button type="link" icon={<UpOutlined />} onClick={() => moveUp(index)} />
          <Button type="link" icon={<DownOutlined />} onClick={() => moveDown(index)} />
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => deleteRow(index)} />
        </Space>
      ),
    },
  ];


  return (
    <StyledDrawer
      title={isNew ? 'New Recurring' : 'Edit Recurring'}
      placement="right"
      closable={true}
      visible={visible}
      onClose={() => handleClose()}
      destroyOnClose={true}
      width={900}
      // bodyStyle={{ padding: '0 10px' }}
      footer={null}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Text strong>Job Template Name</Text>
          <Input placeholder="Job Template Name" value={name} onChange={e => setName(e.target.value)} />
          {/* <Checkbox checked={requiresSign} onChange={e => setRequiresSign(e.target.checked)}>Client signature is required</Checkbox> */}
          <Text strong>Field Definitions</Text>
          <Table
            style={{ width: '100%' }}
            size="small"
            columns={columns}
            dataSource={fields}
            loading={loading}
            pagination={false}
            rowKey={record => record.name}
            footer={null}
          />
        {/* <Divider/> */}
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Button icon={<PlusOutlined />} onClick={addNewRow}>Add New Field</Button>

          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => handleClose()}>Cancel</Button>
            <Button type="primary" onClick={() => handleSave()}>Save</Button>
          </Space>
        </Space>
      </Space>
    </StyledDrawer>
  );
};

JobTemplateForm.propTypes = {
  id: PropTypes.string.isRequired,
  visible: PropTypes.bool.isRequired,
};

JobTemplateForm.defaultProps = {
  visible: false,

};

export default withRouter(JobTemplateForm);
