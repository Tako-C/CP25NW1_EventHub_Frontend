const url = process.env.NEXT_PUBLIC_API_URL;

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
};

const apiFetch = async (endpoint, options = {}, isBlob = false) => {
  const token = getCookie('token');

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${url}/${endpoint}`, {
    ...options,
    headers: defaultHeaders,
  });

  if (isBlob && response.ok) {
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data.message || `Error: ${response.status}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const getData = (path) => apiFetch(path, { method: 'GET' });

export const getDataNoToken = (path) =>
  fetch(`${url}/${path}`).then((res) => res.json());

export const authLoginPassword = (email, password) =>
  apiFetch('auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const authRegisterRequest = (firstName, lastName, email, password) =>
  apiFetch('auth/register/otp/request', {
    method: 'POST',
    body: JSON.stringify({ firstName, lastName, email, password }),
  });

export const authRegisterVerify = (email, otp, password) =>
  apiFetch('auth/register/otp/verify', {
    method: 'POST',
    body: JSON.stringify({ email, otp, password }),
  });

export const authLoginOTPRequest = (email) =>
  apiFetch('auth/login/otp/request', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

export const authLoginOTPVerify = (email, otp) =>
  apiFetch('auth/login/otp/verify', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });

export const postEventRegister = (path) => apiFetch(path, { method: 'POST' });

export const requestEmailOTP = (id, payload) =>
  apiFetch(`events/${id}/register/otp/request`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const verifyEmailOTP = (id, email, otp) =>
  apiFetch(`events/${id}/register/otp/verify`, {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });

export const postQRCheckIn = (qrContent) =>
  apiFetch('qr/check-in', {
    method: 'POST',
    body: JSON.stringify({ qrContent }),
  });

export const postQRUserInfo = (qrContent) =>
  apiFetch('qr/user-info', {
    method: 'POST',
    body: JSON.stringify({ qrContent }),
  });

export const postUpdateProfile = (data) =>
  apiFetch('users/me/profile', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const postUserCheckIn = (path, eventId, userId) =>
  apiFetch(path, {
    method: 'POST',
    body: JSON.stringify({ eventId, userId }),
  });

export const getListUser = (path, payload) =>
  apiFetch(path, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const getImage = (path) => apiFetch(path, { method: 'GET' }, true);
