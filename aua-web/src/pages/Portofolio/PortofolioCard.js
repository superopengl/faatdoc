import React from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import { Input, Button, Form, Modal, DatePicker, Table, Card, Space, Typography } from 'antd';
import { FileUploader } from 'components/FileUploader';
import * as moment from 'moment';
import { GlobalContext } from 'contexts/GlobalContext';
import { Menu, Dropdown, message, Tooltip } from 'antd';
import { UpOutlined, DownOutlined, DeleteOutlined, QuestionOutlined } from '@ant-design/icons';
import { Divider } from 'antd';
import { listPortofolios, deletePortofolio } from 'services/portofolioService';
import { normalizeFieldNameToVar } from 'util/normalizeFieldNameToVar';
import { getDisplayNameFromVarName } from 'util/getDisplayNameFromVarName';

const { Text, Title, Paragraph } = Typography;

const StyledFormItem = styled(Form.Item)`
  // padding: 2rem;
  // margin: 1rem 0;
  // border: 1px solid #eeeeee;
  // border-radius: 8px;
  // background-color: #ffffff;
`
const StyledCard = styled(Card)`
box-shadow: 0px 1px 4px #cccccc;
&:hover {
  cursor: pointer;
}
`

const EMPTY_ROW = {
  label: '',
  name: '',
  required: true,
  type: 'text'
}

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    render: (text) => getDisplayNameFromVarName(text)
  },
  {
    title: 'Value',
    dataIndex: 'value',
  }
];

const PortofolioCard = (props) => {

  const { id, name } = props;

  const handleDelete = async (e) => {
    e.stopPropagation();
    Modal.confirm({
      title: <>To delete Portofolio <strong>{name}</strong>?</>,
      onOk: async () => {
        await deletePortofolio(id);
        props.onDelete();
      },
      okText: 'Yes, delete it!'
    });
  }

  // const data = fields;


  return (<>
    <StyledCard
      hoverable={true}
      title={<Title style={{ margin: 0 }}>{name}</Title>}
      extra={<Button type="link" onClick={handleDelete} danger>Delete</Button>}
      bodyStyle={{ margin: 0, padding: 0 }}
      onClick={props.onClick}
    >
      {/* <Table
        style={{ width: '100%' }}
        size="small"
        footer={false}
        pagination={false}
        columns={columns}
        dataSource={data}
      /> */}
    </StyledCard>
  </>
  );
};

PortofolioCard.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onDelete: PropTypes.func,
};

PortofolioCard.defaultProps = {};

export default withRouter(PortofolioCard);
