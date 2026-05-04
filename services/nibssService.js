const axios = require("axios");

const BASE_URL = process.env.NIBSS_BASE_URL;

const loginNibss = async () => {
    const response = await axios.post(`${BASE_URL}/api/auth/token`, {
        apiKey: process.env.API_KEY,
        apiSecret: process.env.API_SECRET
    });

    return response.data.token;
};

const validateBVN = async (bvn) => {
    const response = await axios.post(
        `https://nibssbyphoenix.onrender.com/api/validateBvn`,
         { bvn }
    );

    return response.data;
};

const validateNIN = async (nin) => {
    const response = await axios.post(
        `https://nibssbyphoenix.onrender.com/api/validateNin`,
        { nin },
    );

    return response.data;
    };

 

const createAccount = async (kycType, kycID, dob, token) => { 
    try {
    const response = await axios.post(
        `https://nibssbyphoenix.onrender.com/api/account/create`,
        { kycType, kycID, dob },
        { headers: { Authorization: `Bearer ${token}` } }
    );

    return response.data;

 } catch (error) {
        console.error("Full NIBSS Account Error:", error.response?.data || error.message);

        throw new Error(
            error.response?.data?.message || error.message || "Account creation failed"
        );
    }
};

// Check balance
const checkBalance = async (accountNumber, token) => {
    const response = await axios.get(
        `https://nibssbyphoenix.onrender.com/api/account/balance/${accountNumber}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

const nameEnquiry = async (accountNumber, token) => {
    const response = await axios.get(
        `https://nibssbyphoenix.onrender.com/api/account/name-enquiry/${accountNumber}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

//transfer funds 
const transferFunds = async (from, to, amount, token) => {
    const response = await axios.post(
        `https://nibssbyphoenix.onrender.com/api/transfer`,
        { from, to, amount },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

const transactionStatus = async (reference, token) => {
    const response = await axios.get(
        `https://nibssbyphoenix.onrender.com/api/transaction/${reference}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

module.exports = {
    loginNibss,
    validateBVN,
    validateNIN,
    createAccount,
    checkBalance,
    nameEnquiry,
    transferFunds,
    transactionStatus
};