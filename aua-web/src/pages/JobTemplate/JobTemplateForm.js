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
import FieldEditor from 'components/FieldEditor';

const { Text } = Typography;

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
  const [loading, setLoading] = React.useState(false);

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
  }, [])

  const handleSave = async (fields) => {
    const newEntity = {
      ...entity,
      name,
      fields
    }
    await saveJobTemplate(newEntity);
    await loadEntity();
    props.onOk();
    notify.success(<>Successfully saved job template <strong>{name}</strong></>)
  }

  const handleClose = () => {
    props.onClose();
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Text strong>Job Template Name</Text>
      <Input placeholder="Job Template Name" value={name} onChange={e => setName(e.target.value)} />
      <FieldEditor
        onChange={handleSave}
        value={fields}
        loading={loading}
        onCancel={() => handleClose()}
      />
    </Space>
  );
};

JobTemplateForm.propTypes = {
  id: PropTypes.string,
};

JobTemplateForm.defaultProps = {
};

export default withRouter(JobTemplateForm);
