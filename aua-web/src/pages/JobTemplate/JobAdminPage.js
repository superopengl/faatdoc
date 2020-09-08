import React from 'react';
import styled from 'styled-components';
import { Tabs, Typography, Layout, Button, Drawer, Card, Col, Modal, Table } from 'antd';
import HomeHeader from 'components/HomeHeader';
import JobTemplateForm from 'pages/JobTemplate/JobTemplateForm';
import JobTemplateCard from 'pages/JobTemplate/JobTemplateCard';
import { saveAs } from 'file-saver';
import * as moment from 'moment';
import windowSize from 'react-window-size';
import Text from 'antd/lib/typography/Text';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { LargePlusButton } from 'components/LargePlusButton';
import { List } from 'antd';
import { Space } from 'antd';
import { listJobTemplate, saveJobTemplate, deleteJobTemplate } from 'services/jobTemplateService';
import { TimeAgo } from 'components/TimeAgo';

const { Title } = Typography;
const { TabPane } = Tabs;

const ContainerStyled = styled.div`
  margin: 6rem 0.5rem 2rem 0.5rem;
  // height: 100%;
  // height: calc(100vh + 64px);
`;

const StyledDrawer = styled(Drawer)`

.ant-drawer-content-wrapper {
  max-width: 90vw;
}

.rce-mbox {
  padding-bottom: 2rem;

  .rce-mbox-time {
    bottom: -1.5rem;
  }
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
  // height: calc(100vh - 64px);
  height: 100%;
`;

const NEW_JOB_TEMPLATE = {
  name: 'New Job Template'
}


export const JobAdminPage = (props) => {
  const columnDef = [
    {
      title: 'Name',
      dataIndex: 'name',
      render: (text, records, index) => text
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      render: (text, records, index) => <TimeAgo value={text} />
    },
    {
      title: 'Updated At',
      dataIndex: 'lastUpdatedAt',
      render: (text, records, index) => <TimeAgo value={text} />
    },
    {
      title: 'Action',
      render: (text, record, index) => (
        <Space size="small">
          <Button shape="circle" icon={<EditOutlined />} onClick={e => handleEdit(e, record)} />
          <Button shape="circle" danger icon={<DeleteOutlined />} onClick={e => handleDelete(e, record)} />
        </Space>
      ),
    },
  ];


  const [list, setList] = React.useState([]);
  const [currentActiveTab, setCurrentActiveTab] = React.useState();
  const [loading, setLoading] = React.useState(true);
  const [drawerVisible, setDrawerVisible] = React.useState(false);
  const [currentId, setCurrentId] = React.useState();


  const handleEdit = (e, item) => {
    e.stopPropagation();
    setCurrentId(item.id);
    setDrawerVisible(true);
  }

  const handleDelete = async (e, item) => {
    e.stopPropagation();
    const { id, name } = item;
    Modal.confirm({
      title: <>To delete Jot Template <strong>{name}</strong>?</>,
      onOk: async () => {
        setLoading(true);
        await deleteJobTemplate(id);
        await loadList();
        setLoading(false);
      },
      maskClosable: true,
      okButtonProps: {
        danger: true
      },
      okText: 'Yes, delete it!'
    });
  }

  const loadList = async () => {
    setLoading(true);
    const list = await listJobTemplate();
    setList(list);
    setLoading(false);
  }

  React.useEffect(() => {
    loadList();
  }, [])

  const handleCreateNew = () => {
    setCurrentId(undefined);
    setDrawerVisible(true);
  }

  const handleDrawerClose = () => {
    setDrawerVisible(false);
  }

  const handleTabChange = activeKey => {
    const item = list[currentActiveTab];
    if (item && !item.id) {
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

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <Space direction="vertical" style={{ width: '100%' }}>
        <StyledTitleRow>
          <Title level={2} style={{ margin: 'auto' }}>Job Template Management</Title>
        </StyledTitleRow>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button type="primary" ghost icon={<PlusOutlined />} onClick={() => handleCreateNew()}>New Job Template</Button>
          </Space>
          <Table columns={columnDef}
            dataSource={list}
            rowKey="id"
            loading={loading}
            pagination={false}
            // onChange={handleTableChange}
            onRow={(record, index) => ({
              onDoubleClick: e => {
                setCurrentId(record.id);
                setDrawerVisible(true);
              }
            })}
          />
        </Space>
        <StyledDrawer
          title={!currentId ? 'New Recurring' : 'Edit Recurring'}
          placement="right"
          closable={true}
          visible={drawerVisible}
          onClose={() => handleDrawerClose()}
          destroyOnClose={true}
          width={900}
          footer={null}
        >
          <JobTemplateForm id={currentId} onClose={() => handleDrawerClose()} onOk={() => {handleDrawerClose(); loadList()}}></JobTemplateForm>
        </StyledDrawer>
      </ContainerStyled>
    </LayoutStyled >
  );
};

JobAdminPage.propTypes = {};

JobAdminPage.defaultProps = {};

export default JobAdminPage;
