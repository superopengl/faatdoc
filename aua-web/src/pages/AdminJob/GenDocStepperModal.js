import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Input, Button, Form, Modal, Space, Layout, Drawer, Typography, Radio, Row, Col, Spin } from 'antd';
import { FileUploader } from 'components/FileUploader';
import HomeHeader from 'components/HomeHeader';
import StepWizard from 'react-step-wizard';

import { Divider } from 'antd';
import { getJob, saveJob } from '../../services/jobService';
import { varNameToLabelName } from 'util/varNameToLabelName';
import { DateInput } from 'components/DateInput';
import JobChat from './JobChat';
import { RangePickerInput } from 'components/RangePickerInput';
import { Select } from 'antd';
import FieldEditor from 'components/FieldEditor';
import { FileAddOutlined, SyncOutlined } from '@ant-design/icons';
import FileLink from 'components/FileLink';
import { notify } from 'util/notify';
import { merge } from 'lodash';
import { FileIcon } from 'components/FileIcon';
import { GrDocumentConfig } from 'react-icons/gr';
import { Tag } from 'antd';
import { getDocTemplate, genPdfFromDocTemplate, listDocTemplate } from 'services/docTemplateService';
import { computeVariablesHash } from 'util/computeVariableHash';

const { Paragraph, Title, Text } = Typography;


const GenDocStepperModal = props => {
  const { visible, fields, onChange, onCancel } = props;
  const [loading, setLoading] = React.useState(true);
  const [docTemplateList, setDocTemplateList] = React.useState([]);
  const [docTemplate, setDocTemplate] = React.useState();
  const [initialValues, setInitialValues] = React.useState();
  const stepperRef = React.useRef(null);

  const loadList = async () => {
    setLoading(true);
    const list = await listDocTemplate();
    list.sort((a, b) => a.name.localeCompare(b.name));
    setDocTemplateList(list);
    setLoading(false);
  }

  React.useEffect(() => {
    if (visible) {
      loadList();
    }
  }, [visible]);


  const handleSubmit = async (values) => {
    setLoading(true);
    const pdfFile = await genPdfFromDocTemplate(docTemplate.id, values);
    setLoading(false);
    const doc = {
      docTemplateId: docTemplate.id,
      fileId: pdfFile.id,
      fileName: pdfFile.fileName,
    }
    onChange(doc)
  }

  const handleChooseDocTemplate = docTemplate => {
    setDocTemplate(docTemplate);
    const initialValues = docTemplate.variables.filter(x => x !== 'now').reduce((pre, cur) => {
      pre[cur] = fields.find(f => f.name === cur)?.value;
      return pre;
    }, {})
    setInitialValues(initialValues);
    stepperRef.current.nextStep();
  }

  return <Modal
    visible={visible}
    title="Add Document from Doc Template"
    maskClosable={true}
    closable={true}
    destroyOnClose={true}
    onOk={onCancel}
    onCancel={onCancel}
    footer={null}
  >
    {visible && <Spin spinning={loading}>
      <StepWizard ref={stepperRef}>
        <div>
          <Title level={4}>Choose a doc template</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            {docTemplateList.map((d, i) => <Button key={i} block size="large" onClick={() => handleChooseDocTemplate(d)}>{d.name}</Button>)}
          </Space>
        </div>
        <div>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Title level={4}>{docTemplate?.name}</Title>
            {docTemplate?.description && <Paragraph type="secondary">{docTemplate.description}</Paragraph>}
            {initialValues && <Form
              layout="vertical"
              // labelCol={{ span: 8 }}
              // wrapperCol={{ span: 16 }}
              onFinish={handleSubmit}
              initialValues={initialValues}
            >
              {Object.keys(initialValues).map((name, i) => <Form.Item label={varNameToLabelName(name)} name={name} key={i} rules={[{ required: true, message: ' ' }]}>
                <Input allowClear autoFocus={i === 0} />
              </Form.Item>)}
              <Form.Item>
                <Button htmlType="submit" block type="primary">Generate Doc</Button>
              </Form.Item>
            </Form>}
          </Space>
        </div>
      </StepWizard>
    </Spin>}
  </Modal>
}

GenDocStepperModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  fields: PropTypes.array,
};

GenDocStepperModal.defaultProps = {
  fields: []
};

export default GenDocStepperModal;