import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

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
import { getDisplayNameFromVarName } from 'util/getDisplayNameFromVarName';
import { getPortofolio } from 'services/portofolioService';
import { DateInput } from 'components/DateInput';

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

const EMPTY_ROW = {
  label: '',
  name: '',
  required: true,
  type: 'text'
}



const PortofolioForm = (props) => {
  const { id } = props;

  const [type, setType] = React.useState();
  const [loading, setLoading] = React.useState(true);
  const [name, setName] = React.useState('New Portofolio');
  const [fields, setFields] = React.useState([]);
  const [form] = Form.useForm();

  const loadEntity = async () => {
    if (id) {
      const entity = await getPortofolio(id);
      setName(entity.name);
      setFields(entity.fields);
      setType(entity.type);
    }
    setLoading(false);
  }

  React.useEffect(() => {
    loadEntity()
  }, []);

  const goBack = () => {
    props.history.goBack();
  }

  const handleSubmit = async values => {
    const portofolio = {
      id,
      type,
      fields: Object.entries(values).map(([name, value]) => ({ name, value }))
    }

    setLoading(true);
    form.resetFields();
    await props.onOk(portofolio);
    setLoading(false);
  }


  const formInitValues = {
    id,
    name,
  };

  for (const f of fields) {
    formInitValues[f.name] = f.value;
  }

  const handleCancel = () => {
    form.resetFields();
    props.onCancel();
  }

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
            label: <>{getDisplayNameFromVarName(name)}{description && <Text type="secondary"> ({description})</Text>}</>,
            name,
            rules
          }
          return (
            <Form.Item key={i} {...formItemProps}>
              {inputType === 'text' ? <Input {...inputProps} disabled={loading} /> :
                inputType === 'paragraphy' ? <Input.TextArea {...inputProps} disabled={loading} /> :
                  inputType === 'date' ? <DateInput placeholder="DD/MM/YYYY" style={{ display: 'block' }} format="YYYY-MM-DD" {...inputProps} /> :
                    inputType === 'select' ? <Radio.Group buttonStyle="solid">
                      {fieldDef.options.map((x, i) => <Radio key={i} style={{ display: 'block', height: '2rem' }} value={x.value}>{x.label}</Radio>)}
                    </Radio.Group> :
                      null}
            </Form.Item>
          );
        })}
        <Form.Item>
          <Button block type="primary" htmlType="submit" disabled={loading}>Save</Button>
        </Form.Item>
        <Form.Item>
          <Button block size="large" type="link" onClick={() => handleCancel()}>Cancel</Button>
        </Form.Item>
      </Form>}
    </Space>
  </>
  );
};

PortofolioForm.propTypes = {
  id: PropTypes.string,

};

PortofolioForm.defaultProps = {};

export default withRouter(PortofolioForm);
