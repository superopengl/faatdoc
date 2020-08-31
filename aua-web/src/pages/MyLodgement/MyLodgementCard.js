import React from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Input, Button, Form, Modal, DatePicker, Table, Card, Space, Typography } from 'antd';
import { FileUploader } from 'components/FileUploader';
import * as moment from 'moment';
import { GlobalContext } from 'contexts/GlobalContext';
import { Menu, Dropdown, message, Tooltip } from 'antd';
import { UpOutlined, DownOutlined, DeleteOutlined, QuestionOutlined } from '@ant-design/icons';
import { Divider } from 'antd';
import { listLodgement, deleteLodgement } from 'services/lodgementService';
import { normalizeFieldNameToVar } from 'util/normalizeFieldNameToVar';
import { getDisplayNameFromVarName } from 'util/getDisplayNameFromVarName';
import { Tag } from 'antd';
import { Progress } from 'antd';
import { Steps, Popover } from 'antd';
import { LodgementProgressBar } from 'components/LodgementProgressBar';

const { Text, Title, Paragraph } = Typography;

const StyledFormItem = styled(Form.Item)`
  // padding: 2rem;
  // margin: 1rem 0;
  // border: 1px solid #eeeeee;
  // border-radius: 8px;
  // background-color: #ffffff;
`
const StyledCard = styled(Card)`
box-shadow: 0px 2px 8px #888888;

`


const MyLodgementCard = (props) => {

  const { value } = props;

  const { id, name, status, createdAt } = value || {};



  return (<>
    <StyledCard
      title={<>
      <Text style={{whiteSpace: 'break-spaces'}}>{name}</Text>
      <Paragraph type="secondary"><small>{moment(createdAt).format('DD MMM YYYY')}</small></Paragraph>
      {/* <Button type="link" onClick={handleDelete} danger>Delete</Button> */}
      </>}
      extra={<>
        <LodgementProgressBar status={status} width={80} />
      </>}
      bodyStyle={{ margin: 0, padding: 0 }}
      onClick={props.onClick}
    >
    </StyledCard>
  </>
  );
};

MyLodgementCard.propTypes = {};

MyLodgementCard.defaultProps = {};

export default withRouter(MyLodgementCard);
