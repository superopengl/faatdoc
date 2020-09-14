import React from 'react';
import styled from 'styled-components';
import { Typography, Layout, Button, Modal, List, Space, Row, Divider } from 'antd';
import HomeHeader from 'components/HomeHeader';
import { PortofolioAvatar } from 'components/PortofolioAvatar';
import Text from 'antd/lib/typography/Text';
import { EditOutlined, UserOutlined, PlusOutlined, TeamOutlined, DeleteOutlined } from '@ant-design/icons';
import PortofolioForm from './PortofolioForm';
import { listPortofolio, savePortofolio, deletePortofolio } from 'services/portofolioService';
import { TimeAgo } from 'components/TimeAgo';
import { Card } from 'antd';

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
color: #143e86 !important;
}

.ant-card {
  border-color: #143e86;
}
`


const PortofolioPage = props => {

  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [newModalVisible, setNewModalVisible] = React.useState(false);

  const loadList = async () => {
    setLoading(true);
    const data = await listPortofolio();
    setList(data);
    setLoading(false);
  }

  React.useEffect(() => {
    loadList();
  }, [])

  const handleEdit = id => {
    props.history.push(`/portofolio/${id}`);
  }

  const handleCreateNew = (type) => {
    props.history.push(`/portofolio/new/${type}`);
  }

  const handleDelete = (e, item) => {
    e.stopPropagation();
    const { id, name } = item;
    Modal.confirm({
      title: <>To delete Portofolio <strong>{name}</strong>?</>,
      onOk: async () => {
        await deletePortofolio(id);
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
            <Title level={2} style={{ margin: 'auto' }}>Portofolios</Title>
          </StyledTitleRow>
          <Paragraph>Portofolios are predefined information that can be used to automatically fill in your task application. You can save the information like name, phone, address, TFN, and etc. for future usage.</Paragraph>
          <Row style={{ flexDirection: 'row-reverse' }}>
            <Button type="primary" ghost icon={<PlusOutlined />} onClick={() => setNewModalVisible(true)}>New Portofolio</Button>
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
                  avatar={<PortofolioAvatar style={{ marginTop: 6 }} value={item.name} />}
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
        title="Please choose portofolio type"
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
              <Title level={3}>Individual Portofolio</Title>
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
              <Title level={3}>Business Portofolio</Title>
              For organisation or compnay information like company name, ACN, ABN, etc.
              </Space>
          </Card>
        </StyledSpace>
      </Modal>
    </LayoutStyled >
  );
};

PortofolioPage.propTypes = {};

PortofolioPage.defaultProps = {};

export default PortofolioPage;
