import React from 'react';

import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Layout } from 'antd';
import HomeHeader from 'components/HomeHeader';
import MyJobForm from './MyJobForm';
import { listJobTemplate } from 'services/jobTemplateService';
import { listPortofolio } from 'services/portofolioService';

const ContainerStyled = styled.div`
margin: 4rem auto 0 auto;
padding: 2rem 1rem;
// text-align: center;
max-width: 500px;
width: 100%;
`;


const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;
`;

const MyJobCard = (props) => {
  const id = props.match.params.id;
  const isNew = id === 'new';

  const [, setLoading] = React.useState(true);

  const onOk = () => {
    props.history.push('/job');
  }
  const onCancel = () => {
    props.history.goBack();
  }

  return (<>
    <LayoutStyled>
      <HomeHeader />
      <ContainerStyled>
        {/* <Title level={2} style={{ margin: 'auto' }}>{isNew ? 'New Job' : 'Edit Job'}</Title> */}

        <MyJobForm
          onChange={() => onOk()}
          onCancel={() => onCancel()}
          id={isNew ? null : id} />
      </ContainerStyled>
    </LayoutStyled>
  </>
  );
};

MyJobCard.propTypes = {
  // id: PropTypes.string.isRequired
};

MyJobCard.defaultProps = {
  // id: 'new'
};

export default withRouter(MyJobCard);
