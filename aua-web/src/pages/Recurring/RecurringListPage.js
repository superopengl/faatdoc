import React from 'react';
import styled from 'styled-components';
import { Tabs, Typography, Layout, Button, Drawer, Table, Input, Modal } from 'antd';
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
  height: 100%;
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

const RecurringListPage = (props) => {

  const [loading, setLoading] = React.useState(true);
  const [formVisible, setFormVisible] = React.useState(false);
  const [list, setList] = React.useState([]);
  const [currentId, setCurrentId] = React.useState();
  const [agentList, setAgentList] = React.useState([]);

  const isRecurringDeprecated = item => !item.email || !item.jobTemplateId || !item.portofolioName;

  const getNextRunDateString = cron => {
    try {
      const interval = cronParser.parseExpression(cron);
      return interval.next().toString();
    } catch (e) {
      if (/L/.test(cron)) {
        // The last day of month
        const now = moment();
        const lastDayOfMonth = now.endOf('month').format('D');
        const interval = cronParser.parseExpression(cron.replace('L', lastDayOfMonth));
        let dateString = interval.next().toString(); // The run time in current month

        if(moment(dateString).isBefore(now)) {
          // If the time has passed by on the last day of the current month,
          // return the time in the next month.
          dateString = interval.next().toString();
        }
        return dateString;
      }
      throw e;
    }
  }
  const columnDef = [
    {
      title: 'Job Template',
      dataIndex: 'jobTemplateName',
      render: (text, record) => record.jobTemplateName ? <Link to={`/job_template/${record.jobTemplateId}`}>{text}</Link> : <Text type="danger">deleted job template</Text>,
      ellipsis: false
    },
    {
      title: 'Portfolio',
      dataIndex: 'portofolioName',
      onFilter: (value, record) => record.agentId === value,
      render: (text, record) => record.portofolioName ? <>
        <PortofolioAvatar value={text} size={40} /> {text} <Text type="secondary"><small>{record.email}</small></Text>
      </> : <Text type="danger">deleted portofolio</Text>
    },
    {
      title: 'Name Template',
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
        return <TimeAgo value={getNextRunDateString(record.cron)} />;
      }
    },
    {
      title: 'Action',
      // fixed: 'right',
      // width: 200,
      render: (text, record) => {
        const deprecated = isRecurringDeprecated(record);
        return (
          <Space size="small" style={{ width: '100%', justifyContent: 'flex-end' }}>
            {!deprecated && <Button shape="circle" icon={<EditOutlined />} onClick={e => handleEditRecurring(e, record)} />}
            {!deprecated && <Button shape="circle" icon={<CaretRightFilled />} onClick={e => handleRunRecurring(e, record)} />}
            <Button shape="circle" danger icon={<DeleteOutlined />} onClick={e => handleDelete(e, record)} />
          </Space>
        )
      },
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
        setLoading(true);
        await deleteRecurring(id);
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
        <Space direction="vertical" style={{ width: '100%' }}>
          <StyledTitleRow>
            <Title level={2} style={{ margin: 'auto' }}>Recurring Management</Title>
          </StyledTitleRow>

          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button type="primary" ghost icon={<PlusOutlined />} onClick={() => handleCreateNew()}>New Recurring</Button>
          </Space>

          <Table columns={columnDef}
            dataSource={list}
            // scroll={{x: 1000}}
            rowKey="id"
            loading={loading}
            pagination={false}
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
      <StyledDrawer
        title={currentId ? 'Edit Recurring' : 'New Recurring'}
        placement="right"
        closable={true}
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        destroyOnClose={true}
        width={500}
        // bodyStyle={{ padding: '0 10px' }}
        footer={null}
      >
        <RecurringForm id={currentId} onOk={() => handleEditOnOk()} />
      </StyledDrawer>
    </LayoutStyled >

  );
};

RecurringListPage.propTypes = {};

RecurringListPage.defaultProps = {};

export default withRouter(RecurringListPage);
