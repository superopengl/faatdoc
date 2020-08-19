import React from 'react';
import { Layout, Row, Col } from 'antd';
import styled from 'styled-components';
// import GitInfo from 'react-git-info/macro';

const { Footer } = Layout;
// const gitInfo = GitInfo();
// const gitVersion = gitInfo.commit.shortHash;
const gitVersion = process.env.REACT_APP_AUA_GIT_HASH;

const FooterStyled = styled(Footer)`
width: 100%;
text-align: center;
font-size: 0.8rem;
color: #f0f0f0;
background-color: #000000;
padding-left: 1rem;
padding-right: 1rem;

a {
  color: #f0f0f0;

  &:hover {
    text-decoration: underline;
  }
}

// line-height: rem;
`;


const HomeFooter = () => (
  <FooterStyled>
    <section id="about">
      <Row>
        <Col span={24}>
          <p>©{new Date().getFullYear()} AUAO Accounting Office PTY LTD. All right reserved.</p>
          <p style={{display: 'none'}}>Version ${gitVersion}</p>
          <p><a href="/terms_and_conditions" target="_blank">Terms & Conditions</a> | <a href="/privacy_policy" target="_blank">Privacy Policy</a> </p>
          <a href="https://www.techseeding.com.au" target="_blank" rel="noopener noreferrer">
          Technical solution by TECHSEEDING PTY LTD.
          </a>
          <div style={{marginTop: 5}}><img src="https://www.techseeding.com.au/logo-bw.png" width="120px" height="auto" alt="Techseeding logo"></img></div>
        </Col>
      </Row>
    </section>
  </FooterStyled>
);

HomeFooter.propTypes = {};

HomeFooter.defaultProps = {};

export default HomeFooter;
