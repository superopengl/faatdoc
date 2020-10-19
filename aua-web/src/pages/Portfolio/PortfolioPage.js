import React from 'react';
import styled from 'styled-components';
import { Typography, Layout, Button, Modal, List, Space, Row, Divider } from 'antd';
import HomeHeader from 'components/HomeHeader';
import { PortfolioAvatar } from 'components/PortfolioAvatar';
import Text from 'antd/lib/typography/Text';
import { EditOutlined, UserOutlined, PlusOutlined, TeamOutlined, DeleteOutlined } from '@ant-design/icons';
import { listPortfolio, deletePortfolio } from 'services/portfolioService';
import { TimeAgo } from 'components/TimeAgo';
import { Card } from 'antd';
import { withRouter } from 'react-router-dom';
import * as queryString from 'query-string';

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

const StyledSpace = styled(Space)`
svg, h3 {
color: #183e91 !important;
}

.ant-card {
  border-color: #183e91;
}
`


const PortfolioPage = props => {

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
        <Space size="small" direction="vertical" style={{ width: '100%' }}>
          <StyledTitleRow>
            <Title level={2} style={{ margin: 'auto' }}>Portfolios</Title>
          </StyledTitleRow>
          <Paragraph>Portfolios are predefined information that can be used to automatically fill in your task application. You can save the information like name, phone, address, TFN, and etc. for future usage.</Paragraph>
          <Row style={{ flexDirection: 'row-reverse' }}>
            <Button type="primary" ghost icon={<PlusOutlined />} onClick={() => setNewModalVisible(true)}>New Portfolio</Button>
          </Row>
          <List
            itemLayout="horizontal"
            dataSource={list}
            renderItem={item => (
              <List.Item
                // style={{backgroundImage: 'linear-gradient(to right, white, #f5f5f5)'}}
                key={item.id}
                onClick={() => handleEdit(item.id)}
              // title={item.name}
              // actions={[
              //   <Button key="edit" type="link" disabled={loading} icon={<EditOutlined />}></Button>,
              // <Button key="delete" type="link" danger disabled={loading} onClick={e => handleDelete(e, item)} icon={<DeleteOutlined />}></Button>
              // ]}
              >
                <List.Item.Meta
                  avatar={<PortfolioAvatar style={{ marginTop: 6 }} value={item.name} />}
                  title={<Text style={{ fontSize: '1.2rem' }}>{item.name}</Text>}
                  description={<Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <TimeAgo value={item.lastUpdatedAt} surfix="Last Updated" />
                    <Space>
                      <Button key="edit" shape="circle" disabled={loading} icon={<EditOutlined />}></Button>
                      <Button key="delete" shape="circle" danger disabled={loading} onClick={e => handleDelete(e, item)} icon={<DeleteOutlined />}></Button>
                    </Space>
                  </Space>}
                />
              </List.Item>
            )}
          />
        </Space>
      </ContainerStyled>
      <Modal
        title="Please choose portfolio type"
        visible={newModalVisible}
        destroyOnClose={true}
        onOk={() => setNewModalVisible(false)}
        onCancel={() => setNewModalVisible(false)}
        footer={null}
        width="90vw"
        centered={true}
        style={{ maxWidth: 400 }}
      >
        <StyledSpace style={{ textAlign: 'center', width: '100%' }} size="small" direction="vertical">
          <Card
            title={null}
            hoverable={true}
            onClick={() => handleCreateNew('individual')}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <UserOutlined style={{ fontSize: '2rem' }} />
              <Title level={3}>Individual Portfolio</Title>
             For individual information like given name, surname, date of birth, etc.
              </Space>
          </Card>
          <Divider>or</Divider> 
          <Card
            title={null}
            hoverable={true}
            onClick={() => handleCreateNew('business')}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <TeamOutlined style={{ fontSize: '2rem' }} />
              <Title level={3}>Business Portfolio</Title>
              For organisation or compnay information like company name, ACN, ABN, etc.
              </Space>
          </Card>
        </StyledSpace>
      </Modal>
    </LayoutStyled >
  );
};

PortfolioPage.propTypes = {};

PortfolioPage.defaultProps = {};

export default withRouter(PortfolioPage);
