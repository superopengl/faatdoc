import React from 'react';
import PropTypes from 'prop-types';
import { Upload, Typography } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import * as _ from 'lodash';
import styled from 'styled-components';
import { InboxOutlined } from '@ant-design/icons';
import { searchFile } from 'services/fileService';
import { FileIcon } from './FileIcon';

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


const { Text } = Typography;


export const FileUploader = (props) => {
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
        url: x.location,
      }));
      setFileList(fileList);
    }
  }

  React.useEffect(() => {
    loadFileList();
  }, []);

  const handleChange = (info) => {
    const { fileList } = info;
    setFileList(fileList);
    setUploadFileId(uuidv4());

    const fileIds = fileList.filter(f => f.status === 'done').map(f => _.get(f, 'response.id', f.uid));
    props.onChange(fileIds);
  };


  const { size, disabled } = props;

  const maxSize = size || 20;

  const getFileIcon = file => <FileIcon name={file.name} />

  return (
    <Container className="clearfix">
      <Dragger
        multiple={true}
        action={`${process.env.REACT_APP_AUA_API_ENDPOINT}/file/${uploadFileId}`}
        withCredentials={true}
        accept="*/*"
        listType="text"
        fileList={fileList}
        // onPreview={handlePreview}
        onChange={handleChange}
        showUploadList={{
          showDownloadIcon: true,
          showRemoveIcon: true,
        }}
        // iconRender={() => <UploadOutlined />}
        disabled={disabled || fileList.length >= maxSize}
        iconRender={getFileIcon}
        // showUploadList={true}
      >
        {disabled ? <Text type="secondary">File upload is disabled</Text>
        : <>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag file to this area to upload</p>
          <p className="ant-upload-hint">
            Support single or bulk upload.
          </p>
        </>}
      </Dragger>
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
