import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Input, Button, Form, PageHeader, Space, Layout, Drawer, Typography, Radio, Row, Col, Modal } from 'antd';
import { FileUploader } from 'components/FileUploader';
import HomeHeader from 'components/HomeHeader';

import { Divider } from 'antd';
import { getJob, saveJob } from '../../services/jobService';
import { varNameToLabelName } from 'util/varNameToLabelName';
import { DateInput } from 'components/DateInput';
import JobChat from './JobChat';
import { RangePickerInput } from 'components/RangePickerInput';
import { Select } from 'antd';
import FieldEditor from 'components/FieldEditor';
import { DeleteOutlined, FileAddOutlined, QuestionCircleOutlined, QuestionOutlined, SyncOutlined } from '@ant-design/icons';
import FileLink from 'components/FileLink';
import { notify } from 'util/notify';
import { merge } from 'lodash';
import { FileIcon } from 'components/FileIcon';
import { GrDocumentConfig } from 'react-icons/gr';
import { Tag } from 'antd';
import GenDocForm from './GenDocForm';

const { Text } = Typography;
const ContainerStyled = styled.div`
  margin: 5rem auto 0 auto;
  padding: 1rem;
  max-width: 900px;
  width: 100%;
  display: flex;
`;


const StyledDrawer = styled(Drawer)`
.ant-drawer-content-wrapper {
  max-width: 90vw;
}
`;

const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;

  .ant-page-header {
    padding: 0;
  }
`;

const StatusSelect = styled(Select)`
&.archive {
  .ant-select-selector {
    background: #ff4d4f;
    border-color: #ff4d4f;
  }

  * {
    color: #ffffff;
  }
}

&.complete {
  .ant-select-selector {
    background: #52c41a;
    border-color: #52c41a;
  }

  * {
    color: #ffffff;
  }
}

