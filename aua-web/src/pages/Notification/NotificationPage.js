import React from 'react';
import styled from 'styled-components';
import { Typography, Layout, Button, Modal, Divider, List, Space } from 'antd';
import HomeHeader from 'components/HomeHeader';
import { PortofolioAvatar } from 'components/PortofolioAvatar';
import {
  SyncOutlined
} from '@ant-design/icons';
import { TimeAgo } from 'components/TimeAgo';
import { listNotification, getNotification } from 'services/notificationService';
import { GlobalContext } from 'contexts/GlobalContext';
import { RiExternalLinkLine } from 'react-icons/ri';

const { Title, Paragraph, Link } = Typography;

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

  .ant-list-item {
    padding-left: 0;
    padding-right: 0;
  }
`;


const NotificationPage = (props) => {

  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const context = React.useContext(GlobalContext);

  const { role } = context;
  const isClient = role === 'client';

  const loadList = async () => {
    setLoading(true);
    const data = await listNotification();
    setList(data);
    context.setNotifyCount(data.filter(x => !x.readAt).length);
    setLoading(false);
  }

  React.useEffect(() => {
    loadList();
  }, [])


  const handleRead = async (e, item) => {
    e.stopPropagation();
    await readNotificationDetail(item.id)
  }

  const handleGoToTask = (e, taskId) => {
    e.stopPropagation();
    const url = isClient ? `/task/${taskId}` : `/task/${taskId}/proceed`;
    props.history.push(url);
    Modal.destroyAll();
  }

  const readNotificationDetail = async (notificationId) => {
    const item = await getNotification(notificationId);
    const { content, createdAt, readAt, taskId, name, forWhom } = item;
    Modal.destroyAll();
    Modal.info({
      icon: null,
      title: <Space style={{ alignItems: 'flex-start' }}><PortofolioAvatar value={forWhom} size={32} /><Link onClick={e => handleGoToTask(e, taskId)}>{name} for {forWhom}<RiExternalLinkLine style={{marginLeft: '0.5rem'}}/></Link></Space>,
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
          {isClient && <Paragraph type="secondary">Notifications are the comments and adviced actions by your agent against your specific task. All the notifications here are associated with certain tasks. Please use the contact methods on the homepage for any inquiry that is not relavant to task.</Paragraph>}
          {!isClient && <Paragraph type="secondary">You can see if the notification has been read by the clients. The status of the message can only change to 'read' when the client has opened it.</Paragraph>}
          {!isClient && <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button type="primary" ghost onClick={() => loadList()} icon={<SyncOutlined />}>Refresh</Button>
          </Space>}
          <List
            itemLayout="horizontal"
            dataSource={list}
            size="small"
            style={{ marginTop: '1rem' }}
            renderItem={item => (<div
              onClick={e => handleRead(e, item)}
              style={{ display: 'flex', width: '100%', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
              <Paragraph ellipsis={{ rows: 1, expandable: false }} style={{ fontWeight: item.readAt ? 300 : 800, width: 'calc(100% - 150px)' }}>
                {item.content}
              </Paragraph>
              <Space>
                <TimeAgo value={item.createdAt} strong={!item.readAt} />
              </Space>
            </div>
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
