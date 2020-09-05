import React from 'react';
import PropTypes from 'prop-types';

import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Input, Button, Form, PageHeader, Drawer, Layout, Modal, Descriptions, Typography, Radio, Row, Col } from 'antd';
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
import { deleteLodgement, generateLodgement, getLodgement, saveLodgement, completeLodgement, sendLodgementMessage } from 'services/lodgementService';
import { listPortofolio } from 'services/portofolioService';
import { getDisplayNameFromVarName } from 'util/getDisplayNameFromVarName';
import { InputYear } from 'components/InputYear';
import { DateInput } from 'components/DateInput';
import LodgementChat from './LodgementChat';
import { LodgementProgressBar } from 'components/LodgementProgressBar';

const { Text, Paragraph, Title } = Typography;
const ContainerStyled = styled.div`
  margin-top: 5rem;
  padding: 1rem;
  // max-width: 700px;
  width: 100%;
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
  const [showsMessage, setShowsMessage] = React.useState(false);


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
        await deleteLodgement(lodgement.id);
        goToListPage();
      },
      maskClosable: true,
      okButtonProps: {
        danger: true
      }
    })
  }

  const handleCompleteLodgement = () => {
    Modal.confirm({
      title: 'Complete this lodgement',
      okText: 'Yes, Complete it',
      maskClosable: true,
      onOk: async () => {
        await completeLodgement(lodgement.id);
        goToListPage();
      }
    })
  }

  const handleRequestSign = async () => {
    const signFiles = lodgement.fields.find(x => x.name === 'requireSign');
    if (!signFiles?.value?.length) {
      Modal.error({
        title: 'Cannot request sign',
        maskClosable: true,
        content: `No files to require sign. Please upload files to the 'Require Sign' field before request sign.`
      });
      return;
    }
    lodgement.status = 'to_sign';
    setLoading(true);
    await saveLodgement(lodgement);
    await sendLodgementMessage(lodgement.id, `Please sign the documents for lodgement '${lodgement.name}'`);
    loadEntity();
    setLoading(false);
  }

  const handleMessage = () => {
    setShowsMessage(true);
  }

  const inputDisabled = loading || ['draft', 'archive', 'done'].includes(lodgement.status);
  const archiveDisabled = loading || ['draft', 'archive', 'done'].includes(lodgement.status);
  const completeDisabled = loading || ['draft', 'archive', 'done'].includes(lodgement.status);
  const requiresSignDisabled = loading || 'submitted' !== lodgement.status;
  const communicateDisabled = loading;
  const saveDisabled = loading || ['draft', 'archive', 'done', 'signed'].includes(lodgement.status);
  const communicationReadonly = loading || ['draft', 'archive', 'done'].includes(lodgement.status);

  return (<LayoutStyled>
    <HomeHeader></HomeHeader>
    <ContainerStyled>
      {lodgement && <Form form={form} layout="vertical"
        onValuesChange={handleValuesChange}
        onFinish={handleSubmit}
        style={{ textAlign: 'left', width: '100%' }} initialValues={getFormInitialValues()}>
        <PageHeader
          onBack={() => handleCancel()}
          title={lodgement.name}
          subTitle={<LodgementProgressBar status={lodgement.status} width={80} />}
          extra={[
            <Button key="1" type="primary" danger disabled={archiveDisabled} onClick={() => handleArchiveLodgement()}>Archive</Button>,
            <Button key="2" type="primary" ghost disabled={completeDisabled} onClick={() => handleCompleteLodgement()}>Complete</Button>,
            <Button key="3" type="primary" ghost disabled={requiresSignDisabled} onClick={() => handleRequestSign()}>Request Sign</Button>,
            <Button key="4" type="primary" ghost disabled={communicateDisabled} onClick={() => handleMessage()}>Communication</Button>,
            <Button key="5" type="primary" htmlType="submit" disabled={saveDisabled}>Save</Button>,
          ]}
        >
        </PageHeader>
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
                  {type === 'text' ? <Input disabled={inputDisabled} /> :
                    type === 'year' ? <DateInput picker="year" placeholder="YYYY" disabled={inputDisabled} /> :
                      type === 'number' ? <Input disabled={inputDisabled} type="number" /> :
                        type === 'paragraph' ? <Input.TextArea disabled={inputDisabled} /> :
                          type === 'date' ? <DateInput picker="date" disabled={inputDisabled} placeholder="DD/MM/YYYY" style={{ display: 'block' }} format="YYYY-MM-DD" /> :
                            type === 'select' ? <Radio.Group disabled={inputDisabled} buttonStyle="solid">
                              {field.options?.map((x, i) => <Radio key={i} style={{ display: 'block', height: '2rem' }} value={x.value}>{x.label}</Radio>)}
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
                <Form.Item key={i} {...formItemProps} > 
                  <FileUploader disabled={inputDisabled} disabled={inputDisabled || (name === 'requireSign' && requiresSignDisabled)}/>
                </Form.Item>
              );
            })}
          </Col>
        </Row>

      </Form>
      }
      {/* <Divider type="vertical" style={{ height: "100%" }} /> */}
    </ContainerStyled>
    {/* {lodgement && <Modal
      title="Communication"
      visible={showsMessage}
      onCancel={() => setShowsMessage(false)}
      onOk={() => setShowsMessage(false)}
      footer={null}
      width={700}
      bodyStyle={{ maxHeight: '90vh' }}
    >
      <LodgementChat lodgementId={lodgement.id} />
    </Modal>} */}

    {lodgement && <LodgementChat visible={showsMessage} onClose={() => setShowsMessage(false)} lodgementId={lodgement?.id} readonly={communicationReadonly} />}

  </LayoutStyled >

  );
};

ProceedLodgementPage.propTypes = {
  id: PropTypes.string
};

ProceedLodgementPage.defaultProps = {};

export default withRouter(ProceedLodgementPage);
