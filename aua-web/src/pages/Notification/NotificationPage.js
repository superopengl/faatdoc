import React from 'react';
import styled from 'styled-components';
import { Typography, Layout, Space } from 'antd';
import HomeHeader from 'components/HomeHeader';
import { listNotification } from 'services/notificationService';
import { GlobalContext } from 'contexts/GlobalContext';
import NotificationList from '../../components/NotificationList';

const { Title, Paragraph } = Typography;

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


const NotificationPage = () => {

  const context = React.useContext(GlobalContext);

  const { role } = context;
  const isClient = role === 'client';


  const handleFetchNextPage = async (page, size) => {
    return await listNotification({page, size, unreadOnly: false});
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
            {/* <Button type="primary" ghost onClick={() => initloadList()} icon={<SyncOutlined />}>Refresh</Button> */}
          </Space>}
          <NotificationList
            onFetchNextPage={handleFetchNextPage}
          />
        </Space>
      </ContainerStyled>
    </LayoutStyled>
  );
};

NotificationPage.propTypes = {};

NotificationPage.defaultProps = {};

export default NotificationPage;
