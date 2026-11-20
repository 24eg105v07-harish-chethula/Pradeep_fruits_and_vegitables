import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { ServiceArea } from '../models/ServiceArea.js';
import { Coupon } from '../models/Coupon.js';
import { Admin } from '../models/Admin.js';

const initialCategories = [
  {
    name: 'Fresh Vegetables',
    slug: 'fresh-vegetables',
    description: 'Farm-fresh daily vegetables harvested straight from local farms.',
    iconName: 'Carrot',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    orderIndex: 1
  },
  {
    name: 'Fresh Fruits',
    slug: 'fresh-fruits',
    description: 'Sweet, juicy, hand-picked seasonal and tropical fruits.',
    iconName: 'Apple',
    image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80',
    orderIndex: 2
  },
  {
    name: 'Leafy Vegetables',
    slug: 'leafy-vegetables',
    description: 'Crisp, nutritious greens like Spinach, Coriander, Methi and Mint.',
    iconName: 'Salad',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
    orderIndex: 3
  },
  {
    name: 'Organic Vegetables',
    slug: 'organic-vegetables',
    description: '100% naturally grown produce without synthetic pesticides.',
    iconName: 'Leaf',
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80',
    orderIndex: 4
  },
  {
    name: 'Seasonal Fruits',
    slug: 'seasonal-fruits',
    description: 'Top-tier seasonal specialties, Mangoes, Custard Apples & Citrus.',
    iconName: 'Sparkles',
    image: 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?auto=format&fit=crop&w=600&q=80',
    orderIndex: 5
  },
  {
    name: 'Dry Fruits',
    slug: 'dry-fruits',
    description: 'Premium Almonds, Cashews, Raisins, and Pistachios for daily health.',
    iconName: 'Nut',
    image: 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?auto=format&fit=crop&w=600&q=80',
    orderIndex: 6
  },
  {
    name: 'Daily Grocery Essentials',
    slug: 'daily-grocery-essentials',
    description: 'Ginger, Garlic, Green Chillies, Lemon, Curry Leaves & daily staples.',
    iconName: 'ShoppingBag',
    image: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?auto=format&fit=crop&w=600&q=80',
    orderIndex: 7
  }
];

