import axios from 'axios';
import { showAlert } from './alerts';

export const updateSetting = async (data, type) => {
  let url;
  try {
    if (type == 'password') {
      url = 'http://localhost:3000/api/users/updatePassword';
    } else {
      url = 'http://localhost:3000/api/users/updateUser';
    }
    const result = await axios({
      method: 'PATCH',
      url,
      data,
    });
    console.log(result);
    showAlert('success', `${type} updated!`);
    setTimeout(() => {
      //location.reload({ forceReload: true });
    }, 500);
  } catch (error) {
    console.log(error);
    showAlert('error', error.response.data.message);
    console.log(error.response);
  }
};
