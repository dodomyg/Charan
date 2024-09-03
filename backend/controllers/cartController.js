const addtoCart = async (req, res) => {
    const {productId} = req.body
    const loggedUser = req.user
  try {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).send("Invalid Product Id");
    }
    const alreadyExists = loggedUser.cart.find((item)=>item.product._id.toString()=== productId.toString())
    if(alreadyExists){
        alreadyExists.quantity+=1
    }else{
        loggedUser.cart.push({product:productId,quantity:1})

    }
    await loggedUser.save()
    return res.status(200).json({ message: "Product added to cart successfully",cart:loggedUser.cart });
  } catch (error) {
    console.log("Error in addtoCart", error);
    return res.status(500).send("Internal Server Error");
  }
};

const removeCart = async (req, res) => {
    const {productId} = req.body
    const loggedUser = req.user
    try {
        if(!mongoose.Types.ObjectId.isValid(productId)){
            return res.status(400).send("Invalid Product Id");
        }
        loggedUser.cart = loggedUser.cart.filter((item) => !item.product._id.equals(productId));
        await loggedUser.save();
        return res.status(200).json({ message: "Product removed from cart successfully",cart:loggedUser.cart });
    } catch (error) {
        console.log("Error in addtoCart", error);
        return res.status(500).send("Internal Server Error");
    }
}

const updateQuantity = async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;
    const loggedUser = req.user;

    try {
        // Check if the productId is valid
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid Product Id" });
        }

        // Find the product in the user's cart
        const existingProduct = loggedUser.cart.find((item) => item.product._id.equals(productId));

        if (existingProduct) {
            // If the quantity is 0, remove the product from the cart
            if (quantity === 0) {
                loggedUser.cart = loggedUser.cart.filter((item) => !item.product._id.equals(productId));
                await loggedUser.save();
                return res.status(200).json({ message: "Product removed from cart successfully", cart: loggedUser.cart });
            }

            // Otherwise, update the quantity
            existingProduct.quantity = quantity;
            await loggedUser.save();
            return res.status(200).json({ message: "Product quantity updated successfully", cart: loggedUser.cart });
        } else {
            return res.status(400).json({ message: "Product not found in cart" });
        }
    } catch (error) {
        console.log("Error in updateQuantity", error);
        return res.status(500).send("Internal Server Error");
    }
};


const getCart = async (req, res) => {
    const loggedUser = req.user
    try {
        await loggedUser.populate("cart.product");
        return res.status(200).json({ cart: loggedUser.cart });
    } catch (error) {
        console.log("Error in getCart", error);
        return res.status(500).send("Internal Server Error");
    }
}

module.exports = { addtoCart,removeCart,updateQuantity,getCart };
