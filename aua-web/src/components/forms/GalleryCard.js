import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Lightbox from 'react-image-lightbox';
import { getFileUrl } from 'util/getFileUrl';
import ReactPlayer from "react-player";


const CoverImageStyled = styled.div`
width: 100%;
height: 300px;
overflow: hidden;
background-repeat: no-repeat;
background-size: contain;
background-position: center;
// border-bottom: 1px solid #f0f0f0;

&:hover {
  cursor: pointer;
}
`;


export class GalleryCard extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      previewing: false
    };
  }

  togglePreview = () => {
    this.setState({
      previewing: !this.state.previewing
    });
  }

  render() {
    const { imageId, type, videoUrl } = this.props.data;

    if (type === 'image' && imageId) {
      const imageUrl = getFileUrl(imageId);
      return (
        <div>
          <CoverImageStyled style={{ backgroundImage: `url("${imageUrl}")` }} onClick={() => this.setState({ previewing: true })} />
          {this.state.previewing && <Lightbox
            mainSrc={imageUrl}
            enableZoom={false}
            onCloseRequest={() => this.setState({ previewing: false })}
          />}
        </div>
      );
    } else if (type === 'video' && videoUrl) {
      return <ReactPlayer url={videoUrl} width="100%" controls={true} />;
    } else {
      throw new Error('Impossible code path')
    }
  }
}

GalleryCard.propTypes = {
  data: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    website: PropTypes.string,
    imageId: PropTypes.string
  })
};

GalleryCard.defaultProps = {};

export default GalleryCard;
