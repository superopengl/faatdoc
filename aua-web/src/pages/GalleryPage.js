import React from 'react';
import styled from 'styled-components';
import { Typography, Layout, Divider } from 'antd';
import HomeHeader from 'components/HomeHeader';
import { handleDownloadCsv } from 'services/memberService';
import { saveAs } from 'file-saver';
import * as moment from 'moment';
import PropTypes from 'prop-types';
import GalleryGrid from 'components/GalleryGrid';


const { Title } = Typography;

const ContainerStyled = styled.div`
  margin: 6rem 0.5rem 2rem 0.5rem;
`;

const StyledTitleRow = styled.div`
//  display: flex;
//  justify-content: space-between;
//  align-items: center;
text-align: center;
 width: 100%;
`

const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
`;


function getGalleryGroupLabel(group) {
  switch (group) {
    case 'badminton': return 'Badminton Social Club';
    case 'tennis': return 'Tennis Playing Club';
    case 'gourmet': return 'Food Tasting Club';
    case 'hiking': return 'Hiking and Cycling Activities';
    case 'gathering': return 'Business Partners Gathering';
    case 'tour': return 'Touring and Sightseeing';
    default: throw new Error(`Unsupported group ${group}`);
  }
}

export class GalleryPage extends React.Component {

  handleDownloadCsv = async () => {
    const data = await handleDownloadCsv();
    // console.log(data);
    // const blob = new Blob([data], {type: 'text/csv,charset=utf-8'});
    saveAs(data, `ubcallied_members ${moment().format('YYYY-MM-DD_HH-mm-ss')}.csv`);
  }

  render() {
    const { group } = this.props;

    return (
      <LayoutStyled>
        <HomeHeader></HomeHeader>
        <ContainerStyled>
          <StyledTitleRow>
            <Title level={2} style={{ margin: 'auto' }}>Gallery</Title>
            <Title level={3} style={{ margin: '1rem auto auto auto' }} type="secondary">{getGalleryGroupLabel(group)}</Title>
          </StyledTitleRow>
          <Divider />
          <GalleryGrid group={group}/>
        </ContainerStyled>
      </LayoutStyled>
    );
  }
}
GalleryPage.propTypes = {
  group: PropTypes.string.isRequired
};

GalleryPage.defaultProps = {};

export default GalleryPage;
