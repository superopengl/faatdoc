import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Input, Button, Form, PageHeader, Space, Layout, Drawer, Typography, Radio, Row, Col, Spin } from 'antd';
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
import { FileAddOutlined, SyncOutlined } from '@ant-design/icons';
import FileLink from 'components/FileLink';
import { notify } from 'util/notify';
import { merge } from 'lodash';
import { FileIcon } from 'components/FileIcon';
import { GrDocumentConfig } from 'react-icons/gr';
import { Tag } from 'antd';
import { getDocTemplate, genPdfFromDocTemplate } from 'services/docTemplateService';
import { computeVariablesHash } from 'util/computeVariableHash';

const { Paragraph, Title } = Typography;


const GenDocForm = props => {
  const { docTemplateId, fields, onFinish } = props;
  const [loading, setLoading] = React.useState(true);
  const [docTemplate, setDocTemplate] = React.useState();
  const [initialValues, setInitialValues] = React.useState({});


  const loadEntity = async () => {
    setLoading(true);
    const docTemplate = await getDocTemplate(docTemplateId);
    const initialValues = docTemplate.variables.filter(x => x !== 'now').reduce((pre, cur) => {
      pre[cur] = fields.find(f => f.name === cur)?.value;
      return pre;
    }, {})
    setDocTemplate(docTemplate);
    setInitialValues(initialValues);
    setLoading(false);
  }

  React.useEffect(() => {
    loadEntity();
  }, []);


  const handleSubmit = async (values) => {
    setLoading(true);
    const pdfData = await genPdfFromDocTemplate(docTemplateId, values);
    const varHash = computeVariablesHash(values);
    setLoading(false);
    onFinish(pdfData.id, varHash);
  }

  return <Spin spinning={loading}>
    <Space direction="vertical" style={{ width: '100%' }}>
      <Title level={4}>{docTemplate?.name}</Title>
      {docTemplate?.description && <Paragraph type="secondary">{docTemplate.description}</Paragraph>}
      <Form
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
      </Form>
    </Space>
  </Spin>
}

GenDocForm.propTypes = {
  docTemplateId: PropTypes.string,
  fields: PropTypes.array,
};

GenDocForm.defaultProps = {
  fields: []
};

export default GenDocForm;