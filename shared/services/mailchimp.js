// services/mailchimp.js
import axios from 'axios';

const API_BASE_URL = 'https://<dc>.api.mailchimp.com/3.0'; // Replace <dc> with your Mailchimp data center

const apiKey = process.env.MAILCHIMP_API_KEY;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  auth: {
    username: 'anystring', // Set any string here
    password: apiKey,
  },
});

export const subscribeToNewsletter = async (email) => {
  try {
    const response = await axiosInstance.post('/lists/<list_id>/members', {
      email_address: email,
      status: 'subscribed',
    });

    return response.data;
  } catch (error) {
    console.error('Mailchimp Subscription Error:', error.response ? error.response.data : error.message);
    throw error;
  }
};