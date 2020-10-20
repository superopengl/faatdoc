import {
  DeleteOutlined, EditOutlined} from '@ant-design/icons';
import { Button, Tooltip, List, Typography, Space } from 'antd';
import { TimeAgo } from 'components/TimeAgo';
import React from 'react';
import MdEditor from 'react-markdown-editor-lite'
import MarkdownIt from 'markdown-it'
import 'react-markdown-editor-lite/lib/index.css';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Card } from 'antd';

const {Title} = Typography;

const StyledList = styled(List)`
  .ant-list-item {
    border: none;
  }

  .ant-card-head {
    border: none;
  }
`;


const mdParser = new MarkdownIt({ html: true, linkify: true });

const previewConfig = {
  view: {
    menu: false,
    md: false,
    html: true
  },
  canView: {
    menu: false,
    md: false,
    html: false,
    fullScreen: false,
    hideMenu: false
  }
};

export const BlogList = props => {
  const {value, readonly, onEdit, onDelete} = props;

  const handleEdit = (e, item) => {
    e.stopPropagation();
    onEdit(item);
  }

  const handleDelete = async (e, item) => {
    e.stopPropagation();
    onDelete(item);
  }

  return (
    <StyledList
      itemLayout="vertical"
      size="large"
      dataSource={value}
      pagination={null}
      footer={null}
      renderItem={item => (
        <List.Item
          key={item.id}
          actions={[
            // <TimeAgo key="createdAt" value={item.createdAt} prefix="Created At: " accurate={false}/>,
            <TimeAgo key="updatedAt" value={item.lastUpdatedAt} prefix="Updated At: " accurate={false}/>,
            readonly ? null : <Tooltip key="delete" placement="bottom" title="Delete post">
              <Button type="link" danger icon={<DeleteOutlined />} onClick={e => handleDelete(e, item)} />
            </Tooltip>,
            readonly ? null : <Tooltip key="edit" placement="bottom" title="Edit post">
              <Button type="link" icon={<EditOutlined />} onClick={e => handleEdit(e, item)} />
            </Tooltip>
          ].filter(x => x)}
        >
          <Card title={<Space>
            <Title level={2}>{item.title}</Title>
            </Space>}>
          <MdEditor
            value={item.md}
            readOnly={true}
            config={previewConfig}
            // style={{ height: "500px" }}
            renderHTML={(text) => mdParser.render(text)}
          />
          </Card>
        </List.Item>
      )}
    />
  );
};

BlogList.propTypes = {
  readonly: PropTypes.bool,
  value: PropTypes.array.isRequired
};

BlogList.defaultProps = {
  readonly: true
};

export default BlogList;