const initialProducts = [
  // Fresh Vegetables
  {
    name: 'Hybrid Tomato (టమోటా)',
    teluguName: 'టమోటా',
    category: 'Fresh Vegetables',
    categorySlug: 'fresh-vegetables',
    description: 'Fresh red, juicy and firm tomatoes harvested directly from Bhadradri farms. Perfect for curries, rasam, and salads.',
    price: 32,
    originalPrice: 45,
    discount: 28,
    unit: '1kg',
    availableStock: 50,
    images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80'],
    isFeatured: true,
    isBestSeller: true,
    isDailyOffer: true
  },
  {
    name: 'Fresh Red Onion (ఉల్లిపాయలు)',
    teluguName: 'ఉల్లిపాయలు',
    category: 'Fresh Vegetables',
    categorySlug: 'fresh-vegetables',
    description: 'Crisp and pungent quality Nashik red onions with high shelf-life. Essential for every Indian dish.',
    price: 40,
    originalPrice: 55,
    discount: 27,
    unit: '1kg',
    availableStock: 80,
    images: ['https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80'],
    isFeatured: true,
    isBestSeller: true
  },
  {
    name: 'Fresh Potato / Aloo (బంగాళాదుంప)',
    teluguName: 'బంగాళాదుంప',
    category: 'Fresh Vegetables',
    categorySlug: 'fresh-vegetables',
    description: 'Evenly shaped, premium quality potatoes suitable for boiling, baking, and curries.',
    price: 35,
    originalPrice: 48,
    discount: 27,
    unit: '1kg',
    availableStock: 75,
    images: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80'],
    isBestSeller: true
  },
  {
    name: 'Lady Finger / Bhindi (బెండకాయ)',
    teluguName: 'బెండకాయ',
    category: 'Fresh Vegetables',
    categorySlug: 'fresh-vegetables',
    description: 'Tender, bright green farm-fresh lady fingers. Crispy and easy to cook.',
    price: 28,
    originalPrice: 40,
    discount: 30,
    unit: '500g',
    availableStock: 35,
    images: ['https://images.unsplash.com/photo-1525607551316-4a8e16d1f9ba?auto=format&fit=crop&w=600&q=80'],
    isBestSeller: true
  },
  {
    name: 'Green Capsicum (బెంగళూరు మిరప)',
    teluguName: 'బెంగళూరు మిరప',
    category: 'Fresh Vegetables',
    categorySlug: 'fresh-vegetables',
    description: 'Glossy, crunchy green bell peppers loaded with Vitamin C. Great for stir fries and fried rice.',
    price: 38,
    originalPrice: 50,
    discount: 24,
    unit: '500g',
    availableStock: 30,
    images: ['https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80']
  },
  {
    name: 'Carrot Delhi Local (క్యారెట్)',
    teluguName: 'క్యారెట్',
    category: 'Fresh Vegetables',
    categorySlug: 'fresh-vegetables',
    description: 'Sweet, vibrant red carrots full of beta carotene. Ideal for halwa, sambar, and juices.',
    price: 45,
    originalPrice: 60,
    discount: 25,
    unit: '500g',
    availableStock: 40,
    images: ['https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80'],
    isDailyOffer: true
  },
  {
    name: 'Cauliflower (క్యాలీఫ్లవర్)',
    teluguName: 'క్యాలీఫ్లవర్',
    category: 'Fresh Vegetables',
    categorySlug: 'fresh-vegetables',
    description: 'Compact, snow-white fresh cauliflower curd direct from farm.',
    price: 35,
    originalPrice: 50,
    discount: 30,
    unit: '1 piece',
    availableStock: 25,
    images: ['https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=600&q=80']
  },
  {
    name: 'Brinjal / Vankaya (గుత్తి వంకాయ)',
    teluguName: 'గుత్తి వంకాయ',
    category: 'Fresh Vegetables',
    categorySlug: 'fresh-vegetables',
    description: 'Tender purple striped round brinjals, perfect for the authentic Telangana Gutti Vankaya curry.',
    price: 30,
    originalPrice: 42,
    discount: 28,
    unit: '500g',
    availableStock: 35,
    images: ['https://images.unsplash.com/photo-1628773822503-930a84e9c704?auto=format&fit=crop&w=600&q=80'],
    isFeatured: true
  },

  // Fresh Fruits
  {
    name: 'Shimla Royal Apple (యాపిల్ పండ్లు)',
    teluguName: 'యాపిల్ పండ్లు',
    category: 'Fresh Fruits',
    categorySlug: 'fresh-fruits',
    description: 'Crisp, sweet, and aromatic Shimla apples. Hand selected for supreme taste and quality.',
    price: 160,
    originalPrice: 210,
    discount: 24,
    unit: '1kg',
    availableStock: 40,
    images: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80'],
    isFeatured: true,
    isBestSeller: true
  },
  {
    name: 'Robusta Banana (అరటి పండ్లు)',
    teluguName: 'అరటి పండ్లు',
    category: 'Fresh Fruits',
    categorySlug: 'fresh-fruits',
    description: 'Naturally ripened, rich in potassium, sweet and creamy bananas.',
    price: 48,
    originalPrice: 65,
    discount: 26,
    unit: '1 dozen',
    availableStock: 60,
    images: ['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80'],
    isBestSeller: true,
    isDailyOffer: true
  },
  {
    name: 'Sweet Pomegranate / Anar (దానిమ్మ)',
    teluguName: 'దానిమ్మ',
    category: 'Fresh Fruits',
    categorySlug: 'fresh-fruits',
    description: 'Ruby red, juicy and iron-packed pearls of sweet pomegranate.',
    price: 180,
    originalPrice: 240,
    discount: 25,
    unit: '1kg',
    availableStock: 25,
    images: ['https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80'],
    isFeatured: true
  },
  {
    name: 'Fresh Papaya (బొప్పాయి)',
    teluguName: 'బొప్పాయి',
    category: 'Fresh Fruits',
    categorySlug: 'fresh-fruits',
    description: 'Semi-ripe to sweet golden papaya, loaded with digestion-friendly enzymes.',
    price: 45,
    originalPrice: 60,
    discount: 25,
    unit: '1 piece',
    availableStock: 20,
    images: ['https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?auto=format&fit=crop&w=600&q=80']
  },

  // Leafy Vegetables
  {
    name: 'Fresh Palak / Spinach (పాలకూర)',
    teluguName: 'పాలకూర',
    category: 'Leafy Vegetables',
    categorySlug: 'leafy-vegetables',
    description: 'Tender, pesticide-screened green spinach bunches freshly harvested at dawn.',
    price: 20,
    originalPrice: 30,
    discount: 33,
    unit: '1 bunch',
    availableStock: 50,
    images: ['https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80'],
    isFeatured: true,
    isBestSeller: true
  },
  {
    name: 'Fresh Methi / Fenugreek (మెంతికూర)',
    teluguName: 'మెంతికూర',
    category: 'Leafy Vegetables',
    categorySlug: 'leafy-vegetables',
    description: 'Aromatic tender methi leaves for flavorful dal and parathas.',
    price: 20,
    originalPrice: 30,
    discount: 33,
    unit: '1 bunch',
    availableStock: 45,
    images: ['https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=600&q=80']
  },
  {
    name: 'Fresh Coriander (కొత్తిమీర)',
    teluguName: 'కొత్తిమీర',
    category: 'Leafy Vegetables',
    categorySlug: 'leafy-vegetables',
    description: 'Fragrant and fresh green coriander bunch with roots.',
    price: 15,
    originalPrice: 25,
    discount: 40,
    unit: '1 bunch',
    availableStock: 60,
    images: ['https://images.unsplash.com/photo-1588879462716-1f65bb49ba65?auto=format&fit=crop&w=600&q=80'],
    isBestSeller: true
  },
  {
    name: 'Fresh Pudina / Mint (పుదీనా)',
    teluguName: 'పుదీనా',
    category: 'Leafy Vegetables',
    categorySlug: 'leafy-vegetables',
    description: 'Cooling, aromatic fresh mint leaves for chai, biryani, and chutneys.',
    price: 15,
    originalPrice: 25,
    discount: 40,
    unit: '1 bunch',
    availableStock: 50,
    images: ['https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?auto=format&fit=crop&w=600&q=80']
  },

  // Organic Vegetables
  {
    name: 'Organic Cucumber / Keera (కీరదోసకాయ)',
    teluguName: 'కీరదోసకాయ',
    category: 'Organic Vegetables',
    categorySlug: 'organic-vegetables',
    description: 'Zero chemical certified crunchy organic cucumbers for fresh salads.',
    price: 35,
    originalPrice: 50,
    discount: 30,
    unit: '500g',
    availableStock: 30,
    images: ['https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=600&q=80'],
    isOrganic: true
  },
  {
    name: 'Organic Bitter Gourd / Kakarakaya (కాకరకాయ)',
    teluguName: 'కాకరకాయ',
    category: 'Organic Vegetables',
    categorySlug: 'organic-vegetables',
    description: 'Naturally grown small prickled bitter gourd. Highly beneficial for blood sugar balance.',
    price: 40,
    originalPrice: 55,
    discount: 27,
    unit: '500g',
    availableStock: 25,
    images: ['https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=600&q=80'],
    isOrganic: true
  },

  // Seasonal Fruits
  {
    name: 'Kothagudem Sweet Guava (జామపండు)',
    teluguName: 'జామపండు',
    category: 'Seasonal Fruits',
    categorySlug: 'seasonal-fruits',
    description: 'Locally grown sweet pink and white guavas from Bhadradri orchards. Crisp and fragrant.',
    price: 60,
    originalPrice: 85,
    discount: 29,
    unit: '1kg',
    availableStock: 30,
    images: ['https://images.unsplash.com/photo-1536511135898-751ce39c488a?auto=format&fit=crop&w=600&q=80'],
    isSeasonal: true,
    isDailyOffer: true
  },
  {
    name: 'Sweet Orange / Mosambi (బత్తాయి)',
    teluguName: 'బత్తాయి',
    category: 'Seasonal Fruits',
    categorySlug: 'seasonal-fruits',
    description: 'Juicy, sweet Mosambi perfect for refreshing immune-boosting citrus juice.',
    price: 75,
    originalPrice: 100,
    discount: 25,
    unit: '1kg',
    availableStock: 35,
    images: ['https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=600&q=80'],
    isSeasonal: true
  },

  // Dry Fruits
  {
    name: 'California Almonds / Badam (బాదం)',
    teluguName: 'బాదం',
    category: 'Dry Fruits',
    categorySlug: 'dry-fruits',
    description: 'Crunchy, jumbo-grade premium California almonds rich in Vitamin E and healthy fats.',
    price: 240,
    originalPrice: 320,
    discount: 25,
    unit: '250g',
    availableStock: 40,
    images: ['https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=600&q=80'],
    isFeatured: true
  },
  {
    name: 'W320 Whole Cashews / Kaju (జీడిపప్పు)',
    teluguName: 'జీడిపప్పు',
    category: 'Dry Fruits',
    categorySlug: 'dry-fruits',
    description: 'Handpicked pristine whole white cashew nuts. Creamy and delicious.',
    price: 260,
    originalPrice: 350,
    discount: 25,
    unit: '250g',
    availableStock: 35,
    images: ['https://images.unsplash.com/photo-1509912760195-2f5a04e57e93?auto=format&fit=crop&w=600&q=80']
  },

  // Daily Grocery Essentials
  {
    name: 'Fresh Ginger / Allam (అల్లం)',
    teluguName: 'అల్లం',
    category: 'Daily Grocery Essentials',
    categorySlug: 'daily-grocery-essentials',
    description: 'Spicy, fiber-rich freshly washed ginger root.',
    price: 35,
    originalPrice: 50,
    discount: 30,
    unit: '250g',
    availableStock: 40,
    images: ['https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=600&q=80'],
    isBestSeller: true
  },
  {
    name: 'Fresh Garlic / Vellulli (వెల్లుల్లి)',
    teluguName: 'వెల్లుల్లి',
    category: 'Daily Grocery Essentials',
    categorySlug: 'daily-grocery-essentials',
    description: 'Dry, big-clove pungent white garlic.',
    price: 55,
    originalPrice: 75,
    discount: 26,
    unit: '250g',
    availableStock: 45,
    images: ['https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=600&q=80'],
    isBestSeller: true
  },
  {
    name: 'Spicy Green Chillies (పచ్చిమిర్చి)',
    teluguName: 'పచ్చిమిర్చి',
    category: 'Daily Grocery Essentials',
    categorySlug: 'daily-grocery-essentials',
    description: 'Fresh and fiery green chillies from local harvest.',
    price: 18,
    originalPrice: 28,
    discount: 35,
    unit: '250g',
    availableStock: 50,
    images: ['https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80'],
    isBestSeller: true
  },
  {
    name: 'Juicy Yellow Lemons (నిమ్మకాయలు)',
    teluguName: 'నిమ్మకాయలు',
    category: 'Daily Grocery Essentials',
    categorySlug: 'daily-grocery-essentials',
    description: 'Thin-skinned, juicy fresh yellow lemons for lemon rice and fresh juice.',
    price: 25,
    originalPrice: 35,
    discount: 28,
    unit: '1 packet',
    availableStock: 60,
    images: ['https://images.unsplash.com/photo-1534432182912-63863115e106?auto=format&fit=crop&w=600&q=80'],
    isBestSeller: true
  }
];

