const { Product } = require('../models/product.model');
const { Category } = require('../models/category.model');
const { User } = require('../models/user.model');
const { ProductImg } = require('../models/productImg.model');
const { storage } = require('../utils/firebase');
const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');

const { catchAsync } = require('../utils/catchAsync');

const getAllProducts = catchAsync(async (req, res, next) => {
  const products = await Product.findAll({
    where: { status: 'active' },
    include: [
      { model: Category, attributes: ['name'] },
      { model: User, attributes: ['username', 'email'] },
      { model: ProductImg },
    ],
  });

  const productsPromises = products.map(async product => {
    const productImgsPromises = product.productImgs.map(async productImg => {
      const imgRef = ref(storage, productImg.imgUrl);
      const url = await getDownloadURL(imgRef);

      productImg.imgUrl = url;
      return productImg;
    });

    const productImgsResolved = await Promise.all(productImgsPromises);
    product.productImgs = productImgsResolved;

    return product;
  });

  const productsResolved = await Promise.all(productsPromises);

  res.status(200).json({ products: productsResolved });
});

const getProductById = catchAsync(async (req, res, next) => {
  const { product } = req;

  res.status(200).json({ product });
});

const createProduct = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const { title, description, quantity, price, categoryId } = req.body;
  const categoryExists = await Category.findOne({
    where: { id: categoryId },
  });

  if (!categoryExists) {
    return next(
      new AppError(
        "The categoryId entered hasn't been created yet. Create the category first or introduce an existing category",
        400
      )
    );
  }

  const newProduct = await Product.create({
    title,
    description,
    quantity,
    categoryId,
    price,
    userId: sessionUser.id,
  });

  const productImgsPromises = req.files.map(async file => {
    const imgRef = ref(
      storage,
      `products/${newProduct.id}-${Date.now()}-${file.originalname}`
    );

    const imgUploaded = await uploadBytes(imgRef, file.buffer);

    return await ProductImg.create({
      productId: newProduct.id,
      imgUrl: imgUploaded.metadata.fullPath,
    });
  });

  await Promise.all(productImgsPromises);

  res.status(201).json({ status: 'success', newProduct });
});

const updateProduct = catchAsync(async (req, res, next) => {
  const { product } = req;
  const { title, description, quantity, price } = req.body;

  await product.update({ title, description, quantity, price });

  res.status(200).json({ status: 'success' });
});

const deleteProduct = catchAsync(async (req, res, next) => {
  const { product } = req;

  await product.update({ status: 'removed' });

  res.status(200).json({ status: 'success' });
});

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
