import React from 'react';
import PropTypes from 'prop-types';
import { Card, Typography } from 'antd';
import styled from 'styled-components';
import { getImageUrl } from 'util/getImageUrl';
const { Meta } = Card;
const {Text} = Typography;


const CardStyled = styled(Card)`
  width: 100%;
  // height: 320px;
  margin-bottom: 1rem;
  text-align: center;

  .ant-card-body {
    padding: 1rem 0.5rem;
    font-size: 0.9rem;
    line-height: 1.2rem;
  }

  .ant-card-meta-title {
    font-size: 1rem;
  }
`;

const MetaStyled = styled(Meta)`
  text-align: center;
`;

const CoverImageStyled = styled.div`
  width: 100%;
  height: 200px;
  overflow: hidden;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  border: 1px solid #f0f0f0;
  border-top: none;
`;

export class EventCard extends React.Component {


  render() {
    const { title, description, imageId } = this.props.data;

    return (
      <CardStyled
        hoverable
        cover={<CoverImageStyled style={{ backgroundImage: `url("${getImageUrl(imageId)}")` }} />}
      >
        <MetaStyled title={<Text style={{whiteSpace: 'break-spaces'}}>{title}</Text>} description={description} />
      </CardStyled>
    );
  }
}

EventCard.propTypes = {
  data: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    website: PropTypes.string,
    imageId: PropTypes.string.isRequired
  })
};

EventCard.defaultProps = {};

export default EventCard;