const initialServiceAreas = [
  {
    areaName: 'Kothagudem Main Town',
    town: 'Kothagudem',
    district: 'Bhadradri Kothagudem',
    state: 'Telangana',
    pincode: '507101',
    isActive: true,
    baseDeliveryMinutes: 25,
    minimumOrder: 99,
    deliveryCharge: 20,
    freeDeliveryThreshold: 299
  },
  {
    areaName: 'Writer Basti',
    town: 'Kothagudem',
    district: 'Bhadradri Kothagudem',
    state: 'Telangana',
    pincode: '507101',
    isActive: true,
    baseDeliveryMinutes: 25,
    minimumOrder: 99,
    deliveryCharge: 20,
    freeDeliveryThreshold: 299
  },
  {
    areaName: 'Chunchupalli',
    town: 'Kothagudem',
    district: 'Bhadradri Kothagudem',
    state: 'Telangana',
    pincode: '507101',
    isActive: true,
    baseDeliveryMinutes: 30,
    minimumOrder: 99,
    deliveryCharge: 25,
    freeDeliveryThreshold: 299
  },
  {
    areaName: 'Ramavaram',
    town: 'Ramavaram',
    district: 'Bhadradri Kothagudem',
    state: 'Telangana',
    pincode: '507118',
    isActive: true,
    baseDeliveryMinutes: 30,
    minimumOrder: 149,
    deliveryCharge: 30,
    freeDeliveryThreshold: 349
  },
  {
    areaName: 'Rudrampur',
    town: 'Rudrampur',
    district: 'Bhadradri Kothagudem',
    state: 'Telangana',
    pincode: '507119',
    isActive: true,
    baseDeliveryMinutes: 35,
    minimumOrder: 149,
    deliveryCharge: 30,
    freeDeliveryThreshold: 349
  },
  {
    areaName: 'Babu Camp',
    town: 'Kothagudem',
    district: 'Bhadradri Kothagudem',
    state: 'Telangana',
    pincode: '507101',
    isActive: true,
    baseDeliveryMinutes: 25,
    minimumOrder: 99,
    deliveryCharge: 20,
    freeDeliveryThreshold: 299
  },
  {
    areaName: 'Vidyanagar',
    town: 'Kothagudem',
    district: 'Bhadradri Kothagudem',
    state: 'Telangana',
    pincode: '507101',
    isActive: true,
    baseDeliveryMinutes: 25,
    minimumOrder: 99,
    deliveryCharge: 20,
    freeDeliveryThreshold: 299
  },
  {
    areaName: 'Palvancha Town',
    town: 'Palvancha',
    district: 'Bhadradri Kothagudem',
    state: 'Telangana',
    pincode: '507115',
    isActive: true,
    baseDeliveryMinutes: 35,
    minimumOrder: 199,
    deliveryCharge: 35,
    freeDeliveryThreshold: 399
  }
];

