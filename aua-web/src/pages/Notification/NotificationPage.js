import React from 'react';
import styled from 'styled-components';
import { Tabs, Typography, Layout, Button, Modal, Divider, List, Space, Row } from 'antd';
import HomeHeader from 'components/HomeHeader';
import { PortofolioAvatar } from 'components/PortofolioAvatar';
import { handleDownloadCsv } from 'services/memberService';
import { saveAs } from 'file-saver';
import * as moment from 'moment';
import windowSize from 'react-window-size';
import Text from 'antd/lib/typography/Text';
import {
  SyncOutlined, DeleteOutlined
} from '@ant-design/icons';
import { listPortofolio, savePortofolio, deletePortofolio } from 'services/portofolioService';
import { random } from 'lodash';
import { TimeAgo } from 'components/TimeAgo';
import { listNotification, getNotification, setNotificationCount, deleteNotification } from 'services/notificationService';
import { Alert } from 'antd';
import { GlobalContext } from 'contexts/GlobalContext';

const { Title, Paragraph, Link } = Typography;
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

  .ant-list-item {
    padding-left: 0;
    padding-right: 0;
  }
`;


const NotificationPage = (props) => {

  const [modalVisible, setModalVisible] = React.useState(false);
  const [list, setList] = React.useState([]);
  const [currentId, setCurrentId] = React.useState();
  const [loading, setLoading] = React.useState(true);
  const context = React.useContext(GlobalContext);

  const { role, setUser, user } = context;
  const isAdmin = role === 'admin';
  const isClient = role === 'client';
  const isAgent = role === 'agent';
  const isGuest = role === 'guest';

  const loadList = async () => {
    setLoading(true);
    const data = await listNotification();
    setList(data);
    setNotificationCount(data.filter(x => !x.readAt).length);
    setLoading(false);
  }

  React.useEffect(() => {
    loadList();
  }, [])


  const handleRead = async (e, item) => {
    e.stopPropagation();
    await readNotificationDetail(item.id)
  }

  const handleDelete = async (e, item) => {
    e.stopPropagation();
    Modal.confirm({
      title: <>To delete this notification?</>,
      onOk: async () => {
        setLoading(true);
        await deleteNotification(item.id);
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

  const handleGoToLodgement = (e, lodgementId) => {
    e.stopPropagation();
    const url = isClient ? `/lodgement/${lodgementId}` : `/lodgement/${lodgementId}/proceed`;
    props.history.push(url);
    Modal.destroyAll();
  }

  const readNotificationDetail = async (notificationId) => {
    const item = await getNotification(notificationId);
    const { id, content, createdAt, readAt, lodgementId, name, forWhom } = item;
    Modal.destroyAll();
    Modal.info({
      icon: null,
      title: <><PortofolioAvatar value={forWhom} size={32} /> About lodgement <Link onClick={e => handleGoToLodgement(e, lodgementId)}>{name} for {forWhom}</Link></>,
      width: 600,
      maskClosable: true,
      content: <>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}><TimeAgo value={createdAt} surfix="Sent at" /><TimeAgo value={readAt} surfix="Read at" /></Space>
        <Divider />
        <Paragraph style={{ whiteSpace: 'pre-line' }}>{content}</Paragraph>
      </>
    })
    await loadList();
  }

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <Space size="small" direction="vertical" style={{ width: '100%' }}>
          <StyledTitleRow>
            <Title level={2} style={{ margin: 'auto' }}>{isClient ? 'Notification' : 'Sent Out Notification'}</Title>
          </StyledTitleRow>
          {isClient && <Paragraph type="secondary">Notifications are the comments and adviced actions by your agent against your specific lodgement. All the notifications here are associated with certain lodgements. Please use the contact methods on the homepage for any inquiry that is not relavant to lodgement.</Paragraph>}
          {!isClient && <Paragraph type="secondary">These sent out notifications are the comments and adviced actions ... You can see if the notification has been read by the clients.</Paragraph>}
          <Space style={{width: '100%', justifyContent: 'flex-end'}}>
            
            <Button onClick={() => loadList()} icon={<SyncOutlined/>}>Refresh</Button>
            </Space>
          <List
            itemLayout="horizontal"
            dataSource={list}
            size="small"
            renderItem={item => (
              <List.Item
                // style={{backgroundImage: 'linear-gradient(to right, white, #f5f5f5)'}}
                key={item.id}
                onClick={e => handleRead(e, item)}
                key={item.id}
                actions={[
                  // !isClient ? <Paragraph>
                  //   To {item.forWhom} for {item.name} 
                  // </Paragraph> : null,
                  <TimeAgo value={item.createdAt} strong={!item.readAt} />,
                  isClient ? <Button shape="circle" danger icon={<DeleteOutlined />} onClick={e => handleDelete(e, item)} /> : null
                ]}
              >
                <Paragraph ellipsis={{ rows: 1, expandable: false }} style={{ fontWeight: item.readAt ? 300 : 800 }}>
                  {item.content}
                  {/* {!isClient && <div style={{marginTop: '0.5rem', fontWeight: 'normal'}}>
                <PortofolioAvatar value={item.forWhom} size={32} /> <Link onClick={e => handleGoToLodgement(e, item.lodgementId)}>{item.name}</Link>
                  </div>} */}
                </Paragraph>

                {/* <br/>
                <PortofolioAvatar value={item.forWhom} size={32} /> */}
                {/* <Space direction="vertical" style={{ display: 'block' }}>

                  {!isClient && <div>
                    
                  </div>}
                </Space> */}
              </List.Item>
            )}
          />
        </Space>
      </ContainerStyled>
      {/* {modalVisible && <Modal
        visible={modalVisible}
        onOk={() => setModalVisible(false)}
        onCancel={() => setModalVisible(false)}
        footer={null}
        title="Create/Edit Portofolio"
        width="90vw"
        style={{ maxWidth: 700 }}
      >
        <PortofolioForm
          onOk={item => saveJob(item)}
          onCancel={() => setModalVisible(false)}
          id={currentId}
        />
      </Modal>} */}
    </LayoutStyled>
  );
};

NotificationPage.propTypes = {};

NotificationPage.defaultProps = {};

export default NotificationPage;
