import { notification } from 'antd';

function request(level, title, content, duration) {
  notification[level].call(this, {
    message: title,
    description: content,
    key: title,
    duration: duration || 4,
    placement: 'topLeft',
    style: {width: '85vw', maxWidth: '380px'}
  })
}

export const notify = {
  error(title, content?) {
    request('error', title, content, 6);
  },
  success(title, content?) {
    request('success', title, content, 4);
  },
  info(title, content?) {
    request('info', title, content, 5);
  },
  warn(title, content?) {
    request('warn', title, content, 5);
  }
}

