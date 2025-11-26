const url = process.env.NEXT_PUBLIC_API_URL;

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

const getData = async (path) => {
  const token = getCookie('token');
  const res = await fetch(`${url}/${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    return error;
  }

  const data = await res.json();
  return data;
};

const getDataNoToken = async (path) => {
  const token = getCookie('token');
  const res = await fetch(`${url}/${path}`);

  if (!res.ok) {
    const error = await res.json();
    return error;
  }

  const data = await res.json();
  return data;
};

const getImage = async (path) => {
  // const token = getCookie("token");
  const res = await fetch(`${url}/${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const error = await res.json();
    return error;
  }

  const imageBlob = await res.blob();
  const imageUrl = URL.createObjectURL(imageBlob);

  // window.open(imageUrl, '_blank');
  return imageUrl;
};

const getQrImage = async (path) => {
  const token = getCookie('token');
  const res = await fetch(`${url}/${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    return error;
  }

  const imageBlob = await res.blob();
  const imageUrl = URL.createObjectURL(imageBlob);

  // window.open(imageUrl, '_blank');
  return imageUrl;
};

const regisEvents = async (path) => {
  const token = getCookie('token');
  const res = await fetch(`${url}/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    return error;
  }

  const data = await res.json();
  return data;
};

const loginPassWord = async (email, password) => {
  const res = await fetch(`${url}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  });

  return res.json();
};

const registerRequest = async (fname, lname, email, password) => {
  const res = await fetch(`${url}/auth/register/otp/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      firstName: fname,
      lastName: lname,
      email: email,
      password: password,
    }),
  });

  return res.json();
};

const registerOTP = async (email, otp, password) => {
  const res = await fetch(`${url}/auth/register/otp/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email,
      otp: otp,
      password: password,
    }),
  });

  return res.json();
};

const loginOTPRequest = async (email) => {
  const res = await fetch(`${url}/auth/login/otp/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email,
    }),
  });

  return res.json();
};

const loginOTPVerify = async (email, otp) => {
  const res = await fetch(`${url}/auth/login/otp/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email,
      otp: otp,
    }),
  });

  return res.json();
};

const qrCodefetch = async (qrcode) => {
  const token = getCookie('token');
  const res = await fetch(`${url}/qr/check-in`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      qrContent: qrcode,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const errorMessage = data.message || `HTTP Error: ${res.status}`;
    throw new Error(errorMessage);
  }

  return data;
};

const getListUser = async (path, email, eventId) => {
  const token = getCookie('token');
  const res = await fetch(`${url}/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      email: email,
      eventId: eventId,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    return error;
  }

  const data = await res.json();
  return data;
};

const getListUserByEvent = async (path, userId, eventId) => {
  const token = getCookie('token');
  const res = await fetch(`${url}/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      eventId: eventId,
      userId: userId,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    return error;
  }

  const data = await res.json();
  return data;
};

const userCheckIn = async (path, eventId, userId) => {
  const token = getCookie('token');
  const res = await fetch(`${url}/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      eventId: eventId,
      userId: userId,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    return error;
  }

  const data = await res.json();
  return data;
};

export {
  getData,
  loginPassWord,
  registerRequest,
  registerOTP,
  loginOTPRequest,
  loginOTPVerify,
  regisEvents,
  getImage,
  getDataNoToken,
  qrCodefetch,
  getListUser,
  userCheckIn,
  getListUserByEvent,
  getQrImage,
};
