import React from 'react';
import styled from 'styled-components';
import { Typography, Layout, Button, Modal, List, Space, Row } from 'antd';
import HomeHeader from 'components/HomeHeader';
import { PortfolioAvatar } from 'components/PortfolioAvatar';
import Text from 'antd/lib/typography/Text';
import { EditOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { listPortfolio, deletePortfolio } from 'services/portfolioService';
import { TimeAgo } from 'components/TimeAgo';
import { withRouter } from 'react-router-dom';
import * as queryString from 'query-string';
import ChoosePortfolioType from 'components/ChoosePortfolioType';
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

  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [newModalVisible, setNewModalVisible] = React.useState(!!create);

  const loadList = async () => {
    setLoading(true);
    const data = await listPortfolio();
    setList(data);
    setLoading(false);
  }

  React.useEffect(() => {
    loadList();
  }, [])

  const handleEdit = id => {
    props.history.push(`/portfolios/${id}`);
  }

  const handleCreateNew = (type) => {
    props.history.push(`/portfolios/new/${type}`);
  }

  const handleDelete = (e, item) => {
    e.stopPropagation();
    const { id, name } = item;
    Modal.confirm({
      title: <>To delete Portfolio <strong>{name}</strong>?</>,
      onOk: async () => {
        await deletePortfolio(id);
        loadList();
      },
      maskClosible: true,
      okButtonProps: {
        danger: true
      },
      okText: 'Yes, delete it!'
    });
  }

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <PortfolioList onLoadList={listPortfolio}/>
      </ContainerStyled>
    </LayoutStyled >
  );
};

PortfolioListPage.propTypes = {};

PortfolioListPage.defaultProps = {};

export default withRouter(PortfolioListPage);
