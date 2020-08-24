import React from 'react';
import { Upload, Modal, Button, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { getAuthHeader } from 'services/localStorageService';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import UploadList from 'antd/es/upload/UploadList';
import en_US from 'antd/es/locale-provider/en_US';
import { v4 as uuidv4 } from 'uuid';
import * as _ from 'lodash';
import styled from 'styled-components';

const Container = styled.div`
& {
  .ant-upload-list-item-card-actions-btn {
    // background-color: yellow !important;
    width: 60px;
    height: 60px;
    position: relative;
    top: -20px;
  }
}

`

const { Text } = Typography;

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

class FileUploaderRaw extends React.Component {
  constructor(props) {
    super(props);

    const { value } = props;
    this.state = {
      previewVisible: false,
      previewImage: '',
      previewTitle: '',
      uploadFileId: uuidv4(),
      fileList: (value || []).map(img => ({
        uid: img.id,
        name: img.fileName,
        status: 'done',
        url: img.location
      })),
    };
  }

  onRemove = file => {
    const {fileList} = this.state;
    const newFileList = fileList.filter(item => item.uid !== file.uid);
    this.handleChange({ fileList: newFileList });
  };

  onDragEnd = ({ source, destination }) => {
    const {fileList} = this.state;
    const reorder = (list, startIndex, endIndex) => {
      const [removed] = list.splice(startIndex, 1);
      list.splice(endIndex, 0, removed);

      return list;
    };

    const newFileList = reorder(fileList, source.index, destination.index);
    this.handleChange({ fileList: newFileList });
  };

  handleCancel = () => this.setState({ previewVisible: false });

  handlePreview = async file => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    this.setState({
      previewImage: file.url || file.preview,
      previewVisible: true,
      previewTitle: file.name || file.url.substring(file.url.lastIndexOf('/') + 1),
    });
  };

  handleChange = (info) => {
    const { fileList } = info;
    this.setState({
      fileList,
      uploadFileId: uuidv4()
    });

    const fileIds = fileList.filter(f => f.status === 'done').map(f => _.get(f, 'response.id', f.uid));
    this.props.onChange(fileIds);
  };

  render() {
    const { previewVisible, previewImage, fileList, previewTitle, uploadFileId } = this.state;
    const { size, disabled } = this.props;

    const maxSize = size || 20;

    return (
      <Container className="clearfix">
        <Upload
          action={`${process.env.REACT_APP_AUA_API_ENDPOINT}/file/${uploadFileId}`}
          headers={getAuthHeader()}
          accept="*/*"
          listType="picture"
          fileList={fileList}
          onPreview={this.handlePreview}
          onChange={this.handleChange}
          showUploadList={false}
          iconRender={() => <UploadOutlined />}
          disabled={disabled}
        >
          <div style={{ marginTop: '1rem' }}>
            <Button disabled={disabled || fileList.length >= maxSize}>
              <UploadOutlined /> Upload (maximum {maxSize} files)
          </Button>
          </div>
        </Upload>

        <Modal
          visible={previewVisible}
          title={previewTitle}
          footer={null}
          onCancel={this.handleCancel}
        >
          <img alt={previewTitle} style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </Container>
    );
  }
}

FileUploaderRaw.propTypes = {};

FileUploaderRaw.defaultProps = {
  disabled: false
};

export const FileUploader = FileUploaderRaw;