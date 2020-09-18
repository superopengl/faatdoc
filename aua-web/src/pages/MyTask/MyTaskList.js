import { Badge, Button, Layout, List, Modal, Space, Tabs, Typography } from 'antd';
import Text from 'antd/lib/typography/Text';
import HomeHeader from 'components/HomeHeader';
import { TaskStatus } from 'components/TaskStatus';
import { TimeAgo } from 'components/TimeAgo';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { listTask } from 'services/taskService';
import { listPortofolio } from 'services/portofolioService';
import { PlusOutlined, EditOutlined, ZoomInOutlined, SyncOutlined, HighlightOutlined } from '@ant-design/icons';
import styled from 'styled-components';

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

  .task-count .ant-badge-count {
    background-color: #143e86;
    color: #eeeeee;
    // box-shadow: 0 0 0 1px #143e86 inset;
  }
`;


const MyTaskList = (props) => {

  const { data, loading } = props;

  const [portofolioList, setPortofolioList] = React.useState([]);

  const goToEditTask = (id) => {
    props.history.push(`/task/${id || 'new'}`);
  }

  const goToViewTask = (id) => {
    props.history.push(`/task/${id}/view`);
  }

  const actionOnTask = task => {
    if (['to_sign', 'signed', 'complete'].includes(task.status)) {
      goToViewTask(task.id);
    } else {
      goToEditTask(task.id);
    }
  }

  const getActionIcon = status => {
    switch (status) {
      case 'todo':
        return <EditOutlined />
      case 'to_sign':
        return <HighlightOutlined />
      case 'signed':
      case 'complete':
      case 'archive':
      default:
        return <ZoomInOutlined />
    }
  }

  return <List
    itemLayout="horizontal"
    dataSource={data}
    size="large"
    loading={loading}
    renderItem={item => (
      <List.Item
        style={{ paddingLeft: 0, paddingRight: 0 }}
        key={item.id}
        onClick={() => actionOnTask(item)}
      >
        <List.Item.Meta
          avatar={<TaskStatus key="1" status={item.status} width={60} name={item.forWhom} style={{ marginTop: 6 }} />}

          title={<Text style={{ fontSize: '1rem' }}>{item.name}</Text>}
          description={<Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <TimeAgo value={item.lastUpdatedAt} surfix="Last Updated" />
            <Space>
              <Button shape="circle" key="action" onClick={() => actionOnTask(item)} icon={getActionIcon(item.status)}></Button>
              {/* {item.status === 'draft' && <>
                  <Button key="delete" shape="circle" danger disabled={loading} onClick={e => handleDelete(e, item)} icon={<DeleteOutlined />}></Button>
                </>} */}
            </Space>
          </Space>
          }
        />
      </List.Item>
    )}
  />
};

MyTaskList.propTypes = {};

MyTaskList.defaultProps = {};

export default withRouter(MyTaskList);
