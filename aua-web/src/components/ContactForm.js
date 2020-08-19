import React from 'react';
import { Form, Input, Button, message } from "antd";
import styled from 'styled-components';
import GoogleMapReact from 'google-map-react';

const Container = styled.div`
margin-left: auto;
margin-right: auto;
max-width: 500px;
text-align: left;

p {
  color: #ffffff;

}
`;

const SubmitButton = styled(Button)`
border-width: 2px;
// border-radius: 20px;

&:hover {
  border-color: white;
  color: white;
}
`;
// import emailjs from 'emailjs-com';
class ContactForm extends React.Component {

  initialValues = {
    name2: '',
    reply: '',
    message: ''
  };

  formRef = React.createRef();

  constructor(props) {
    super(props);

    this.firstInputRef = React.createRef();

    this.state = {
      sending: false
    }
  }

  focus() {
    this.firstInputRef.focus();
  }

  handleSubmit = async values => {
    if (this.state.sending) {
      return;
    }

    const {
      REACT_APP_EMAILJS_TEMPLATEID,
      REACT_APP_EMAILJS_USERID
    } = process.env;

    // console.log(process.env);
    try {
      this.setState({ sending: true });
      // await emailjs.send(
      //   'gmail_service',
      //   REACT_APP_EMAILJS_TEMPLATEID,
      //   {
      //     guest_name: values.name,
      //     guest_reply: values.reply,
      //     guest_message: values.message,
      //   },
      //   REACT_APP_EMAILJS_USERID
      // );
      message.success({
        content: 'Successfully sent out the message. We will reply shortly',
        key: 'contact.message.done'
      });
      this.reset();
    } catch (e) {
      message.error({
        content: 'Failed to send out message',
        key: 'contact.message.error'
      });
      // console.error(e);
    } finally {
      this.setState({ sending: false }, () => this.props.onDone());
    }
  }

  reset = () => {
    // console.log('reset triggered');
    this.formRef.current.resetFields();
  }

  handleCancel = () => {
    this.props.onDone();
  }

  render() {
    const { sending } = this.state;

    return (
      <Container>
        <Form onFinish={this.handleSubmit} ref={this.formRef}>
          <Form.Item name="name" rules={[{ required: true, message: 'Name is required', whitespace: true, max: 100 }]}>
            <Input autoFocus={true} placeholder="Your name" allowClear={true} maxLength={100} disabled={sending} />
          </Form.Item>
          <Form.Item name="company" rules={[{ required: false, whitespace: true, max: 100 }]}>
            <Input placeholder="Company" allowClear={true} maxLength={100} disabled={sending} />
          </Form.Item>
          <Form.Item name="reply" rules={[{ required: true, message: 'Email or phone is required', whitespace: true, max: 100 }]}>
            <Input placeholder="Email or phone" allowClear={true} maxLength={100} disabled={sending} />
          </Form.Item>
          <Form.Item name="message" rules={[{ required: true, message: 'Message content is required', whitespace: true, max: 1000 }]}>
            <Input.TextArea autoSize={{ minRows: 3 }} allowClear={true} maxLength={1000} disabled={sending} placeholder="Message" />
          </Form.Item>
          <Form.Item>
            <SubmitButton block type="primary" htmlType="submit" disabled={sending}>Submit</SubmitButton>
          </Form.Item>
          <Form.Item>
            <Button block type="link" onClick={this.handleCancel} disabled={sending}>Cancel</Button>
          </Form.Item>
        </Form>
      </Container>
    );
  }
}

ContactForm.propTypes = {};

ContactForm.defaultProps = {};

export default ContactForm;
