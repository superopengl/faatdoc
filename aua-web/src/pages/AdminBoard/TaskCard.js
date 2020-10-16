import { Modal, Space, Card } from 'antd';
import Text from 'antd/lib/typography/Text';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { deleteJob } from '../../services/jobService';
import styled from 'styled-components';
import { Draggable } from 'react-beautiful-dnd';
import { PortfolioAvatar } from 'components/PortfolioAvatar';
import PropTypes from 'prop-types';

const StyledCard = styled(Card)`
position: relative;
box-shadow: 0 1px 2px rgba(0,0,0,0.1);
.ant-card-body {
  padding: 16px;
}
`;

const TaskCard = (props) => {

  const { job, index, onChange } = props;
  const { id, name, forWhom, email, jobTemplateName } = job;

  const getItemStyle = (isDragging, draggableStyle) => ({
    // background: isDragging ? "#C0C0C0" : "",
    ...draggableStyle
  });


  const handleEditJob = (id) => {
    props.history.push(`/job/${id}/proceed`);
  }

  return <Draggable draggableId={id} index={index}>
    {
      (provided, snapshot) => (
        <div ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}>
          <StyledCard hoverable onDoubleClick={() => handleEditJob(id)}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {name}
              <Text type="secondary">{jobTemplateName}</Text>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space style={{ lineHeight: '0.5rem', padding: 0 }}>
                  <PortfolioAvatar value={forWhom} size={32} />
                  <Space direction="vertical">
                    <small>{forWhom}</small>
                    <small>{email}</small>
                  </Space>
                </Space>
              </Space>
            </Space>
            {/* <div style={{ display: 'flex', position: 'absolute', right: 0, bottom: 0 }}>
              <Tooltip placement="bottom" title="Proceed job">
                <Link to={`/job/${id}/proceed`}><Button type="link" icon={<EditOutlined />}></Button></Link>
              </Tooltip>
              <Tooltip placement="bottom" title="Delete job">
                <Button type="link" danger onClick={handleDelete} icon={<DeleteOutlined />}></Button>
              </Tooltip>
            </div> */}
          </StyledCard>
        </div>
      )
    }
  </Draggable>
}

TaskCard.propTypes = {
  job: PropTypes.any.isRequired
};

TaskCard.defaultProps = {};

export default withRouter(TaskCard);