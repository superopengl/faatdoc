import React from 'react';
import styled from 'styled-components';
import { Tabs, Typography, Layout, Button, Row, Card } from 'antd';
import PosterAdminGrid from 'components/grids/PosterAdminGrid';
import GalleryAdminGrid from 'components/grids/GalleryAdminGrid';
import BusinessAdminGrid from 'components/grids/BusinessAdminGrid';
import EventAdminGrid from 'components/grids/EventAdminGrid';
import {LargePlusButton} from 'components/LargePlusButton';
import HomeHeader from 'components/HomeHeader';
import { handleDownloadCsv } from 'services/memberService';
import { saveAs } from 'file-saver';
import * as moment from 'moment';
import windowSize from 'react-window-size';
import Text from 'antd/lib/typography/Text';
import {
  ExclamationCircleOutlined, PlusOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import Modal from 'antd/lib/modal/Modal';
import { List } from 'antd';
import { Space } from 'antd';
import PortofolioForm from './PortofolioForm';
import PortofolioCard from './PortofolioCard';
import { listPortofolio, savePortofolio } from 'services/portofolioService';
import { random } from 'lodash';

const { Title, Paragraph } = Typography;
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


const PortofolioPage = (props) => {

  const [modalVisible, setModalVisible] = React.useState(false);
  const [list, setList] = React.useState([{ isNewButton: true }]);
  const [currentItem, setCurrentItem] = React.useState();
  const [initialLoaded, setInitialLoaded] = React.useState(false);

  const loadList = async (force = false) => {
    if (!initialLoaded || force) {
      const data = await listPortofolio();
      setList([...data, { isNewButton: true }]);
      setInitialLoaded(true);
    }
  }

  React.useEffect(() => {
    loadList();
  })

  const saveJob = async item => {
    await savePortofolio(item);
    await loadList(true);
    setModalVisible(false);
  }

  const openModalToCreate = () => {
    setCurrentItem({});
    // setTimeout(() => setModalVisible(true), 1000);
    setModalVisible(true);
  }

  const openModalToEdit = item => {
    setCurrentItem({ ...item });
    setModalVisible(true);
  }

  const handleAfterDelete = async () => {
    await loadList(true);
  }

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <Space size="large" direction="vertical" style={{ width: '100%' }}>
          <StyledTitleRow>
            <Title level={2} style={{ margin: 'auto' }}>Portofolio</Title>
          </StyledTitleRow>
          <Paragraph>Portofolios are predefined information that can be automatically filled into your lodgement. You can save the information like name, phone, address, TFN, and etc. for future usage.</Paragraph>

          <List
            grid={{
              gutter: 24,
              xs: 1,
              sm: 1,
              md: 2,
              lg: 2,
              xl: 3,
              xxl: 4,
            }}
            dataSource={list}
            renderItem={item => (
              <List.Item key={item.id}>
                {item.isNewButton && <LargePlusButton onClick={() => openModalToCreate()} />}
                {!item.isNewButton && <PortofolioCard onClick={() => openModalToEdit(item)} onDelete={() => handleAfterDelete()} value={item} />}
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
          value={currentItem}
        />
      </Modal>}
    </LayoutStyled >
  );
};

PortofolioPage.propTypes = {};

PortofolioPage.defaultProps = {};

export default PortofolioPage;
