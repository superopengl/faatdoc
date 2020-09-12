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
import SignUpPage from 'pages/SignUpPage';
import TermAndConditionPage from 'pages/TermAndConditionPage';
import Error404 from 'pages/Error404';
import PrivacyPolicyPage from 'pages/PrivacyPolicyPage';
import MyLodgementListPage from 'pages/MyLodgement/MyLodgementListPage';
import JobTemplatePage from 'pages/JobTemplate/JobTemplatePage';
import PortofolioPage from 'pages/Portofolio/PortofolioPage';
import AdminLodgementListPage from 'pages/AdminLodgement/AdminLodgementListPage';
import ProceedLodgementPage from 'pages/AdminLodgement/ProceedLodgementPage';
import { getAuthUser } from 'services/authService';
import {RoleRoute} from 'components/RoleRoute';
import MyLodgementPage from 'pages/MyLodgement/MyLodgementPage';
import RecurringListPage from 'pages/Recurring/RecurringListPage';
import NotificationPage from 'pages/Notification/NotificationPage';
import UserPage from 'pages/User/UserPage';
import ImpersonatePage from 'pages/Impersonate/ImpersonatePage';
import { refreshNotificationUnreadCount as getNotificationUnreadCount} from 'services/notificationService';
import PortofolioForm from 'pages/Portofolio/PortofolioForm';
import DisclaimerPage from 'pages/DisclaimerPage';


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
      const count = await getNotificationUnreadCount();
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
            <RoleRoute visible={isGuest} loading={loading} exact path="/signup" component={SignUpPage} />
            <RoleRoute visible={isGuest} loading={loading} exact path="/forgot_password" component={ForgotPasswordPage} />
            <RoleRoute visible={isClient} loading={loading} exact path="/portofolio" component={PortofolioPage} />
            <RoleRoute visible={isClient} loading={loading} exact path="/portofolio/:id" component={PortofolioForm} />
            <RoleRoute visible={isClient} loading={loading} exact path="/portofolio/new/:type" component={PortofolioForm} />
            <RoleRoute loading={loading} path="/reset_password" exact component={ResetPasswordPage} />
            <RoleRoute visible={isAdmin} loading={loading} exact path="/job_template" component={JobTemplatePage} />
            <RoleRoute visible={isAdmin} loading={loading} exact path="/user" component={UserPage} />
            <RoleRoute visible={isAdmin} loading={loading} exact path="/recurring" component={RecurringListPage} />
            <RoleRoute visible={isAdmin} loading={loading} exact path="/impersonate" component={ImpersonatePage} />
            <RoleRoute visible={!isGuest} loading={loading} path="/notification" exact component={NotificationPage} />
            <RoleRoute visible={isClient} loading={loading} path="/lodgement/:id" exact component={MyLodgementPage} />
            <RoleRoute visible={isAdmin || isAgent || isClient} loading={loading} path="/lodgement" exact component={isClient ? MyLodgementListPage : AdminLodgementListPage} />
            <RoleRoute visible={isAdmin || isAgent} loading={loading} path="/lodgement/:id/proceed" exact component={ProceedLodgementPage} />
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
