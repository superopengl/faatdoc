import React from 'react';
import PropTypes from 'prop-types';
import { Upload, Typography, Button, Space, Modal, Spin } from 'antd';
import * as _ from 'lodash';
import styled from 'styled-components';
import { getFile, searchFile } from 'services/fileService';
import { FileIcon } from '../../components/FileIcon';
import { saveAs } from 'file-saver';
import FileLink from '../../components/FileLink';
import {
  QuestionCircleOutlined, DeleteOutlined, FileAddOutlined, UploadOutlined
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

  // const loadFileList = async () => {
  //   const { value } = props;
  //   if (value && value.length) {
  //     setLoading(true);
  //     const list = await searchFile(value);
  //     const fileList = list.map(x => ({
  //       uid: x.id,
  //       name: x.fileName,
  //       status: 'done',
  //       url: x.location,
  //     }));
  //     setDocList(fileList);
  //     setLoading(false);
  //   }
  // }


  // React.useEffect(() => {
  //   loadFileList()
  // }, []);

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
    if (!doc.signedAt) {
      doc.requiresSign = requiresSign;
      updateDocList([...docList]);
    }
  }

  const handleFeedbackDoc = (doc, isFeedback) => {
    doc.isFeedback = isFeedback;
    updateDocList([...docList]);
  }

  const handleGenDocDone = (newDoc) => {
    updateDocList([...docList, newDoc])
    setGenDocModalVisible(false);
  }

  const columns = [
    {
      title: 'Document',
      dataIndex: 'fileId',
      render: (value, doc) => <FileLink id={value} name={doc.fileName} />
    },
    {
      title: 'Doc Template',
      render: (value, doc) => doc.docTemplateId ? doc.fileName?.replace(/\.pdf$/, '') : null
      //   render: (value, doc) => {
      //   const { docTemplateId, fileName } = doc;
      //   if (!docTemplateId) return null;
      //   return <Button type="link" href={`/doc_template/${docTemplateId}`}>{fileName.replace(/\.pdf$/, '')}</Button>
      // }
    },
    {
      title: 'Require Sign?',
      dataIndex: 'requiresSign',
      render: (value, doc) => doc.signedAt ? null : <Switch defaultChecked={value} onChange={checked => handleReqireSign(doc, checked)} />
    },
    {
      title: 'Feedback Doc?',
      dataIndex: 'isFeedback',
      render: (value, doc) => <Switch defaultChecked={value} onChange={checked => handleFeedbackDoc(doc, checked)} />
    },
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
      title: '',
      render: (value, doc) => <Button type="link" onClick={() => handleDeleteDoc(doc)} danger icon={<DeleteOutlined/>}></Button>
    }
  ];

  return (
    <Container className="clearfix">
      <Space style={{ width: '100%', margin: '1rem auto', justifyContent: 'flex-end' }}>
        <Button disabled={loading} icon={<FileAddOutlined />} onClick={() => setGenDocModalVisible(true)}>Add from Doc Template</Button>
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
        rowKey={record => record.fileId}
      />
      <GenDocStepperModal visible={genDocModalVisible} onChange={handleGenDocDone} onCancel={() => setGenDocModalVisible(false)} />
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
