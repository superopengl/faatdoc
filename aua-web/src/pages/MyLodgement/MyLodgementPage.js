import React from 'react';
import PropTypes from 'prop-types';

import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Input, Button, Form, Layout, Drawer, Table, Card, Space, Typography } from 'antd';
import { FileUploader } from 'components/FileUploader';
import * as moment from 'moment';
import { GlobalContext } from 'contexts/GlobalContext';
import { Menu, Dropdown, message, Tooltip } from 'antd';
import { UpOutlined, DownOutlined, DeleteOutlined, QuestionOutlined } from '@ant-design/icons';
import { Divider } from 'antd';
import { listLodgement, deleteLodgement } from 'services/lodgementService';
import { normalizeFieldNameToVar } from 'util/normalizeFieldNameToVar';
import { varNameToLabelName } from 'util/varNameToLabelName';
import { Tag } from 'antd';
import { Progress } from 'antd';
import { Steps, Popover } from 'antd';
import { LodgementProgressBar } from 'components/LodgementProgressBar';
import HomeHeader from 'components/HomeHeader';
import MyLodgementForm from './MyLodgementForm';
import { listJobTemplate } from 'services/jobTemplateService';
import { listPortofolio } from 'services/portofolioService';

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
const ContainerStyled = styled.div`
margin: 4rem auto 2rem auto;
  padding: 2rem 0.5rem;
// text-align: center;
max-width: 500px;
width: 100%;
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
`;

const MyLodgementCard = (props) => {
  const id = props.match.params.id;
  const isNew = id === 'new';

  const [loading, setLoading] = React.useState(true);
  const [jobTemplateList, setJobTemplateList] = React.useState([]);
  const [portofolioList, setPortofolioList] = React.useState([]);

  const loadData = async () => {
    setLoading(true);
    const jobTemplateList = await listJobTemplate() || [];
    const portofolioList = await listPortofolio() || [];

    setJobTemplateList(jobTemplateList);
    setPortofolioList(portofolioList);
    setLoading(false);
  }

  const onOk = () => {
    props.history.push('/lodgement');
  }
  const onCancel = () => {
    props.history.goBack();
  }


  React.useEffect(() => {
    loadData();
  }, [])

  const { value } = props;

  const { name, status, createdAt } = value || {};



  return (<>
    <LayoutStyled>
      <HomeHeader />
      <ContainerStyled>
        {/* <Title level={2} style={{ margin: 'auto' }}>{isNew ? 'New Lodgement' : 'Edit Lodgement'}</Title> */}

        <MyLodgementForm
          onChange={() => onOk()}
          onCancel={() => onCancel()}
          jobTemplateList={jobTemplateList}
          portofolioList={portofolioList}
          id={isNew ? null : id} />
      </ContainerStyled>
    </LayoutStyled>
  </>
  );
};

MyLodgementCard.propTypes = {
  // id: PropTypes.string.isRequired
};

MyLodgementCard.defaultProps = {
  // id: 'new'
};

export default withRouter(MyLodgementCard);
