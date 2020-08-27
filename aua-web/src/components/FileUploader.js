import React from 'react';
import PropTypes from 'prop-types';

import { Upload, Modal, Button, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import UploadList from 'antd/es/upload/UploadList';
import en_US from 'antd/es/locale-provider/en_US';
import { v4 as uuidv4 } from 'uuid';
import * as _ from 'lodash';
import styled from 'styled-components';
import { InboxOutlined } from '@ant-design/icons';
import { searchFile } from 'services/fileService';
import { getFileUrl } from 'util/getFileUrl';
import { FileIcon, defaultStyles } from 'react-file-icon';

const { Dragger } = Upload;

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
  }
}
`

const StyledFileIcon = styled.div`
  width: 40px;
  height: 50px;
  display: inline-block;
`;

const { Text } = Typography;

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

export const FileUploader = (props) => {



  // debugger;
  // state = {
  //   previewVisible: false,
  //   previewImage: '',
  //   previewTitle: '',
  //   uploadFileId: uuidv4(),
  //   fileList: (value || []).map(img => ({
  //     uid: img.id,
  //     name: img.fileName,
  //     status: 'done',
  //     url: img.location
  //   })),
  // };

  const [previewVisible, setPreviewVisible] = React.useState(false);
  const [previewImage, setPreviewImage] = React.useState('');
  const [previewTitle, setPreviewTitle] = React.useState('');
  const [uploadFileId, setUploadFileId] = React.useState(uuidv4());
  const [fileList, setFileList] = React.useState([]);

  const loadFileList = async () => {
    const { value } = props;
    if (value && value.length) {
      const list = await searchFile(value);
      const fileList = list.map(x => ({
        uid: x.id,
        name: x.fileName,
        status: 'done',
        url: getFileUrl(x.id),
      }));
      setFileList(fileList);
    }
  }

  React.useEffect(() => {
    loadFileList();
  }, []);



  const handleCancel = () => setPreviewVisible(false);

  const handlePreview = async file => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    setPreviewVisible(false);
    setPreviewImage(file.url || file.preview);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
  };

  const handleChange = (info) => {
    const { fileList } = info;
    setFileList(fileList);
    setUploadFileId(uuidv4());

    const fileIds = fileList.filter(f => f.status === 'done').map(f => _.get(f, 'response.id', f.uid));
    props.onChange(fileIds);
  };


  const { size, disabled } = props;

  const maxSize = size || 20;

  const getFileIcon = (file, listType) => {
    const tokens = file.name.split('.');
    const ext = tokens[tokens.length -1];
    return <StyledFileIcon><FileIcon extension={ext}  /></StyledFileIcon>;
  }

  return (
    <Container className="clearfix">
      <Dragger
        multiple={true}
        action={`${process.env.REACT_APP_AUA_API_ENDPOINT}/file/${uploadFileId}`}
        withCredentials={true}
        accept="*/*"
        listType="text"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
        showUploadList={{
          showDownloadIcon: true,
          showRemoveIcon: true,
        }}
        // iconRender={() => <UploadOutlined />}
        disabled={disabled || fileList.length >= maxSize}
        iconRender={getFileIcon}
      >
        {/* <div style={{ marginTop: '1rem' }}>
            <Button disabled={disabled || fileList.length >= maxSize}>
              <UploadOutlined /> Upload (maximum {maxSize} files)
          </Button>
          </div> */}

        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag file to this area to upload</p>
        <p className="ant-upload-hint">
          Support for a single or bulk upload.
    </p>
      </Dragger>
      <Modal
        visible={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={handleCancel}
      >
        <a href={previewImage}>Click to download</a>
      </Modal>
    </Container>
  );

}

FileUploader.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string),
  size: PropTypes.number,
  disabled: PropTypes.bool,
};

FileUploader.defaultProps = {
  disabled: false
};
