import React from 'react';
import styled from 'styled-components';
import { Tabs, Typography, Layout, Button, Row, Table } from 'antd';
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
import Modal from 'antd/lib/modal/Modal';
import { List } from 'antd';
import { Space } from 'antd';

import { listLodgement, saveLodgement } from 'services/lodgementService';
import { random } from 'lodash';
import { listJobTemplate } from 'services/jobTemplateService';
import { listPortofolio } from 'services/portofolioService';
import { LodgementProgressBar } from 'components/LodgementProgressBar';

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


const columnDef = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'id',
    render: (text, record) =>text
  },
  {
    title: 'Created At',
    dataIndex: 'createdAt',
    key: 'id',
    render: (text, record) => {
      return moment(text).format('DD MMM YYYY')
    }
  },
  {
    title: 'Job',
    dataIndex: 'jobTemplateName',
    key: 'id',
    render: (text, record) => {
      return text;
    }
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'id',
    render: (text, record) => {
      return <LodgementProgressBar status={text} width={50}/>;
    }
  },
  {
    title: 'Action',
    key: 'action',
    render: (text, record) => (
      <Space size="middle">
        <Link to={`/lodgement/proceed/${record.id}`}>Proceed</Link>
        <a>Message</a>
      </Space>
    ),
  },
];

const AdminLodgementPage = (props) => {

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

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <Space size="large" direction="vertical" style={{ width: '100%' }}>
          <StyledTitleRow>
            <Title level={2} style={{ margin: 'auto' }}>Lodgement</Title>
          </StyledTitleRow>
          <Paragraph>Lodgements are predefined information that can be automatically filled into your lodgement. You can save the information like name, phone, address, TFN, and etc. for future usage.</Paragraph>

          <Button onClick={() => openModalToCreate()}>Create New Lodgement</Button>
          <Table columns={columnDef} dataSource={lodgementList}></Table>
          {/* <List
            grid={{
              gutter: 24,
              xs: 1,
              sm: 1,
              md: 2,
              lg: 2,
              xl: 3,
              xxl: 4,
            }}
            dataSource={lodgementList}
            renderItem={item => (
              <List.Item key={item.id}>
                {item.isNewButton && <LargePlusButton onClick={() => openModalToCreate()} />}
                {!item.isNewButton && <LodgementCard onClick={() => openModalToEdit(item.id)} onDelete={() => loadList()} value={item} />}
              </List.Item>
            )}
          /> */}
        </Space>

      </ContainerStyled>
      {/* {modalVisible && <Modal
        visible={modalVisible}
        onOk={() => handleModalCancel()}
        onCancel={() => handleModalCancel()}
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
      </Modal>} */}
    </LayoutStyled >
  );
};

AdminLodgementPage.propTypes = {};

AdminLodgementPage.defaultProps = {};

export default AdminLodgementPage;
