import React from 'react';
import HomeRowArea from "./HomeRowArea";
import styled from 'styled-components';
import { MailOutlined, PhoneOutlined, WechatOutlined } from '@ant-design/icons';
import { HashAnchorPlaceholder } from 'components/HashAnchorPlaceholder';
import { Typography } from 'antd';

const {Title} = Typography;

const InfoCard = styled.div`
box-sizing: border-box;
width: 100%;
margin-bottom: 2rem;
font-size: 1rem;

a {
  color: #ffffff;

  &:hover {
    text-decoration: underline;
  }
}
`;


class HomeFeatureArea extends React.Component {
  render() {
    const props = {
      bgColor: '',
      span: {
        xs: 24,
        sm: 24,
        md: 24,
        lg: 12,
        xl: 12,
        xxl: 12
      },
      style: {
        backgroundColor: '#002855',
        color: '#f0f0f0',
      }
    }

    return (
      <HomeRowArea {...props}>
        <InfoCard >
          <HashAnchorPlaceholder id="about" />
          <Title style={{color: "#ffffff"}}>About Us</Title>
          <section style={{ textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
            <p>
              AUA Allied Pty Ltd, partnered with ISouth BC, is a sports club fostering harmony in the Asian community. It is also the one that contains a social club platform for all ways of lifestyle enjoyment.
            </p>
            <p>
              Our business mission is to create an all-around interactive platform for merchants and members to have a luxury and sportive lifestyle.
              </p>
            <p>
              Our business philosophy is to  build a resource sharing platform between our merchants and our members through the network connection and help each other to gain Triple wins ~ <strong><br />Merchants Win, <br />Members Win <br />and AUA Wins!</strong>
            </p>
            <p style={{ marginBottom: 0 }}>
              AUA and ISouth BC activities are including
              </p>

            <ul style={{ margin: '0 auto', textAlign: 'left' }}>
              <li>Badminton social club</li>
              <li>Tennis playing club</li>
              <li>Food tasting club</li>
              <li>Hiking and cycling activities</li>
              <li>Business partners gathering</li>
              <li>Touring and sightseeing</li>
            </ul>
            <p>
              and more activities to come.
            </p>
            <p>
              AUA and ISouth BC will help your business through sharing and promoting on all our activities, our website and our social media platforms.
            </p>
            <p>
              With our annual membership card, you can visit any of our cooperative merchants and enjoy the exclusive benefits!
            </p>
          </section>
        </InfoCard>
        <InfoCard>
          <HashAnchorPlaceholder id="contact" />
          <Title style={{color: "#ffffff"}}>Contact</Title>
          <section>

            <p>
              <MailOutlined style={{ marginRight: 8 }} /><a href="mailto:office.aua.allied@gmail.com">office.aua.allied@gmail.com</a>
        </p>
            <br />
            <p>
              <strong>Maxx</strong>
                </p>
            <p>
              <PhoneOutlined style={{ marginRight: 8 }} /><a href="tel:+61410344808">04 1034 4808</a>
            </p>
            <p>
              <WechatOutlined style={{ marginRight: 8 }} />maxxwong988
              </p>
            <br />
            <p>
              <strong>Benson</strong>
                </p>
            <p>
              <PhoneOutlined style={{ marginRight: 8 }} /><a href="tel:+61426785838">04 2678 5838</a>
            </p>
            <p>
              <WechatOutlined style={{ marginRight: 8 }} />bensonyi
              </p>

          </section>

        </InfoCard>
        {/* <InfoCard>
          <SubTitle>Disclaimer</SubTitle>
          <section>
            A disclaimer is a notice which is placed on your website in an effort to limit your liability for the outcome of the use of your site. Even if you haven't thought much about them previously, you have certainly seen disclaimers all over the web. Nearly every website has one in place, and you should as well.
        </section>
        </InfoCard> */}
      </HomeRowArea>
    );
  }
}

HomeFeatureArea.propTypes = {};

HomeFeatureArea.defaultProps = {};

export default HomeFeatureArea;
