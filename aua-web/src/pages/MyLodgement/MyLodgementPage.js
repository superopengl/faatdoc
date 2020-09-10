import React from 'react';

import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Layout } from 'antd';
import HomeHeader from 'components/HomeHeader';
import MyLodgementForm from './MyLodgementForm';
import { listJobTemplate } from 'services/jobTemplateService';
import { listPortofolio } from 'services/portofolioService';

const ContainerStyled = styled.div`
margin: 4rem auto 2rem auto;
  padding: 2rem 0.5rem;
// text-align: center;
max-width: 500px;
width: 100%;
`;


const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;
`;

const MyLodgementCard = (props) => {
  const id = props.match.params.id;
  const isNew = id === 'new';

  const [, setLoading] = React.useState(true);
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
