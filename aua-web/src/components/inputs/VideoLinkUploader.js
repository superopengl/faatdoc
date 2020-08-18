import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';
import ReactPlayer from "react-player";

export class VideoLinkUploader extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      url: this.props.url
    }
  }

  handleChange = (e) => {
    const url = (e.target.value || '').trim();
    this.setState({ url });
    this.props.onChange(url);
  };

  isValidUrl = (url) => {
    return /https?:\/\/.+/i.test(url);
  }

  render() {
    const { url } = this.state;

    return (
      <>
        <Input type="url" placeholder="https://" onChange={this.handleChange} />
        {/* {url} */}
        {this.isValidUrl(url) && <ReactPlayer url={url} width="100%" controls={true} />}
      </>
    );
  }
}

VideoLinkUploader.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
};

VideoLinkUploader.defaultProps = {};

export default VideoLinkUploader;
