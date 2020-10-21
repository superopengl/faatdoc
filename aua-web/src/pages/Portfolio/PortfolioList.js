import React from 'react';
import styled from 'styled-components';
import { Typography, Layout, Button, Modal, List, Space, Row } from 'antd';
import { PortfolioAvatar } from 'components/PortfolioAvatar';
import Text from 'antd/lib/typography/Text';
import { EditOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { newPortfolioForUser, deletePortfolio, savePortfolio } from 'services/portfolioService';
import { TimeAgo } from 'components/TimeAgo';
import { withRouter } from 'react-router-dom';
import * as queryString from 'query-string';
import ChoosePortfolioType from 'components/ChoosePortfolioType';
import PropTypes from 'prop-types';
import { GlobalContext } from 'contexts/GlobalContext';
import PortfolioForm from '../../components/PortfolioForm';

const { Title, Paragraph } = Typography;


const StyledTitleRow = styled.div`
 display: flex;
 justify-content: space-between;
 align-items: center;
 width: 100%;
`

const PortfolioList = props => {

  const { onLoadList, userId } = props;

  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [newModalVisible, setNewModalVisible] = React.useState(false);
  const [formVisible, setFormVisible] = React.useState(false);
  const [newType, setNewType] = React.useState(false);
  const [portfolioId, setPortfolioId] = React.useState();
  const context = React.useContext(GlobalContext);

  const loadList = async () => {
    setLoading(true);
    const data = await onLoadList();
    setList(data);
    setLoading(false);
  }

  React.useEffect(() => {
    loadList();
  }, [])

  const handleEdit = id => {
    setPortfolioId(id);
    setNewModalVisible(false);
    setFormVisible(true);
    // props.history.push(`/portfolios/${id}`);
  }

  const handleCreateNew = (type) => {
    setNewType(type);
    setPortfolioId(undefined);
    setNewModalVisible(false);
    setFormVisible(true);
  }

  const handleSubmitPortfolio = async (portfolio, userId) => {
    try {
      setLoading(true);
      if(context.user.role === 'client') {
        await savePortfolio(portfolio);
      } else {
        await newPortfolioForUser(portfolio, userId);
      }
      setFormVisible(false);
      await loadList();
    } finally {
      setLoading(false);
    }
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

  return (<>
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
            key={item.id}
            onClick={() => handleEdit(item.id)}
          >
            <List.Item.Meta
              avatar={<PortfolioAvatar style={{ marginTop: 6 }} value={item.name} id={item.id} />}
              title={<Text style={{ fontSize: '1.2rem' }}>{item.name}</Text>}
              description={<Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <TimeAgo value={item.lastUpdatedAt} prefix="Last Updated" />
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
    <ChoosePortfolioType
      visible={newModalVisible}
      onOk={type => handleCreateNew(type)}
      onCancel={() => setNewModalVisible(false)}
    />
    <Modal
      visible={formVisible}
      maskClosable={true}
      destroyOnClose={true}
      footer={null}
      onOk={() => setFormVisible(false)}
      onCancel={() => setFormVisible(false)}
    >

      <PortfolioForm
        loading={loading}
        id={portfolioId}
        type={newType}
        onCancel={() => setFormVisible(false)}
        onOk={portfolio => handleSubmitPortfolio(portfolio, userId)}
        />
    </Modal>
  </>
  );
};

PortfolioList.propTypes = {
  userId: PropTypes.string,

};

PortfolioList.defaultProps = {};

export default withRouter(PortfolioList);
