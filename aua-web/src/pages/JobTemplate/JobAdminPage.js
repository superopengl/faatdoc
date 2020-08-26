import React from 'react';
import styled from 'styled-components';
import { Tabs, Typography, Layout, Button, Row, Card, Col, Modal } from 'antd';
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
  ExclamationCircleOutlined,
  CloseOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { LargePlusButton } from 'components/LargePlusButton';
import { List } from 'antd';
import { Space } from 'antd';
import { listJobTemplate, saveJobTemplate, deleteJobTemplate } from 'services/jobTemplateService';

const { Title } = Typography;
const { TabPane } = Tabs;

const ContainerStyled = styled.div`
  margin: 6rem 0.5rem 2rem 0.5rem;
  // height: 100%;
  // height: calc(100vh + 64px);
`;

const StyledTabs = styled(Tabs)`
height: 100%;
 .ant-tabs-tab, .ant-tabs-nav-add {
  justify-content: space-between;
  height: 4rem;
 }

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
  height: calc(100vh - 64px);
`;

const NEW_JOB_TEMPLATE = {
  name: 'New Job Template'
}


export const JobAdminPage = (props) => {
  // const { windowWidth } = props;
  // const showNarrowScreenWarning = windowWidth <= 450;

  // const initialList = await listJobTemplates();

  const [list, setList] = React.useState([]);
  const [currentActiveTab, setCurrentActiveTab] = React.useState();

  const loadList = async () => {
      const list = await listJobTemplate();
      setList(list);
  }

  React.useEffect(() => {
    loadList();
  }, [])

  const handleTabClick = (key, e) => {
    // const item = list[currentActiveTab];
    // if(item && !item.id) {
    //   Modal.error({
    //     title: 'There is a unsaved job template. Please save it before other operation'
    //   });
    //   e.stopPropagation();
    //   debugger;
    //   return;
    // }
    // setCurrentTab(key);
  }

  const handleTabChange = activeKey => {
    const item = list[currentActiveTab];
    if(item && !item.id) {
      Modal.error({
        title: 'There is a unsaved job template. Please save or delete it before other operations.'
      });
      return;
    }
    setCurrentTab(activeKey);
  }

  const refreshList = async () => {
    await loadList();
  }

  const setCurrentTab = (key) => {
    setCurrentActiveTab(`${key}`)
  }

  const hasUnsavedNewTemplate = () => {
    return list.some(item => !item.id);
  }

  const handleEdit = async (targetKey, action) => {
    switch (action) {
      case 'add':
        if (hasUnsavedNewTemplate()) {
          Modal.error({
            title: 'There is a unsaved job template. Please save it before adding new one'
          });
          return;
        }
        setList([...list, NEW_JOB_TEMPLATE]);
        setCurrentTab(list.length);

        break;
      case 'remove':
        const item = list[targetKey];
        Modal.confirm({
          title: <>To delete Job Template <strong>{item.name}</strong>?</>,
          onOk: async () => {
            if (item.id) {
              await deleteJobTemplate(item.id);
            }
            refreshList();
          },
          okText: 'Yes, delete it!'
        });
        break;
      default:
        break;
    }
  };

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <StyledTitleRow>
          <Title level={2} style={{ margin: 'auto' }}>Job Template Management</Title>
        </StyledTitleRow>

          {/* <Button type="primary" onClick={() => handleCreateNew()} icon={<PlusOutlined />}>Create New Job Template</Button> */}
          <StyledTabs
            // size="large"
            tabPosition="left"
            activeKey={currentActiveTab}
            onTabClick={handleTabClick}
            onChange={handleTabChange}
            onEdit={handleEdit}
            type="editable-card"
          >
            {list.map((item, i) => <Tabs.TabPane key={i} tab={<>{item.name}{item.id ? null : ' *'}</>}>
              <JobTemplateForm
                id={item.id}
                onOk={() => refreshList()}
              />
            </Tabs.TabPane>)}
          </StyledTabs>

      </ContainerStyled>
    </LayoutStyled >
  );
};

JobAdminPage.propTypes = {};

JobAdminPage.defaultProps = {};

export default JobAdminPage;
