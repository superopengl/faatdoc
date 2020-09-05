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
  DeleteOutlined, EditOutlined, CaretRightFilled, PlusOutlined
} from '@ant-design/icons';
import { Link, withRouter } from 'react-router-dom';
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
import { reactLocalStorage } from 'reactjs-localstorage';
import { listRecurring, deleteRecurring, runRecurring } from 'services/recurringService';
import RecurringForm from './RecurringForm';
import { PortofolioAvatar } from 'components/PortofolioAvatar';
import { notify } from 'util/notify';
import cronstrue from 'cronstrue';
import * as cronParser from 'cron-parser';

const { Title, Paragraph, Link: TextLink } = Typography;
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
      title: 'Job',
      dataIndex: 'jobTemplateName',
      render: (text, record) => text,
      ellipsis: false
    },
    {
      title: 'Portfolio',
      dataIndex: 'portofolioName',
      onFilter: (value, record) => record.agentId === value,
      render: (text, record) => <>
        <PortofolioAvatar value={text} size={40} /> {text} <Text type="secondary"><small>{record.email}</small></Text></>
    },
    {
      title: 'Lodgement Name',
      dataIndex: 'nameTemplate',
      render: (text, record) => text,
      ellipsis: false
    },
    {
      title: 'Recurring',
      dataIndex: 'cron',
      render: (text, record) => {
        return cronstrue.toString(text, { use24HourTimeFormat: false, verbose: true });
        // return <TimeAgo value={text} />;
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
        const interval = cronParser.parseExpression(record.cron);
        return <TimeAgo value={interval.next().toString()} />;
      }
    },
    {
      title: 'Action',
      // fixed: 'right',
      // width: 200,
      render: (text, record) => (
        <Space size="small">
          <Button shape="circle" icon={<EditOutlined />} onClick={e => handleEditRecurring(e, record)} />
          <Button shape="circle" icon={<CaretRightFilled />} onClick={e => handleRunRecurring(e, record)} />
          <Button shape="circle" danger icon={<DeleteOutlined />} onClick={e => handleDelete(e, record)} />
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

  React.useEffect(() => {
    loadList();
  }, []);

  const handleCreateNew = async () => {
    setCurrentId();
    setFormVisible(true);
  }

  const handleEditRecurring = async (e, record) => {
    e.stopPropagation();
    setCurrentId(record.id);
    setFormVisible(true);
  }

  const handleDelete = async (e, item) => {
    e.stopPropagation();
    const { id, jobTemplateName, portofolioName, email } = item;
    Modal.confirm({
      title: <>To delete Recurring <strong>{jobTemplateName}</strong> for <strong>{portofolioName}</strong>?</>,
      onOk: async () => {
        await deleteRecurring(id);
        loadList();
      },
      maskClosable: true,
      okButtonProps: {
        danger: true
      },
      okText: 'Yes, delete it!'
    });
  }

  const handleRunRecurring = async (e, item) => {
    e.stopPropagation();
    const { id } = item;
    const lodgement = await runRecurring(id);
    notify.success(
      'Successfully run the recurring',
      <Text>The lodgement <TextLink strong onClick={() => props.history.push(`/lodgement/${lodgement.id}/proceed`)}>{lodgement.name}</TextLink> was created</Text>,
      15
    );
  }

  const handleEditOnOk = async () => {
    await loadList();
    setFormVisible(false);
  }

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <Space size="large" direction="vertical" style={{ width: '100%' }}>
          <StyledTitleRow>
            <Title level={2} style={{ margin: 'auto' }}>Recurring Management</Title>
          </StyledTitleRow>
          <Button type="primary" ghost icon={<PlusOutlined />} onClick={() => handleCreateNew()}>New Recurring</Button>

          <Table columns={columnDef}
            dataSource={list}
            // scroll={{x: 1000}}
            rowKey="id"
            loading={loading}
            // pagination={queryInfo}
            // onChange={handleTableChange}
            onRow={(record, index) => ({
              onDoubleClick: e => {
                setCurrentId(record.id);
                setFormVisible(true);
              }
            })}
          />
        </Space>

      </ContainerStyled>
      <RecurringForm id={currentId} visible={formVisible} onClose={() => setFormVisible(false)} onOk={() => handleEditOnOk()} />
    </LayoutStyled >
  );
};

RecurringListPage.propTypes = {};

RecurringListPage.defaultProps = {};

export default withRouter(RecurringListPage);
