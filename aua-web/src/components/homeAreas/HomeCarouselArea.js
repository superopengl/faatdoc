import React from 'react';
import { Carousel, Row, Col } from 'antd';
import styled from 'styled-components';
import { List, Typography } from 'antd';
import { listPoster } from 'services/posterService';
import { getImageUrl } from 'util/getImageUrl';
import windowSize from 'react-window-size';

const { Title, Text } = Typography;

const ImgStyled = styled.div`
background-repeat: no-repeat;
background-size: cover;
background-position: center;
width: 100%;
overflow: hidden;
box-shadow: inset 0 -10px 500px -10px #143e86;
// background-color: #000000;

`

const ContainerStyled = styled.div`
border-bottom: 1px solid #f0f0f0;
margin: 0 auto 0 auto;
// padding: 1rem;
width: 100%;
`;

const PosterContainer = styled.div`
background-repeat: no-repeat;
background-size: cover;
background-position: center;
background-image: radial-gradient(rgba(0,0,0,0.8), rgba(0, 0, 0, 0.0)),url("images/poster.jpg");
width: 100%;
min-height: 200px;
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
padding: 1rem;
padding-top: 40px;

.ant-typography {
  color: rgba(255,255,255,1) !important;
  text-align: center;
}

`;



class HomeCarouselAreaRaw extends React.Component {

  constructor(props) {
    super(props);

    this.carousel = React.createRef();
    this.state = {};
  }

  componentDidMount() {
    this.loadList();
  }

  loadList() {
    const list = [
      '/images/poster.jpg'
    ]
    this.setState({
      list
    })
  }


  goTo = (i) => {
    this.carousel.goTo(i);
  }


  render() {
    const { list } = this.state;
    const { windowWidth } = this.props;

    const posterHeight = windowWidth < 576 ? 200 :
      windowWidth < 992 ? 300 :
        500;

    const catchPhraseSize = windowWidth < 576 ? 28 :
      windowWidth < 992 ? 36 :
        44;

    return (
      <ContainerStyled gutter={0} style={{ position: 'relative' }}>
        <PosterContainer style={{ height: posterHeight, position: 'relative' }}>
          <div style={{maxWidth: '1200px'}}>
              <Title style={{ fontSize: catchPhraseSize, marginTop: '2rem' }}>AU Accounting Office</Title>
              <Title level={2} style={{ marginTop: 0, fontWeight: 400, fontSize: Math.max(catchPhraseSize * 0.6, 14) }}>
              We are providing professional accounting and tax services to our clients including individuals, Sole traders, Partnerships, Companies, Trusts etc.
              You’ve got the skills and the experience. We’ve got diverse projects and meaningful work. Let’s take your career to the next level.
              </Title>
              </div>
            </PosterContainer>
      </ContainerStyled>
    );
  }
}

HomeCarouselAreaRaw.propTypes = {};

HomeCarouselAreaRaw.defaultProps = {};

export const HomeCarouselArea = windowSize(HomeCarouselAreaRaw);

export default HomeCarouselArea;
