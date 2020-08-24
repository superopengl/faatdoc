import React from 'react';
import PropTypes from 'prop-types';
import { Card, Typography, Button } from 'antd';
import styled from 'styled-components';
import { getFileUrl } from 'util/getFileUrl';
import { LinkOutlined } from '@ant-design/icons';
const { Meta } = Card;
const { Text } = Typography;

const CardStyled = styled(Card)`
  width: 100%;
  // height: 420px;
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
  position: relative;
`;

const LinkButton = styled(Button)`
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(255,255,255,0.6);
`;

export class BusinessCard extends React.Component {

  render() {
    const { title, district, description, imageId, website } = this.props.data;

    return (
      <CardStyled
        hoverable
        cover={<CoverImageStyled style={{ backgroundImage: `url("${getFileUrl(imageId)}")` }}>
          {website && <LinkButton type="seconday" shape="circle" target="_blank" href={website} icon={<LinkOutlined />}/>}
        </CoverImageStyled>}
      >
        <MetaStyled 
        title={<div>
        <Text style={{whiteSpace: 'break-spaces'}}>{title}{district ? <small> {district}</small> : null}</Text>
        
        </div>} 
        description={description} />
        
      </CardStyled>
    );
  }
}

BusinessCard.propTypes = {
  data: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    website: PropTypes.string,
    imageId: PropTypes.string.isRequired
  })
};

BusinessCard.defaultProps = {};

export default BusinessCard;
