import Product from "../model/product.js";


export async function createProduct(req, res, next) {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    next(err);
  }
}


export async function getProducts(req, res, next) {
  try {
    const category = req.query.category;
    const search = req.query.search;
    const sortBy = req.query.sortBy;
    const order = req.query.order;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);

    const queryObj = {};
    if (category) {
      queryObj.category = category;
    }
    if (search) {
      queryObj.name = { $regex: search.trim(), $options: "i" };
    }

    const total = await Product.countDocuments(queryObj);
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    let findQuery = Product.find(queryObj);

    if (sortBy) {
      const direction = order === "desc" ? -1 : 1;
      findQuery = findQuery.sort({ [sortBy]: direction });
    }

    const products = await findQuery.skip(skip).limit(limit);

    res.status(200).json({
      total: total,
      page: page,
      totalPages: totalPages,
      count: products.length,
      products: products
    });
  } catch (err) {
    next(err);
  }
}


export async function getLowStockProducts(req, res, next) {
  try {
    const lowStockItems = await Product.aggregate([
      {
        $match: {
          $expr: { $lte: ["$quantity", "$reorderLevel"] }
        }
      },
      {
        $sort: { quantity: 1, name: 1 }
      }
    ]);

    res.status(200).json({
      count: lowStockItems.length,
      lowStockItems: lowStockItems
    });
  } catch (err) {
    next(err);
  }
}


export async function getInventorySummary(req, res, next) {
  try {
    const summary = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          totalItems: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
          totalStockValue: { $sum: { $multiply: ["$price", "$quantity"] } },
          avgPrice: { $avg: "$price" }
        }
      },
      {
        $sort: { totalStockValue: -1 }
      }
    ]);

    res.status(200).json({
      categories: summary.length,
      summary: summary
    });
  } catch (err) {
    next(err);
  }
}


export async function getProductById(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
}


export async function updateProduct(req, res, next) {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updated) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
}


export async function updateStock(req, res, next) {
  try {
    const change = Number(req.body.change);

    if (Number.isNaN(change) || change === 0) {
      return res.status(400).json({ message: "change must be a non-zero number" });
    }

    
    if (change < 0) {
      const needed = Math.abs(change);
      const updated = await Product.findOneAndUpdate(
        { _id: req.params.id, quantity: { $gte: needed } },
        { $inc: { quantity: change } },
        { new: true, runValidators: true }
      );

      if (!updated) {
        const existing = await Product.findById(req.params.id);
        if (!existing) {
          return res.status(404).json({ message: "Product not found" });
        }
        return res.status(400).json({ message: "Not enough stock" });
      }

      return res.status(200).json({
        message: "Stock updated",
        product: updated
      });
    }

    
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { quantity: change } },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Stock updated",
      product: updated
    });
  } catch (err) {
    next(err);
  }
}


export async function deleteProduct(req, res, next) {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({
      message: "Product deleted",
      id: req.params.id
    });
  } catch (err) {
    next(err);
  }
}