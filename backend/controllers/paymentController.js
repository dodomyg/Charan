const USER = require("../schema/USER");
const stripe = require("../utils/stripe");

const checkoutSession = async (req, res) => {
  try {
    const { products } = req.body;

    //check if products is array
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "No products found" });
    }

    let totalAmt = 0;
    const itemsToShow = products.map((item) => {
      const amount = Math.floor(item.price * 100);
      totalAmt += amount * item.quantity;

      return {
        price_data: {
          currency: "inr",
          product_data: {
            name: item.name,
            images: [item.image],
          },
          unit_amount: amount,
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "amazon_pay", "paypal", "swish"],
      line_items: itemsToShow,
      mode: "payment",
      success_url: `http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: "http://localhost:5173/cancel",
      discounts: [],
      metadata: {
        userId: req.user._id.toString(),
        products: JSON.stringify(
          products.map((item) => ({
            id: item._id,
            quantity: item.quantity,
            price: item.price,
          }))
        ),
      },
    });

    return res.status(200).json({ id: session.id, amount: totalAmt / 100 });
  } catch (error) {
    console.log("Error in checkoutSession", error);
    return res.status(500).send("Internal Server Error");
  }
};

const checkOutSuccess = async (req, res) => {
  const { sessionId } = req.body;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session && session.payment_status === "paid") {
      //create a new Order
      const products = JSON.parse(session.metadata.products);

      const newOrder = await new ORDER({
        user: session.metadata.userId,
        products: products.map((item) => ({
          product: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: session.amount_total / 100,
        stripeSessionId: sessionId,
      });

      await newOrder.save();
      //clear the cart

      const user = await USER.findById(session.metadata.userId);
      user.cart = [];
      await user.save();
      return res
        .status(200)
        .json({ message: "Order created successfully", orderId: newOrder._id });
    }
  } catch (error) {
    console.log("Error in checkOutSuccess", error);
    return res.status(500).send("Internal Server Error");
  }
};

module.exports = { checkoutSession, checkOutSuccess };
