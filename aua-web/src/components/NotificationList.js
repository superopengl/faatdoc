import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Typography, Modal, Divider, List, Space, Spin } from 'antd';
import { PortofolioAvatar } from 'components/PortofolioAvatar';
import { TimeAgo } from 'components/TimeAgo';
import { getNotification, countUnreadNotification } from 'services/notificationService';
import { GlobalContext } from 'contexts/GlobalContext';
import { RiExternalLinkLine } from 'react-icons/ri';
import InfiniteScroll from 'react-infinite-scroller';

const { Paragraph, Link } = Typography;

const StyledListItem = styled.div`
display: flex;
width: 100%;
justify-content: space-between;
margin-bottom: 0.5rem;
padding-bottom: 0.5rem;
border-bottom: 1px solid #f3f3f3;
`;

const NotificationList = (props) => {

  const { onItemRead, onFetchNextPage, size, max } = props;

  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [hasMore, setHasMore] = React.useState(true);
  const [page, setPage] = React.useState(0);
  const context = React.useContext(GlobalContext);

  const { role } = context;
  const isClient = role === 'client';

  const initloadList = async () => {
    setLoading(true);
    await handleFetchNextPageData(size);
    const count = await countUnreadNotification();
    context.setNotifyCount(count);
    setLoading(false);
  }

  React.useEffect(() => {
    initloadList();
  }, []);

  const handleFetchNextPageData = async () => {
    // const data = await listNotification(page, pageSize);
    const data = await onFetchNextPage(page, size);
    const newList = [...list, ...data];

    setList(max ? newList.slice(0, max) : newList);
    setPage(page + 1);

    const shouldStopLoading = data.length < size || (max && newList.length >= max);
    setHasMore(!shouldStopLoading);
  }

  const handleRead = async (e, item) => {
    e.stopPropagation();
    await readNotificationDetail(item.id);
    item.readAt = new Date();
    setList([...list]);
    context.setNotifyCount(context.notifyCount - 1);
    onItemRead(item);
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
      title: <Space style={{ alignItems: 'flex-start' }}><PortofolioAvatar value={forWhom} size={32} /><Link onClick={e => handleGoToTask(e, taskId)}>{name} for {forWhom}<RiExternalLinkLine style={{ marginLeft: '0.5rem' }} /></Link></Space>,
      width: 600,
      maskClosable: true,
      content: <>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}><TimeAgo value={createdAt} surfix="Sent at" /><TimeAgo value={readAt} surfix="Read at" /></Space>
        <Divider />
        <Paragraph style={{ whiteSpace: 'pre-line' }}>{content}</Paragraph>
      </>
    })
    // await initloadList();
  }

  return (
    <InfiniteScroll
      initialLoad={true}
      pageStart={0}
      loadMore={() => handleFetchNextPageData()}
      hasMore={!loading && hasMore}
      useWindow={true}
      loader={<Space key="loader" style={{ width: '100%', justifyContent: 'center' }}><Spin /></Space>}
    >
      <List
        itemLayout="horizontal"
        dataSource={list}
        size="small"
        style={{ marginTop: '1rem' }}
        renderItem={item => (<StyledListItem
          onClick={e => handleRead(e, item)}
          >
          <Paragraph ellipsis={{ rows: 1, expandable: false }} style={{ fontWeight: item.readAt ? 300 : 800, width: 'calc(100% - 150px)' }}>
            {item.content}
          </Paragraph>
          <Space>
            <TimeAgo value={item.createdAt} strong={!item.readAt} />
          </Space>
        </StyledListItem>
        )}
      />
    </InfiniteScroll>
  );
};

NotificationList.propTypes = {
  size: PropTypes.number.isRequired,
  onItemRead: PropTypes.func.isRequired,
  onFetchNextPage: PropTypes.func.isRequired,
  max: PropTypes.number,
};

NotificationList.defaultProps = {
  size: 20,
  onItemRead: () => { },
};

export default NotificationList;