&.signed, &.to_sign, &.todo {
  .ant-select-selector {
    background: #1890ff;
    border-color: #1890ff;
  }

  * {
    color: #ffffff;
  }
}
`

const DeleteGenDocButton = styled(Button)`
  width: 60px !important;
  height: 60px !important;
  position: relative;
  opacity: 0.5;
  color: rgba(0,0,0,0.45);

  &:hover {
    color: rgba(0,0,0,0.45);
    opacity: 1;
    background: rgba(0, 0, 0, 0.038);
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const ProceedJobPage = (props) => {
  const id = props.match.params.id;
  // const { name, id, fields } = value || {};

  const [loading, setLoading] = React.useState(true);
  const [drawerVisible, setDrawerVisible] = React.useState(false);
  const [form] = Form.useForm();

  const [job, setJob] = React.useState();
  const [showsNotify, setShowsNotify] = React.useState(false);
  const [currentDocTemplateId, setCurrentDocTemplateId] = React.useState();


  const loadEntity = async () => {
    setLoading(true);
    if (id) {
      const job = await getJob(id);
      setJob(job);
      setStatusValue({ value: defaultStatus[job.status] })
    }
    setLoading(false);
  }

  const initialLoadEntity = React.useCallback(() => loadEntity());

  React.useEffect(() => {
    initialLoadEntity();
  }, [])

  const handlePostGenDoc = (fileId, varHash) => {
    const genDoc = job.genDocs.find(d => d.docTemplateId === currentDocTemplateId);
    genDoc.fileId = fileId;
    genDoc.varHash = varHash;
    setJob({ ...job });
    setCurrentDocTemplateId(null);
  }

  const showGenDocModal = (docTemplateId) => {
    setCurrentDocTemplateId(docTemplateId);
  }


  const handleValuesChange = (changedValues, allValues) => {
    const changedJob = merge(job, changedValues);
    setJob({ ...changedJob });
  }

  const handleSubmit = async (values) => {
    setLoading(true);
    await saveJob({
      ...job,
      ...values,
      fields: merge(job.fields, values.fields)
    });
    notify.success('Successfully saved');
    setLoading(false);
  }

  const handleCancel = () => {
    goToListPage();
  }

  const goToListPage = () => {
    props.history.push('/job');
  }

  // const getFormInitialValues = () => {
  //   const values = {
  //     name: job?.name || 'New Job',
  //     status: job?.status || 'todo'
  //   };
  //   if (job && job.fields) {
  //     for (const f of job.fields) {
  //       values[f.name] = f.value;
  //     }
  //   }
  //   return values;
  // }

  const handleMessage = () => {
    setShowsNotify(true);
  }

  const handleStatusChange = async option => {
    const value = option?.value;
    if (!value) return;
    if (value === 'to_sign' && !job.signDocs.length) {
      Modal.error({
        title: 'Cannot change status',
        content: <>Cannot change status to <Text strong>To Sign</Text> because there is no documents to sign.</>,
        maskClosable: true
      });
      form.setFieldsValue({});
    } else if (value !== job.status) {
      job.status = value;
      setLoading(true);
      await saveJob(job);
      loadEntity();
    }
  }

  const deleteGenDoc = (docTemplateId) => {
    const doc = job.genDocs.find(d => d.docTemplateId === docTemplateId);
    Modal.confirm({
      title: <>Delete <Text strong>{doc.docTemplateName}</Text></>,
      icon: <QuestionCircleOutlined danger/>,
      closable: true,
      maskClosable: true,
      okText: 'Yes, Delete',
      okButtonProps: {
        danger: true
      },
      onOk: () => {
        delete doc.fileId;
        delete doc.fileName;
        setJob({ ...job });
      }
    });

  }

  const status = job?.status;
  const defaultStatus = {
    todo: 'To Do',
    to_sign: 'To Sign',
    signed: 'Signed',
    complete: 'Complete',
    archive: 'Archive'
  };

  const [statusValue, setStatusValue] = React.useState({ value: defaultStatus[status] });

  const options = [
    { value: 'todo', label: 'To Do' },
    { value: 'to_sign', label: 'To Sign' },
    { value: 'signed', label: 'Signed' },
    { value: 'complete', label: <Text type="success">Complete</Text> },
    { value: 'archive', label: <Text type="danger">Archive</Text> },
  ];

  const handleModifyFields = () => {
    setDrawerVisible(true);
  }

  const handleFieldChange = async value => {
    job.fields = value;
    setJob({...job});
    setDrawerVisible(false);
    // await handleSubmit();
    // await loadEntity();
  }

  return (<LayoutStyled>
    <HomeHeader></HomeHeader>
    <ContainerStyled>
      {job && <Form
        form={form}
        layout="vertical"
        onValuesChange={handleValuesChange}
        onFinish={handleSubmit}
        style={{ textAlign: 'left', width: '100%' }}
        initialValues={job}
      >
        <PageHeader
          onBack={() => handleCancel()}
          title={job.name}
          // subTitle={<JobProgressBar status={job.status} width={60} />}
          extra={[
            <Space key="1" style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button type="primary" ghost disabled={loading} icon={<SyncOutlined />} onClick={() => loadEntity()}></Button>
              <Button type="primary" ghost disabled={loading} onClick={() => handleMessage()}>Message</Button>
              <Button type="primary" ghost disabled={loading} onClick={() => handleModifyFields()}>Modify Fields</Button>
              <Button type="primary" htmlType="submit" disabled={loading}>Save</Button>
              <StatusSelect value={statusValue}
                labelInValue={true}
                style={{ width: 120 }}
                className={status}
                onChange={handleStatusChange}
              >
                {options
                  .filter(x => x.value !== status)
                  .map((x, i) => <Select.Option key={i} value={x.value}>{x.label}</Select.Option>)}
              </StatusSelect>
            </Space>
          ]}
        >
        </PageHeader>

        <Divider />
        <Row gutter={32}>
          <Col span={12}>
            {job.fields.map((field, i) => {
              const { name, description, type } = field;
              const formItemProps = {
                label: <>{varNameToLabelName(name)}{description && <Text type="secondary"> ({description})</Text>}</>,
                name: ['fields', i, 'value']
                // rules: [{ required }]
              }
              return (
                <Form.Item key={i} {...formItemProps}>
                  {type === 'text' ? <Input disabled={loading} /> :
                    type === 'year' ? <DateInput picker="year" placeholder="YYYY" disabled={loading} /> :
                      type === 'monthRange' ? <RangePickerInput picker="month" disabled={loading} /> :
                        type === 'number' ? <Input disabled={loading} type="number" /> :
                          type === 'paragraph' ? <Input.TextArea disabled={loading} /> :
                            type === 'date' ? <DateInput picker="date" disabled={loading} placeholder="DD MMM YYYY" style={{ display: 'block' }} format="D MMM YYYY" /> :
                              type === 'select' ? <Radio.Group disabled={loading} buttonStyle="solid">
                                {field.options?.map((x, i) => <Radio key={i} style={{ display: 'block', height: '2rem' }} value={x.value}>{x.label}</Radio>)}
                              </Radio.Group> :
                                null}
                </Form.Item>
              );
            })}
          </Col>
          <Col span={12}>
            {job.genDocs && <Form.Item
              label="Auto Generated Docs"
            >
              {job.genDocs.map((d, i) => <div key={i}>{
                d.fileId ? <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <FileLink id={d.fileId} />
                  <DeleteGenDocButton type="link" size="large" icon={<DeleteOutlined />} onClick={() => deleteGenDoc(d.docTemplateId)}></DeleteGenDocButton>
                </Space>
                  : <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Space style={{ width: '100%', alignItems: 'center' }}>
                      <FileIcon name={`${d.docTemplateName}.gen`} /> {d.docTemplateName}<Tag>pending</Tag>
                    </Space>
                    <Button type="link" size="large" icon={<FileAddOutlined />} onClick={() => showGenDocModal(d.docTemplateId)}></Button>
                  </Space>}
              </div>)}
            </Form.Item>}
            {job.uploadDocs && <Form.Item
              label="Client Uploaded Docs"
              name="uploadDocs"
            // rules={[{ required: true, message: 'Please upload files' }]}
            >
              <FileUploader disabled={loading} />
            </Form.Item>}
            {job.signDocs && <Form.Item
              label="Docs To Sign"
              name="signDocs"
            // rules={[{ required: true, message: 'Please upload files' }]}
            >
              <FileUploader disabled={loading} showsLastReadAt={true} showsSignedAt={true} />
            </Form.Item>}
            {job.feedbackDocs && <Form.Item
              label="Feedback Docs"
              name="feedbackDocs"
            // rules={[{ required: true, message: 'Please upload files' }]}
            >
              <FileUploader disabled={loading} showsLastReadAt={true} />
            </Form.Item>}
          </Col>
        </Row>

      </Form>
      }
      {/* <Divider type="vertical" style={{ height: "100%" }} /> */}
    </ContainerStyled>

    {(job && showsNotify) && <JobChat visible={showsNotify} onClose={() => setShowsNotify(false)} jobId={job?.id} />}

    <StyledDrawer
      title="Modify Job Fields"
      placement="right"
      closable={true}
      visible={drawerVisible}
      onClose={() => setDrawerVisible(false)}
      destroyOnClose={true}
      width={900}
      footer={null}
    >
      <FieldEditor value={job?.fields} onChange={handleFieldChange} onCancel={() => setDrawerVisible(false)} />
    </StyledDrawer>
    <Modal
      visible={currentDocTemplateId}
      title="Generate Doc"
      footer={null}
      maskClosable={true}
      destroyOnClose={true}
      onOk={() => setCurrentDocTemplateId(null)}
      onCancel={() => setCurrentDocTemplateId(null)}
    >
      {currentDocTemplateId && <GenDocForm docTemplateId={currentDocTemplateId} fields={job?.fields} onFinish={handlePostGenDoc} />}
    </Modal>
  </LayoutStyled >

  );
};

ProceedJobPage.propTypes = {
  id: PropTypes.string
};

ProceedJobPage.defaultProps = {};

export default withRouter(ProceedJobPage);
