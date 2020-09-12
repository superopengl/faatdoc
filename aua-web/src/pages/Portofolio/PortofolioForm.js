import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Input, Button, Form, Checkbox, Space, Typography, Radio, Layout } from 'antd';
import HomeHeader from 'components/HomeHeader';
import { BuiltInFieldDef } from "components/FieldDef";
import { varNameToLabelName } from 'util/varNameToLabelName';
import { getPortofolio, savePortofolio } from 'services/portofolioService';
import { DateInput } from 'components/DateInput';

const { Text, Title } = Typography;

const ContainerStyled = styled.div`
margin: 6rem auto 2rem auto;
padding: 0 0.5rem;
width: 100%;
max-width: 600px;
`;

const StyledTitleRow = styled.div`
 display: flex;
 justify-content: space-between;
 align-items: center;
 width: 100%;
`

const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;
`;


const PortofolioForm = (props) => {
  const {id, type: newType} = props.match.params;
  const isNew = !id;

  const [loading, setLoading] = React.useState(true);
  // const [name, setName] = React.useState('New Portofolio');
  // const [fields, setFields] = React.useState([]);
  const [form] = Form.useForm();
  const [portofolio, setPortofolio] = React.useState();
  const [initialValues, setInitialValues] = React.useState();
  const type = portofolio?.type || newType;

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
    await savePortofolio(payload);
    setLoading(false);
    props.history.push(`/portofolio`);
  }

  const handleCancel = () => {
    props.history.goBack();
  }

  const fieldDefs = BuiltInFieldDef.filter(x => x.portofolioType?.includes(type));

  // console.log('value', initialValues);

  return (<>
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <Space size="small" direction="vertical" style={{ width: '100%' }}>
          <StyledTitleRow>
            <Title level={2} style={{ margin: 'auto' }}>{`${isNew ? 'New' : 'Edit'} Portofolio`}</Title>
          </StyledTitleRow>
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
              <Checkbox>I have read and agree on the <a href="/disclaimer" target="_blank">disclaimer</a></Checkbox>
            </Form.Item>}
            <Form.Item>
              <Button block type="primary" htmlType="submit" disabled={loading}>Save</Button>
            </Form.Item>
            <Form.Item>
              <Button block type="link" onClick={() => handleCancel()}>Cancel</Button>
            </Form.Item>
          </Form>}
        </Space>
      </ContainerStyled>
    </LayoutStyled >
  </>
  );
};

PortofolioForm.propTypes = {
  id: PropTypes.string,
  defaultType: PropTypes.string,
};

PortofolioForm.defaultProps = {};

export default withRouter(PortofolioForm);
