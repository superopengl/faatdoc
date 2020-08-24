import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Typography, Tag } from 'antd';
import { EditOutlined, StopOutlined, QuestionOutlined } from '@ant-design/icons';
import { Card } from 'antd';
import { Modal, Popconfirm } from 'antd';
import { getFileUrl } from 'util/getFileUrl';
import styled from 'styled-components';
import ReactPlayer from "react-player";

const { Meta } = Card;
const { Text } = Typography;


const CardStyled = styled(Card)`
margin-bottom: 20px;
`;

const ImageDiv = styled.div`
width: 100%;
height: 300px;
overflow: hidden;
background-repeat: no-repeat;
background-size: contain;
background-position: center;
border-bottom: 1px solid #f0f0f0;
`;

const spanProps = {
  xs: 24,
  sm: 24,
  md: 12,
  lg: 8,
  xl: 6,
  xxl: 6,
}

export class GenericAdminGrid extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      list: undefined,
      loading: false,
      editModalVisible: false
    }
  }

  componentDidMount() {
    this.loadList()
  }

  loadList = async () => {
    this.setState({ loading: true });
    const list = await this.props.onLoadList();
    this.setState({
      list,
      loading: false
    });
  }

  onFinish = () => {
    this.loadList();
  }

  delete = async (id) => {
    this.setState({ loading: true });
    await this.props.onDelete(id);
    await this.loadList();
  }

  edit = (id) => {
    if (!id) throw new Error('id not specified when editing')
    this.setState({
      targetId: id,
      editModalVisible: true
    });
  }

  add = () => {
    this.setState({
      targetId: undefined,
      editModalVisible: true
    });
  }

  handleEditModalOk = async () => {
    await this.loadList();
    this.setState({
      // targetId: undefined,
      editModalVisible: false
    });
  }

  handleModalCancel = () => {
    this.setState({
      // targetId: undefined,
      editModalVisible: false
    });
  }

  render() {
    const { list, editModalVisible, targetId } = this.state;
    const { name } = this.props;

    const CardEditorComponent = this.props.cardEditorComponent;

    return (
      <div>
        {/* <em>targetId = {targetId}</em> */}
        <Row gutter={20} style={{ paddingBottom: 20 }}>
          {list && list.map((item, i) => (
            <Col key={i} {...spanProps}>
              <CardStyled hoverable
                // cover={<img alt="example" src={getFileUrl(item.imageId)} style={{ padding: '1px' }} />}
                cover={<div style={{ padding: '1px' }}>
                  {item.imageId && <ImageDiv style={{backgroundImage: `url("${getFileUrl(item.imageId)}")`}} />}
                  {item.videoUrl && <ReactPlayer url={item.videoUrl} width="100%" controls={true} />}
                </div>}
                actions={[
                  <Popconfirm
                    title={`Are you sure delete this ${name}?`}
                    onConfirm={() => this.delete(item.id)}
                    okButtonProps={{ danger: true }}
                    okText="Yes, delete this!"
                    cancelText="No, cancel"
                    icon={<QuestionOutlined />}
                  >
                    <StopOutlined key="delete" style={{ color: 'red' }} />
                  </Popconfirm>,
                  <EditOutlined key="edit" onClick={() => this.edit(item.id)} />,
                ]}
              >

                <Meta title={
                  <div>
                    {item.group && <>Group: {item.group.map(g => <Tag key={g}>{g}</Tag>)}</>}
                    <div>Ordinal: {item.ordinal}</div>
                    <div>Title: {item.title}</div>
                    {item.district ? <div><Text type="secondary"> <small>District: {item.district}</small></Text></div> : null}
                  </div>}
                  description={item.description} />
              </CardStyled>
            </Col>
          ))}
          <Col {...spanProps}>
            <Card hoverable onClick={() => this.add()}>
              <PlusOutlined style={{ fontSize: '5rem', margin: 'auto', width: '100%' }} />
              {/* <Text type="secondary">Click to add new card</Text> */}
            </Card>
          </Col>
        </Row>
        <Modal
          title={`${targetId ? "Edit" : "New"} ${name}`}
          visible={editModalVisible}
          onOk={this.handleEditModalOk}
          onCancel={this.handleModalCancel}
          footer={null}
        >
          {editModalVisible && <CardEditorComponent ref={this.modalRef} id={targetId}
            onFinish={this.handleEditModalOk}
            onCancel={this.handleModalCancel}
          ></CardEditorComponent>}
        </Modal>
      </div>
    );
  }
}

GenericAdminGrid.propTypes = {
  name: PropTypes.string.isRequired,
  cardEditorComponent: PropTypes.oneOfType([
    PropTypes.instanceOf(React.Component),
    PropTypes.func
  ]).isRequired,
  onLoadList: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

GenericAdminGrid.defaultProps = {
};

export default GenericAdminGrid;
