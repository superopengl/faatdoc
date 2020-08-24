import React from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Input, Button, Form, Select, DatePicker, Checkbox, Table, Space, Typography, Radio } from 'antd';
import { FileUploader } from '../../components/FileUploader';
import * as moment from 'moment';
import { GlobalContext } from 'contexts/GlobalContext';
import { Menu, Dropdown, message, Tooltip } from 'antd';
import { UpOutlined, DownOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Divider } from 'antd';
import { BuiltInFieldDef } from "components/FieldDef";
import { normalizeFieldNameToVar } from 'util/normalizeFieldNameToVar';
import { listJobTemplate } from 'services/jobTemplateService';
import { listLodgement, generateLodgement } from 'services/lodgementService';
import { listPortofolio } from 'services/portofolioService';
import { ChooseJobTemplateWithPortofolioComponent } from './ChooseJobTemplateWithPortofolioComponent';
import { displayNameAsLabel } from 'util/displayNameAsLabel';
import { InputYear } from 'components/InputYear';

const { Text, Paragraph, Title } = Typography;

const StyledTypeButton = styled(Button)`
  height: 100%;

  h1, div {
    margin: 0;
  }

  div {
    white-space: break-spaces; 
  }
`;

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
    <Form.Item label={label} name={name} rules={[{ required, whitespace: true, message: ' ' }]}>
      <InputComponent />
    </Form.Item>
  );
}


const MyLodgementForm = (props) => {
  const { value } = props;

  const { name, id, fields } = value || {};

  const [type, setType] = React.useState(value?.type);
  const [sending, setSending] = React.useState(false);
  const [form] = Form.useForm();

  const [initialLoaded, setInitialLoaded] = React.useState(false);

  const [lodgementList, setLodgementList] = React.useState([]);
  const [lodgement, setLodgement] = React.useState(props.lodgement);
  const [jobTemplateId, setJobTemplateId] = React.useState();
  const [portofolioId, setPortofolioId] = React.useState();

  const loadList = async (force = false) => {
    if (!initialLoaded || force) {
      const lodgementList = await listLodgement();

      setLodgementList(lodgementList);
      setInitialLoaded(true);
    }
  }

  React.useEffect(() => {
    loadList();
  })

  const goBack = () => {
    props.history.goBack();
  }


  const saveDraft = async () => {

  }

  const handleSubmit = async values => {
    const { name, givenName, surname, dateOfBirth } = values;

    values.dateOfBirth = dateOfBirth?.utc().format('YYYY-MM-DD');

    const lodgement = {
      id,
      jobTemplateId,
      portofolioId,
      name,
      type,
      fields: values
    }

    setSending(true);
    form.resetFields();
    await props.onOk(lodgement);
    setSending(false);
  }


  const formInitValues = {
    id,
    name,
  };
  if (fields) {
    fields.forEach(f => formInitValues[f.name] = f.value);
  }


  const handleCancel = () => {
    form.resetFields();
    props.onCancel();
  }

  const handleSelectedTemplate = async (values) => {
    setJobTemplateId(values.jobTemplateId);
    setPortofolioId(values.portofolioId);
    const lodgement = await generateLodgement(values);
    setLodgement(lodgement);
  }

  const getFormInitialValues = () => {
    if (lodgement && lodgement.fields) {
      const values = {};
      for (const f of lodgement.fields) {
        if (f.type === 'date' && f.value) {
          values[f.name] = moment(f.value)
        } else {
          values[f.name] = f.value;
        }
      }
      return values;
    }
    return null;
  }


  const isIndividual = type === 'individual';
  const isBusiness = type === 'business';

  console.log('value', formInitValues);

  return (<>
    <Space direction="vertical" size="large" style={{ width: '100%' }}>

      {!lodgement && <ChooseJobTemplateWithPortofolioComponent onChange={handleSelectedTemplate} />}

      {lodgement && <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ textAlign: 'left' }} initialValues={getFormInitialValues()}>
        <Form.Item label="Name" name="name" rules={[{ required: true, message: ' ' }]}>
          <Input disabled={sending} />
        </Form.Item>

        {lodgement.fields.map((field, i) => {
          const { name, description, type, required } = field;
          const formItemProps = {
            label: <>{displayNameAsLabel(name)}{description && <Text type="secondary"> ({description})</Text>}</>,
            name,
            rules: [{ required, message: ' ' }]
          }
          return (
            <Form.Item key={i} {...formItemProps}>
              {type === 'text' ? <Input disabled={sending} /> :
                type === 'year' ? <InputYear disabled={sending} /> :
                  type === 'number' ? <Input disabled={sending} type="number" /> :
                    type === 'paragraph' ? <Input.TextArea disabled={sending} /> :
                      type === 'date' ? <DatePicker disabled={sending} placeholder="DD/MM/YYYY" style={{ display: 'block' }} format="YYYY-MM-DD" /> :
                        type === 'upload' ? <FileUploader disabled={sending} /> :
                          type === 'select' ? <Radio.Group disabled={sending} buttonStyle="solid">
                            {field.options.map((x, i) => <Radio key={i} style={{ display: 'block', height: '2rem' }} value={x.value}>{x.label}</Radio>)}
                          </Radio.Group> :
                            null}
            </Form.Item>
          );
        })}
        <Divider />
        <Form.Item>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Button block ghost type="primary" disabled={sending} onClick={() => saveDraft()}>Save As Draft</Button>
            <Button block type="primary" htmlType="submit" disabled={sending}>Submit Now</Button>
            <Button block type="link" onClick={() => handleCancel()}>Cancel</Button>
          </Space>
        </Form.Item>
      </Form>}
    </Space>
  </>
  );
};

MyLodgementForm.propTypes = {};

MyLodgementForm.defaultProps = {};

export default withRouter(MyLodgementForm);
