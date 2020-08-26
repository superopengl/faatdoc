import React from 'react';
import styled from 'styled-components';
import { Tabs, Typography, Layout, Button, Row, Modal } from 'antd';
import PosterAdminGrid from 'components/grids/PosterAdminGrid';
import GalleryAdminGrid from 'components/grids/GalleryAdminGrid';
import BusinessAdminGrid from 'components/grids/BusinessAdminGrid';
import EventAdminGrid from 'components/grids/EventAdminGrid';
import { LargePlusButton } from 'components/LargePlusButton';
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
import { List } from 'antd';
import { Space } from 'antd';
import LodgementForm from './MyLodgementForm';
import LodgementCard from './MyLodgementCard';
import { listLodgement, saveLodgement } from 'services/lodgementService';
import { random } from 'lodash';
import { listJobTemplate } from 'services/jobTemplateService';
import { listPortofolio } from 'services/portofolioService';

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


const MyLodgementPage = (props) => {

  const [loading, setLoading] = React.useState(true);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [lodgementList, setLodgementList] = React.useState([{ isNewButton: true }]);
  const [currentId, setCurrentId] = React.useState();


  const loadList = async () => {
    setLoading(true);
    const list = await listLodgement();
    setLodgementList([...list, { isNewButton: true }]);
    setLoading(false);
  }


  React.useEffect(() => {
    loadList();
  }, [])

  const saveJob = async () => {
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

  const handleModalCancel = () => {
    setModalVisible(false);
    loadList();
  }

  const handleConfirmAndCancel = () => {
    Modal.confirm({
      title: 'Disgard the changes without saving?',
      icon: <ExclamationCircleOutlined />,
      okText: 'Yes, disgard the changes',
      onOk: () => handleModalCancel(),
      // cancelText: 'No, continue changing'
    })
  }

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <Space size="large" direction="vertical" style={{ width: '100%' }}>
          <StyledTitleRow>
            <Title level={2} style={{ margin: 'auto' }}>Lodgement</Title>
          </StyledTitleRow>
          <Paragraph>Lodgements are predefined information that can be automatically filled into your lodgement. You can save the information like name, phone, address, TFN, and etc. for future usage.</Paragraph>

          <List
            grid={{
              gutter: 24,
              xs: 1,
              sm: 1,
              md: 1,
              lg: 2,
              xl: 2,
              xxl: 3,
            }}
            dataSource={lodgementList}
            renderItem={item => (
              <List.Item key={item.id}>
                {item.isNewButton && <LargePlusButton onClick={() => openModalToCreate()} />}
                {!item.isNewButton && <LodgementCard onClick={() => openModalToEdit(item.id)} onDelete={() => loadList()} value={item} />}
              </List.Item>
            )}
          />
        </Space>

      </ContainerStyled>
      {modalVisible && <Modal
        visible={modalVisible}
        onOk={() => handleModalCancel()}
        onCancel={() => handleConfirmAndCancel()}
        footer={null}
        title="Create/Edit Lodgement"
        width="90vw"
        style={{ maxWidth: 700 }}
      >
        <LodgementForm
          onChange={() => handleModalCancel()}
          onCancel={() => handleModalCancel()}
          id={currentId}
        />
      </Modal>}
    </LayoutStyled >
  );
};

MyLodgementPage.propTypes = {};

MyLodgementPage.defaultProps = {};

export default MyLodgementPage;
