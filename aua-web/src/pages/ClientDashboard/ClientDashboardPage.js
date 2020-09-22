import { Button, Layout, Modal, Space, Typography, Row, Col } from 'antd';
import HomeHeader from 'components/HomeHeader';
import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { listUnreadJob, searchJob } from 'services/jobService';
import { listPortofolio } from 'services/portofolioService';
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
  max-width: 1000px;

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

  const [, setLoading] = React.useState(true);
  const [toSignJobList, setToSignJobList] = React.useState([]);
  const [unreadJobList, setUnreadJobList] = React.useState([]);
  const [portofolioList, setPortofolioList] = React.useState([]);
  const [, setHasMessage] = React.useState(false);
  const context = React.useContext(GlobalContext);
  const { notifyCount } = context;

  const loadList = async () => {
    setLoading(true);
    const portofolioList = await listPortofolio() || [];
    const { data: toSignJobList } = await searchJob({ status: ['to_sign'] });
    const unreadJobList = await listUnreadJob();

    setToSignJobList(toSignJobList);
    setPortofolioList(portofolioList);
    setUnreadJobList(unreadJobList);
    setLoading(false);
    if (!portofolioList.length) {
      showNoPortofolioWarn();
    }
  }


  React.useEffect(() => {
    loadList()
  }, []);

  const goToEditJob = (id) => {
    props.history.push(`/job/${id || 'new'}`);
  }


  const showNoPortofolioWarn = () => {
    Modal.confirm({
      title: 'No portofolio',
      content: 'Please create portofolio before creating job. Go to create protofolio now?',
      okText: 'Yes, go to create portofolio',
      maskClosable: true,
      onOk: () => props.history.push('/portofolio')
    });
  }

  const createNewJob = e => {
    e.stopPropagation();
    if (portofolioList.length) {
      goToEditJob();
    } else {
      showNoPortofolioWarn();
    }
  }

  const handleFetchNextPage = async (page, size) => {
    const data = await listMessages({ page, size, unreadOnly: true });
    setHasMessage(!!data.length);
    return data;
  }

  const hasPortofolio = !!portofolioList.length;

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <Row gutter={80}>
          <StyledCol {...span}>
            <Space size="small" direction="vertical" style={{ width: '100%' }}>
              <Title type="secondary" level={4}>My Jobs</Title>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Link to="/job">All jobs</Link>
                <Button type="link" onClick={createNewJob} style={{ padding: 0 }}><PlusOutlined /> Create New Job</Button>
              </Space>
              <Divider />
              {!hasPortofolio && <>
                <Title type="secondary" level={4}>My Portofolio</Title>
                <Paragraph >Portofolios are predefined information that can be used to automatically fill in your job application. You can save the information like name, phone, address, TFN, and etc. for future usage.</Paragraph>
                <Link to="/portofolio"><Button size="large" type="primary" ghost block icon={<PlusOutlined />}>New Portofolio</Button></Link>
                <Divider />
              </>}
              {toSignJobList.length > 0 && <>
                <Title type="secondary" level={4}>Require Sign</Title>
                <MyJobList data={toSignJobList} />
                <Divider />
              </>}
              {unreadJobList.length > 0 && <>
                <Title type="secondary" level={4}>Latest 5 jobs with new messages</Title>
                <MyJobList data={unreadJobList.slice(0, 5)} />
                <Divider />
              </>}
            </Space>
          </StyledCol>

          <StyledCol {...span}>
            <Space size="small" direction="vertical" style={{ width: '100%' }}>
              <Title type="secondary" level={4}>Latest 10 Unread Message</Title>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Link to="/message"><Button type="link" style={{ padding: 0 }}>All messages ({notifyCount} unread)</Button></Link>
                {/* <Button type="link" icon={<SyncOutlined />} onClick={() => window.location.reload(false)}></Button> */}
              </Space>
              <MessageList
                onFetchNextPage={handleFetchNextPage}
                // onItemRead={}
                max={10}
                size={10}
              />

            </Space>
          </StyledCol>
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
