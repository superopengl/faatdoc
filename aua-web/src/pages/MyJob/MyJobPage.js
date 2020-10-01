import React from 'react';

import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Layout, Spin } from 'antd';
import HomeHeader from 'components/HomeHeader';
import MyJobForm from './MyJobForm';
import { listJobTemplate } from 'services/jobTemplateService';
import { listPortfolio } from 'services/portfolioService';
import { generateJob, getJob, saveJob } from 'services/jobService';
import MyJobSign from './MyJobSign';
import JobFormWizard from './JobFormWizard';

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

const MyJobPage = (props) => {
  const id = props.match.params.id;
  const isNew = !id || id === 'new';

  const [loading, setLoading] = React.useState(true);
  const [job, setJob] = React.useState();

  const loadEntity = async () => {
    setLoading(true);
    if (id && !isNew) {
      const job = await getJob(id);
      setJob(job);
    }
    setLoading(false);
  }

  React.useEffect(() => {
    loadEntity();
  }, [])

  const onOk = () => {
    props.history.push('/job');
  }
  const onCancel = () => {
    props.history.goBack();
  }

  const showsEditableForm = isNew || job?.status === 'todo';
  const showsSign = !showsEditableForm || job?.status === 'to_sign';

  return (<>
    <LayoutStyled>
      <HomeHeader />
      <ContainerStyled>
        {loading ? <Spin /> : <>

          {/* {showsEditableForm && <MyJobForm
            onOk={onOk}
            onCancel={() => onCancel()}
            value={job} />} */}
          {showsEditableForm && <JobFormWizard
            onOk={onOk}
            onCancel={onCancel}
            value={job} />}
          {showsSign && <MyJobSign value={job} />}
        </>}
      </ContainerStyled>
    </LayoutStyled>
  </>
  );
};

MyJobPage.propTypes = {
  // id: PropTypes.string.isRequired
};

MyJobPage.defaultProps = {
  // id: 'new'
};

export default withRouter(MyJobPage);
