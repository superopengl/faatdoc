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
import { getLabelFromName } from 'util/getLabelFromName';
import { listJobTemplate } from 'services/jobTemplateService';
import { listLodgement, generateLodgement } from 'services/lodgementService';
import { listPortofolio } from 'services/portofolioService';
import { ChooseJobTemplateWithPortofolioComponent } from './ChooseJobTemplateWithPortofolioComponent';

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
  const [lodgement, setLodgement] = React.useState(null);

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


  const handleSubmit = async values => {
    const { company, givenName, surname, dateOfBirth } = values;

    values.dateOfBirth = dateOfBirth?.utc().format('YYYY-MM-DD');

    const lodgement = {
      id,
      name: company || `${givenName} ${surname}`,
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
    ...fields,
  };

  if (formInitValues.dateOfBirth) {
    formInitValues.dateOfBirth = moment(formInitValues.dateOfBirth)
  }


  const handleCancel = () => {
    form.resetFields();
    props.onCancel();
  }

  const handleSelectedTemplate = async (values) => {
    const lodgement = await generateLodgement(values);
    setLodgement(lodgement);
  }

  const isIndividual = type === 'individual';
  const isBusiness = type === 'business';

  console.log('value', formInitValues);

  const fieldDefs = BuiltInFieldDef.filter(x => x.lodgementType?.includes(type));

  return (<>
    <Space direction="vertical" size="large" style={{ width: '100%' }}>

      {!lodgement && <ChooseJobTemplateWithPortofolioComponent onChange={handleSelectedTemplate} />}

      {lodgement && <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ textAlign: 'left' }} initialValues={formInitValues}>
        {fieldDefs.map((fieldDef, i) => {
          const { name, description, rules, inputType, inputProps } = fieldDef;
          const formItemProps = {
            label: <>{getLabelFromName(name)}{description && <Text type="secondary"> ({description})</Text>}</>,
            name,
            rules
          }
          return (
            <Form.Item key={i} {...formItemProps}>
              {inputType === 'text' ? <Input {...inputProps} disabled={sending} /> :
                inputType === 'paragraphy' ? <Input.TextArea {...inputProps} disabled={sending} /> :
                  inputType === 'date' ? <DatePicker placeholder="DD/MM/YYYY" style={{ display: 'block' }} format="YYYY-MM-DD" {...inputProps} /> :
                    inputType === 'select' ? <Radio.Group buttonStyle="solid">
                      {fieldDef.options.map((x, i) => <Radio key={i} style={{ display: 'block', height: '2rem' }} value={x.value}>{x.label}</Radio>)}
                    </Radio.Group> :
                      null}
            </Form.Item>
          );
        })}
        <Form.Item>
          <Button block type="primary" htmlType="submit" disabled={sending}>{props.okButtonText || 'Submit'}</Button>
        </Form.Item>
        <Form.Item>
          <Button block size="large" type="link" onClick={() => handleCancel()}>Cancel</Button>
        </Form.Item>
      </Form>}
    </Space>
  </>
  );
};

MyLodgementForm.propTypes = {};

MyLodgementForm.defaultProps = {};

export default withRouter(MyLodgementForm);
