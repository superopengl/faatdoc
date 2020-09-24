import { Button, Layout, Modal, Space, Typography, Row, Col, Spin } from 'antd';
import HomeHeader from 'components/HomeHeader';
import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { listJob, searchJob } from 'services/jobService';
import { listPortfolio } from 'services/portfolioService';
import { PlusOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { listMessages } from 'services/messageService';
import MessageList from 'components/MessageList';
import { GlobalContext } from 'contexts/GlobalContext';
import { Divider } from 'antd';
import MyJobList from 'pages/MyJob/MyJobList';


const { Title, Paragraph } = Typography;


const ContainerStyled = styled.div`
  margin: 6rem auto 2rem auto;
  padding: 0 1rem;
  width: 100%;
  max-width: 600px;

  .ant-divider {
    margin: 8px 0 24px;
  }
`;

const StyledCol = styled(Col)`
// margin-bottom: 2rem;
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

const span = {
  xs: 24,
  sm: 24,
  md: 12,
  lg: 12,
  xl: 12,
  xxl: 12
}

const ClientDashboardPage = (props) => {

  const [loading, setLoading] = React.useState(true);
  const [toSignJobList, setToSignJobList] = React.useState([]);
  const [unreadJobList, setUnreadJobList] = React.useState([]);
  const [completeList, setCompleteList] = React.useState([]);
  const [portfolioList, setPortfolioList] = React.useState([]);
  const [, setHasMessage] = React.useState(false);
  const context = React.useContext(GlobalContext);
  const { notifyCount } = context;

  const loadList = async () => {
    setLoading(true);
    const portfolioList = await listPortfolio() || [];
    // const { data: toSignJobList } = await searchJob({ status: ['to_sign'] });
    const list = await listJob();

    setPortfolioList(portfolioList);
    setToSignJobList(list.filter(x => x.status === 'to_sign'));
    setUnreadJobList(list.filter(x => x.lastUnreadMessageAt));
    setCompleteList(list.filter(x => x.status === 'complete'));
    setLoading(false);
    if (!portfolioList.length) {
      showNoPortfolioWarn();
    }
  }


  React.useEffect(() => {
    loadList()
  }, []);

  const goToEditJob = (id) => {
    props.history.push(`/job/${id || 'new'}`);
  }


  const showNoPortfolioWarn = () => {
    Modal.confirm({
      title: 'No portfolio',
      content: 'Please create portfolio before creating job. Go to create protofolio now?',
      okText: 'Yes, go to create portfolio',
      maskClosable: true,
      onOk: () => props.history.push('/portfolio')
    });
  }

  const createNewJob = e => {
    e.stopPropagation();
    if (portfolioList.length) {
      goToEditJob();
    } else {
      showNoPortfolioWarn();
    }
  }

  const handleFetchNextPage = async (page, size) => {
    const data = await listMessages({ page, size, unreadOnly: true });
    setHasMessage(!!data.length);
    return data;
  }

  const handleGoToJobWithMessage = job => {
    props.history.push(`/job/${job.id}?chat=true`)
  }

  const handleGoToJobSign = job => {
    props.history.push(`/job/${job.id}/view`)
  }

  const hasPortfolio = !!portfolioList.length;

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <Row gutter={80}>
          <StyledCol span={24}>
            <Space size="small" direction="vertical" style={{ width: '100%' }}>
              {/* <Title type="secondary" level={4}>My Jobs</Title> */}
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Link to="/job">All jobs</Link>
                <Button type="link" onClick={createNewJob} style={{ padding: 0 }} icon={<PlusOutlined />}>Create New Job</Button>
              </Space>
              <Divider />
              {loading ? <Spin style={{ width: '100%', margin: '2rem auto' }} /> : <>
                {!hasPortfolio && <>
                  <Title type="secondary" level={4}>My Portfolio</Title>
                  <Paragraph >Portfolios are predefined information that can be used to automatically fill in your job application. You can save the information like name, phone, address, TFN, and etc. for future usage.</Paragraph>
                  <Link to="/portfolio"><Button size="large" type="primary" ghost block icon={<PlusOutlined />}>New Portfolio</Button></Link>
                  <Divider />
                </>}
                {toSignJobList.length > 0 && <>
                  <Title type="secondary" level={4}>Require Sign</Title>
                  <MyJobList data={toSignJobList} onItemClick={handleGoToJobSign} />
                  <Divider />
                </>}
                {unreadJobList.length > 0 && <>
                  <Title type="secondary" level={4}>Jobs with Unread Messages</Title>
                  <MyJobList data={unreadJobList} onItemClick={handleGoToJobWithMessage} />
                  <Divider />
                </>}
                {completeList.length > 0 && <>
                  <Title type="secondary" level={4}>Recent Completed Jobs</Title>
                  <MyJobList data={completeList} onItemClick={handleGoToJobWithMessage} />
                  <Divider />
                </>}
              </>}
            </Space>
          </StyledCol>

          {/* <StyledCol {...span}>
            <Space size="small" direction="vertical" style={{ width: '100%' }}>
              <Title type="secondary" level={4}>Jobs with Unread Messages</Title>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Link to="/message"><Button type="link" style={{ padding: 0 }}>All messages ({notifyCount} unread)</Button></Link>
              </Space>
              <Divider />
              <MessageList
                onFetchNextPage={handleFetchNextPage}
                max={10}
                size={10}
              />
            </Space>
          </StyledCol> */}
        </Row>
        <Space size="large" direction="vertical" style={{ width: '100%' }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }} >
            {/* <Button type="link" onClick={() => loadList()} icon={<SyncOutlined />}></Button> */}
          </Space>

        </Space>
      </ContainerStyled>
    </LayoutStyled >
  );
};

ClientDashboardPage.propTypes = {};

ClientDashboardPage.defaultProps = {};

export default withRouter(ClientDashboardPage);
