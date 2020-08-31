import React from 'react';
import PropTypes from 'prop-types';

import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Input, Button, Form, Select, DatePicker, Layout, Modal, Space, Typography, Radio, Row, Col } from 'antd';
import { FileUploader } from 'components/FileUploader';
import HomeHeader from 'components/HomeHeader';

import * as moment from 'moment';
import { GlobalContext } from 'contexts/GlobalContext';
import { Menu, Dropdown, message, Tooltip } from 'antd';
import { UpOutlined, DownOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Divider } from 'antd';
import { BuiltInFieldDef } from "components/FieldDef";
import { normalizeFieldNameToVar } from 'util/normalizeFieldNameToVar';
import { listJobTemplate } from 'services/jobTemplateService';
import { archiveLodgement, generateLodgement, getLodgement, saveLodgement, completeLodgement } from 'services/lodgementService';
import { listPortofolio } from 'services/portofolioService';
import { getDisplayNameFromVarName } from 'util/getDisplayNameFromVarName';
import { InputYear } from 'components/InputYear';
import { DateInput } from 'components/DateInput';
import LodgementChat from './LodgementChat';

const { Text, Paragraph, Title } = Typography;
const ContainerStyled = styled.div`
  margin-top: 5rem;
  padding: 1rem;
  // max-width: 700px;
  width: 67vw;
  display: flex;
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
`;

const ProceedLodgementPage = (props) => {
  const id = props.match.params.id;
  // const { name, id, fields } = value || {};

  const [loading, setLoading] = React.useState(true);
  const [form] = Form.useForm();

  const [lodgement, setLodgement] = React.useState();
  const [jobTemplateId, setJobTemplateId] = React.useState();
  const [portofolioId, setPortofolioId] = React.useState();


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
    await saveLodgement({ ...lodgement });
    // form.resetFields();
    setLoading(false);
  }

  const handleCancel = () => {
    goToListPage();
  }

  const goToListPage = () => {
    props.history.push('/lodgement');
  }

  const handleSelectedTemplate = async (values) => {
    setJobTemplateId(values.jobTemplateId);
    setPortofolioId(values.portofolioId);
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

  const handleArchiveLodgement = () => {
    Modal.confirm({
      title: 'Archive this lodgement',
      okText: 'Yes, Archive it',
      onOk: async () => {
        await archiveLodgement(lodgement.id);
        goToListPage();
      }
    })
  }

  const handleCompleteLodgement = () => {
    Modal.confirm({
      title: 'Complete this lodgement',
      okText: 'Yes, Complete it',
      onOk: async () => {
        await completeLodgement(lodgement.id);
        goToListPage();
      }
    })
  }

  return (<LayoutStyled>
    <HomeHeader></HomeHeader>
    <ContainerStyled>
      {lodgement && <Form form={form} layout="vertical"
        onValuesChange={handleValuesChange}
        onFinish={handleSubmit}
        style={{ textAlign: 'left', width: '100%' }} initialValues={getFormInitialValues()}>
        <Title>{lodgement.name}</Title>
        <Divider />
        <Row gutter={32}>
          <Col span={12}>
            {lodgement.fields.filter(f => f.type !== 'upload').map((field, i) => {
              const { name, description, type, required } = field;
              const formItemProps = {
                label: <>{getDisplayNameFromVarName(name)}{description && <Text type="secondary"> ({description})</Text>}</>,
                name,
                // rules: [{ required }]
              }
              return (
                <Form.Item key={i} {...formItemProps}>
                  {type === 'text' ? <Input disabled={loading} /> :
                    type === 'year' ? <DateInput picker="year" placeholder="YYYY" disabled={loading} /> :
                      type === 'number' ? <Input disabled={loading} type="number" /> :
                        type === 'paragraph' ? <Input.TextArea disabled={loading} /> :
                          type === 'date' ? <DateInput picker="date" disabled={loading} placeholder="DD/MM/YYYY" style={{ display: 'block' }} format="YYYY-MM-DD" /> :
                            type === 'select' ? <Radio.Group disabled={loading} buttonStyle="solid">
                              {field.options.map((x, i) => <Radio key={i} style={{ display: 'block', height: '2rem' }} value={x.value}>{x.label}</Radio>)}
                            </Radio.Group> :
                              null}
                </Form.Item>
              );
            })}
          </Col>
          <Col span={12}>

            {lodgement.fields.filter(f => f.type === 'upload').map((field, i) => {
              const { name, description, type, required } = field;
              const formItemProps = {
                label: <>{getDisplayNameFromVarName(name)}{description && <Text type="secondary"> ({description})</Text>}</>,
                name,
                // rules: [{ required }]
              }
              return (
                <Form.Item key={i} {...formItemProps}>
                  <FileUploader disabled={loading} />
                </Form.Item>
              );
            })}
          </Col>
        </Row>
        <Divider />
        <Form.Item>
          <Space direction="horizontal" style={{ width: '100%' }} size="middle">
            <Button block type="link" onClick={() => handleCancel()}>Cancel</Button>
            <Button block type="primary" danger disabled={loading} onClick={() => handleArchiveLodgement()}>Archive</Button>
            <Button block type="primary" ghost disabled={loading} onClick={() => handleCompleteLodgement()}>Complete</Button>
            <Button block type="primary" ghost disabled={loading}>Request Sign</Button>
            <Button block type="primary" htmlType="submit" disabled={loading}>Save</Button>
          </Space>
        </Form.Item>
      </Form>
      }
      {/* <Divider type="vertical" style={{ height: "100%" }} /> */}
    </ContainerStyled>
    <Layout.Sider
      width="33vw"
      theme="light"
      style={{
        height: '100vh',
        position: 'fixed',
        right: 0,
        overflow: 'auto',
        backgroundColor: '#143e86'

        // display: 'flex'
      }}
    >
      {lodgement && <LodgementChat lodgementId={lodgement.id} />}
    </Layout.Sider>
  </LayoutStyled >

  );
};

ProceedLodgementPage.propTypes = {
  id: PropTypes.string
};

ProceedLodgementPage.defaultProps = {};

export default withRouter(ProceedLodgementPage);
