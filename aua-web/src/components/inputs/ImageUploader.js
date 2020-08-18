import React from 'react';
import PropTypes from 'prop-types';
import { Upload } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import * as mineFormat from 'mime-format';
import styled from 'styled-components';
import { getImageUrl } from 'util/getImageUrl';
import { getAuthHeader } from 'services/localStorageService';
import { notify } from 'util/notify';

const UploadStyled = styled(Upload)`
& .ant-upload {
  width: 100%;
  max-width: 600px;
  height: 300px;
  margin-left: auto;
  margin-right: auto;
  float: none;
}
`;

const ImagePreview = styled.div`
width: 100%;
height: 100%;
background-repeat: no-repeat;
background-size: contain;
background-position: center;
`;


export class ImageUploader extends React.Component {

  constructor(props) {
    super(props);

    const imageId = this.props.value;

    this.state = {
      loading: false,
      imageId,
      imageUrl: getImageUrl(imageId),
      uploadImageId: uuidv4(),
    }
  }

  beforeUpload = (file) => {
    const isImage = mineFormat.lookup(file.type).type === 'image';

    if (!isImage) {
      notify.error('You can only upload image file!');
    }
    const isSizeOk = file.size < 10 * 1024 * 1024;
    if (!isSizeOk) {
      notify.error('Image must be smaller than 10 MB!');
    }

    const isOk = isImage && isSizeOk;

    if (isOk) {
      // Start uploading
      this.setState({ loading: true });
    }
    return isOk;
  }

  getBase64 = async (img) => {
    return new Promise((res) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => res(reader.result));
      reader.readAsDataURL(img);
    })
  }

  handleChange = async info => {
    const { file } = info
    switch (file.status) {
      case 'uploading':
        return;
      case 'done':
        const { uploadImageId } = this.state;
        // Get this url from response in real world.
        const imageUrl = await this.getBase64(file.originFileObj)
        this.setState({
          imageUrl,
          imageId: uploadImageId,
          uploadImageId: uuidv4(), // Issue a new uuid for next upload
          loading: false
        });

        this.props.onChange(uploadImageId);
        break;
      default:
    }
    this.setState({ loading: false });
  };

  render() {
    const { imageUrl, uploadImageId, loading } = this.state;

    return (
      <div>
        <UploadStyled
          name="file"
          listType="picture-card"
          accept="image/*"
          // className="avatar-uploader"
          showUploadList={false}
          action={`${process.env.REACT_APP_AUA_API_ENDPOINT}/image/${uploadImageId}`}
          headers={getAuthHeader()}
          beforeUpload={this.beforeUpload}
          onChange={this.handleChange}
        // customRequest={this.onRequest}
        >
          {loading ? <LoadingOutlined style={{ fontSize: '3rem' }} /> :
            // imageUrl ? <img src={imageUrl} alt="" style={{ width: '100%', height: 'auto' }} /> : <div>
            imageUrl ? <ImagePreview style={{ backgroundImage: `url("${imageUrl}")` }} /> : <div>
              <PlusOutlined style={{ fontSize: '3rem' }} />
              <div className="ant-upload-text">Upload</div>
            </div>
          }
          {/* {imageUrl ? <img src={imageUrl} alt="" style={{ width: '100%' }} /> : uploadButton} */}
        </UploadStyled>
      </div >
    );
  }
}

ImageUploader.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
};

ImageUploader.defaultProps = {};

export default ImageUploader;
