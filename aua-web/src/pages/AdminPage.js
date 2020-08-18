import React from 'react';
import styled from 'styled-components';
import { Tabs, Typography, Layout, Button, Row } from 'antd';
import PosterAdminGrid from 'components/grids/PosterAdminGrid';
import GalleryAdminGrid from 'components/grids/GalleryAdminGrid';
import BusinessAdminGrid from 'components/grids/BusinessAdminGrid';
import EventAdminGrid from 'components/grids/EventAdminGrid';
import HomeHeader from 'components/HomeHeader';
import { handleDownloadCsv } from 'services/memberService';
import { saveAs } from 'file-saver';
import * as moment from 'moment';
import windowSize from 'react-window-size';
import Text from 'antd/lib/typography/Text';
import {
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title } = Typography;
const { TabPane } = Tabs;

const ContainerStyled = styled.div`
  margin: 6rem 0.5rem 2rem 0.5rem;
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
`;

function callback() {
  // console.log(key);
}

const MemberOperationRow = styled(Row)`
  margin-top: 2rem;
  margin-button: 2rem; 
`

export class AdminPage extends React.Component {

  handleDownloadCsv = async () => {
    const data = await handleDownloadCsv();
    // console.log(data);
    const blob = new Blob([data], { type: 'text/csv,charset=utf-8' });
    saveAs(blob, `ubcallied members ${moment().format('YYYY-MM-DD_HH-mm-ss')}.csv`);
  }

  render() {
    const { windowWidth } = this.props;

    const showNarrowScreenWarning = windowWidth <= 450;

    return (
      <LayoutStyled>
        <HomeHeader></HomeHeader>
        <ContainerStyled>
          <StyledTitleRow>
            <Title level={2} style={{ margin: 'auto' }}>AUA Content Management</Title>
          </StyledTitleRow>
          {showNarrowScreenWarning && <Text type="warning"><ExclamationCircleOutlined /> This admin page will be more convenient on wide screens.</Text>}
          <Tabs defaultActiveKey="1" onChange={callback}>
            <TabPane tab="Poster" key="poster">
              <PosterAdminGrid />
            </TabPane>
            <TabPane tab="Business" key="business">
              <BusinessAdminGrid />
            </TabPane>
            <TabPane tab="Event" key="event">
              <EventAdminGrid />
            </TabPane>
            <TabPane tab="Gallery" key="gallery">
              <GalleryAdminGrid />
            </TabPane>
            <TabPane tab="Members" key="members">
              <MemberOperationRow>
                <Button size="large" type="primary" onClick={this.handleDownloadCsv}>Download all members as CSV</Button>
              </MemberOperationRow>
              <MemberOperationRow>
                <Link to="/signup?type=business"><Button ghost size="large" type="primary">Sign Up Business Member</Button></Link>
              </MemberOperationRow>
              <MemberOperationRow>
                <Link to="/signup?type=individual"><Button ghost size="large" type="primary">Sign Up Individual Member</Button></Link>
              </MemberOperationRow>
            </TabPane>
          </Tabs>
        </ContainerStyled>
      </LayoutStyled >
    );
  }
}
AdminPage.propTypes = {};

AdminPage.defaultProps = {};

export default windowSize(AdminPage);
