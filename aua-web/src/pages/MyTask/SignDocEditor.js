import { Button, List, Space, Typography, Form, Checkbox, Modal } from 'antd';
import { FileIcon } from 'components/FileIcon';
import FileLink from 'components/FileLink';
import { TimeAgo } from 'components/TimeAgo';
import PropTypes from 'prop-types';
import React from 'react';
import { openFile, searchFile } from 'services/fileService';
import { signTaskDoc } from 'services/taskService';
import styled from 'styled-components';
import * as _ from 'lodash';
import { withRouter } from 'react-router-dom';

const { Link: TextLink , Text} = Typography;

const StyledListItem = styled(List.Item)`
  cursor: pointer;
  border: none !important;

  // &:hover {
  //   background-color: rgba(0,0,0,0.1);
  // }

  .ant-list-item-meta-title {
    margin-bottom: 0;
  }

  strong {
    font-weight: 800;
  }

`;

const SignDocEditor = (props) => {
  const { value, onOk } = props;

  const task = value;
  const [, setLoading] = React.useState(true);
  const [fileToSign, setFileToSign] = React.useState();
  const [files, setFiles] = React.useState([]);


  const getSignFiles = async (task) => {
    const files = await searchFile(task.docs.filter(d => d.requiresSign).map(d => d.fileId));
    return files
  }

  const loadEntity = async () => {
    setLoading(true);
    const files = await getSignFiles(task);
    const sortedFiles = _.sortBy(files, ['fileName']);
    setFiles(sortedFiles);
    setLoading(false);
  }

  React.useEffect(() => {
    loadEntity()
  }, []);

  const handleSignAll = async () => {
    const unsignedFileIds = files.filter(f => !f.signedAt).map(f => f.id);
    await signTaskDoc(task.id, unsignedFileIds);
    await loadEntity();
    onOk();
  }

  const handleFileClick = async (file) => {
    await openFile(task.id, file.id);
    loadEntity();
  }

  const showSignDocModal = async (e, file) => {
    e.stopPropagation();
    setFileToSign(file);
  }

  const handleSignFile = async (file) => {
    await signTaskDoc(task.id, [file.id]);
    setFileToSign(null);
    await loadEntity();
    onOk();
  }

  const { status } = task || {};

  const isSigned = status === 'signed';
  const canSign = status === 'to_sign' && files.every(f => !!f.lastReadAt) && !isSigned;

  return (
    <Space size="large" direction="vertical" style={{ width: '100%' }}>
      <List
        itemLayout="horizontal"
        dataSource={files}
        renderItem={item => (<StyledListItem
          onClick={() => handleFileClick(item)}
          key={item.id}
          actions={[
            item.signedAt ? null :
            item.lastReadAt ? <Button type="link" style={{ paddingRight: 0 }} onClick={e => showSignDocModal(e, item)}>Sign</Button> :
              <Button type="link" style={{ paddingRight: 0 }}>View</Button>
          ]}
        >
          <List.Item.Meta
            avatar={<FileIcon style={{ position: 'relative', top: 4 }} name={item.fileName} />}
            title={<TextLink strong={!item.lastReadAt}>{item.fileName}</TextLink>}
            description={<TimeAgo 
              direction="horizontal" 
              value={item.signedAt || item.lastReadAt} 
              prefix={item.signedAt ? 'Signed:' : 'Last view:' }
              defaultContent={<Text strong>Unread</Text>} 
              />}
          />
        </StyledListItem>)}
      />
      {!isSigned && <Form onFinish={handleSignAll}>
        <Form.Item name="" valuePropName="checked" rules={[{
          validator: (_, value) =>
            value ? Promise.resolve() : Promise.reject('You have to agree to continue.'),
        }]}>
          <Checkbox>I have read and agree on the <a href="/disclaimer" target="_blank">declare</a></Checkbox>
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit" type="primary" block disabled={!canSign}>{canSign ? 'e-Sign All Documents' : 'Please view all documents before sign'}</Button>
        </Form.Item>
      </Form>}
      {isSigned && <Button block type="primary" onClick={() => props.history.goBack()}>OK</Button>}
      <Modal
        visible={fileToSign}
        destroyOnClose={true}
        maskClosable={false}
        onOk={() => setFileToSign(null)}
        onCancel={() => setFileToSign(null)}
        footer={null}
        title="Sign document"
      >
        <Form onFinish={() => handleSignFile(fileToSign)}>
          <Form.Item>
            <FileLink id={fileToSign?.id} />
          </Form.Item>
          <Form.Item name="" valuePropName="checked" rules={[{
            validator: (_, value) =>
              value ? Promise.resolve() : Promise.reject('You have to agree to continue.'),
          }]}>
            <Checkbox>I have read and agree on the <a href="/disclaimer" target="_blank">declare</a></Checkbox>
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" type="primary" block>Sign</Button>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};

SignDocEditor.propTypes = {
  id: PropTypes.string
};

SignDocEditor.defaultProps = {};

export default withRouter(SignDocEditor);
