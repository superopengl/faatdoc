import React from 'react';
import PropTypes from 'prop-types';
import { Upload, Typography, Button, Space, Modal, Tooltip, Tag } from 'antd';
import * as _ from 'lodash';
import styled from 'styled-components';
import { getFile, searchFile } from 'services/fileService';
import { FileIcon } from '../../components/FileIcon';
import { saveAs } from 'file-saver';
import FileLink from '../../components/FileLink';
import {
  QuestionCircleOutlined, DeleteOutlined, FileAddOutlined, UploadOutlined,
  HighlightOutlined, PushpinFilled, ExclamationCircleOutlined
} from '@ant-design/icons';
import { Badge } from 'antd';
import { Popover } from 'antd';
import { TimeAgo } from '../../components/TimeAgo';
import { Table } from 'antd';
import { Checkbox } from 'antd';
import GenDocStepperModal from './GenDocStepperModal';
import { Switch } from 'antd';

const { Text } = Typography;

const Container = styled.div`
& {
  .ant-upload-list-item {
    height: 60px;
  }
  .ant-upload-list-item-card-actions-btn {
    // background-color: yellow !important;
    width: 60px;
    height: 60px;
    position: relative;
    opacity: 0.5;
  }

  .ant-upload-list-item-info > span {
    display: flex;
    align-items: center;
  }

  .ant-upload-text-icon {
    display: inline-block;
  }
  .ant-upload-list-item-name {
    width: auto;
    padding-left: 8px;
  }
}`;

const FileIconContainer = styled.div`
  display: inline-block;
  position: relative;
`;

const StyledSpace = styled(Space)`
  &:hover {
    cursor: pointer;
  }
`;


const FileIconWithOverlay = props => {
  const { id, name, showsLastReadAt, showsSignedAt } = props

  const [file, setFile] = React.useState();

  const loadEntity = async () => {
    if (showsLastReadAt || showsSignedAt) {
      const file = await getFile(id);
      setFile(file);
    }
  }

  React.useEffect(() => {
    loadEntity();
  }, []);

  if (!file) {
    return <FileIcon name={name} />
  }

  const { lastReadAt, signedAt } = file;

  return <Popover content={
    <Space direction="vertical">
      <TimeAgo value={lastReadAt} surfix="Last read:" direction="horizontal" defaultContent="Unread" />
      <TimeAgo value={signedAt} surfix="Signed at:" direction="horizontal" defaultContent="Unsigned" />
    </Space>
  } trigger="click">
    <FileIconContainer>
      <FileIcon name={name} />
      {!lastReadAt ? <Badge color="blue" style={{ position: 'absolute', top: -8, left: -8 }} /> :
        !signedAt ? <Badge color="red" style={{ position: 'absolute', top: -8, left: -8 }} /> :
          null}
    </FileIconContainer>
  </Popover>
}

