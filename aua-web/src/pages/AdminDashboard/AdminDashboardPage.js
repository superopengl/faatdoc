import { Button, Layout, Card, Space, Typography, Row, Col, Spin } from 'antd';
import HomeHeader from 'components/HomeHeader';
import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { listJob, searchJob } from 'services/jobService';
import { listPortfolio } from 'services/portfolioService';
import { SyncOutlined, PlusOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { listMessages } from 'services/messageService';
import MessageList from 'components/MessageList';
import { GlobalContext } from 'contexts/GlobalContext';
import { Divider } from 'antd';
import MyJobList from 'pages/MyJob/MyJobList';
import { Alert } from 'antd';
import { getStats } from 'services/statsService';
import { sum } from 'lodash';
import { MdOpenInNew } from 'react-icons/md';
import { DonutChart } from "bizcharts";

const { Title, Paragraph, Text } = Typography;


const ContainerStyled = styled.div`
  margin: 6rem auto 2rem auto;
  padding: 0 1rem;
  width: 100%;
  max-width: 1000px;

  .ant-divider {
    margin: 8px 0 24px;
  }
`;

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
  md: 24,
  lg: 12,
  xl: 12,
  xxl: 12
}

const StatCard = (props) => {
  const { title, value, loading } = props;

  const sumAll = (data) => {
    return sum(Object.values(data).map(x => +x));
  }

  const data = Object.entries(value || {}).map(([k, v]) => ({type: k, value: v}));

  return <Card title={title} style={{ marginTop: 20 }}>
    {loading ? <Spin /> : <Space direction="vertical" style={{ width: '100%', alignItems: 'center' }}>
      <DonutChart
        data={data || []}
        // title={{
        //   visible: false,
        //   text: "环图",
        // }}
        forceFit
        // description={{
        //   visible: false,
        //   text: "环图的外半径决定环图的大小，而内半径决定环图的厚度。",
        // }}
        radius={0.8}
        padding="auto"
        angleField="value"
        colorField="type"
        pieStyle={{ stroke: "white", lineWidth: 5 }}
        statistic={{
          totalLabel: 'Total',

        }}
        legend={{
          position: 'top-center'
        }}
        // color={['blue','yellow','green']}
      />
      <Space style={{ width: '100%', justifyContent: 'space-between' }} size="large">
        {Object.entries(value).map(([k, v], i) => <div key={i}>{k} <Text style={{ fontSize: 28 }} type="secondary" strong>{v}</Text></div>)}
      </Space>
    </Space>}
  </Card>
}

const AdminDashboardPage = (props) => {

  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState();
  const context = React.useContext(GlobalContext);
  const { notifyCount } = context;

  const loadEntity = async () => {
    setLoading(true);
    const stats = await getStats();
    setStats(stats);
    setLoading(false);
  }

  React.useEffect(() => {
    loadEntity()
  }, []);

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <Space style={{width: '100%', justifyContent: 'flex-end'}}>

        <Button onClick={() => loadEntity()} icon={<SyncOutlined />}></Button>
        </Space>
        <Row gutter={40}>
          <Col {...span}>
            <StatCard title={<Link to="/user">User <MdOpenInNew /></Link>} value={stats?.user} loading={loading} />
          </Col>
          <Col {...span}>
            <StatCard title="Portfolio" value={stats?.portfolio} loading={loading} />
          </Col>
          <Col {...span}>
            <StatCard title={<Link to="/job">Job <MdOpenInNew /></Link>} value={stats?.job} loading={loading} />
          </Col>
        </Row>
      </ContainerStyled>
    </LayoutStyled >
  );
};

AdminDashboardPage.propTypes = {};

AdminDashboardPage.defaultProps = {};

export default withRouter(AdminDashboardPage);