const initialCoupons = [
  {
    code: 'WELCOME50',
    description: 'Flat 50% OFF up to ₹100 for your first order',
    discountPercentage: 50,
    minOrderValue: 149,
    maxDiscountAmount: 100,
    isActive: true,
    validUntil: new Date('2028-12-31')
  },
  {
    code: 'FRESH30',
    description: 'Save 30% up to ₹75 on daily fresh produce',
    discountPercentage: 30,
    minOrderValue: 199,
    maxDiscountAmount: 75,
    isActive: true,
    validUntil: new Date('2028-12-31')
  },
  {
    code: 'KOTHAGUDEM',
    description: 'Local special: ₹50 OFF on orders above ₹299',
    discountPercentage: 20,
    minOrderValue: 299,
    maxDiscountAmount: 50,
    isActive: true,
    validUntil: new Date('2028-12-31')
  }
];

export const seedDatabase = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pradeep_vegetables';
  try {
    await mongoose.connect(uri);
    console.log('[Seed] Connected to MongoDB pradeep_vegetables');

    // 1. Seed Categories
    console.log('[Seed] Seeding categories...');
    await Category.deleteMany({});
    await Category.insertMany(initialCategories);

    // 2. Seed Products
    console.log('[Seed] Seeding products...');
    await Product.deleteMany({});
    await Product.insertMany(initialProducts);

    // 3. Seed Service Areas
    console.log('[Seed] Seeding Bhadradri Kothagudem service areas...');
    await ServiceArea.deleteMany({});
    await ServiceArea.insertMany(initialServiceAreas);

    // 4. Seed Coupons
    console.log('[Seed] Seeding promotional coupons...');
    await Coupon.deleteMany({});
    await Coupon.insertMany(initialCoupons);

    // 5. Admin accounts are created only by the backend setupAdmin script.

    console.log('[Seed] Database seeded successfully!');
    process.exit(0);
  } catch (error: any) {
    console.error('[Seed Error]:', error.message);
    process.exit(1);
  }
};

if (process.argv[1]?.includes('seed')) {
  seedDatabase();
}
