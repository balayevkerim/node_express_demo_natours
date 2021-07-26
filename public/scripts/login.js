import axios from 'axios';
import { showAlert } from './alerts';
export const login = async (email, password) => {
  try {
    const result = await axios({
      method: 'POST',
      url: '/api/users/login',
      data: {
        email,
        password,
      },
    });

    showAlert('success', 'Logged in Successfully');
    window.setTimeout(() => {
      location.assign('/');
    }, 500);
  } catch (error) {
    console.log(error.response);
    showAlert('error', 'Invalid password or email');
  }
};
