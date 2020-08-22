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
import { displayNameAsLabel } from 'util/displayNameAsLabel';

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




const EMPTY_ROW = {
  label: '',
  name: '',
  required: true,
  type: 'text'
}



const PortofolioForm = (props) => {
  const { value } = props;

  const { name, id, fields } = value || {};

  const [type, setType] = React.useState(value?.type);
  const [sending, setSending] = React.useState(false);
  const [form] = Form.useForm();

  const goBack = () => {
    props.history.goBack();
  }

  const handleSubmit = async values => {
    const { Company, Given_Name, Surname, Date_Of_Birth } = values;

    values.Date_Of_Birth = Date_Of_Birth?.utc().format('YYYY-MM-DD');

    const portofolio = {
      id,
      name: Company || `${Given_Name} ${Surname}`,
      type,
      fields: Object.entries(values).map(([name, value]) => ({ name, value }))
    }

    setSending(true);
    form.resetFields();
    await props.onOk(portofolio);
    setSending(false);
  }


  const formInitValues = {
    id,
    name,
  };

  for(const f of fields) {
    formInitValues[f.name] = f.value;
    if(f.name === 'Date_Of_Birth' && f.value) {
      formInitValues[f.name] = moment(f.value);
    }
  }

  const handleCancel = () => {
    form.resetFields();
    props.onCancel();
  }

  const isIndividual = type === 'individual';
  const isBusiness = type === 'business';

  console.log('value', formInitValues);

  const fieldDefs = BuiltInFieldDef.filter(x => x.portofolioType.includes(type));

  return (<>
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {!type && <>
        <Text>Please choose a portofolio type</Text>
        <StyledTypeButton block ghost type="primary" onClick={() => setType('individual')}>
          <Title>Individual</Title>
          <Paragraph type="secondary">Input given name, surname, date of birth, etc.</Paragraph>
        </StyledTypeButton>
        <StyledTypeButton block ghost type="primary" onClick={() => setType('business')}>
          <Title>Business</Title>
          <Paragraph type="secondary">Input company name, ACN, ABN, etc.</Paragraph>
        </StyledTypeButton>

      </>}
      {type && <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ textAlign: 'left' }} initialValues={formInitValues}>
        {fieldDefs.map((fieldDef, i) => {
          const { name, description, rules, inputType, inputProps } = fieldDef;
          const formItemProps = {
            label: <>{displayNameAsLabel(name)}{description && <Text type="secondary"> ({description})</Text>}</>,
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

PortofolioForm.propTypes = {};

PortofolioForm.defaultProps = {};

export default withRouter(PortofolioForm);
