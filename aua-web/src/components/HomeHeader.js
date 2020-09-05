import React from 'react';
import styled from 'styled-components';
import { Layout, Menu, Drawer, Button, Modal, Typography } from 'antd';
import MediaQuery from 'react-responsive'
import {
  MenuOutlined, HomeOutlined, MailOutlined, SmileOutlined, PictureOutlined,
  BellOutlined, SettingOutlined,
  IdcardOutlined, UserOutlined, LogoutOutlined, SecurityScanOutlined,
  LoginOutlined, TeamOutlined, SnippetsOutlined
} from '@ant-design/icons';
import { Link, withRouter } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { Logo } from './Logo';
import { GlobalContext } from '../contexts/GlobalContext'
import { logout } from 'services/authService';

const {Title, Text} = Typography;
const { Header } = Layout;
const HeaderStyled = styled(Header)`
position: fixed;
z-index: 1;
width: 100%;
// background-color: rgba(255,255,255,0.8);
background-color: rgba(255,255,255);
display: flex;
white-space: nowrap;
border: 0;
justify-content: space-between;
border-bottom: 1px solid #f0f0f0;
align-items: center;
box-shadow: 0px 2px 8px #888888;
padding-left: 20px;
padding-right: 20px;

`;

const MenuContianer = styled.div`
float: right;
// border: 0;
margin-bottom: 2px;
`;


const headerHeight = 64;

const HeaderLogo = styled.div`
display: flex;
height: ${headerHeight}px;
`

class HomeHeaderRaw extends React.Component {
  state = {
    visible: false
  }

  showDrawer = () => {
    this.setState({
      visible: true,
    });
  };

  onClose = () => {
    this.setState({
      visible: false,
    });
  };

  goToBackdoorPage = () => {
    const history = this.props.history;
    this.setState({ visible: false }, () => {
      history.push('/backdoor');
    });
  }

