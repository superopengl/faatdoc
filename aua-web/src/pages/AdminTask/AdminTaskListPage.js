import { DeleteOutlined, EditOutlined, SearchOutlined, SyncOutlined } from '@ant-design/icons';
import { Button, Input, Layout, Modal, Select, Space, Table, Tooltip, Typography } from 'antd';
import Text from 'antd/lib/typography/Text';
import HomeHeader from 'components/HomeHeader';
import { TaskProgressBar } from 'components/TaskProgressBar';
import { TimeAgo } from 'components/TimeAgo';
import * as moment from 'moment';
import ReviewSignPage from 'pages/MyTask/ReviewSignPage';
import React from 'react';
import Highlighter from "react-highlight-words";
import { Link } from 'react-router-dom';
import { reactLocalStorage } from 'reactjs-localstorage';
import { assignTask, deleteTask, searchTask } from '../../services/taskService';
import { listAgents } from 'services/userService';
import styled from 'styled-components';

const { Title } = Typography;

const ContainerStyled = styled.div`
  margin: 6rem 1rem 2rem 1rem;
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
  status: ['todo', 'to_sign', 'signed'],
  orderField: 'lastUpdatedAt',
  orderDirection: 'DESC'
};

const AdminTaskListPage = (props) => {

  const [loading, setLoading] = React.useState(true);
  const [taskList, setTaskList] = React.useState([]);
  const [agentList, setAgentList] = React.useState([]);

  const [queryInfo, setQueryInfoRaw] = React.useState(reactLocalStorage.getObject('query', DEFAULT_QUERY_INFO, true))

  const setQueryInfo = (queryInfo) => {
    reactLocalStorage.setObject('query', queryInfo);
    setQueryInfoRaw(queryInfo);
  }

  const columnDef = [
    {
      title: 'Task Name',
      dataIndex: 'name',
      // filteredValue: filteredInfo.name || null,
      onFilter: (value, record) => record.name.includes(value),
      render: (text) => <Highlighter highlightClassName="search-highlighting" searchWords={[queryInfo.text]} autoEscape={true} textToHighlight={text || ''} />,
      ellipsis: false,
    },
    {
      title: 'Portofolio',
      dataIndex: 'forWhom',
      render: (text) => <Highlighter highlightClassName="search-highlighting" searchWords={[queryInfo.text]} autoEscape={true} textToHighlight={text || ''} />
    },
    {
      title: 'User',
      dataIndex: 'email',
      render: (text) => <Text code><small>{text}</small></Text>
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      sorter: (a, b) => moment(a.createdAt).toDate() - moment(b.createdAt).toDate(),
      render: (text) => <TimeAgo value={text} />
    },
    {
      title: 'Job',
      dataIndex: 'jobTemplateName',
      render: (text) => <Highlighter highlightClassName="search-highlighting" searchWords={[queryInfo.text]} autoEscape={true} textToHighlight={text || ''} />,
      ellipsis: false
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (text) => <TaskProgressBar width={60} status={text}></TaskProgressBar>,
      ellipsis: false
    },
    {
      title: 'Assignee',
      dataIndex: 'agentId',
      // filteredValue: filteredInfo.agentId || null,
      // filters: agentList.map(a => ({ text: `${a.givenName} ${a.surname}`, value: a.id })),
      // onFilter: (value, record) => record.agentId === value,
      render: (text, record) => <Select
        placeholder="Select an agent"
        style={{ width: 130 }}
        onChange={value => assignTaskToAgent(record, value)}
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
      render: (text) => {
        return <TimeAgo value={text} />;
      }
    },
    {
      title: 'Signed At',
      dataIndex: 'signedAt',
      sorter: (a, b) => moment(a.createdAt).toDate() - moment(b.createdAt).toDate(),
      render: (text, record) => {
        return <Space size="small"><TimeAgo value={text} extra={<Button shape="circle" icon={<SearchOutlined />} onClick={() => handleShowSignDetail(record.id)} />} /></Space>;
      }
    },
    {
      title: 'Action',
      // fixed: 'right',
      // width: 200,
      render: (text, record) => (
        <Space size="small">
          <Tooltip placement="bottom" title="Proceed task">
            <Link to={`/task/${record.id}/proceed`}><Button shape="circle" icon={<EditOutlined />}></Button></Link>
          </Tooltip>
          <Tooltip placement="bottom" title="Delete task">
            <Button shape="circle" danger onClick={e => handleDelete(e, record)} icon={<DeleteOutlined />}></Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleTableChange = (pagination, filters, sorter) => {
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

  const assignTaskToAgent = async (task, agentId) => {
    await assignTask(task.id, agentId);
    await loadList();
  }

  const loadTaskWithQuery = async (queryInfo) => {
    setLoading(true);
    const { data, pagination: { total } } = await searchTask(queryInfo);

    setTaskList(data);
    setQueryInfo({ ...queryInfo, total })
    setLoading(false);
  }

  const loadList = async () => {
    setLoading(true);
    await loadTaskWithQuery(queryInfo);
    const agentList = await listAgents();
    setAgentList(agentList);
    setLoading(false);
  }

  const handleDelete = async (e, item) => {
    e.stopPropagation();
    const { id, name } = item;
    Modal.confirm({
      title: <>Archive task <Text strong>{name}</Text>?</>,
      okText: 'Yes, Archive it',
      onOk: async () => {
        await deleteTask(id);
        await loadList();
      },
      maskClosable: true,
      okButtonProps: {
        danger: true
      }
    });
  }

  const handleSearch = async (value) => {
    const text = value?.trim();

    const newQueryInfo = {
      ...queryInfo,
      text
    }

    await loadTaskWithQuery(newQueryInfo);
  }

  const handleShowSignDetail = async (taskId) => {
    Modal.info({
      title: 'Client Review And Sign Details',
      content: <ReviewSignPage id={taskId} readonly={true} />,
      width: 700,
      icon: null,
      maskClosable: true,
    });
  }

  const handleStatusFilter = async (status) => {
    const newQueryInfo = {
      ...queryInfo,
      status
    }
    await loadTaskWithQuery(newQueryInfo);
  }

  React.useEffect(() => {
    loadList();
  }, [])

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <Space direction="vertical" style={{ width: '100%' }}>
          <StyledTitleRow>
            <Title level={2} style={{ margin: 'auto' }}>Task Management</Title>
          </StyledTitleRow>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Input.Search
              placeholder="input search text"
              enterButton={<><SearchOutlined /> Search</>}
              onSearch={value => handleSearch(value)}
              onPressEnter={e => handleSearch(e.target.value)}
              loading={loading}
              defaultValue={queryInfo?.text}
              allowClear
            />

            <Button onClick={() => loadList()} icon={<SyncOutlined />}></Button>
            <Select
              mode="multiple"
              allowClear
              style={{ width: '520px' }}
              placeholder="Status filter"
              defaultValue={queryInfo?.status || []}
              onChange={handleStatusFilter}
            >
              <Select.Option value='todo'>To Do</Select.Option>
              <Select.Option value='to_sign'>To Sign</Select.Option>
              <Select.Option value='signed'>Signed</Select.Option>
              <Select.Option value='complete'>Complete</Select.Option>
              <Select.Option value='archive'>Archive</Select.Option>
            </Select>
            <Button onClick={() => clearAllFilters()}>Create All Filters</Button>
          </Space>
          <Table columns={columnDef}
            dataSource={taskList}
            // scroll={{x: 1000}}
            rowKey="id"
            loading={loading}
            pagination={queryInfo}
            onChange={handleTableChange}
            onRow={(record) => ({
              onDoubleClick: () => {
                props.history.push(`/task/${record.id}/proceed`);
              }
            })}
          ></Table>
        </Space>

      </ContainerStyled>
    </LayoutStyled >
  );
};

AdminTaskListPage.propTypes = {};

AdminTaskListPage.defaultProps = {};

export default AdminTaskListPage;
