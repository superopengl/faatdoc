// import 'App.css';
import { Affix, Spin, Layout, Typography } from 'antd';
import ContactForm from 'components/ContactForm';
import { HashAnchorPlaceholder } from 'components/HashAnchorPlaceholder';
import HomeCarouselArea from 'components/homeAreas/HomeCarouselArea';
import HomeContactArea from 'components/homeAreas/HomeContactArea';
import HomeServiceArea from 'components/homeAreas/HomeServiceArea';
import HomeTeamArea from 'components/homeAreas/HomeTeamArea';
import HomeFooter from 'components/HomeFooter';
import HomeHeader from 'components/HomeHeader';
import { Loading } from 'components/Loading';
import React from 'react';
import { AiOutlineMessage } from "react-icons/ai";
import { listBlog } from 'services/blogService';
import styled from 'styled-components';
import BlogList from '../components/BlogList';

const { Content } = Layout;

const { Title, Paragraph } = Typography;


const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
`;

const ContainerStyled = styled.div`
  margin: 6rem 1rem 2rem 1rem;
  // height: 100%;
  // height: calc(100vh + 64px);

  .rc-md-editor {
    border: none;

    .section-container {
      padding: 0 !important;
    }
  }
`;


const BlogsPage = props => {

  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const loadList = async () => {
    setLoading(true);
    const list = await listBlog();
    setList(list);
    setLoading(false);
  }

  React.useEffect(() => {
    loadList();
  }, [])

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      {/* <BarStyled></BarStyled> */}
      <ContainerStyled>
        <Title level={2} style={{ textAlign: 'center' }}>All Blog Posts</Title>
        <Loading loading={loading}>
          <BlogList value={list} readonly={true} />
        </Loading>
      </ContainerStyled>
    </LayoutStyled>
  );
}

BlogsPage.propTypes = {};

BlogsPage.defaultProps = {};

export default BlogsPage;
