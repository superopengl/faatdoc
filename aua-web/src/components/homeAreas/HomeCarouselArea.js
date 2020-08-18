import React from 'react';
import { Carousel, Row, Col } from 'antd';
import styled from 'styled-components';
import { List } from 'antd';
import { listPoster } from 'services/posterService';
import { getImageUrl } from 'util/getImageUrl';
import windowSize from 'react-window-size';

const ImgStyled = styled.div`
background-repeat: no-repeat;
background-size: contain;
background-position: center;
width: 100%;
overflow: hidden;
// height: 600px;
box-shadow: inset 0 -10px 10px -10px #888888;

`

const ListContainer = styled.div`
height: auto;
min-width: 200px;
width: 300px;
overflow: auto;
background-color: rgba(0,0,0,0.7);
color: #fff;

.ant-list-item:hover {
  background-color: rgba(255,255,255,0.1);
  pointer: cursor;
}
`;

const ContainerStyled = styled.div`
border-bottom: 1px solid #f0f0f0;
`;


const ItemStyled = styled(List.Item)`
color: #f0f0f0;
font-weight: bold;
cursor: pointer;
&:hover: {
  color: #fff;
  background-color: rgba(0, 32, 46, 0.3);
}
height: 2.8rem;
padding-top: 10px !important;
padding-bottom: 10px !important;
`;

const CarouselRow = styled(Row)`
background-image: url("images/background.jpg");
background-repeat: repeat;
background-size: 30%;
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

  async loadList() {
    const list = await listPoster();
    this.setState({
      list
    })
  }

  getRankIndex(i) {
    switch (i) {
      case 1:

        return <span></span>;

      default:
        break;
    }
  }

  goTo = (i) => {
    this.carousel.goTo(i);
  }


  render() {
    const { list } = this.state;
    const { windowWidth } = this.props;

    // const isNarrowScreen = useMediaQuery({ query: '(max-width: 800px)' })

    const posterHeight = windowWidth < 576 ? 200 :
      windowWidth < 992 ? 400 :
        600;
    const showsPosterList = posterHeight > 400 && list && list.length;

    return (
      <ContainerStyled gutter={0} style={{ position: 'relative' }}>
        <CarouselRow style={{ height: posterHeight }}>
          <Col span={24}>
            <Carousel autoplay dotPosition="bottom" ref={node => (this.carousel = node)}>
              {list && list.map((f, i) => (
                <div key={i}>
                  <ImgStyled style={{ height: posterHeight, backgroundImage: `url("${getImageUrl(f.imageId)}")` }}>
                  </ImgStyled>
                </div>
              ))}
            </Carousel>
          </Col>
        </CarouselRow>
        {!showsPosterList ? null : <ListContainer style={{ position: 'absolute', right: '2rem', top: '2rem', margin: '0 auto 0 auto' }}>
          <List
            size="large"
            dataSource={list}
            renderItem={(item, i) => <ItemStyled onClick={() => this.goTo(i)}>{item.title}</ItemStyled>}
          />
        </ListContainer>}
      </ContainerStyled>
    );
  }
}

HomeCarouselAreaRaw.propTypes = {};

HomeCarouselAreaRaw.defaultProps = {};

export const HomeCarouselArea = windowSize(HomeCarouselAreaRaw);

export default HomeCarouselArea;
