import React from 'react';
import 'antd/dist/antd.less';
import 'react-image-lightbox/style.css';
import { BrowserRouter, Switch } from 'react-router-dom';
import HomePage from 'pages/HomePage';
import LogInPage from 'pages/LogInPage';
import ResetPasswordPage from 'pages/ResetPasswordPage';
import { GlobalContext } from './contexts/GlobalContext';
import ForgotPasswordPage from 'pages/ForgotPasswordPage';
import ChangePasswordPage from 'pages/ChangePasswordPage';
import SignInPage from 'pages/SignInPage';
import TermAndConditionPage from 'pages/TermAndConditionPage';
import Error404 from 'pages/Error404';
import PrivacyPolicyPage from 'pages/PrivacyPolicyPage';
import MyJobListPage from 'pages/MyJob/MyJobListPage';
import JobTemplatePage from 'pages/JobTemplate/JobTemplatePage';
import DocTemplatePage from 'pages/DocTemplate/DocTemplatePage';
import PortfolioPage from 'pages/Portfolio/PortfolioPage';
import AdminJobListPage from 'pages/AdminJob/AdminJobListPage';
import ProceedJobPage from 'pages/AdminJob/ProceedJobPage';
import { getAuthUser } from 'services/authService';
import {RoleRoute} from 'components/RoleRoute';
import MyJobPage from 'pages/MyJob/MyJobPage';
import RecurringListPage from 'pages/Recurring/RecurringListPage';
import MessagePage from 'pages/Message/MessagePage';
import UserPage from 'pages/User/UserPage';
import ImpersonatePage from 'pages/Impersonate/ImpersonatePage';
import { countUnreadMessage } from 'services/messageService';
import PortfolioForm from 'pages/Portfolio/PortfolioForm';
import DisclaimerPage from 'pages/DisclaimerPage';
import MyJobSign from 'pages/MyJob/MyJobSign';
import ClientDashboardPage from 'pages/ClientDashboard/ClientDashboardPage';
import AdminStatsPage from 'pages/AdminStats/AdminStatsPage';
import AdminBoardPage from 'pages/AdminBoard/AdminBoardPage';


class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      user: null,
      role: 'guest',
      loading: true,
      setUser: this.setUser,
      setLoading: this.setLoading,
      notifyCount: 0,
      setNotifyCount: this.setNotifyCount
    };
  }

  async componentDidMount() {
    this.setLoading(true);
    const user = await getAuthUser();
    if (user) {
      this.setUser(user);
      const count = await countUnreadMessage();
      this.setNotifyCount(count);
    }
    this.setLoading(false);
  }

  setUser = (user) => {
    this.setState({ user, role: user ? user.role : 'guest' });
  }

  setLoading = (value) => {
    this.setState({ loading: !!value });
  }

  setNotifyCount = (value) => {
    this.setState({ notifyCount: value });
  }

  render() {
    const { role, loading } = this.state;
    const isAdmin = role === 'admin';
    const isGuest = role === 'guest';
    const isClient = role === 'client';
    const isAgent = role === 'agent';

    return (
      <GlobalContext.Provider value={this.state}>
        <BrowserRouter basename="/">
          <Switch>
            <RoleRoute loading={loading} path="/" exact component={HomePage} />
            <RoleRoute visible={isGuest} loading={loading} exact path="/login" component={LogInPage} />
            <RoleRoute visible={isGuest} loading={loading} exact path="/signin" component={SignInPage} />
            <RoleRoute visible={isGuest} loading={loading} exact path="/forgot_password" component={ForgotPasswordPage} />
            <RoleRoute visible={isAdmin || isAgent} loading={loading} exact path="/stats" component={AdminStatsPage} />
            <RoleRoute visible={isAdmin || isAgent} loading={loading} exact path="/board" component={AdminBoardPage} />
            <RoleRoute visible={isClient} loading={loading} exact path="/landing" component={ClientDashboardPage} />
            <RoleRoute visible={isClient} loading={loading} exact path="/portfolio" component={PortfolioPage} />
            <RoleRoute visible={isClient} loading={loading} exact path="/portfolio/:id" component={PortfolioForm} />
            <RoleRoute visible={isClient} loading={loading} exact path="/portfolio/new/:type" component={PortfolioForm} />
            <RoleRoute loading={loading} path="/reset_password" exact component={ResetPasswordPage} />
            <RoleRoute visible={isAdmin} loading={loading} exact path="/job_template" component={JobTemplatePage} />
            <RoleRoute visible={isAdmin} loading={loading} exact path="/doc_template" component={DocTemplatePage} />
            <RoleRoute visible={isAdmin} loading={loading} exact path="/user" component={UserPage} />
            <RoleRoute visible={isAdmin} loading={loading} exact path="/recurring" component={RecurringListPage} />
            <RoleRoute visible={isAdmin} loading={loading} exact path="/impersonate" component={ImpersonatePage} />
            <RoleRoute visible={!isGuest} loading={loading} path="/message" exact component={MessagePage} />
            <RoleRoute visible={!isGuest} loading={loading} path="/job/new" exact component={MyJobPage} />
            <RoleRoute visible={!isGuest} loading={loading} path="/job/:id" exact component={MyJobPage} />
            <RoleRoute visible={isAdmin || isAgent || isClient} loading={loading} path="/job" exact component={isClient ? MyJobListPage : AdminJobListPage} />
            <RoleRoute visible={isAdmin || isAgent} loading={loading} path="/job/:id/proceed" exact component={ProceedJobPage} />
            <RoleRoute visible={!isGuest} loading={loading} path="/change_password" exact component={ChangePasswordPage} />
            <RoleRoute loading={loading} path="/terms_and_conditions" exact component={TermAndConditionPage} />
            <RoleRoute loading={loading} path="/privacy_policy" exact component={PrivacyPolicyPage} />
            <RoleRoute loading={loading} path="/disclaimer" exact component={DisclaimerPage} />
            {/* <Redirect to="/" /> */}
            <RoleRoute loading={loading} component={Error404} />

          </Switch>
        </BrowserRouter>
      </GlobalContext.Provider>
    );
  }
}

export default App;
