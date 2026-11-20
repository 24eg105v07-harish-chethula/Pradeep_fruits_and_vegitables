import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { memoryStore } from '../config/memoryStore.js';

const isDBConnected = () => mongoose.connection.readyState === 1;

// Get products with filters and search
export const getProducts = async (req: Request, res: Response) => {
  try {
    const { category, search, isBestSeller, isDailyOffer, isFeatured, limit = 50, sort = 'createdAt' } = req.query;

    if (isDBConnected()) {
      const filter: any = { isActive: true };

      if (category && category !== 'all') {
        filter.$or = [
          { category: new RegExp(`^${category}$`, 'i') },
          { categorySlug: new RegExp(`^${category}$`, 'i') }
        ];
      }

      if (search) {
        const searchRegex = new RegExp(String(search), 'i');
        filter.$or = [
          { name: searchRegex },
          { teluguName: searchRegex },
          { category: searchRegex },
          { description: searchRegex }
        ];
      }

      if (isBestSeller === 'true') filter.isBestSeller = true;
      if (isDailyOffer === 'true') filter.isDailyOffer = true;
      if (isFeatured === 'true') filter.isFeatured = true;

      let sortOption: any = { createdAt: -1 };
      if (sort === 'price_asc') sortOption = { price: 1 };
      if (sort === 'price_desc') sortOption = { price: -1 };
      if (sort === 'discount') sortOption = { discount: -1 };

      const products = await Product.find(filter)
        .sort(sortOption)
        .limit(Number(limit));

      return res.json({ success: true, count: products.length, products });
    }

    // In-memory fallback
    let list = memoryStore.products.filter(p => p.isActive !== false);

    if (category && category !== 'all') {
      const catStr = String(category).toLowerCase();
      list = list.filter(p => p.category.toLowerCase() === catStr || p.categorySlug.toLowerCase() === catStr);
    }

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.teluguName && p.teluguName.includes(q)) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    if (isBestSeller === 'true') list = list.filter(p => p.isBestSeller);
    if (isDailyOffer === 'true') list = list.filter(p => p.isDailyOffer);
    if (isFeatured === 'true') list = list.filter(p => p.isFeatured);

    if (sort === 'price_asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') list.sort((a, b) => b.price - a.price);
    else if (sort === 'discount') list.sort((a, b) => b.discount - a.discount);

    return res.json({ success: true, count: list.length, products: list.slice(0, Number(limit)) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get single product
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (isDBConnected()) {
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
      return res.json({ success: true, product });
    }

    const product = memoryStore.products.find(p => p._id === id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    return res.json({ success: true, product });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get categories
export const getCategories = async (_req: Request, res: Response) => {
  try {
    if (isDBConnected()) {
      const categories = await Category.find({ isActive: true }).sort({ orderIndex: 1 });
      return res.json({ success: true, categories });
    }
    return res.json({ success: true, categories: memoryStore.categories });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Create product
export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      name,
      teluguName,
      category,
      categorySlug,
      description,
      price,
      originalPrice,
      discount,
      unit,
      availableStock,
      images,
      isFeatured,
      isBestSeller,
      isDailyOffer,
      isOrganic,
      isSeasonal
    } = req.body;

    if (!name || !category || !price || !unit) {
      return res.status(400).json({ success: false, message: 'Please provide required fields: name, category, price, unit.' });
    }

    const calculatedDiscount = discount !== undefined
      ? discount
      : (originalPrice && originalPrice > price)
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0;

    const newProdData = {
      name,
      teluguName,
      category,
      categorySlug: categorySlug || category.toLowerCase().replace(/\s+/g, '-'),
      description: description || `${name} fresh from Bhadradri Kothagudem local farms.`,
      price: Number(price),
      originalPrice: Number(originalPrice || price),
      discount: calculatedDiscount,
      unit,
      availableStock: Number(availableStock !== undefined ? availableStock : 10),
      images: Array.isArray(images) && images.length ? images : ['https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'],
      isFeatured: !!isFeatured,
      isBestSeller: !!isBestSeller,
      isDailyOffer: !!isDailyOffer,
      isOrganic: !!isOrganic,
      isSeasonal: !!isSeasonal,
      isActive: true,
      rating: 4.8,
      reviewsCount: 1,
      createdAt: new Date().toISOString()
    };

    if (isDBConnected()) {
      const product = new Product(newProdData);
      await product.save();
      return res.status(201).json({ success: true, message: 'Product created successfully.', product });
    }

    const memoryProduct = { ...newProdData, _id: `prod_${Date.now()}` };
    memoryStore.products.unshift(memoryProduct);
    return res.status(201).json({ success: true, message: 'Product created successfully.', product: memoryProduct });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Update product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.originalPrice && updates.price) {
      updates.discount = Math.round(((updates.originalPrice - updates.price) / updates.originalPrice) * 100);
    }

    if (isDBConnected()) {
      const product = await Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
      if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
      return res.json({ success: true, message: 'Product updated successfully.', product });
    }

    const idx = memoryStore.products.findIndex(p => p._id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Product not found.' });
    memoryStore.products[idx] = { ...memoryStore.products[idx], ...updates };
    return res.json({ success: true, message: 'Product updated successfully.', product: memoryStore.products[idx] });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Delete product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (isDBConnected()) {
      const product = await Product.findByIdAndDelete(id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
      return res.json({ success: true, message: 'Product deleted successfully.' });
    }

    const initialLen = memoryStore.products.length;
    memoryStore.products = memoryStore.products.filter(p => p._id !== id);
    if (memoryStore.products.length === initialLen) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    return res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Quick update stock
export const updateStock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { availableStock, isActive } = req.body;

    if (isDBConnected()) {
      const updates: any = {};
      if (availableStock !== undefined) updates.availableStock = Number(availableStock);
      if (isActive !== undefined) updates.isActive = Boolean(isActive);

      const product = await Product.findByIdAndUpdate(id, updates, { new: true });
      if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
      return res.json({ success: true, message: 'Stock updated successfully.', product });
    }

    const product = memoryStore.products.find(p => p._id === id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    if (availableStock !== undefined) product.availableStock = Number(availableStock);
    if (isActive !== undefined) product.isActive = Boolean(isActive);
    return res.json({ success: true, message: 'Stock updated successfully.', product });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
