import React from 'react';
import styled from 'styled-components';
import { Tabs, Typography, Layout, Button, Modal, Alert, Divider } from 'antd';
import { LargePlusButton } from 'components/LargePlusButton';
import HomeHeader from 'components/HomeHeader';
import { handleDownloadCsv } from 'services/memberService';
import { saveAs } from 'file-saver';
import * as moment from 'moment';
import windowSize from 'react-window-size';
import Text from 'antd/lib/typography/Text';
import {
  DeleteOutlined, PlusOutlined, SyncOutlined, EditOutlined, FormOutlined, CheckCircleOutlined, SmileOutlined
} from '@ant-design/icons';
import { Link, withRouter } from 'react-router-dom';
import { List } from 'antd';
import { Space } from 'antd';
import LodgementForm from './MyLodgementForm';
import LodgementCard from './MyLodgementCard';
import { listLodgement, deleteLodgement } from 'services/lodgementService';
import { random } from 'lodash';
import { listJobTemplate } from 'services/jobTemplateService';
import { listPortofolio } from 'services/portofolioService';
import ReviewSignPage from './ReviewSignPage';
import { LodgementProgressBar } from 'components/LodgementProgressBar';
import { TimeAgo } from 'components/TimeAgo';
import { Badge } from 'antd';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;


const ContainerStyled = styled.div`
  margin: 6rem auto 2rem auto;
  padding: 0 0.5rem;
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

  .lodgement-count .ant-badge-count {
    background-color: #143e86;
    color: #eeeeee;
    // box-shadow: 0 0 0 1px #143e86 inset;
  }
`;


