import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Input, Button, Select, Checkbox, Table, Space, Typography, AutoComplete } from 'antd';
import { UpOutlined, DownOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { BuiltInFieldLabelNames, BuiltInFieldType, getBuiltInFieldByLabelName, getBuiltInFieldByVarName } from 'components/FieldDef';
import { varNameToLabelName } from 'util/varNameToLabelName';
import { saveJobTemplate, getJobTemplate } from 'services/jobTemplateService';
import { notify } from 'util/notify';
import { labelNameToVarName } from 'util/labelNameToVarName';

const { Text } = Typography;

const EMPTY_ROW = {
  name: '',
  required: true,
  type: 'text'
}


const FieldEditor = (props) => {

  const { value, onChange, loading, footer } = props;

  const [fields, setFields] = React.useState(value);

  React.useEffect(() => {
    setFields(value);
  }, [value]);

  const handleClose = () => {
    props.onCancel();
  }

  const handleSave = () => {
    const value = fields.filter(f => groomField(f)).map(f => {
      const varName = labelNameToVarName(f.name);
      const builtInField = getBuiltInFieldByVarName(varName);
      const type = builtInField?.inputType || f.type;
      return {
        ...f,
        name: varName,
        type
      };
    });

    onChange(value);
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
    fields[index][name] = v;
    setFields([...fields]);
  }

  function groomField(field) {
    return field && field.name?.trim() && field.type?.trim();
  }

  const nameOptions = BuiltInFieldLabelNames.map(x => ({
    label: varNameToLabelName(x),
    value: x
  }));

  const columns = [
    {
      title: 'No',
      render: (text, record, index) => <>{index + 1}</>
    },
    {
      title: 'Name',
      dataIndex: 'name',
      render: (text, record, index) => {
        return <AutoComplete
          placeholder="Name"
          options={nameOptions}
          allowClear={true}
          maxLength={50}
          defaultValue={varNameToLabelName(text)}
          // defaultValue={getDisplayNameFromVarName(text)}
          style={{ width: 200 }}
          autoComplete="off"
          onBlur={(e) => changeValue(index, 'name', e.target.value)}
          disabled={record.value}
        />
      }
    },
    {
      title: 'Type',
      dataIndex: 'type',
      render: (value, record, index) => {
        const fieldName = record.name;
        const builtInField = getBuiltInFieldByLabelName(fieldName);
        const inputType = builtInField?.inputType || (record.value ? value : null);
        return !fieldName ? null : inputType ? <Text disabled>{varNameToLabelName(inputType)}</Text> : <Select value={value} style={{ width: '200px' }} onChange={(v) => changeValue(index, 'type', v)}>
          {BuiltInFieldType.map((f, i) => <Select.Option key={i} value={f}>{varNameToLabelName(f)}</Select.Option>)}
        </Select>
      }
    },
    {
      title: 'Required ?',
      dataIndex: 'required',
      render: (value, record, index) => <Checkbox
        checked={value}
        onChange={(e) => changeValue(index, 'required', e.target.checked)}
        disabled={record.value}
      />
    },
    {
      title: 'Official Only ?',
      dataIndex: 'officialOnly',
      render: (value, record, index) => <Checkbox
        checked={value}
        onChange={(e) => changeValue(index, 'officialOnly', e.target.checked)}
        disabled={record.value}
      />
    },
    {
      title: 'Action',
      render: (text, record, index) => (
        <Space size="small">
          <Button type="link" icon={<UpOutlined />} onClick={() => moveUp(index)} />
          <Button type="link" icon={<DownOutlined />} onClick={() => moveDown(index)} />
          {!record.value && <Button type="link" danger icon={<DeleteOutlined />} onClick={() => deleteRow(index)} />}
        </Space>
      ),
    },
  ];


  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Table
        style={{ width: '100%' }}
        size="small"
        columns={columns}
        dataSource={fields}
        pagination={false}
        loading={loading}
        rowKey={record => record.name}
        footer={null}
      />
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Button icon={<PlusOutlined />} onClick={addNewRow}>Add New Field</Button>
        <Space>
          <Button key="cancel" onClick={() => handleClose()}>Cancel</Button>
          <Button key="save" type="primary" onClick={() => handleSave()}>Save</Button>
        </Space>
      </Space>

    </Space>
  );
};

FieldEditor.propTypes = {
  value: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  footer: PropTypes.object,
};

FieldEditor.defaultProps = {
  value: [],
  loading: false,
  footer: null
};

export default withRouter(FieldEditor);
