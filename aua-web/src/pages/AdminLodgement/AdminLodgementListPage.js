import React from 'react';
import styled from 'styled-components';
import { Tabs, Typography, Layout, Button, Select, Table, Input, Modal } from 'antd';
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
  ExclamationCircleOutlined, EditOutlined, SearchOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { List } from 'antd';
import { Space } from 'antd';

import { listLodgement, searchLodgement, assignLodgement } from 'services/lodgementService';
import { random } from 'lodash';
import { listJobTemplate } from 'services/jobTemplateService';
import { listPortofolio } from 'services/portofolioService';
import { LodgementProgressBar } from 'components/LodgementProgressBar';
import { AutoComplete } from 'antd';
import { listAgents } from 'services/userService';
import Highlighter from "react-highlight-words";
import ReviewSignPage from 'pages/MyLodgement/ReviewSignPage';
import { TimeAgo } from 'components/TimeAgo';

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

const DEFAULT_QUERY_INFO = {
  text: '',
  page: 1,
  size: 50,
  total: 0,
  status: ['submitted', 'to_sign', 'signed'],
  orderField: 'lastUpdatedAt',
  orderDirection: 'DESC'
};

const AdminLodgementListPage = (props) => {

  const [loading, setLoading] = React.useState(true);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [lodgementList, setLodgementList] = React.useState([{ isNewButton: true }]);
  const [currentId, setCurrentId] = React.useState();
  const [agentList, setAgentList] = React.useState([]);

  const [queryInfo, setQueryInfo] = React.useState(DEFAULT_QUERY_INFO)

  const columnDef = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'id',
      // filteredValue: filteredInfo.name || null,
      onFilter: (value, record) => record.name.includes(value),
      render: (text, record) => <Highlighter highlightClassName="search-highlighting" searchWords={[queryInfo.text]} autoEscape={true} textToHighlight={text} />,
      ellipsis: false,
    },
    {
      title: 'For',
      dataIndex: 'displayName',
      key: 'id',
      render: (text, record) => <Highlighter highlightClassName="search-highlighting" searchWords={[queryInfo.text]} autoEscape={true} textToHighlight={text} />
    },
    {
      title: 'Client',
      dataIndex: 'email',
      key: 'id',
      render: (text, record) => text
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'id',
      sorter: (a, b) => moment(a.createdAt).toDate() - moment(b.createdAt).toDate(),
      render: (text, record) => <TimeAgo value={text} />
    },
    {
      title: 'Job',
      dataIndex: 'jobTemplateName',
      key: 'id',
      render: (text, record) => <Highlighter highlightClassName="search-highlighting" searchWords={[queryInfo.text]} autoEscape={true} textToHighlight={text} />,
      ellipsis: false
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'id',
      render: (text, record) => <LodgementProgressBar width={50} status={text}></LodgementProgressBar>,
      ellipsis: false
    },
    {
      title: 'Assignee',
      dataIndex: 'agentId',
      key: 'id',
      // filteredValue: filteredInfo.agentId || null,
      // filters: agentList.map(a => ({ text: `${a.givenName} ${a.surname}`, value: a.id })),
      onFilter: (value, record) => record.agentId === value,
      render: (text, record) => <Select
        placeholder="Select an agent"
        style={{ width: 130 }}
        onChange={value => assignLodgementToAgent(record, value)}
        value={text}
      >
        <Select.Option key={-1} value={null}>{' '}</Select.Option>
        {agentList.map((a, i) => <Select.Option key={i} value={a.id}>{a.givenName} {a.surname}</Select.Option>)}
      </Select>
    },
    {
      title: 'Last Update At',
      dataIndex: 'lastUpdatedAt',
      sorter: (a, b) => moment(a.createdAt).toDate() - moment(b.createdAt).toDate(),
      key: 'id',
      render: (text, record) => {
        return <TimeAgo value={text} />;
      }
    },
    {
      title: 'Signed At',
      dataIndex: 'signedAt',
      sorter: (a, b) => moment(a.createdAt).toDate() - moment(b.createdAt).toDate(),
      key: 'id',
      render: (text, record) => {
        return <Space size="small"><TimeAgo value={text} /><Button shape="circle" icon={<SearchOutlined />} onClick={() => handleShowSignDetail(record.id)} /></Space>;
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
    debugger;
    const newQueryInfo = {
      ...queryInfo,
    }
    if (sorter) {
      newQueryInfo.orderField = sorter.field;
      newQueryInfo.orderDirection = sorter.order
    }
  }

  const clearAllFilters = () => {
    setQueryInfo({ ...DEFAULT_QUERY_INFO });
  }

  const assignLodgementToAgent = async (lodgement, agentId) => {
    await assignLodgement(lodgement.id, agentId);
    await loadList();
  }

  const loadLodgementWithQuery = async (queryInfo) => {
    setLoading(true);
    const { data, pagination: { total } } = await searchLodgement(queryInfo);

    setLodgementList(data);
    setQueryInfo({ ...queryInfo, total })
    setLoading(false);
  }

  const loadList = async () => {
    setLoading(true);
    await loadLodgementWithQuery(queryInfo);
    const agentList = await listAgents();
    setAgentList(agentList);
    setLoading(false);
  }

  const handleSearch = async (value) => {
    const text = value?.trim();

    const newQueryInfo = {
      ...queryInfo,
      text
    }

    await loadLodgementWithQuery(newQueryInfo);
  }

  const handleShowSignDetail = async (lodgementId) => {
    Modal.info({
      title: 'Client sign details',
      content: <ReviewSignPage id={lodgementId} readonly={true} />,
      width: 700,
      icon: null
    });
  }

  const handleStatusFilter = async (status) => {
    const newQueryInfo = {
      ...queryInfo,
      status
    }
    await loadLodgementWithQuery(newQueryInfo);
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
          <Space>
            <Input.Search
              placeholder="input search text"
              enterButton={<><SearchOutlined /> Search</>}
              onSearch={value => handleSearch(value)}
              onPressEnter={e => handleSearch(e.target.value)}
              loading={loading}
              allowClear
            />

            <Button onClick={() => clearAllFilters()}>Create All Filters</Button>
          </Space>
          <Select
              mode="multiple"
              allowClear
              style={{ width: '100%' }}
              placeholder="Status filter"
              defaultValue={['submitted', 'to_sign', 'signed']}
              onChange={handleStatusFilter}
            >
              <Select.Option value='draft'>Draft</Select.Option>
              <Select.Option value='submitted'>Submitted</Select.Option>
              <Select.Option value='to_sign'>To Sign</Select.Option>
              <Select.Option value='signed'>Signed</Select.Option>
              <Select.Option value='done'>Done</Select.Option>
              <Select.Option value='archive'>Archive</Select.Option>
            </Select>
          <Table columns={columnDef}
            dataSource={lodgementList}
            // scroll={{x: 1000}}
            rowKey={record => record.id}
            loading={loading}
            pagination={queryInfo}
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