export const JobDocEditor = (props) => {
  const { value, onChange } = props;

  const [docList, setDocList] = React.useState(value);
  const [loading, setLoading] = React.useState(false);
  const [genDocModalVisible, setGenDocModalVisible] = React.useState(false);
  const [docTemplateId, setDocTemplateId] = React.useState();

  React.useEffect(() => {
    setDocList(value);
  }, [value]);

  const handleChange = (info) => {
    const { file } = info;
    switch (file.status) {
      case 'uploading': {
        setLoading(true);
        return;
      }
      case 'done': {

        const fileId = _.get(file, 'response.id');
        const fileName = _.get(file, 'response.fileName');
        if (fileId) {
          setDocList([...docList, { fileId, fileName }]);
        }
      }
      default: {
        setLoading(false);
      }
    }
  };

  const handlePreview = file => {
    const fileName = file.name || file.response.fileName;
    const url = file.url || file.response.location;
    saveAs(url, fileName);
  }

  const { size, disabled } = props;

  const maxSize = size || 20;

  const updateDocList = (updatedDocList) => {
    setDocList(updatedDocList);
    onChange(updatedDocList);
  }


  const handleDeleteDoc = doc => {
    Modal.confirm({
      title: <>Delete <Text strong>{doc.fileName}</Text></>,
      icon: <QuestionCircleOutlined danger />,
      closable: true,
      maskClosable: true,
      okText: 'Yes, Delete',
      okButtonProps: {
        danger: true
      },
      onOk: () => {
        const updatedDocList = docList.filter(d => d !== doc)
        updateDocList(updatedDocList);
      }
    });
  }

  const handleReqireSign = (doc, requiresSign) => {
    if (requiresSign && !doc.fileId) {
      Modal.error({
        title: 'Cannot require sign',
        content: 'The document is not generated yet.',
        maskClosable: true,
      });
      return false;
    }
    if (!doc.signedAt) {
      doc.requiresSign = requiresSign;
      updateDocList([...docList]);
    }
  }

  const handleGenDocDone = (generatedDoc) => {
    if (docTemplateId) {
      updateDocList(docList.map(d => d.docTemplateId === docTemplateId ? generatedDoc : d));
    } else {
      updateDocList([...docList, generatedDoc])
    }
    setGenDocModalVisible(false);
  }

  const showGenDocModalSpecific = (docTemplateId) => {
    if (!docTemplateId) throw new Error('docTemplateId is not specified');
    setDocTemplateId(docTemplateId);
    setGenDocModalVisible(true);
  }

  const showGenDocModalAny = () => {
    setDocTemplateId(null);
    setGenDocModalVisible(true);
  }

  const toggleRequiresSign = (doc) => {
    doc.requiresSign = !doc.requiresSign;
    updateDocList([...docList]);
  }

  const toggleIsFeedback = (doc) => {
    doc.isFeedback = !doc.isFeedback;
    updateDocList([...docList]);
  }

  const columns = [
    {
      title: 'Document',
      dataIndex: 'fileId',
      render: (value, doc) => value ? <FileLink id={value} name={doc.fileName} /> :
        <Tooltip title="Generate from the doc template">
          <StyledSpace style={{ width: '100%', alignItems: 'center' }} onClick={() => showGenDocModalSpecific(doc.docTemplateId)}>
            <FileIcon name={doc.fileName} />
            {doc.fileName}
            <Tag icon={<ExclamationCircleOutlined />} color="warning">Pending doc template. Click to generate!</Tag>
          </StyledSpace>
        </Tooltip>
    },
    // {
    //   title: 'Doc Template',
    //   render: (value, doc) => doc.docTemplateId ? <Space>
    //     {doc.fileName?.replace(/\.pdf$/, '')}
    //     {!doc.fileId && <Tooltip title="Generate from the doc template">
    //       <Button shape="circle" onClick={() => showGenDocModalSpecific(doc.docTemplateId)} icon={<FileAddOutlined />}></Button>
    //     </Tooltip>}
    //   </Space> : null
    //   //   render: (value, doc) => {
    //   //   const { docTemplateId, fileName } = doc;
    //   //   if (!docTemplateId) return null;
    //   //   return <Button type="link" href={`/doc_template/${docTemplateId}`}>{fileName.replace(/\.pdf$/, '')}</Button>
    //   // }
    // },
    // {
    //   title: 'Require Sign?',
    //   dataIndex: 'requiresSign',
    //   render: (value, doc) => doc.signedAt ? null : <Switch defaultChecked={value} onChange={checked => handleReqireSign(doc, checked)} />
    // },
    // {
    //   title: 'Feedback Doc?',
    //   dataIndex: 'isFeedback',
    //   render: (value, doc) => <Switch defaultChecked={value} onChange={checked => handleFeedbackDoc(doc, checked)} />
    // },
    {
      title: 'Last Read At',
      dataIndex: 'lastReadAt',
      render: (value) => <TimeAgo value={value} />
    },
    {
      title: 'Signed At',
      dataIndex: 'signedAt',
      render: (value) => value ? <TimeAgo value={value} /> : null
    },
    {
      title: 'Action',
      render: (value, doc) => <Space >
        <Tooltip title="Require sign">
          <Button shape="circle" type={doc.requiresSign ? 'secondary' : 'primary'} onClick={() => toggleRequiresSign(doc)} icon={<HighlightOutlined />} disabled={!doc.fileId || doc.signedAt}></Button>
        </Tooltip>
        <Tooltip title="Make this a feedback document">
          <Button shape="circle" type={doc.isFeedback ? 'secondary' : 'primary'} onClick={() => toggleIsFeedback(doc)} icon={<PushpinFilled />} disabled={!doc.fileId}></Button>
        </Tooltip>
        <Tooltip title="Delete document">
          <Button shape="circle" onClick={() => handleDeleteDoc(doc)} danger icon={<DeleteOutlined />}></Button>
        </Tooltip>

      </Space>
    },
  ];

  let rowKey = 0;

  return (
    <Container className="clearfix">
      <Space style={{ width: '100%', margin: '1rem auto', justifyContent: 'flex-end' }}>
        <Button disabled={loading} icon={<FileAddOutlined />} onClick={() => showGenDocModalAny()}>Add from Doc Template</Button>
        <Upload
          multiple={true}
          action={`${process.env.REACT_APP_AUA_API_ENDPOINT}/file`}
          withCredentials={true}
          accept="*/*"
          // fileList={docList}
          onChange={handleChange}
          showUploadList={false}
          disabled={loading}
        >
          <Button disabled={loading} icon={<UploadOutlined />}>Click to Upload</Button>
        </Upload>
      </Space>
      {/* <Text code style={{ whiteSpace: 'pre-line' }}>{JSON.stringify(docList, null, 2)}</Text> */}
      <Table
        columns={columns}
        dataSource={docList}
        pagination={false}
        loading={loading}
        rowKey={record => rowKey++}
      />
      <GenDocStepperModal
        visible={genDocModalVisible}
        onChange={handleGenDocDone}
        docTemplateId={docTemplateId}
        onCancel={() => setGenDocModalVisible(false)}
      />
    </Container>
  );

}

JobDocEditor.propTypes = {
  value: PropTypes.arrayOf(PropTypes.any),
  disabled: PropTypes.bool,
};

JobDocEditor.defaultProps = {
  disabled: false,
};
