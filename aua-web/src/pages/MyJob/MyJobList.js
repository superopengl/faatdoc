import { Button, List, Space } from 'antd';
import Text from 'antd/lib/typography/Text';
import { JobStatus } from 'components/JobStatus';
import { TimeAgo } from 'components/TimeAgo';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { EditOutlined, ZoomInOutlined, HighlightOutlined } from '@ant-design/icons';


const MyJobList = (props) => {

  const { data, loading } = props;

  const goToEditJob = (id) => {
    props.history.push(`/job/${id || 'new'}`);
  }

  const goToViewJob = (id) => {
    props.history.push(`/job/${id}/view`);
  }

  const actionOnJob = job => {
    if (['to_sign', 'signed', 'complete'].includes(job.status)) {
      goToViewJob(job.id);
    } else {
      goToEditJob(job.id);
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
        onClick={() => actionOnJob(item)}
      >
        <List.Item.Meta
          avatar={<JobStatus key="1" status={item.status} width={60} name={item.forWhom} style={{ marginTop: 6 }} />}

          title={<Text style={{ fontSize: '1rem' }}>{item.name}</Text>}
          description={<Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <TimeAgo value={item.lastUpdatedAt} surfix="Last Updated" />
            <Space>
              <Button shape="circle" key="action" onClick={() => actionOnJob(item)} icon={getActionIcon(item.status)}></Button>
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
