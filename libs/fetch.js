const url = process.env.NEXT_PUBLIC_API_URL;

const getData = async (path) => {
  const res = await fetch(`${url}/${path}`);

  if (!res.ok) {
    const error = await res.json();
    return error;
  }

  const data = await res.json();
  return data;
};

const loginPassWord = async (email, password) => {
  console.log(url)
  const res = await fetch(`${url}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  });

  return res.json()
};

const registerRequest = async (fname, lname, email, password) => {
  const res = await fetch(`${url}/auth/register/otp/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      firstName: fname,
      lastName: lname,
      email: email,
      password: password,
    }),
  });

  return res.json()
};

const registerOTP = async ( email, otp, password) => {
  const res = await fetch(`${url}/auth/register/otp/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      otp: otp,
      password: password,
    }),
  });

  return res.json()
};

const loginOTPRequest = async (email) => {
  const res = await fetch(`${url}/auth/login/otp/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
    }),
  });

  return res.json()
};

const loginOTPVerify = async (email, otp) => {
  const res = await fetch(`${url}/auth/login/otp/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      otp: otp,
    }),
  });

  return res.json()
};



export { getData, loginPassWord, registerRequest, registerOTP, loginOTPRequest, loginOTPVerify };
