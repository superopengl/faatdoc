import { Button, List, Space } from 'antd';
import Text from 'antd/lib/typography/Text';
import { JobStatus } from 'components/JobStatus';
import { TimeAgo } from 'components/TimeAgo';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { EditOutlined, ZoomInOutlined, HighlightOutlined } from '@ant-design/icons';
import { Badge } from 'antd';


const MyJobList = (props) => {

  const { data, loading, onItemClick } = props;

  const goToEditJob = (id) => {
    props.history.push(`/job/${id || 'new'}`);
  }

  const goToViewJob = (id) => {
    props.history.push(`/job/${id}/view`);
  }

  const actionOnJob = job => {
    onItemClick(job);
    // if (['to_sign', 'signed', 'complete'].includes(job.status)) {
    //   goToViewJob(job.id);
    // } else {
    //   goToEditJob(job.id);
    // }
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

  const getDotComponent = (item) => {
    const color = item.status === 'to_sign' ? 'red' : item.lastUnreadMessageAt ? 'blue' : null;
    if (!color) return null;
    return <Badge color={color} style={{ position: 'absolute', top: -5, left: 0 }} />
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
        onClick={() => actionOnJob(item)}
      >
        <List.Item.Meta
          avatar={<div style={{ position: 'relative' }}>
            {getDotComponent(item)}
            <JobStatus key="1" status={item.status} width={60} name={item.forWhom} style={{ marginTop: 6 }} />
          </div>}

          title={<Text style={{ fontSize: '1rem' }}>{item.name}</Text>}
          description={<Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <TimeAgo value={item.lastUpdatedAt} surfix="Last Updated" accurate={true} />
            <Space>
              <Button shape="circle" key="action" type="link" onClick={() => actionOnJob(item)} icon={getActionIcon(item.status)}></Button>
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

MyJobList.propTypes = {};

MyJobList.defaultProps = {};

export default withRouter(MyJobList);
