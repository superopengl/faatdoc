
// import 'App.css';
import { withRouter } from 'react-router-dom';

const OtherPage = (props) => {
  props.history.push('/');
  return null;
};

OtherPage.propTypes = {};

OtherPage.defaultProps = {};

export default withRouter(OtherPage);
