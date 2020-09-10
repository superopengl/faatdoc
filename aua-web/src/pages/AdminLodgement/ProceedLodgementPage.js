import React from 'react';
import PropTypes from 'prop-types';

import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Input, Button, Form, PageHeader, Space, Layout, Modal, Typography, Radio, Row, Col } from 'antd';
import { FileUploader } from 'components/FileUploader';
import HomeHeader from 'components/HomeHeader';

import { Divider } from 'antd';
import { deleteLodgement, getLodgement, saveLodgement, completeLodgement, notifyLodgement } from 'services/lodgementService';
import { varNameToLabelName } from 'util/varNameToLabelName';
import { DateInput } from 'components/DateInput';
import LodgementChat from './LodgementChat';
import { LodgementProgressBar } from 'components/LodgementProgressBar';
import { RangePickerInput } from 'components/RangePickerInput';

const { Text } = Typography;
const ContainerStyled = styled.div`
  margin: 5rem auto 0 auto;
  padding: 1rem;
  max-width: 900px;
  width: 100%;
  display: flex;
`;


const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;

  .ant-page-header {
    padding: 0;
  }
`;

const ProceedLodgementPage = (props) => {
  const id = props.match.params.id;
  // const { name, id, fields } = value || {};

  const [loading, setLoading] = React.useState(true);
  const [form] = Form.useForm();

  const [lodgement, setLodgement] = React.useState();
  const [showsNotify, setShowsNotify] = React.useState(false);


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

  const handleSubmit = async () => {

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

  const handleArchive = () => {
    const { id, name } = lodgement;
    Modal.confirm({
      title: <>Archive lodgement <Text strong>{name}</Text>?</>,
      okText: 'Yes, Archive it',
      onOk: async () => {
        await deleteLodgement(id);
        props.history.push('/lodgement');
      },
      maskClosable: true,
      okButtonProps: {
        danger: true
      }
    });
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
    await notifyLodgement(lodgement.id, `The lodgement is waiting for your signature. Please view the documents and sign if OK.`);
    loadEntity();
    setLoading(false);
  }

  const handleMessage = () => {
    setShowsNotify(true);
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
          subTitle={<LodgementProgressBar status={lodgement.status} width={60} />}
        >
        </PageHeader>
        <Space style={{width: '100%', justifyContent: 'flex-end'}}>
          <Button key="1" type="primary" danger disabled={archiveDisabled} onClick={() => handleArchive()}>Archive</Button>
          <Button key="2" type="primary" ghost disabled={completeDisabled} onClick={() => handleCompleteLodgement()}>Complete</Button>
          <Button key="3" type="primary" ghost disabled={requiresSignDisabled} onClick={() => handleRequestSign()}>Request Sign</Button>
          <Button key="4" type="primary" ghost disabled={communicateDisabled} onClick={() => handleMessage()}>Notify</Button>
          <Button key="5" type="primary" htmlType="submit" disabled={saveDisabled}>Save</Button>
        </Space>
        <Divider />
        <Row gutter={32}>
          <Col span={12}>
            {lodgement.fields.filter(f => f.type !== 'upload').map((field, i) => {
              const { name, description, type } = field;
              const formItemProps = {
                label: <>{varNameToLabelName(name)}{description && <Text type="secondary"> ({description})</Text>}</>,
                name,
                // rules: [{ required }]
              }
              return (
                <Form.Item key={i} {...formItemProps}>
                  {type === 'text' ? <Input disabled={inputDisabled} /> :
                    type === 'year' ? <DateInput picker="year" placeholder="YYYY" disabled={inputDisabled} /> :
                      type === 'monthRange' ? <RangePickerInput picker="month" disabled={inputDisabled} /> :
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
              const { name, description } = field;
              const formItemProps = {
                label: <>{varNameToLabelName(name)}{description && <Text type="secondary"> ({description})</Text>}</>,
                name,
                // rules: [{ required }]
              }
              return (
                <Form.Item key={i} {...formItemProps} >
                  <FileUploader disabled={inputDisabled} />
                </Form.Item>
              );
            })}
          </Col>
        </Row>

      </Form>
      }
      {/* <Divider type="vertical" style={{ height: "100%" }} /> */}
    </ContainerStyled>

    {(lodgement && showsNotify) && <LodgementChat visible={showsNotify} onClose={() => setShowsNotify(false)} lodgementId={lodgement?.id} readonly={communicationReadonly} />}

  </LayoutStyled >

  );
};

ProceedLodgementPage.propTypes = {
  id: PropTypes.string
};

ProceedLodgementPage.defaultProps = {};

export default withRouter(ProceedLodgementPage);
