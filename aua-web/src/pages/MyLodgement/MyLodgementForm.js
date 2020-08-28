import React from 'react';
import PropTypes from 'prop-types';

import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Input, Button, Form, Select, DatePicker, Checkbox, Modal, Space, Typography, Radio } from 'antd';
import { FileUploader } from '../../components/FileUploader';
import * as moment from 'moment';
import { GlobalContext } from 'contexts/GlobalContext';
import { Menu, Dropdown, message, Tooltip } from 'antd';
import { UpOutlined, DownOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Divider } from 'antd';
import { BuiltInFieldDef } from "components/FieldDef";
import { normalizeFieldNameToVar } from 'util/normalizeFieldNameToVar';
import { listJobTemplate } from 'services/jobTemplateService';
import { deleteLodgement, generateLodgement, getLodgement, saveLodgement } from 'services/lodgementService';
import { listPortofolio } from 'services/portofolioService';
import { LodgementGenerator } from './LodgementGenerator';
import { displayNameAsLabel } from 'util/displayNameAsLabel';
import { InputYear } from 'components/InputYear';
import { DateInput } from 'components/DateInput';
import { RangePickerInput } from 'components/RangePickerInput';

const { Text, Paragraph, Title } = Typography;
const { RangePicker } = DatePicker;

const StyledTypeButton = styled(Button)`
  height: 100%;

  h1, div {
    margin: 0;
  }

  div {
    white-space: break-spaces; 
  }
`;


const MyLodgementForm = (props) => {
  const { id, jobTemplateList, portofolioList } = props;

  // const { name, id, fields } = value || {};

  const [loading, setLoading] = React.useState(true);
  const [form] = Form.useForm();

  const [lodgement, setLodgement] = React.useState();

  const loadEntity = async () => {
    setLoading(true);
    if (id) {
      const lodgement = await getLodgement(id);
      setLodgement(lodgement);
    }
    setLoading(false);
  }

  React.useEffect(() => {
    loadEntity();
  }, [])

  const updateLodgmentWithFormValues = values => {
    lodgement.name = values.name;

    lodgement.fields.forEach(field => {
      field.value = values[field.name];
    })

    return lodgement;
  }

  const saveDraft = async () => {
    setLoading(true);
    await saveLodgement({ name: 'New Lodgment', ...lodgement, status: 'draft' });
    await props.onChange();
    setLoading(false);
  }

  const handleValuesChange = (changedValues, allValues) => {
    const lodgment = updateLodgmentWithFormValues(allValues);
    setLodgement({ ...lodgment });
  }

  const handleSubmit = async values => {

    // debugger;
    setLoading(true);
    await saveLodgement({ ...lodgement, status: 'submitted' });
    // form.resetFields();
    await props.onChange();
    setLoading(false);
  }

  const handleCancel = () => {
    form.resetFields();
    props.onCancel();
  }

  const handleSelectedTemplate = async (values) => {
    setLoading(true);
    const lodgement = await generateLodgement(values);
    setLodgement(lodgement);
    setLoading(false);
  }

  const getFormInitialValues = () => {
    const values = {
      name: lodgement?.name || 'New Lodgement',
      status: lodgement?.name || 'draft'
    };
    if (lodgement && lodgement.fields) {
      for (const f of lodgement.fields) {
        values[f.name] = f.value;
      }
    }
    return values;
  }

  const handleDelete = async (e) => {
    e.stopPropagation();
    Modal.confirm({
      title: <>To delete lodgement <strong>{lodgement.name}</strong>?</>,
      onOk: async () => {
        await deleteLodgement(lodgement.id);
        props.onChange();
      },
      okText: 'Yes, delete it!'
    });
  }

  const checkIfCanEdit = (lodgement) => {
    if (loading) return false;
    if (!lodgement) return false;
    const { status, id } = lodgement;
    return ['draft', 'submitted'].includes(status);
  }

  const canEdit = checkIfCanEdit(lodgement);
  const disabled = !canEdit || loading;

  // console.log('value', formInitValues);

  return (<>
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {!lodgement && <LodgementGenerator onChange={handleSelectedTemplate} jobTemplateList={jobTemplateList} portofolioList={portofolioList} />}

      {lodgement && <Form form={form} layout="vertical"
        onValuesChange={handleValuesChange}
        onFinish={handleSubmit}
        style={{ textAlign: 'left' }} initialValues={getFormInitialValues()}>
        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input disabled={disabled} />
        </Form.Item>

        {lodgement.fields.filter(field => !field.officialOnly).map((field, i) => {
          const { name, description, type, required } = field;
          const formItemProps = {
            label: <>{displayNameAsLabel(name)}{description && <Text type="secondary"> ({description})</Text>}</>,
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
                              {field.options.map((x, i) => <Radio key={i} style={{ display: 'block', height: '2rem' }} value={x.value}>{x.label}</Radio>)}
                            </Radio.Group> :
                              null}
            </Form.Item>
          );
        })}
        <Divider />
        <Form.Item>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {(canEdit && lodgement.status === 'draft') && <Button block ghost type="primary" disabled={disabled} onClick={() => saveDraft()}>Save As Draft</Button>}
            {canEdit && <Button block type="primary" htmlType="submit" disabled={disabled}>Submit Now</Button>}
            <Button block type="link" onClick={() => handleCancel()}>Cancel</Button>
          </Space>
        </Form.Item>
        {(id && lodgement?.status === 'draft') && <Form.Item>
          <Button block type="primary" danger disabled={disabled} onClick={handleDelete}>Delete</Button>
        </Form.Item>}
      </Form>}
    </Space>
  </>
  );
};

MyLodgementForm.propTypes = {
  id: PropTypes.string
};

MyLodgementForm.defaultProps = {};

export default withRouter(MyLodgementForm);
