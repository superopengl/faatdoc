import { DeleteOutlined, EditOutlined, SearchOutlined, SyncOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Modal, Layout, Tooltip, Row, Col, Space, Card, Spin, Typography } from 'antd';
import Text from 'antd/lib/typography/Text';
import HomeHeader from 'components/HomeHeader';
import { JobStatus } from 'components/JobStatus';
import { TimeAgo } from 'components/TimeAgo';
import SignDocEditor from 'pages/MyJob/SignDocEditor';
import React from 'react';
import Highlighter from "react-highlight-words";
import { Link } from 'react-router-dom';
import { reactLocalStorage } from 'reactjs-localstorage';
import { assignJob, deleteJob, saveJob, searchJob } from '../../services/jobService';
import { listAgents } from 'services/userService';
import styled from 'styled-components';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { PortfolioAvatar } from 'components/PortfolioAvatar';

const { Title } = Typography;

const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;
`;

const ContainerStyled = styled.div`
  margin: 6rem 1rem 2rem 1rem;
`;

const StyledRow = styled(Row)`
  height: 100%;
  min-height: calc(100vh - 110px);
`;

const StyledColumn = styled(Space)`
border-radius: 4px;
background-color: rgb(250,250,250);
height: 100%;
width: 100%;
padding: 8px;
`;

const StyledCard = styled(Card)`
position: relative;
box-shadow: 0 1px 2px rgba(0,0,0,0.1);
.ant-card-body {
  padding: 16px;
}
`;


const COLUMN_DEFS = [
  {
    status: 'todo',
    label: 'To Do',
    bgColor: '#fafafa',
    hoverColor: '#f0f0f0',
  },
  {
    status: 'to_sign',
    label: 'To Sign',
    bgColor: '#ffccc7',
    hoverColor: '#ffa39e',
  },
  {
    status: 'signed',
    label: 'Signed',
    bgColor: '#91d5ff',
    hoverColor: '#69c0ff',
  },
  {
    status: 'completed',
    label: 'Completed',
    bgColor: '#d9f7be',
    hoverColor: '#95de64',
  },
]

const DEFAULT_QUERY_INFO = {
  text: '',
  page: 1,
  size: 200,
  total: 0,
  status: ['todo', 'to_sign', 'signed', 'completed'],
  orderField: 'lastUpdatedAt',
  orderDirection: 'DESC'
};

const TaskCard = (props) => {

  const { job, index, onChange } = props;
  const { id, name, forWhom, email, jobTemplateName } = job;

  const getItemStyle = (isDragging, draggableStyle) => ({
    // background: isDragging ? "#C0C0C0" : "",
    ...draggableStyle
  });

  const handleDelete = async (e) => {
    e.stopPropagation();
    Modal.confirm({
      title: <>Archive job <Text strong>{name}</Text>?</>,
      okText: 'Yes, Archive it',
      onOk: async () => {
        await deleteJob(id);
        onChange();
      },
      maskClosable: true,
      okButtonProps: {
        danger: true
      }
    });
  }

  return <Draggable draggableId={id} index={index}>
    {
      (provided, snapshot) => (
        <div ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}>
          <StyledCard hoverable>
            <Space direction="vertical" style={{ width: '100%' }}>
              {name}
              <Text type="secondary">{jobTemplateName}</Text>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space style={{ lineHeight: '0.5rem', padding: 0 }}>
                  <PortfolioAvatar value={forWhom} size={32} />
                  <Space direction="vertical">
                    <small>{forWhom}</small>
                    <small>{email}</small>
                  </Space>
                </Space>
              </Space>
            </Space>
            <Space size="small" style={{position: 'absolute', right: 0, bottom: 0}}>
              <Tooltip placement="bottom" title="Proceed job">
                <Link to={`/job/${id}/proceed`}><Button type="link" icon={<EditOutlined />}></Button></Link>
              </Tooltip>
              <Tooltip placement="bottom" title="Delete job">
                <Button type="link" danger onClick={handleDelete} icon={<DeleteOutlined />}></Button>
              </Tooltip>
            </Space>
          </StyledCard>
        </div>
      )
    }
  </Draggable>
}

const AdminBoardPage = props => {
  const [loading, setLoading] = React.useState(true);
  const [jobList, setJobList] = React.useState([]);
  const [queryInfo, setQueryInfo] = React.useState(reactLocalStorage.getObject('query', DEFAULT_QUERY_INFO, true))

  const loadList = async () => {
    setLoading(true);
    const { data, pagination: { total } } = await searchJob(queryInfo);
    setJobList(data);
    setLoading(false);
  }

  React.useEffect(() => {
    loadList();
  }, []);

  const onDragEnd = async result => {
    const { draggableId: jobId, destination: { droppableId: status } } = result;
    const job = jobList.find(j => j.id === jobId);
    if (job.status !== status) {
      job.status = status;
      setLoading(true);
      await saveJob(job);
      loadList();
      setLoading(false);
    }
  }

  const getStatusStyle = (isDraggingOver) => ({
    background: isDraggingOver ? "#00BFFF" : ''
  });

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <DragDropContext onDragEnd={onDragEnd}>
          <Spin spinning={loading}>
            <StyledRow gutter={10}>
              {COLUMN_DEFS.map((s, i) => <Droppable droppableId={s.status} key={i}>
                {(provided, snapshot) => (
                  <Col span={6}
                    ref={provided.innerRef}>
                    <StyledColumn direction="vertical" style={{ backgroundColor: snapshot.isDraggingOver ? s.hoverColor : s.bgColor }}>
                      <Title level={4} style={{ textAlign: 'center', margin: '0 auto' }}><Text type="secondary">{s.label}</Text> <sup>{jobList.filter(j => j.status === s.status).length}</sup></Title>
                      {jobList.filter(j => j.status === s.status).map((job, index) => {
                        // if (task.statusId === status.id)
                        return (
                          <TaskCard key={job.id} index={index} job={job} onChange={() => loadList()} />
                        );
                      })
                      }
                      {provided.placeholder}
                    </StyledColumn>
                  </Col>
                )}
              </Droppable>)}
            </StyledRow>
          </Spin>
        </DragDropContext>
      </ContainerStyled>
    </LayoutStyled>
  )
}

AdminBoardPage.propTypes = {};

AdminBoardPage.defaultProps = {};

export default AdminBoardPage;