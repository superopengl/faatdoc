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
import { varNameToLabelName } from 'util/varNameToLabelName';
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
  const { id, defaultType } = props;

  const isNew = !id;
  const [loading, setLoading] = React.useState(true);
  // const [name, setName] = React.useState('New Portofolio');
  // const [fields, setFields] = React.useState([]);
  const [form] = Form.useForm();
  const [portofolio, setPortofolio] = React.useState();
  const [initialValues, setInitialValues] = React.useState();
  const type = portofolio?.type || defaultType;


  const loadEntity = async () => {
    if (!isNew) {
      const entity = await getPortofolio(id);
      setPortofolio(entity);

      const initialValues = getFormInitialValues(entity);
      setInitialValues(initialValues);
    }
    setLoading(false);
  }

  React.useEffect(() => {
    loadEntity()
  }, [id]);

  const getFormInitialValues = (portofolio) => {
    if (!portofolio) return undefined;
    const name = portofolio.name || '';
    const fields = portofolio.fields || [];
    const formInitValues = {
      id,
      name,
    };
    for (const f of fields) {
      formInitValues[f.name] = f.value;
    }


    return formInitValues;
  }

  const handleSubmit = async values => {
    const payload = {
      id,
      type,
      fields: Object.entries(values).map(([name, value]) => ({ name, value }))
    }

    setLoading(true);
    form.resetFields();
    await props.onOk(payload);
    setLoading(false);
  }

  const handleCancel = () => {
    form.resetFields();
    props.onCancel();
  }

  const fieldDefs = BuiltInFieldDef.filter(x => x.portofolioType.includes(type));

  // console.log('value', initialValues);

  return (<>
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {loading && 'loading...'}
      {!loading && <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ textAlign: 'left' }} initialValues={initialValues}>
        {fieldDefs.map((fieldDef, i) => {
          const { name, description, rules, inputType, inputProps } = fieldDef;
          const formItemProps = {
            key: i,
            label: <>{varNameToLabelName(name)}{description && <Text type="secondary"> ({description})</Text>}</>,
            name,
            rules
          }
          return (
            <Form.Item {...formItemProps}>
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
        {isNew && <Form.Item name="" valuePropName="checked" rules={[{
          validator: (_, value) =>
            value ? Promise.resolve() : Promise.reject('You have to agree to continue.'),
        }]}>
          <Checkbox>I have read and agree on the disclaimer</Checkbox>
        </Form.Item>}
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
  defaultType: PropTypes.string,
};

PortofolioForm.defaultProps = {};

export default withRouter(PortofolioForm);
