// Create an instance of the Stripe object with your publishable API key
var stripe = Stripe(
  'pk_test_51IiPUdJcc1mpeWP4pSvEdbYJbJHkZnpDpSctYamyRXOuvRVGQyGRpt7pYjy1tVS2vIWNBSaMwC7WdAMARArm1n6f00q6joYkQ7'
);
import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  try {
    const session = await axios(
      `http://localhost:3000/api/booking/checkout-session/${tourId}`
    );

    await stripe.redirectToCheckout({ sessionId: session.data.session.id });

    console.log(session);
  } catch (error) {
    showAlert('error', error);
  }
};
