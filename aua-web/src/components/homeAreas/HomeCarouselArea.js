import React, { useContext } from 'react';
import styled from 'styled-components';
import { Typography, Button, Space, Row, Col } from 'antd';
import { withRouter } from 'react-router-dom';
import { GoogleOutlined } from '@ant-design/icons';
import { useWindowWidth } from '@react-hook/window-size'
import { GlobalContext } from 'contexts/GlobalContext';
import GoogleSsoButton from 'components/GoogleSsoButton';

const { Title } = Typography;


const ContainerStyled = styled.div`
border-bottom: 1px solid #f0f0f0;
margin: 0 auto 0 auto;
// padding: 1rem;
width: 100%;
`;

const SignUpButton = styled(Button)`
margin-top: 1rem;
max-width: 300px;
height: 50px;
border-radius: 30px;
// font-size: 1.3rem;
border: 2px solid white;
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
// padding-top: 40px;

.ant-typography {
  color: rgba(255,255,255,1) !important;
  text-align: center;
}

`;

const span = {
  xs: 24,
  sm: 24,
  md: 24,
  lg: 12,
  xl: 12,
  xxl: 12
}

const HomeCarouselAreaRaw = props => {

  const windowWidth = useWindowWidth();
  const context = useContext(GlobalContext);

  const isGuest = context.role === 'guest';

  const posterHeight = windowWidth < 576 ? 400 :
    windowWidth < 992 ? 450 :
      500;

  const catchPhraseSize = windowWidth < 576 ? 28 :
    windowWidth < 992 ? 36 :
      44;

  const handleSignUp = () => {
    props.history.push('/signup')
  }

  return (
    <ContainerStyled gutter={0} style={{ position: 'relative' }}>
      <PosterContainer style={{ height: posterHeight, position: 'relative' }}>
        <Space direction="vertical" style={{ maxWidth: '1200px', textAlign: 'center' }}>
          <Title style={{ fontSize: catchPhraseSize }}>AU Accounting Office</Title>
          <Title level={2} style={{ marginTop: 0, fontWeight: 300, fontSize: Math.max(catchPhraseSize * 0.5, 14) }}>
            We are providing professional accounting and tax services to our clients including individuals, Sole traders, Partnerships, Companies, Trusts etc.
            You’ve got the skills and the experience. We’ve got diverse projects and meaningful work. Let’s take your career to the next level.
              </Title>
          {isGuest &&
            <Row style={{maxWidth: 500, margin: '0 auto'}} gutter={30}>
              <Col {...span}>
                <SignUpButton block type="primary" 
                        size="large"
                        onClick={() => handleSignUp()}>Sign Up Now!</SignUpButton>
              </Col>
              <Col {...span}>
                <GoogleSsoButton
                  render={
                    renderProps => (
                      <SignUpButton
                        block
                        type="secondary"
                        size="large"
                        icon={<GoogleOutlined />}
                        onClick={renderProps.onClick}
                        disabled={renderProps.disabled}
                      >Sign In with Google</SignUpButton>
                    )}
                />
              </Col>
            </Row>}
        </Space>
      </PosterContainer>
    </ContainerStyled>
  );
}

HomeCarouselAreaRaw.propTypes = {};

HomeCarouselAreaRaw.defaultProps = {};

export const HomeCarouselArea = withRouter(HomeCarouselAreaRaw);

export default HomeCarouselArea;
