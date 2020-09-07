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
  MailOutlined, PlusOutlined
} from '@ant-design/icons';
import { listPortofolio, savePortofolio, deletePortofolio } from 'services/portofolioService';
import { random } from 'lodash';
import { TimeAgo } from 'components/TimeAgo';
import { listNotification, getNotification, setNotificationCount } from 'services/notificationService';
import { Alert } from 'antd';

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
`;


const NotificationPage = (props) => {

  const [modalVisible, setModalVisible] = React.useState(false);
  const [list, setList] = React.useState([]);
  const [currentId, setCurrentId] = React.useState();
  const [loading, setLoading] = React.useState(true);

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

  const handleGoToLodgement = (e, lodgementId) => {
    e.stopPropagation();
    props.history.push(`/lodgement/${lodgementId}`);
    Modal.destroyAll();
  }
  
  
  const readNotificationDetail = async (notificationId) => {
    const item = await getNotification(notificationId);
    const {id, content, createdAt, readAt, lodgementId, name, forWhom} = item;
    Modal.destroyAll();
    Modal.info({
      icon: <MailOutlined />,
      title: <>About lodgement <Link onClick={e => handleGoToLodgement(e, lodgementId)}>{name} for {forWhom}</Link></>,
      width: 600,
      maskClosable: true,
      content: <>
      <Space style={{width: '100%', justifyContent: 'space-between'}}><TimeAgo value={createdAt} surfix="Sent at"/><TimeAgo value={readAt} surfix="Read at"/></Space>
      <Divider/>
      <Paragraph style={{whiteSpace: 'pre-line'}}>{content}</Paragraph>
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
            <Title level={2} style={{ margin: 'auto' }}>Notification</Title>
          </StyledTitleRow>
          <Paragraph type="secondary">Notifications are the comments and adviced actions by your agent against your specific lodgement. All the notifications here are associated with certain lodgements. Please use the contact methods on the homepage for any inquiry that is not relavant to lodgement.</Paragraph>
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
                  <TimeAgo value={item.createdAt} strong={!item.readAt} />
                ]}
              >
                <List.Item.Meta
                  // avatar={<PortofolioAvatar style={{marginTop: 6}} value={item.name} />}
                  title={<Paragraph ellipsis={{rows: 1, expandable: false}} style={{fontWeight:item.readAt ? 300: 800 }}>{item.content}</Paragraph>}
                  // description={}
                />
                {/* <PortofolioCard onClick={() => openModalToEdit(item.id)} onDelete={() => loadList()} id={item.id} name={item.name} /> */}
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
