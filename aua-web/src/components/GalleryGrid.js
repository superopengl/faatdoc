import React from 'react';
import { listGallery } from 'services/galleryService';
import HomeRowArea from "components/homeAreas/HomeRowArea";
import GalleryCard from 'components/forms/GalleryCard';
import { Typography } from 'antd';

const {Text} = Typography;

export class GalleryGrid extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: undefined
    }
  }

  async componentDidMount() {
    const list = await listGallery(this.props.group);
    this.setState({
      list
    });
  }

  render() {
    const { list } = this.state;
    if (!list || !list.length) return <Text type="warning">Coming soon.</Text>;
    return (
      <HomeRowArea {...this.props}>
        {list && list.map((f, i) => <GalleryCard key={i} data={f} />)}
      </HomeRowArea>
    );
  }
}

GalleryGrid.propTypes = {};

GalleryGrid.defaultProps = {};

export default GalleryGrid;
