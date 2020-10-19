import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Form, Typography, Modal } from 'antd';
import { getTask } from '../../services/taskService';
import GenDocStepperModal from './GenDocStepperModal';

const GenDocWizardModal = props => {
  const {visible} = props;
  // const { name, id, fields } = value || {};

  const [, setLoading] = React.useState(true);
  const [] = Form.useForm();

  const [task, setTask] = React.useState();
  const [] = React.useState(false);
  const [currentDocTemplateId, setCurrentDocTemplateId] = React.useState();


  const loadEntity = async () => {
    setLoading(true);
    if (id) {
      const task = await getTask(id);
      setTask(task);
      setStatusValue({ value: defaultStatus[task.status] })
    }
    setLoading(false);
  }

  const initialLoadEntity = React.useCallback(() => loadEntity());

  React.useEffect(() => {
    initialLoadEntity();
  }, [])

  const handlePostGenDoc = (fileId, varHash) => {
    const genDoc = task.genDocs.find(d => d.docTemplateId === currentDocTemplateId);
    genDoc.fileId = fileId;
    genDoc.varHash = varHash;
    setTask({ ...task });
    setCurrentDocTemplateId(null);
  }


  const status = task?.status;
  const defaultStatus = {
    todo: 'To Do',
    to_sign: 'To Sign',
    signed: 'Signed',
    complete: 'Complete',
    archive: 'Archive'
  };

  const [, setStatusValue] = React.useState({ value: defaultStatus[status] });

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
      {currentDocTemplateId && <GenDocStepperModal docTemplateId={currentDocTemplateId} fields={task?.fields} onFinish={handlePostGenDoc} />}
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
