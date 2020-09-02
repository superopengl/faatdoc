import React from 'react';

import styled from 'styled-components';

// import 'App.css';
import { Layout, Modal, Button, Affix } from 'antd';
import HomeHeader from 'components/HomeHeader';
import HomeFooter from 'components/HomeFooter';
import HomeCarouselArea from 'components/homeAreas/HomeCarouselArea';
import HomeTeamArea from 'components/homeAreas/HomeTeamArea';
import HomeServiceArea from 'components/homeAreas/HomeServiceArea';
import HomeContactArea from 'components/homeAreas/HomeContactArea';
import { HashAnchorPlaceholder } from 'components/HashAnchorPlaceholder';
import { AiOutlineWechat, AiOutlineMessage } from "react-icons/ai";
import ContactForm from 'components/ContactForm';

const { Content } = Layout;

const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
`;

const ContentStyled = styled(Content)`
  margin: 64px auto 0 auto;
  width: 100%;
`;

const AffixContactButton = styled(Button)`
width: 60px;
height: 60px;
display: flex;
align-items: center;
justify-content: center;
border: none;
background-color: rgba(20, 62, 134, 0.8);
color: white;
// box-shadow: 1px 1px 5px #222222;
border: 2px solid white;

&:focus,&:hover,&:active {
color: white;
background-color: rgba(20, 62, 134, 0.8);
border: 2px solid white;
}
`;

class HomePage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      modalVisible: false
    }

    this.contactFormRef = React.createRef();

  }

  openContactForm = () => {
    this.setState({
      modalVisible: true
    });
  }

  handleContactCancel = () => {
    this.setState({
      modalVisible: false
    }, () => this.resetContactForm());
  }

  resetContactForm = () => {
    this.contactFormRef.current.reset();
  }


  render() {

    return (
      <LayoutStyled>
        <HomeHeader></HomeHeader>
        {/* <BarStyled></BarStyled> */}
        <ContentStyled>
          <HashAnchorPlaceholder id="home" />
          <section>
            <HomeCarouselArea></HomeCarouselArea>
          </section>
          <HashAnchorPlaceholder id="services" />
          <section><HomeServiceArea /></section>
          <HashAnchorPlaceholder id="team" />
          <section><HomeTeamArea /></section>
          <section><HomeContactArea bgColor="#142952"></HomeContactArea></section>
        </ContentStyled>
        <HomeFooter></HomeFooter>
        <Affix style={{ position: 'fixed', bottom: 30, right: 30 }}>
          <AffixContactButton type="primary" shape="circle" size="large" onClick={() => this.openContactForm()}>
            <AiOutlineMessage size={36} />
          </AffixContactButton>
        </Affix>
        <Modal
          title={<div style={{ fontSize: '1rem', fontWeight: 300 }}>
            Let us tailor a service package that meets your needs. Tell us a little about how we can help you or your business, and we will get back to you with some ideas shortly.
          </div>}
          visible={this.state.modalVisible}
          onOk={this.handleContactOk}
          onCancel={this.handleContactCancel}
          footer={null}
          centered={true}
        >
          <ContactForm ref={this.contactFormRef} onDone={this.handleContactCancel}></ContactForm>
        </Modal>
      </LayoutStyled>
    );
  }
}

HomePage.propTypes = {};

HomePage.defaultProps = {};

export default HomePage;
