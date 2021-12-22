import 'regenerator-runtime/runtime'
import { login } from './login';
import '@babel/polyfill';
import { displayMap } from './mapbox';
import axios from 'axios';
import { showAlert } from './alerts';
import { updateSetting } from './updateSetting';
import { bookTour } from './stripe';
//values

const map = document.getElementById('map');

const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const updatePwdForm = document.querySelector('.form-user-settings');
const updateUserForm = document.querySelector('.form-user-data');
const saveBtn = document.querySelector('.btn--save ');
const bookTourBtn = document.getElementById('book-tour');

if (updateUserForm) {
  console.log('asfasfasf', updateUserForm);
  updateUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    let formData = new FormData();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    formData.append('name', name);
    formData.append('email', email),
      formData.append('photo', document.getElementById('photo').files[0]);

    /*  const data = {
      name: name,
      email: email,
    }; */
    //console.log(data);
    updateSetting(formData, 'User data');
  });
}
if (updatePwdForm) {
  updatePwdForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    saveBtn.textContent = 'Updating...';

    const oldPwd = document.getElementById('password-current').value;
    const newPwd = document.getElementById('password').value;
    const confirmPwd = document.getElementById('password-confirm').value;
    const data = {
      currentPassword: oldPwd,
      password: newPwd,
      confirmPassword: confirmPwd,
    };

    updateSetting(data, 'password');
    saveBtn.textContent = 'SAVE PASSWORD';
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    console.log(email, password);
    login(email, password);
  });
}
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    console.log('called');
    try {
      const result = await axios({
        method: 'GET',
        url: '/api/users/logout',
      });

      console.log(result);
      setTimeout(() => {
        location.assign('/');
      }, 500);
    } catch (error) {
      console.log(error);
      showAlert('error', 'Error logging out');
    }
  });
}

if (map) {
  const locations = JSON.parse(
    document.getElementById('map').dataset.locations
  );
  displayMap(locations);
}

if (bookTourBtn) {
  bookTourBtn.addEventListener('click', (e) => {
    const { tourId } = e.target.dataset;
    bookTourBtn.textContent = 'Processing';
    console.log(tourId);
    console.log(bookTourBtn);
    bookTour(tourId);
  });
}