const MyLodgementListPage = (props) => {

  const [loading, setLoading] = React.useState(true);
  const [signModalVisible, setSignModalVisible] = React.useState(false);
  const [lodgementList, setLodgementList] = React.useState([]);
  const [jobTemplateList, setJobTemplateList] = React.useState([]);
  const [portofolioList, setPortofolioList] = React.useState([]);
  const [currentLodgement, setCurrentLodgement] = React.useState();


  const loadList = async () => {
    setLoading(true);
    const portofolioList = await listPortofolio() || [];

    const list = await listLodgement();
    const jobTemplateList = await listJobTemplate() || [];

    setLodgementList(list);
    setJobTemplateList(jobTemplateList);
    setPortofolioList(portofolioList);
    setLoading(false);
  }


  React.useEffect(() => {
    loadList();
  }, [])

  const goToLodgement = (id) => {
    props.history.push(`/lodgement/${id || 'new'}`);
  }

  const createNewLodgement = () => {
    if (!portofolioList.length) {
      Modal.confirm({
        title: 'No portofolio',
        content: 'Please create portofolio before creating lodgement. Go to create protofolio now?',
        okText: 'Yes, go to create portofolio',
        onOk: () => props.history.push('/portofolio')
      });
      return;
    }
    goToLodgement();
  }

  const actionOnLodgement = lodgement => {
    setCurrentLodgement(lodgement);
    if (['to_sign', 'signed', 'done'].includes(lodgement.status)) {
      setSignModalVisible(true);
    } else {
      goToLodgement(lodgement.id);
    }
  }

  const handleModalExit = async () => {
    setSignModalVisible(false);
    await loadList();
  }

  const getActionLabel = status => {
    return {
      draft: 'edit',
      submitted: 'edit',
      to_sign: 'sign',
      signed: 'view',
      done: 'view',
      archive: 'view'
    }[status];
  }

  const handleDelete = async (e, item) => {
    e.stopPropagation();
    Modal.confirm({
      title: <>To delete lodgement <strong>{item.name}</strong>?</>,
      onOk: async () => {
        setLoading(true);
        await deleteLodgement(item.id);
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

  const RenderListFilteredByStatus = (statuses = []) => {
    const data = lodgementList.filter(x => statuses.includes(x.status));

    return <List
      itemLayout="horizontal"
      dataSource={data}
      size="large"
      renderItem={item => (
        <List.Item
          style={{ paddingLeft: 0, paddingRight: 0 }}
          key={item.id}
          onClick={() => actionOnLodgement(item)}
          // extra={[
          //   <LodgementProgressBar key="1" status={item.status} width={80} />
          // ]}
          // actions={[
          //   <Button type="link" key="action" onClick={() => actionOnLodgement(item)}>{getActionLabel(item.status)}</Button>,
          //   item.status === 'draft' ? <Button type="link" key="delete" danger onClick={e => handleDelete(e, item)}>delete</Button> : null,
          // ]}
        >
          <List.Item.Meta
            avatar={<LodgementProgressBar key="1" status={item.status} width={80} style={{ marginTop: 6 }} />}

            title={<Text style={{ fontSize: '1.3rem' }}>{item.name}</Text>}
            description={<Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <TimeAgo value={item.lastUpdatedAt} surfix="Last Updated" />
              <Space>
                <Button type="link" key="action" onClick={() => actionOnLodgement(item)}>{getActionLabel(item.status)}</Button>
                {item.status === 'draft' && <>
                  <Divider type="vertical" />
                  <Button key="delete" type="link" danger disabled={loading} onClick={e => handleDelete(e, item)}>delete</Button>
                </>}
              </Space>
            </Space>
            }
          />
        </List.Item>
      )}
    />
  }

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <Space size="large" direction="vertical" style={{ width: '100%' }}>
          <StyledTitleRow>
            <Title level={2} style={{ margin: 'auto' }}>Lodgements</Title>
          </StyledTitleRow>
          {/* <Steps current={0} size="small">
            <Steps.Step status="submitted" title="submitted" icon={<SendOutlined />} />
            <Steps.Step status="to_sign" title="to sign" icon={<EditOutlined />} />
            <Steps.Step status="signed" title="signed" icon={<FormOutlined />} />
            <Steps.Step status="done" title="complete" icon={<CheckCircleOutlined />} />
          </Steps> */}
          <Space style={{ width: '100%', justifyContent: 'flex-end' }} >
            {/* <Button type="link" onClick={() => loadList()} icon={<SyncOutlined />}></Button> */}
            <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => createNewLodgement()}>New Lodgement</Button>
          </Space>

          <Tabs defaultActiveKey="ongoing" type="card" tabBarExtraContent={{ right: <Button type="link" onClick={() => loadList()} icon={<SyncOutlined />}></Button> }}>
            <TabPane tab={<>In Progress <Badge count={lodgementList.filter(x => ['to_sign'].includes(x.status)).length} showZero={false} /></>} key="ongoing">
              {RenderListFilteredByStatus(['submitted', 'to_sign', 'signed'])}
            </TabPane>
            <TabPane tab={"Draft"} key="draft">
              {RenderListFilteredByStatus(['draft'])}
            </TabPane>
            <TabPane tab={"Completed"} key="done">
              {RenderListFilteredByStatus(['done'])}
            </TabPane>
          </Tabs>
        </Space>

      </ContainerStyled>
      <Modal
        title={currentLodgement?.name || 'New Lodgement'}
        visible={signModalVisible}
        destroyOnClose={true}
        onCancel={() => setSignModalVisible(false)}
        onOk={() => setSignModalVisible(false)}
        footer={null}
        width={700}
      >
        {currentLodgement?.status === 'signed' ? <Alert message="The lodgement has been signed." description="Please wait for the lodgement to be completed by us." type="success" showIcon /> : null}
        {currentLodgement?.status === 'to_sign' ? <Alert message="The lodgement requires signature." description="All above documents have been viewed and the lodgement is ready to e-sign." type="warning" showIcon /> : null}
        <Tabs>
          <Tabs.TabPane tab="Review and Sign" key="sign">
            <ReviewSignPage id={currentLodgement?.id} onFinish={() => handleModalExit()} onCancel={() => setSignModalVisible(false)} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Lodgement" key="view">
            <LodgementForm id={currentLodgement?.id} onFinish={() => handleModalExit()} onCancel={() => setSignModalVisible(false)} />
          </Tabs.TabPane>
        </Tabs>
      </Modal>
    </LayoutStyled >
  );
};

MyLodgementListPage.propTypes = {};

MyLodgementListPage.defaultProps = {};

export default withRouter(MyLodgementListPage);
