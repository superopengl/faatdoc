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
import GenDocStepperModal from './GenDocStepperModal';
import { JobDocEditor } from './JobDocEditor';

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

const GenDocWizardModal = props => {
  const {fields, visible, onChange} = props;
  // const { name, id, fields } = value || {};

  const [loading, setLoading] = React.useState(true);
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
    // goToListPage();
    props.history.goBack();
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

  const handleJobDocsChange = (docs) => {
    job.docs = docs;
    setJob({...job});
  }

  return (
    <Modal
      visible={visible}
      title="Generate Doc"
      footer={null}
      maskClosable={true}
      destroyOnClose={true}
      onOk={() => setCurrentDocTemplateId(null)}
      onCancel={() => setCurrentDocTemplateId(null)}
    >
      {currentDocTemplateId && <GenDocStepperModal docTemplateId={currentDocTemplateId} fields={job?.fields} onFinish={handlePostGenDoc} />}
    </Modal>
  );
};

GenDocWizardModal.propTypes = {
  fields: PropTypes.array,
  visible: PropTypes.bool.isRequired,
  onChange: PropTypes.func
};

GenDocWizardModal.defaultProps = {
  fields: []
};

export default withRouter(GenDocWizardModal);
