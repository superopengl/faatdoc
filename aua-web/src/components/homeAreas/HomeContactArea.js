import React from 'react';
import HomeRowArea from "./HomeRowArea";
import styled from 'styled-components';
import { MailOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons';
import { HashAnchorPlaceholder } from 'components/HashAnchorPlaceholder';
import { Typography } from 'antd';
import ContactForm from 'components/ContactForm';
import GoogleMapReact from 'google-map-react';

const Marker = styled.div`
color: black;

`;

const AnyReactComponent = ({ text }) => <Marker >{text}</Marker>;
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

const MapContainer = styled.div`
margin: auto;
width: 100%;
max-width: 800px;
height: 400px;
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

    const position = {
      address: 'Unit 101, 11 Spring St., Chatswood, NSW 2067',
      lat: -33.796497,
      lng: 151.185049
    };

    const renderMarkers = (map, maps) => {
      const marker = new maps.Marker({
        position,
        map,
        title: 'AU Accounting Office'
      });
      return marker;
    };

    return (
      <HomeRowArea {...props}>
        <InfoCard >
          <HashAnchorPlaceholder id="about" />
          <Title style={{ color: "#ffffff" }}>Contact</Title>
          <section style={{ textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
            <p>
              <span style={{marginRight: '2rem'}}><MailOutlined style={{ marginRight: 8 }} /><a href="mailto:accountant@auao.com.au">accountant@auao.com.au</a></span>
              <span><MailOutlined style={{ marginRight: 8 }} /><a href="mailto:jzhou@auao.com.au">jzhou@auao.com.au</a></span>
            </p>
            <p>
              <span style={{marginRight: '2rem'}}><PhoneOutlined style={{ marginRight: 8 }} /><a href="tel:+61290615028">+61 2 9061 5028</a></span>
              <span><PhoneOutlined style={{ marginRight: 8 }} /><a href="tel:+61433388655">+61 433 388 655</a></span>
            </p>
            <p>
              <HomeOutlined style={{ marginRight: 8 }} /><a href="http://maps.google.com/?q=Unit 101, 11 Spring St., Chatswood, NSW 2067" target="_blank" rel="noopener noreferrer">
                Unit 101, 11 Spring St., Chatswood, NSW 2067
                </a>
            </p>
            <MapContainer>
              <GoogleMapReact
                bootstrapURLKeys={{ key: 'AIzaSyAqcl9O4Ay_2qL7aZX_LMwIARUAXlPM9yQ' }}
                defaultCenter={position}
                defaultZoom={15}
                yesIWantToUseGoogleMapApiInternals
                onGoogleApiLoaded={({ map, maps }) => renderMarkers(map, maps)}
              >
                {/* <AnyReactComponent text="AU Accounting Office" lat={-33.796497} lng={151.185049} /> */}
              </GoogleMapReact>
            </MapContainer>
          </section>
        </InfoCard>
      </HomeRowArea>
    );
  }
}

HomeContactArea.propTypes = {};

HomeContactArea.defaultProps = {};

export default HomeContactArea;
