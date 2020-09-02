import React from 'react';
import styled from 'styled-components';
import { Tabs, Typography, Layout, Button, Modal, Divider } from 'antd';
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
import { Link, withRouter } from 'react-router-dom';
import { List } from 'antd';
import { Space } from 'antd';
import LodgementForm from './MyLodgementForm';
import LodgementCard from './MyLodgementCard';
import { listLodgement, saveLodgement } from 'services/lodgementService';
import { random } from 'lodash';
import { listJobTemplate } from 'services/jobTemplateService';
import { listPortofolio } from 'services/portofolioService';
import ReviewSignPage from './ReviewSignPage';
import { TabPaneProps } from 'antd/lib/tabs';

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
  const [editModalVisible, setEditModalVisible] = React.useState(false);
  const [signModalVisible, setSignModalVisible] = React.useState(false);
  const [lodgementList, setLodgementList] = React.useState([]);
  const [jobTemplateList, setJobTemplateList] = React.useState([]);
  const [portofolioList, setPortofolioList] = React.useState([]);
  const [currentLodgement, setCurrentLodgement] = React.useState();


  const loadList = async () => {
    setLoading(true);
    const list = await listLodgement();
    const jobTemplateList = await listJobTemplate() || [];
    const portofolioList = await listPortofolio() || [];

    setLodgementList(list);
    setJobTemplateList(jobTemplateList);
    setPortofolioList(portofolioList);
    setLoading(false);
  }


  React.useEffect(() => {
    loadList();
  }, [])


  const openModalToCreate = () => {
    if (!portofolioList.length) {
      Modal.confirm({
        title: 'No portofolio',
        content: 'Please create portofolio before creating lodgement. Go to create protofolio now?',
        okText: 'Yes, go to create portofolio',
        onOk: () => props.history.push('/portofolio')
      });
      return;
    }
    setCurrentLodgement();
    setEditModalVisible(true);
  }

  const openLodgement = lodgement => {
    setCurrentLodgement(lodgement);
    if (lodgement.status === 'to_sign') {
      setSignModalVisible(true);
    } else {
      setEditModalVisible(true);
    }
  }

  const handleModalOk = async () => {
    setEditModalVisible(false);
    setSignModalVisible(false);
    await loadList();
  }

  const handleConfirmAndCancel = () => {
    if (currentLodgement?.status === 'done') {
      setEditModalVisible(false);
    } else {
      Modal.confirm({
        title: 'Disgard the changes without saving?',
        icon: <ExclamationCircleOutlined />,
        okText: 'Yes, disgard the changes',
        okButtonProps: {
          danger: true
        },
        onOk: () => handleModalOk(),
        maskClosable: true,
        // cancelText: 'No, continue changing'
      });
    }
  }

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <Space size="large" direction="vertical" style={{ width: '100%' }}>
          <StyledTitleRow>
            <Title level={2} style={{ margin: 'auto' }}>Lodgement</Title>
          </StyledTitleRow>
          <Button type="primary" ghost icon={<PlusOutlined/>} onClick={() => openModalToCreate()}>Create New Lodgement</Button>
          <Divider>Ongoing Lodgments</Divider>
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
            dataSource={lodgementList.filter(x => x.status !== 'done')}
            renderItem={item => (
              <List.Item key={item.id}>
                <LodgementCard onClick={() => openLodgement(item)} onDelete={() => loadList()} value={item} />
              </List.Item>
            )}
          />
          <Divider>Finished Lodgments</Divider>
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
            dataSource={lodgementList.filter(x => x.status === 'done')}
            renderItem={item => (
              <List.Item key={item.id}>
                <LodgementCard onClick={() => openLodgement(item)} value={item} />
              </List.Item>
            )}
          />
        </Space>

      </ContainerStyled>
      {editModalVisible && <Modal
        visible={editModalVisible}
        onOk={() => handleModalOk()}
        onCancel={() => handleConfirmAndCancel()}
        footer={null}
        title="Create/Edit Lodgement"
        width="90vw"
        style={{ maxWidth: 700 }}
      >
        <LodgementForm
          onChange={() => handleModalOk()}
          onCancel={() => handleModalOk()}
          jobTemplateList={jobTemplateList}
          portofolioList={portofolioList}
          id={currentLodgement?.id}
        />
      </Modal>}
      {signModalVisible && <Modal
        title={currentLodgement?.name || 'New Lodgement'}
        visible={signModalVisible}
        onCancel={() => setSignModalVisible(false)}
        onOk={() => setSignModalVisible(false)}
        footer={null}
        width={700}
      >
        <Tabs>
          <Tabs.TabPane tab="Review and Sign" key="sign">
            <ReviewSignPage id={currentLodgement?.id} onFinish={() => handleModalOk()} onCancel={() => setSignModalVisible(false)}/>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Lodgement" key="view">
            <LodgementForm id={currentLodgement?.id} onFinish={() => handleModalOk()} onCancel={() => setSignModalVisible(false)}/>
          </Tabs.TabPane>
        </Tabs>
      </Modal>}
    </LayoutStyled >
  );
};

MyLodgementPage.propTypes = {};

MyLodgementPage.defaultProps = {};

export default withRouter(MyLodgementPage);
