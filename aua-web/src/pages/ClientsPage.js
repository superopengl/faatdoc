import React from 'react';
import styled from 'styled-components';
import { Tabs, Typography, Layout, Button, Row } from 'antd';
import HomeHeader from 'components/HomeHeader';
import { handleDownloadCsv } from 'services/memberService';
import { saveAs } from 'file-saver';
import * as moment from 'moment';
import Text from 'antd/lib/typography/Text';
import {
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Table, Tag, Space } from 'antd';
import { listAllUsers } from 'services/userService';

const { Title } = Typography;
const { TabPane } = Tabs;

const ContainerStyled = styled.div`
  margin: 6rem 0.5rem 2rem 0.5rem;
`;

const StyledTitleRow = styled.div`
 display: flex;
 justify-content: space-between;
 align-items: center;
 margin-bottom: 1rem;
 width: 100%;
`

const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;
`;

const MemberOperationRow = styled(Row)`
  margin-top: 2rem;
  margin-button: 2rem; 
`

const columnDef = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (text, record) => <>{record.givenName} {record.surname}</>
  },
  {
    title: 'Bio Info',
    dataIndex: 'bio',
    key: 'bio',
    render: (text, record) => {
      const {dob, gender} = record;
      const theDate = moment(dob);
      return <>
        <div>Gendar: {gender}</div>
        <div>DOB: {theDate.format('DD MMM YYYY')}</div>
        <div>Age: {moment().diff(theDate, 'years', false)}</div>
      </>;
    }
  },
  {
    title: 'Contact',
    dataIndex: 'contact',
    key: 'contact',
    render: (text, record) => {
      const { email, phone, address } = record;
      return <>
        {email && <div>Email: <a href={`mailto:${email}`}>{email}</a></div>}
        {phone && <div>Phone: <a href={`tel:${phone}`}>{phone}</a></div>}
        {address && <div>Address: {address}</div>}
      </>;
    }
  },
  {
    title: 'Tax Info',
    dataIndex: 'taxinfo',
    key: 'taxinfo',
    render: (text, record) => {
      const { tfn, abn, acn } = record;
      return <>
        {tfn && <div>TFN: {tfn}</div>}
        {abn && <div>ABN: {abn}</div>}
        {acn && <div>ACN: {acn}</div>}
      </>;
    }
  },
  {
    title: 'Company',
    dataIndex: 'company',
    key: 'company',
    render: (text, record) => <>{text}</>
  },
  {
    title: 'Occupation / Industry',
    dataIndex: 'industry',
    key: 'industry',
    render: (text, record) => <>{record.occupation} {record.industry}</>
  },
  {
    title: 'Action',
    key: 'action',
    render: (text, record) => (
      <Space size="middle">
        <Link to={`/tasks?u=${record.id}`}>Tasks</Link>
        <a>Message</a>
      </Space>
    ),
  },
];

class ClientsPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      data: []
    }
  }

  componentDidMount() {
    this.loadData();
  }

  loadData = async () => {
    const data = await listAllUsers();
    this.setState({ data });
  };

  handleDownloadCsv = async () => {
    const data = await handleDownloadCsv();
    // console.log(data);
    const blob = new Blob([data], { type: 'text/csv,charset=utf-8' });
    saveAs(blob, `ubcallied members ${moment().format('YYYY-MM-DD_HH-mm-ss')}.csv`);
  }

  render() {
    const { windowWidth } = this.props;

    const { data } = this.state;

    const showNarrowScreenWarning = windowWidth <= 450;

    return (
      <LayoutStyled>
        <HomeHeader></HomeHeader>
        <ContainerStyled>
          <StyledTitleRow>
            <Title level={2} style={{ margin: 'auto' }}>Clients Management</Title>
          </StyledTitleRow>
          {showNarrowScreenWarning && <Text type="warning"><ExclamationCircleOutlined /> This admin page will be more convenient on wide screens.</Text>}
          <Table 
          rowKey={record => record.id}
          columns={columnDef} 
          dataSource={data} />
        </ContainerStyled>
      </LayoutStyled >
    );
  }
}
ClientsPage.propTypes = {};

ClientsPage.defaultProps = {};

export default ClientsPage;
