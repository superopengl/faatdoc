import { PlusOutlined } from '@ant-design/icons';
import { Button, Layout, Row, Col, Space, Card, Spin, Typography } from 'antd';
import Text from 'antd/lib/typography/Text';
import HomeHeader from 'components/HomeHeader';
import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { reactLocalStorage } from 'reactjs-localstorage';
import { saveJob, searchJob } from '../../services/jobService';
import styled from 'styled-components';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import TaskCard from './TaskCard';

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
  min-height: calc(100vh - 180px);
`;

const StyledColumn = styled(Space)`
border-radius: 4px;
background-color: rgb(250,250,250);
height: 100%;
width: 100%;
padding: 8px;
`;

const COLUMN_DEFS = [
  {
    status: 'todo',
    label: 'To Do',
    bgColor: '#f5f5f5',
    hoverColor: '#bfbfbf',
  },
  {
    status: 'to_sign',
    label: 'To Sign',
    bgColor: '#f5f5f5',
    hoverColor: '#ff4d4f',
  },
  {
    status: 'signed',
    label: 'Signed',
    bgColor: '#f5f5f5',
    hoverColor: '#1890ff',
  },
  {
    status: 'complete',
    label: 'Completed',
    bgColor: '#f5f5f5',
    hoverColor: '#73d13d',
  },
]

const DEFAULT_QUERY_INFO = {
  text: '',
  page: 1,
  size: 200,
  total: 0,
  status: ['todo', 'to_sign', 'signed', 'complete'],
  orderField: 'lastUpdatedAt',
  orderDirection: 'DESC'
};

const AdminBoardPage = props => {
  const [loading, setLoading] = React.useState(true);
  const [jobList, setJobList] = React.useState([]);
  const [queryInfo] = React.useState(reactLocalStorage.getObject('query', DEFAULT_QUERY_INFO, true))

  const loadList = async () => {
    setLoading(true);
    const { data } = await searchJob(queryInfo);
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
      try {
        await saveJob(job);
      } finally {
        await loadList();
        setLoading(false);
      }
    }
  }

  const handleCreateJob = () => {
    props.history.push('/job/new');
  }
  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <Space style={{ width: '100%', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <Link to="/job"><Button type="link">All Jobs</Button></Link>
          <Button type="primary" onClick={() => handleCreateJob()} icon={<PlusOutlined />}>New Job</Button>
        </Space>
        <DragDropContext onDragEnd={onDragEnd}>
          <Spin spinning={loading}>
            <StyledRow gutter={10}>
              {COLUMN_DEFS.map((s, i) => <Droppable droppableId={s.status} key={i}>
                {(provided, snapshot) => (
                  <Col span={6}
                    ref={provided.innerRef}>
                    <StyledColumn direction="vertical" style={{ backgroundColor: s.bgColor, border: `2px dashed ${snapshot.isDraggingOver ? s.hoverColor : s.bgColor}` }}>
                      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Title level={5} style={{ textAlign: 'center', margin: '0 auto' }} type="secondary">{s.label}</Title>
                        <Text strong>{jobList.filter(j => j.status === s.status).length}</Text>
                      </Space>
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

export default withRouter(AdminBoardPage);