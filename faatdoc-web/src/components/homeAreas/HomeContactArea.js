import { HomeOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { Typography, Row, Col } from 'antd';
import { HashAnchorPlaceholder } from 'components/HashAnchorPlaceholder';
import React from 'react';
import styled from 'styled-components';
import HomeRowArea from "./HomeRowArea";

const { Title } = Typography;

const InfoCard = styled.div`
box-sizing: border-box;
width: 100%;

a {
  color: #ffffff;

  &:hover {
    text-decoration: underline;
  }
}
`;


class HomeContactArea extends React.Component {
  render() {
    const props = {
      bgColor: '',
      span: {
        xs: 24,
        sm: 24,
        md: 24,
        lg: 24,
        xl: 24,
        xxl: 24
      },
      style: {
        backgroundColor: '#002855',
        color: '#f0f0f0',
      }
    }

    const span = {
      xs: 24,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 12,
      xxl: 12
    };

    return (
      <HomeRowArea {...props}>
        <InfoCard >
          <HashAnchorPlaceholder id="about" />
          <Title style={{ color: "#ffffff" }}>Contact</Title>
          <Row style={{ maxWidth: 480, margin: '1rem auto' }} gutter={16}>
            <Col {...span}>
              <MailOutlined style={{ marginRight: 8 }} /><a href="mailto:info@auao.com.au">info@auao.com.au</a>
            </Col>
            <Col {...span}>
              <MailOutlined style={{ marginRight: 8 }} /><a href="mailto:jzhou@auao.com.au">jzhou@auao.com.au</a>
            </Col>
          </Row>
          <Row style={{ maxWidth: 480, margin: '1rem auto' }} gutter={16}>
            <Col {...span}>
              <PhoneOutlined style={{ marginRight: 8 }} /><a href="tel:+61290615028">+61 2 9061 5028</a>
            </Col>
            <Col {...span}>
              <PhoneOutlined style={{ marginRight: 8 }} /><a href="tel:+61433388655">+61 433 388 655</a>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
            <HomeOutlined style={{ marginRight: 8 }} /><a href="https://maps.google.com/?q=Unit 101, 11 Spring St., Chatswood, NSW 2067" target="_blank" rel="noopener noreferrer">
                Unit 101, 11 Spring St., Chatswood, NSW 2067
                </a>
            </Col>
          </Row>
        </InfoCard>
      </HomeRowArea>
    );
  }
}

HomeContactArea.propTypes = {};

HomeContactArea.defaultProps = {};

export default HomeContactArea;
