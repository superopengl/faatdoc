import React from 'react';
import styled from 'styled-components';
import { Tabs, Typography, Layout, Button, Modal, Divider, List, Space, Row } from 'antd';
import PosterAdminGrid from 'components/grids/PosterAdminGrid';
import GalleryAdminGrid from 'components/grids/GalleryAdminGrid';
import BusinessAdminGrid from 'components/grids/BusinessAdminGrid';
import EventAdminGrid from 'components/grids/EventAdminGrid';
import { LargePlusButton } from 'components/LargePlusButton';
import HomeHeader from 'components/HomeHeader';
import { PortofolioAvatar } from 'components/PortofolioAvatar';
import { handleDownloadCsv } from 'services/memberService';
import { saveAs } from 'file-saver';
import * as moment from 'moment';
import windowSize from 'react-window-size';
import Text from 'antd/lib/typography/Text';
import {
  IdcardOutlined, PlusOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import PortofolioForm from './PortofolioForm';
import PortofolioCard from './PortofolioCard';
import { listPortofolio, savePortofolio, deletePortofolio } from 'services/portofolioService';
import { random } from 'lodash';
import { TimeAgo } from 'components/TimeAgo';
import * as toMaterialStyle from 'material-color-hash';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

const ContainerStyled = styled.div`
margin: 6rem auto 2rem auto;
padding: 0 0.5rem;
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
`;


const PortofolioPage = (props) => {

  const [modalVisible, setModalVisible] = React.useState(false);
  const [list, setList] = React.useState([]);
  const [currentId, setCurrentId] = React.useState();
  const [loading, setLoading] = React.useState(true);

  const loadList = async () => {
    setLoading(true);
    const data = await listPortofolio();
    setList(data);
    setLoading(false);
  }

  React.useEffect(() => {
    loadList();
  }, [])

  const saveJob = async item => {
    await savePortofolio(item);
    await loadList();
    setModalVisible(false);
  }

  const openModalToCreate = () => {
    setCurrentId();
    setModalVisible(true);
  }

  const openModalToEdit = id => {
    setCurrentId(id);
    setModalVisible(true);
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
          <Paragraph>Portofolios are predefined information that can be used to automatically fill in your lodgement application. You can save the information like name, phone, address, TFN, and etc. for future usage.</Paragraph>
          <Row style={{flexDirection: 'row-reverse'}}>
            <Button type="primary" size="large" ghost icon={<PlusOutlined />} onClick={() => openModalToCreate()}>New Portofolio</Button>
          </Row>
          <List
            itemLayout="horizontal"
            dataSource={list}
            renderItem={item => (
              <List.Item
                // style={{backgroundImage: 'linear-gradient(to right, white, #f5f5f5)'}}
                key={item.id}
                onClick={() => openModalToEdit(item.id)}
                key={item.id}
                actions={[
                  <Button key="edit" type="link" disabled={loading} >edit</Button>,
                  <Button key="delete" type="link" danger disabled={loading} onClick={e => handleDelete(e, item)}>delete</Button>
                ]}
              >
                <List.Item.Meta
                  avatar={<PortofolioAvatar style={{marginTop: 6}} value={item.name} />}
                  title={<Text style={{fontSize: '1.3rem'}}>{item.name}</Text>}
                  description={<TimeAgo value={item.lastUpdatedAt} surfix="Last Updated" />}
                />
                {/* <PortofolioCard onClick={() => openModalToEdit(item.id)} onDelete={() => loadList()} id={item.id} name={item.name} /> */}
              </List.Item>
            )}
          />
        </Space>

      </ContainerStyled>
      {modalVisible && <Modal
        visible={modalVisible}
        onOk={() => setModalVisible(false)}
        onCancel={() => setModalVisible(false)}
        footer={null}
        title="Create/Edit Portofolio"
        width="90vw"
        style={{ maxWidth: 700 }}
      >
        <PortofolioForm
          onOk={item => saveJob(item)}
          onCancel={() => setModalVisible(false)}
          id={currentId}
        />
      </Modal>}
    </LayoutStyled >
  );
};

PortofolioPage.propTypes = {};

PortofolioPage.defaultProps = {};

export default PortofolioPage;
