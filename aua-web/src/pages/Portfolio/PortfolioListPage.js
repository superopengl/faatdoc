import React from 'react';
import styled from 'styled-components';
import { Typography, Layout } from 'antd';
import HomeHeader from 'components/HomeHeader';
import { listPortfolio } from 'services/portfolioService';
import { withRouter } from 'react-router-dom';
import * as queryString from 'query-string';
import PortfolioList from './PortfolioList';

const { Title, Paragraph } = Typography;

const ContainerStyled = styled.div`
margin: 6rem auto 2rem auto;
padding: 0 1rem;
width: 100%;
max-width: 600px;
`;

const StyledTitleRow = styled.div`
 display: flex;
 justify-content: space-between;
 align-items: center;
 width: 100%;
`

const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;
`;


const PortfolioListPage = props => {

  const { create } = queryString.parse(props.location.search);

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <StyledTitleRow>
          <Title level={2} style={{ margin: 'auto' }}>Portfolios</Title>
        </StyledTitleRow>
        <Paragraph>Portfolios are predefined information that can be used to automatically fill in your task application. You can save the information like name, phone, address, TFN, and etc. for future usage.</Paragraph>

        <PortfolioList createMode={Boolean(create)}/>
      </ContainerStyled>
    </LayoutStyled >
  );
};

PortfolioListPage.propTypes = {};

PortfolioListPage.defaultProps = {};

export default withRouter(PortfolioListPage);
