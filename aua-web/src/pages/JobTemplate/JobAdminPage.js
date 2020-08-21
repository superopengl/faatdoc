import React from 'react';
import styled from 'styled-components';
import { Tabs, Typography, Layout, Button, Row, Card } from 'antd';
import PosterAdminGrid from 'components/grids/PosterAdminGrid';
import GalleryAdminGrid from 'components/grids/GalleryAdminGrid';
import BusinessAdminGrid from 'components/grids/BusinessAdminGrid';
import EventAdminGrid from 'components/grids/EventAdminGrid';
import HomeHeader from 'components/HomeHeader';
import JobTemplateForm from 'pages/JobTemplate/JobTemplateForm';
import JobTemplateCard from 'pages/JobTemplate/JobTemplateCard';
import { handleDownloadCsv } from 'services/memberService';
import { saveAs } from 'file-saver';
import * as moment from 'moment';
import windowSize from 'react-window-size';
import Text from 'antd/lib/typography/Text';
import {
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import {LargePlusButton} from 'components/LargePlusButton';

import Modal from 'antd/lib/modal/Modal';
import { List } from 'antd';
import { Space } from 'antd';
import { listJobTemplates, saveJobTemplate } from 'services/jobTemplateService';

const { Title } = Typography;
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



export const JobAdminPage = (props) => {
  // const { windowWidth } = props;
  // const showNarrowScreenWarning = windowWidth <= 450;

  // const initialList = await listJobTemplates();

  
  const [modalVisible, setModalVisible] = React.useState(false);
  const [list, setList] = React.useState([{isNewButton: true}]);
  const [currentJob, setCurrentJob] = React.useState();
  const [initialLoaded, setInitialLoaded] = React.useState(false);
  
  const loadList = async (force = false) => {
    if (!initialLoaded || force) {
      const list = await listJobTemplates();
      setList([...list, {isNewButton: true}]);
      setInitialLoaded(true);
    }
  }

  React.useEffect(() => {
    loadList();
  })

  const saveJob = async job => {
    await saveJobTemplate(job);
    await loadList(true);
    setModalVisible(false);
  }

  const openModalToCreate = () => {
    setCurrentJob(undefined);
    setModalVisible(true);
  }

  const openModalToEdit = job => {
    setCurrentJob(job);
    setModalVisible(true);
  }

  const handleAfterDelete = async () =>  {
    await loadList(true);
  }

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <StyledTitleRow>
          <Title level={2} style={{ margin: 'auto' }}>Job Template Management</Title>
        </StyledTitleRow>
        <Space size="large" direction="vertical" style={{ width: '100%' }}>
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
                {!item.isNewButton && <JobTemplateCard onClick={() => openModalToEdit(item)} onDelete={() => handleAfterDelete()} value={item} />}
              </List.Item>
            )}
          />
        </Space>

      </ContainerStyled>
      <Modal
        visible={modalVisible}
        onOk={() => setModalVisible(false)}
        onCancel={() => setModalVisible(false)}
        footer={null}
        title="Create/Edit Job Template"
        width="90vw"
        style={{ maxWidth: 1000 }}
      >
        <JobTemplateForm
          onOk={job => saveJob(job)}
          onCancel={() => setModalVisible(false)}
          initialValue={currentJob}
        />
      </Modal>
    </LayoutStyled >
  );
};

JobAdminPage.propTypes = {};

JobAdminPage.defaultProps = {};

export default JobAdminPage;
