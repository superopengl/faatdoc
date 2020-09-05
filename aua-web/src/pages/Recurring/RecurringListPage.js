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
  DeleteOutlined, EditOutlined, SearchOutlined, PlusOutlined
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
import {reactLocalStorage} from 'reactjs-localstorage';
import { listRecurring } from 'services/recurringService';
import RecurringForm from './RecurringForm';

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

const RecurringListPage = (props) => {

  const [loading, setLoading] = React.useState(true);
  const [formVisible, setFormVisible] = React.useState(false);
  const [list, setList] = React.useState([]);
  const [currentId, setCurrentId] = React.useState();
  const [agentList, setAgentList] = React.useState([]);

  const columnDef = [
    {
      title: 'For Whom',
      dataIndex: 'forWhom',
      render: (text, record) => text
    },
    {
      title: 'Client',
      dataIndex: 'email',
      render: (text, record) => text
    },
    {
      title: 'Job',
      dataIndex: 'jobTemplateName',
      render: (text, record) => text,
      ellipsis: false
    },
    {
      title: 'Portfolio',
      dataIndex: 'portofolioName',
      onFilter: (value, record) => record.agentId === value,
      render: (text, record) => text
    },
    {
      title: 'Recurring',
      dataIndex: 'cron',
      sorter: (a, b) => moment(a.createdAt).toDate() - moment(b.createdAt).toDate(),
      render: (text, record) => {
        return <TimeAgo value={text} />;
      }
    },
    {
      title: 'Last Update At',
      dataIndex: 'lastUpdatedAt',
      render: (text, record) => {
        return <TimeAgo value={text} />;
      }
    },
    {
      title: 'Next Run At',
      render: (text, record) => {
        return <Space size="small"><TimeAgo value={text} extra={<Button shape="circle" icon={<SearchOutlined />} onClick={() => handleShowSignDetail(record.id)} />}/></Space>;
      }
    },
    {
      title: 'Action',
      // fixed: 'right',
      // width: 200,
      render: (text, record) => (
        <Space size="middle">
          <Link to={`/recurring/${record.id}`}><Button shape="circle" icon={<EditOutlined />} /></Link>
          <Button shape="circle" danger icon={<DeleteOutlined />} />
        </Space>
      ),
    },
  ];

  const loadList = async () => {
    setLoading(true);
    const list = await listRecurring();
    setList(list);
    setLoading(false);
  }

  const handleShowSignDetail = async (lodgementId) => {
    Modal.info({
      title: 'Client Review And Sign Details',
      content: <ReviewSignPage id={lodgementId} readonly={true} />,
      width: 700,
      icon: null,
      maskClosable: true,
    });
  }

  React.useEffect(() => {
    loadList();
  }, []);

  const handleCreateNew = async () => {
    setCurrentId();
    setFormVisible(true);
  }

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <Space size="large" direction="vertical" style={{ width: '100%' }}>
          <StyledTitleRow>
            <Title level={2} style={{ margin: 'auto' }}>Recurring Job Management</Title>
          </StyledTitleRow>
            <Button type="primary" ghost icon={<PlusOutlined />} onClick={() => handleCreateNew()}>New Recurring Job</Button>

          <Table columns={columnDef}
            dataSource={list}
            // scroll={{x: 1000}}
            rowKey="id"
            loading={loading}
            // pagination={queryInfo}
            // onChange={handleTableChange}
            onRow={(record, index) => ({
              onDoubleClick: e => {
                props.history.push(`/lodgement/proceed/${record.id}`);
              }
            })}
          />
        </Space>

      </ContainerStyled>
      <RecurringForm id={currentId} visible={formVisible} onClose={() => setFormVisible(false)}/>
    </LayoutStyled >
  );
};

RecurringListPage.propTypes = {};

RecurringListPage.defaultProps = {};

export default RecurringListPage;
