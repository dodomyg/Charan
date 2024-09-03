const { Stripe } = require("stripe");
require("dotenv").config();

const stripe = new Stripe(process.env.SEC_KEY);

module.exports = stripe;
