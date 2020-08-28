import React from 'react';
import styled from 'styled-components';
import { Tabs, Typography, Layout, Button, Select, Table } from 'antd';
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
  ExclamationCircleOutlined, EditOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import Modal from 'antd/lib/modal/Modal';
import { List } from 'antd';
import { Space } from 'antd';

import { listLodgement, saveLodgement, assignLodgement } from 'services/lodgementService';
import { random } from 'lodash';
import { listJobTemplate } from 'services/jobTemplateService';
import { listPortofolio } from 'services/portofolioService';
import { LodgementProgressBar } from 'components/LodgementProgressBar';
import { AutoComplete } from 'antd';
import { listAgents } from 'services/userService';

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


const AdminLodgementListPage = (props) => {

  const [loading, setLoading] = React.useState(true);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [lodgementList, setLodgementList] = React.useState([{ isNewButton: true }]);
  const [currentId, setCurrentId] = React.useState();
  const [agentList, setAgentList] = React.useState([]);
  const [filteredInfo, setFilteredInfo] = React.useState({});
  const [sortedInfo, setSortedInfo] = React.useState({});

  const columnDef = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'id',
      // filteredValue: filteredInfo.name || null,
      onFilter: (value, record) => record.name.includes(value),
      render: (text, record) => text,
      ellipsis: true
    },
    {
      title: 'From',
      dataIndex: 'from',
      key: 'id',
      render: (text, record) => text
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'id',
      sorter: (a, b) => moment(a.createdAt).toDate() - moment(b.createdAt).toDate(),
      render: (text, record) => {
        return moment(text).format('DD MMM YYYY HH:mm')
      }
    },
    {
      title: 'Job',
      dataIndex: 'jobTemplateName',
      key: 'id',
      render: (text, record) => {
        return text;
      },
      ellipsis: true
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'id',
      filters: ['draft', 'submitted', 'done', 'to_sign', 'archive'].map(a => ({ text: a, value: a })),
      onFilter: (value, record) => record.status === value,
      render: (text, record) => {
        return <LodgementProgressBar status={text} width={50} />;
      }
    },
    {
      title: 'Assignee',
      dataIndex: 'agentId',
      key: 'id',
      // filteredValue: filteredInfo.agentId || null,
      filters: agentList.map(a => ({ text: `${a.givenName} ${a.surname}`, value: a.id })),
      onFilter: (value, record) => record.agentId === value,
      render: (text, record) => <Select
        placeholder="Select an agent"
        style={{ width: 120 }}
        onChange={value => assignLodgementToAgent(record, value)}
        value={text}
      >
        {agentList.map((a, i) => <Select.Option key={i} value={a.id}>{a.givenName} {a.surname}</Select.Option>)}
      </Select>
    },
    {
      title: 'Last Read At',
      dataIndex: 'lastReadAt',
      sorter: (a, b) => moment(a.createdAt).toDate() - moment(b.createdAt).toDate(),
      key: 'id',
      render: (text, record) => {
        return <>{text && moment(text).format('DD MMM YYYY HH:mm')}</>;
      }
    },
    {
      title: 'Signed At',
      dataIndex: 'signedAt',
      sorter: (a, b) => moment(a.createdAt).toDate() - moment(b.createdAt).toDate(),
      key: 'id',
      render: (text, record) => {
        return <>{text && moment(text).format('DD MMM YYYY HH:mm')}</>;
      }
    },
    {
      title: 'Action',
      key: 'action',
      // fixed: 'right',
      // width: 200,
      render: (text, record) => (
        <Space size="middle">
          <Link to={`/lodgement/proceed/${record.id}`}><Button type="primary" ghost icon={<EditOutlined />}>Proceed</Button></Link>
        </Space>
      ),
    },
  ];

  const handleTableChange = (pagination, filters, sorter) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  }

  const clearAllFilters = () => {
    setFilteredInfo({});
    setSortedInfo({});
  }

  const assignLodgementToAgent = async (lodgement, agentId) => {
    await assignLodgement(lodgement.id, agentId);
    await loadList();
  }

  const loadList = async () => {
    setLoading(true);
    const list = await listLodgement();
    const agentList = await listAgents();
    setLodgementList(list);
    setAgentList(agentList);
    setLoading(false);
  }


  React.useEffect(() => {
    loadList();
  }, [])

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <Space size="large" direction="vertical" style={{ width: '100%' }}>
          <StyledTitleRow>
            <Title level={2} style={{ margin: 'auto' }}>Lodgement</Title>
          </StyledTitleRow>
          <Paragraph>Lodgements are predefined information that can be automatically filled into your lodgement. You can save the information like name, phone, address, TFN, and etc. for future usage.</Paragraph>

          <Button onClick={() => clearAllFilters()}>Create All Filters</Button>
          <Table columns={columnDef} 
          dataSource={lodgementList} 
          // scroll={{x: 1000}}
          onChange={handleTableChange}
          onRow={(record, index) => ({
            onDoubleClick: e => {
              props.history.push(`/lodgement/proceed/${record.id}`);
            }
          })}
          ></Table>
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

AdminLodgementListPage.propTypes = {};

AdminLodgementListPage.defaultProps = {};

export default AdminLodgementListPage;
