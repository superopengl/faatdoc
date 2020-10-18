import React from 'react';
import HomeRowArea from "./HomeRowArea";
import styled from 'styled-components';
import { Typography } from 'antd';

const { Title } = Typography;

const InfoCard = styled.div`
box-sizing: border-box;
width: 100%;
// margin-top: 2rem;
padding: 1rem;
// border: 1px solid #eeeeee;

h1 {
  // color: #183e91;
  color: rgba(0,0,0,0.7);
}

p {
  text-align: left;
}
`;


class HomeServiceArea extends React.Component {
  render() {
    const props = {
      bgColor: '',
      span: {
        xs: 24,
        sm: 24,
        md: 24,
        lg: 8,
        xl: 8,
        xxl: 8
      },
      style: {
        // backgroundColor: '#002855',
        // color: '#f0f0f0',
      }
    }

    return (
      <HomeRowArea {...props}>
        <InfoCard >
          <Title>Accounting and Bookkeeping</Title>
          <section>
            <p>
              I'm a Paragraph. Click here to add your own text and edit me. It’s easy. Just click “Edit Text” or double click me and you can start adding your own content and make changes to the font.
            </p>
            <p>
              I’m a great place for you to let your users know a little more about you. If you want to delete me just click on me and press delete.
            </p>
          </section>
        </InfoCard>

        <InfoCard >
          <Title>Tax</Title>
          <section>
            <p>
            I'm a Paragraph. Click here to add your own text and edit me. It’s easy. Just click “Edit Text” or double click me and you can start adding your own content and make changes to the font.
            </p>
            <p>
            I’m a great place for you to let your users know a little more about you. If you want to delete me just click on me and press delete.
            </p>
          </section>
        </InfoCard>

        <InfoCard >
          <Title>Business improvement</Title>
          <section>
            <p>
            I'm a Paragraph. Click here to add your own text and edit me. It’s easy. Just click “Edit Text” or double click me and you can start adding your own content and make changes to the font.
            </p>
            <p>
            I’m a great place for you to let your users know a little more about you. If you want to delete me just click on me and press delete.
            </p>
          </section>
        </InfoCard>

        <InfoCard >
          <Title>Corporate advisory</Title>
          <section>
            <p>
            I'm a Paragraph. Click here to add your own text and edit me. It’s easy. Just click “Edit Text” or double click me and you can start adding your own content and make changes to the font.
            </p>
            <p>
            I’m a great place for you to let your users know a little more about you. If you want to delete me just click on me and press delete.
            </p>
          </section>
        </InfoCard>

        <InfoCard >
          <Title>Assurance</Title>
          <section>
            <p>
            I'm a Paragraph. Click here to add your own text and edit me. It’s easy. Just click “Edit Text” or double click me and you can start adding your own content and make changes to the font.
            </p>
            <p>
            I’m a great place for you to let your users know a little more about you. If you want to delete me just click on me and press delete.
            </p>
          </section>
        </InfoCard>

        <InfoCard >
          <Title>International business</Title>
          <section>
            <p>
            I'm a Paragraph. Click here to add your own text and edit me. It’s easy. Just click “Edit Text” or double click me and you can start adding your own content and make changes to the font.
            </p>
            <p>
            I’m a great place for you to let your users know a little more about you. If you want to delete me just click on me and press delete.
            </p>
          </section>
        </InfoCard>

      </HomeRowArea>
    );
  }
}

HomeServiceArea.propTypes = {};

HomeServiceArea.defaultProps = {};

export default HomeServiceArea;