  render() {
    const history = this.props.history;

    return (
      <GlobalContext.Consumer>
        {
          context => {
            const { role, setUser } = context;
            const isAdmin = role === 'admin';
            const isClient = role === 'client';
            const isAgent = role === 'agent';
            const isGuest = role === 'guest';

            const handleLogout = () => {
              Modal.confirm({
                title: <>Do you want to log out?</>,
                icon: null,
                // content: 'Some descriptions',
                async onOk() {
                  await logout();
                  setUser(null);
                  history.push('/');
                },
                maskClosable: true,
                okText: 'Yes, log me out!',
                onCancel() {
                },
              });
            }
            return (
              <HeaderStyled>
                <HeaderLogo>
                  <HashLink to="/">
                  <img alt="AUA logo" src="/images/header-logo.png" width="auto" height="60" style={{padding: '2px 0 2px 0'}}></img>
                  </HashLink>
                  {/* {isAdmin && <Text>Admin</Text>} */}
                </HeaderLogo>
                <MediaQuery minDeviceWidth={801}>
                  <MenuContianer>
                    <Menu mode="horizontal" style={{ border: 0 }}>
                      {isGuest && <Menu.Item key="home"><HashLink to="/#home">Home</HashLink></Menu.Item>}
                      {isGuest && <Menu.Item key="services"><HashLink to="/#services">Services</HashLink></Menu.Item>}
                      {isGuest && <Menu.Item key="team"><HashLink to="/#team">Team</HashLink></Menu.Item>}
                      {isGuest && <Menu.Item key="login"><Link to="/login">Log In / Sign Up</Link></Menu.Item>}
                      {!isGuest && <Menu.Item key="lodgement"><Link to="/lodgement">Lodgements</Link></Menu.Item>}
                      {isClient && <Menu.Item key="portofolio"><Link to="/portofolio">Portofolios</Link></Menu.Item>}
                      {isAdmin && <Menu.Item key="clients"><Link to="/clients">Users</Link></Menu.Item>}
                      {/* {isAdmin && <Menu.Item key="admin"><Link to="/admin">Admin</Link></Menu.Item>} */}
                      {isAdmin && <Menu.Item key="job_template"><Link to="/job_template">Job Template</Link></Menu.Item>}
                      {isAdmin && <Menu.Item key="recurring"><Link to="/recurring">Recurring</Link></Menu.Item>}
                      {!isGuest && <Menu.Item key="message"><Link to="/message">Messages</Link></Menu.Item>}
                      {!isGuest && <Menu.Item key="changePassword"><Link to="/change_password">Change Password</Link></Menu.Item>}
            {!isGuest && <Menu.Item key="logout" onClick={handleLogout}>{isAdmin ? 'Admin ' : isAgent ? 'Agent ' : null}Log Out</Menu.Item>}
                    </Menu>
                  </MenuContianer>
                  {/* <Tag>{user?.memberId}</Tag> */}
                </MediaQuery>
                <MediaQuery maxDeviceWidth={800}>
                  <Button type="default" onClick={this.showDrawer}>
                    <MenuOutlined />
                  </Button>
                  <Drawer
                    placement="right"
                    closable={true}
                    onClose={this.onClose}
                    visible={this.state.visible}
                    width={290}
                    bodyStyle={{paddingLeft: 0, paddingRight: 0}}
                  >
                    <Menu mode="inline" style={{ border: 0 }} openKeys={['gallery']}>
                      {isGuest && <Menu.Item key="login"><LoginOutlined /> <Link to="/login">Log In / Sign Up</Link></Menu.Item>}
                      {/* {isAdmin && <Menu.Item key="admin"><SettingOutlined /> <Link to="/admin">Admin</Link></Menu.Item>} */}
                      {!isGuest && <Menu.Item key="lodgement"><SnippetsOutlined /> <Link to="/lodgement">Lodgements</Link></Menu.Item>}
                      {isClient && <Menu.Item key="portofolio"><IdcardOutlined /> <Link to="/portofolio">Portofolios</Link></Menu.Item>}
                      {isAdmin && <Menu.Item key="job_template"><SettingOutlined /> <Link to="/job_template">Job Template</Link></Menu.Item>}
                      {isAdmin && <Menu.Item key="recurring"><SettingOutlined /> <Link to="/recurring">Recurring</Link></Menu.Item>}
                      {isAdmin && <Menu.Item key="clients"><SettingOutlined /> <Link to="/clients">Users</Link></Menu.Item>}
                      {!isGuest && <Menu.Item key="messages"><MailOutlined /> <Link to="/message">Messages</Link></Menu.Item>}
                      {!isGuest && <Menu.Item key="changePassword"><SecurityScanOutlined /> <Link to="/change_password">Change Password</Link></Menu.Item>}
                      {isGuest && <Menu.Item key="home"><HomeOutlined /> <HashLink to="/#home" onClick={this.onClose}>Home</HashLink></Menu.Item>}
                      {isGuest && <Menu.Item key="services"><BellOutlined /> <HashLink to="/#services" onClick={this.onClose}>Services</HashLink></Menu.Item>}
                      {isGuest && <Menu.Item key="team"><TeamOutlined /> <HashLink to="/#team" onClick={this.onClose}>Team</HashLink></Menu.Item>}
                      {!isGuest && <Menu.Item key="logout" onClick={handleLogout}><LogoutOutlined />{isAdmin ? 'Admin ' : isAgent ? 'Agent ' : null}Log Out</Menu.Item>}
                    </Menu>
                  </Drawer>
                </MediaQuery>

              </HeaderStyled>
            );
          }
        }
      </GlobalContext.Consumer>
    )
  }
}

HomeHeaderRaw.propTypes = {};

HomeHeaderRaw.defaultProps = {};

export const HomeHeader = withRouter(HomeHeaderRaw);

export default HomeHeader;
