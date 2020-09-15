import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Input, Space } from 'antd';
import { saveJobTemplate, getJobTemplate } from 'services/jobTemplateService';
import { notify } from 'util/notify';
import FieldEditor from 'components/FieldEditor';

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

  const handleSave = async () => {
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
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      <Input style={{flex: '1'}} placeholder="Job Template Name" value={name} onChange={e => setName(e.target.value)} />
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
