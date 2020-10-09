import { Badge, Button, Layout, Modal, Space, Tabs, Typography } from 'antd';
import HomeHeader from 'components/HomeHeader';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { listJob } from 'services/jobService';
import { listPortfolio } from 'services/portfolioService';
import { PlusOutlined, SyncOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import MyJobList from './MyJobList';

const { Title } = Typography;
const { TabPane } = Tabs;


const ContainerStyled = styled.div`
  margin: 6rem auto 2rem auto;
  padding: 0 1rem;
  width: 100%;
  max-width: 600px;
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

  .job-count .ant-badge-count {
    background-color: #143e86;
    color: #eeeeee;
    // box-shadow: 0 0 0 1px #143e86 inset;
  }
`;


const MyJobListPage = (props) => {

  const [, setLoading] = React.useState(true);
  const [jobList, setJobList] = React.useState([]);
  const [portfolioList, setPortfolioList] = React.useState([]);


  const loadList = async () => {
    setLoading(true);
    const portfolioList = await listPortfolio() || [];

    const list = await listJob();

    setJobList(list);
    setPortfolioList(portfolioList);
    setLoading(false);
  }


  React.useEffect(() => {
    loadList();
  }, [])

  const goToEditJob = (id) => {
    props.history.push(`/job/${id || 'new'}`);
  }


  const createNewJob = () => {
    if (!portfolioList.length) {
      Modal.confirm({
        title: 'No portfolio',
        maskClosable: true,
        content: 'Please create portfolio before creating job. Go to create protofolio now?',
        okText: 'Yes, go to create portfolio',
        onOk: () => props.history.push('/portfolio')
      });
      return;
    }
    goToEditJob();
  }

  const handleItemClick = job => {
    goToEditJob(job.id);
  }


  const RenderListFilteredByStatus = (statuses = []) => {
    const data = jobList.filter(x => statuses.includes(x.status));

    return <MyJobList data={data} onItemClick={handleItemClick}/>
  }

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <Space size="large" direction="vertical" style={{ width: '100%' }}>
          <StyledTitleRow>
            <Title level={2} style={{ margin: 'auto' }}>Jobs</Title>
          </StyledTitleRow>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }} >
            {/* <Button type="link" onClick={() => loadList()} icon={<SyncOutlined />}></Button> */}
            <Button type="primary" icon={<PlusOutlined />} onClick={() => createNewJob()}>New Job</Button>
          </Space>

          <Tabs defaultActiveKey="todo" type="card" tabBarExtraContent={{ right: <Button type="link" onClick={() => loadList()} icon={<SyncOutlined />}></Button> }}>
            <TabPane tab={<>To Do <Badge count={jobList.filter(x => ['todo', 'signed'].includes(x.status) && !x.lastUnreadMessageAt).length} showZero={false} /></>} key="todo">
              {RenderListFilteredByStatus(['todo', 'signed'])}
            </TabPane>
            <TabPane tab={<>To Sign <Badge count={jobList.filter(x => ['to_sign'].includes(x.status)).length} showZero={false} /></>} key="ongoing">
              {RenderListFilteredByStatus(['to_sign'])}
            </TabPane>
            <TabPane tab={"Completed"} key="complete">
              {RenderListFilteredByStatus(['complete'])}
            </TabPane>
          </Tabs>
        </Space>
      </ContainerStyled>
    </LayoutStyled >
  );
};

MyJobListPage.propTypes = {};

MyJobListPage.defaultProps = {};

export default withRouter(MyJobListPage);
