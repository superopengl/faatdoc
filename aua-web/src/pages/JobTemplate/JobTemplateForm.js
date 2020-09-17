import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Input, Space, Select, Typography } from 'antd';
import { saveJobTemplate, getJobTemplate } from 'services/jobTemplateService';
import { notify } from 'util/notify';
import FieldEditor from 'components/FieldEditor';
import { listDocTemplate } from 'services/docTemplateService';
import * as _ from 'lodash';
import { BuiltInFieldDef } from 'components/FieldDef';

const { Text } = Typography;

const JobTemplateForm = (props) => {

  const { id } = props;

  const [entity, setEntity] = React.useState();
  const [name, setName] = React.useState('');
  const [fields, setFields] = React.useState([]);
  const [docTemplates, setDocTemplates] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [docTemplateOptions, setDocTemplateOptions] = React.useState([]);

  const loadEntity = async () => {
    setLoading(true);
    if (id) {
      const entity = await getJobTemplate(id);
      setEntity(entity);
      setName(entity.name);
      setDocTemplates(entity.docTemplates);
      setFields(entity.fields);
    }

    const docTemps = await listDocTemplate();
    setDocTemplateOptions(_.sortBy(docTemps, ['name']));

    setLoading(false);
  }

  React.useEffect(() => {
    loadEntity();
  }, [])

  const handleSave = async () => {
    const newEntity = {
      ...entity,
      name,
      docTemplates,
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

  const getFieldTypeByVarName = (varName) => {
    const builtInField = BuiltInFieldDef.find(x => x.name === varName);
    return builtInField?.inputType || 'text';
  }

  const applyDocTemplateChangesToFields = (docTemplateIds) => {
    const uniqueVariables = _.chain(docTemplateOptions)
      .filter(x => docTemplateIds.includes(x.id))
      .map(x => x.variables)
      .flatten()
      .filter(x => x !== 'now')
      .uniq()
      .value();
    const fieldsToAdd = uniqueVariables
      .filter(v => !fields.find(f => f.name === v))
      .map(v => ({
        name: v,
        required: true,
        type: getFieldTypeByVarName(v)
      }));
    setFields([...fields, ...fieldsToAdd]);
  }

  const handleDocTemplatesChange = (docTemplateIds) => {
    setDocTemplates(docTemplateIds);
    applyDocTemplateChangesToFields(docTemplateIds);
  }

  return (
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      <Text>Job Template Name</Text>
      <Input style={{ flex: '1' }} placeholder="Job Template Name" value={name} onChange={e => setName(e.target.value)} />
      <Text>Doc Templates to Apply</Text>
      <Select
        mode="multiple"
        allowClear
        style={{ width: '100%' }}
        placeholder="Doc Templates to apply"
        value={docTemplates}
        onChange={handleDocTemplatesChange}
      >
        {docTemplateOptions.map((x, i) => (<Select.Option key={i} value={x.id}>{x.name}</Select.Option>))}

      </Select>
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
