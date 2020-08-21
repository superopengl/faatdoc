import React from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Input, Button, Form, Modal, DatePicker, Table, Card, Space, Typography } from 'antd';
import { FileUploader } from '../../components/FileUploader';
import * as moment from 'moment';
import { GlobalContext } from 'contexts/GlobalContext';
import { Menu, Dropdown, message, Tooltip } from 'antd';
import { UpOutlined, DownOutlined, DeleteOutlined, QuestionOutlined } from '@ant-design/icons';
import { Divider } from 'antd';
import { listJobTemplates, deleteJobTemplate } from 'services/jobTemplateService';

const { Text, Paragraph } = Typography;

const StyledFormItem = styled(Form.Item)`
  // padding: 2rem;
  // margin: 1rem 0;
  // border: 1px solid #eeeeee;
  // border-radius: 8px;
  // background-color: #ffffff;
`

const StyledCard = styled(Card)`
box-shadow: 0px 2px 8px #888888;

`


const getInputFor = (type, props) => {
  switch (type) {
    case 'text':
      return <Input allowClear={true} type="text" {...props} />;
    case 'number':
      return <Input allowClear={true} type="number" {...props} />;
    case 'paragraph':
      return <Input.TextArea maxLength={1000} allowClear={true} {...props} />;
    case 'date':
      return <DatePicker style={{ display: 'block' }} format="YYYY-MM-DD" {...props} />;
    case 'upload':
      return <FileUploader {...props} />;
    default:
      throw new Error(`Unsupported job template field type '${type}`);
  }
}


const JobTemplateField = (props) => {
  const { label, name, required, type } = props;
  const InputComponent = getInputFor(type, props);
  return (
    <StyledFormItem label={label} name={name} rules={[{ required, whitespace: true, message: ' ' }]}>
      <InputComponent />
    </StyledFormItem>
  );
}



const EMPTY_ROW = {
  label: '',
  name: '',
  required: true,
  type: 'text'
}

const columns = [
  {
    title: 'No',
    render: (text, records, index) => <>{index + 1}</>
  },
  {
    title: 'Label',
    dataIndex: 'label',
  },
  {
    title: 'Name',
    dataIndex: 'name',
  },
  {
    title: 'Required',
    dataIndex: 'required',
  },
  {
    title: 'Type',
    dataIndex: 'type',
  },
];

const JobTemplateCard = (props) => {

  const { value } = props;

  console.log(value);

  const { id, name, fields } = value || {};

  const handleDelete = async (e) => {
    e.stopPropagation();
    Modal.confirm({
      title: <>To delete Job Template <strong>{name}</strong>?</>,
      onOk: async () => {
        await deleteJobTemplate(id);
        props.onDelete();
      },
      okText: 'Yes, delete it!'
    });

  }


  return (<>
    <StyledCard
      title={name}
      extra={<Button type="link" onClick={handleDelete} danger>Delete</Button>}
      bodyStyle={{margin: 0, padding: 0}}
      onClick={props.onClick}
    >
      <Table
        style={{ width: '100%' }}
        size="middle"
        footer={false}
        pagination={false}
        columns={columns}
        dataSource={fields}
      />
    </StyledCard>
  </>
  );
};

JobTemplateCard.propTypes = {};

JobTemplateCard.defaultProps = {};

export default withRouter(JobTemplateCard);
