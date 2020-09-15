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
import MyTaskListPage from 'pages/MyTask/MyTaskListPage';
import JobTemplatePage from 'pages/JobTemplate/JobTemplatePage';
import PortofolioPage from 'pages/Portofolio/PortofolioPage';
import AdminTaskListPage from 'pages/AdminTask/AdminTaskListPage';
import ProceedTaskPage from 'pages/AdminTask/ProceedTaskPage';
import { getAuthUser } from 'services/authService';
import {RoleRoute} from 'components/RoleRoute';
import MyTaskPage from 'pages/MyTask/MyTaskPage';
import RecurringListPage from 'pages/Recurring/RecurringListPage';
import NotificationPage from 'pages/Notification/NotificationPage';
import UserPage from 'pages/User/UserPage';
import ImpersonatePage from 'pages/Impersonate/ImpersonatePage';
import { countUnreadNotification as getNotificationUnreadCount} from 'services/notificationService';
import PortofolioForm from 'pages/Portofolio/PortofolioForm';
import DisclaimerPage from 'pages/DisclaimerPage';
import MyTaskViewPage from 'pages/MyTask/MyTaskViewPage';
import ClientDashboardPage from 'pages/ClientDashboard/ClientDashboardPage';


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
            <RoleRoute visible={isGuest} loading={loading} exact path="/signin" component={SignInPage} />
            <RoleRoute visible={isGuest} loading={loading} exact path="/forgot_password" component={ForgotPasswordPage} />
            <RoleRoute visible={isClient} loading={loading} exact path="/landing" component={ClientDashboardPage} />
            <RoleRoute visible={isClient} loading={loading} exact path="/portofolio" component={PortofolioPage} />
            <RoleRoute visible={isClient} loading={loading} exact path="/portofolio/:id" component={PortofolioForm} />
            <RoleRoute visible={isClient} loading={loading} exact path="/portofolio/new/:type" component={PortofolioForm} />
            <RoleRoute loading={loading} path="/reset_password" exact component={ResetPasswordPage} />
            <RoleRoute visible={isAdmin} loading={loading} exact path="/job_template" component={JobTemplatePage} />
            <RoleRoute visible={isAdmin} loading={loading} exact path="/user" component={UserPage} />
            <RoleRoute visible={isAdmin} loading={loading} exact path="/recurring" component={RecurringListPage} />
            <RoleRoute visible={isAdmin} loading={loading} exact path="/impersonate" component={ImpersonatePage} />
            <RoleRoute visible={!isGuest} loading={loading} path="/notification" exact component={NotificationPage} />
            <RoleRoute visible={isClient} loading={loading} path="/task/:id" exact component={MyTaskPage} />
            <RoleRoute visible={isClient} loading={loading} path="/task/:id/view" exact component={MyTaskViewPage} />
            <RoleRoute visible={isAdmin || isAgent || isClient} loading={loading} path="/task" exact component={isClient ? MyTaskListPage : AdminTaskListPage} />
            <RoleRoute visible={isAdmin || isAgent} loading={loading} path="/task/:id/proceed" exact component={ProceedTaskPage} />
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
