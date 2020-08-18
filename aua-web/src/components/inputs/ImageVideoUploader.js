import React from 'react';
import PropTypes from 'prop-types';
import { Radio } from 'antd';
import { FileImageOutlined, YoutubeOutlined } from '@ant-design/icons';
import ImageUploader from './ImageUploader';
import VideoLinkUploader from './VideoLinkUploader';

const options = [
  { label: <><FileImageOutlined /> Image</>, value: 'image' },
  { label: <><YoutubeOutlined /> Video</>, value: 'video' },
]

export class ImageVideoUploader extends React.Component {

  constructor(props) {
    super(props);

    const { videoUrl, imageId } = this.props;
    if (videoUrl && imageId) throw new Error('Cannot specify both videoUrl and imageId. Use either of them');
    this.state = {
      loading: false,
      isVideo: !!videoUrl,
      isImage: !!imageId
    }
  }

  handleChange = (imageIdOrVideoUrl) => {
    this.props.onChange(imageIdOrVideoUrl);
  };

  handleSelect = (e) => {
    switch (e.target.value) {
      case 'image':
        this.setState({ isImage: true, isVideo: false });
        break;
      case 'video':
        this.setState({ isImage: false, isVideo: true })
        break;
      default:
        break;
    }
  }

  render() {
    const { videoUrl, imageId } = this.props;
    const { isImage, isVideo } = this.state;

    const shouldChooseType = !isImage && !isVideo;

    return (
      <>
        {shouldChooseType && <Radio.Group
          options={options}
          onChange={this.handleSelect}
          optionType="button"
          style={{width: '100%'}}
        />}
        {isImage && <ImageUploader value={imageId} onChange={this.handleChange} />}
        {isVideo && <VideoLinkUploader value={videoUrl} onChange={this.handleChange} />}
      </>
    );
  }
}

ImageVideoUploader.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
};

ImageVideoUploader.defaultProps = {};

export default ImageVideoUploader;
