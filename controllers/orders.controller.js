const { Cart } = require('../models/cart.model');
const { ProductInCart } = require('../models/productInCart.model');
const { Product } = require('../models/product.model');
const { Order } = require('../models/order.model');
const { AppError } = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');

const getUserCart = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const cart = await Cart.findOne({
    where: { userId: sessionUser.id, status: 'active' },
    include: [{ model: ProductInCart, include: [{ model: Product }] }],
  });

  res.status(200).json({ status: 'success', cart });
});

const addProductToCart = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const { sessionUser } = req;

  const product = await Product.findOne({
    where: { id: productId, status: 'active' },
  });

  if (!product) {
    return next(new AppError('Invalid product', 404));
  } else if (quantity < 0 || quantity > product.quantity) {
    return next(
      new AppError(
        `This product only has ${product.quantity} items available`,
        400
      )
    );
  }

  const cart = await Cart.findOne({
    where: { userId: sessionUser.id, status: 'active' },
  });

  if (!cart) {
    const newCart = await Cart.create({ userId: sessionUser.id });
    await ProductInCart.create({ cartId: newCart.id, productId, quantity });
  } else {
    const productInCart = await ProductInCart.findOne({
      where: { cartId: cart.id, productId },
    });

    if (productInCart && productInCart.status === 'active') {
      return next(
        new AppError('You already have that product in your cart', 400)
      );
    } else if (productInCart && productInCart.status === 'removed') {
      await productInCart.update({ status: 'active', quantity });
    } else if (!productInCart) {
      await ProductInCart.create({
        cartId: cart.id,
        productId,
        quantity,
      });
    }
  }

  res.status(200).json({ status: 'success' });
});

const updateProductInCart = catchAsync(async (req, res, next) => {
  const { newQty, productId } = req.body;
  const { sessionUser } = req;
  const cart = await Cart.findOne({
    where: { status: 'active', userId: sessionUser.id },
  });

  if (!cart) {
    return next(new AppError('Must create a cart first', 400));
  }

  const productInCart = await ProductInCart.findOne({
    where: { status: 'active', cartId: cart.id, productId },
    include: [{ model: Product }],
  });

  if (!productInCart) {
    return next(new AppError('This product does not exist in your cart', 404));
  }
  if (newQty < 0 || newQty > productInCart.product.quantity) {
    return next(
      new AppError(
        `Invalid selected quantity, this product only has ${productInCart.product.quantity} items available`,
        400
      )
    );
  }
  if (newQty === 0) {
    await productInCart.update({ quantity: 0, status: 'removed' });
  } else if (newQty > 0) {
    await productInCart.update({ quantity: newQty });
  }

  res.status(200).json({ status: 'success' });
});

const purchaseCart = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const cart = await Cart.findOne({
    where: { status: 'active', userId: sessionUser.id },
    include: [
      {
        model: ProductInCart,
        where: { status: 'active' },
        include: [{ model: Product }],
      },
    ],
  });

  if (!cart) {
    return next(new AppError('This user does not have a cart yet.', 400));
  }

  let totalPrice = 0;

  const cartPromises = cart.productInCarts.map(async productInCart => {
    const updatedQty = productInCart.product.quantity - productInCart.quantity;
    await productInCart.product.update({ quantity: updatedQty });
    const productPrice = productInCart.quantity * +productInCart.product.price;
    totalPrice += productPrice;

    return await productInCart.update({ status: 'purchased' });
  });

  await Promise.all(cartPromises);

  const newOrder = await Order.create({
    userId: sessionUser.id,
    cartId: cart.id,
    totalPrice,
  });

  await cart.update({ status: 'purchased' });

  res.status(200).json({ status: 'success', newOrder });
});

const removeProductFromCart = catchAsync(async (req, res, next) => {
  res.status(200).json({ status: 'success' });
});

module.exports = {
  addProductToCart,
  updateProductInCart,
  purchaseCart,
  removeProductFromCart,
  getUserCart,
};
