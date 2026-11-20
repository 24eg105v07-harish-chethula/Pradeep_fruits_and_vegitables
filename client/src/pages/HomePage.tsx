import React, { useState, useEffect } from 'react';
import { HeroBanners } from '../components/HeroBanners.tsx';
import { CategorySlider } from '../components/CategorySlider.tsx';
import { ProductCard } from '../components/ProductCard.tsx';
import { Product, Category } from '../types/index.ts';
import api from '../services/api.ts';
import { Sparkles, TrendingUp, Flame, Leaf, Award, ShieldCheck, Zap } from 'lucide-react';

interface HomePageProps {
  searchQuery: string;
}

export const HomePage: React.FC<HomePageProps> = ({ searchQuery }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [catRes, prodRes] = await Promise.all([
        api.get('/products/categories'),
        api.get('/products')
      ]);

      if (catRes.data.success) {
        setCategories(catRes.data.categories);
      }
      if (prodRes.data.success) {
        setProducts(prodRes.data.products);
      }
    } catch (err) {
      console.warn('Failed to fetch from backend, check fallback data in memoryStore.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered by Category and Search Query
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.teluguName && p.teluguName.includes(searchQuery)) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' ||
      p.categorySlug === selectedCategory ||
      p.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Highlight slices
  const dailyOfferProducts = products.filter((p) => p.isDailyOffer);
  const bestSellerProducts = products.filter((p) => p.isBestSeller);
  const freshVegProducts = products.filter((p) => p.category === 'Fresh Vegetables');
  const freshFruitProducts = products.filter((p) => p.category === 'Fresh Fruits');
  const organicAndLeafy = products.filter((p) => p.category === 'Leafy Vegetables' || p.category === 'Organic Vegetables');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* If Searching, show dedicated search results */}
      {searchQuery ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h1 className="text-xl font-extrabold text-gray-900">
              Search Results for <span className="text-emerald-700">"{searchQuery}"</span>
            </h1>
            <span className="text-xs font-semibold text-gray-500">
              {filteredProducts.length} items found
            </span>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="text-base font-bold text-gray-800">No matching produce found</h3>
              <p className="text-xs text-gray-500 mt-1">
                Try searching for "Tomato", "Apple", "Onion", or browse categories below.
              </p>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Hero Promotional Banners */}
          <HeroBanners />

          {/* Quick Value Props */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Zap className="w-4 h-4 fill-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-950">30-Min Delivery</p>
                <p className="text-[10px] text-emerald-700">In Bhadradri Kothagudem</p>
              </div>
            </div>

            <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Leaf className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-950">100% Farm Fresh</p>
                <p className="text-[10px] text-emerald-700">Morning direct harvest</p>
              </div>
            </div>

            <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-950">Best Local Prices</p>
                <p className="text-[10px] text-emerald-700">Wholesale daily rates</p>
              </div>
            </div>

            <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-950">COD & Razorpay</p>
                <p className="text-[10px] text-emerald-700">Safe verified payment</p>
              </div>
            </div>
          </div>

          {/* Categories Slider */}
          <CategorySlider
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(slug) => setSelectedCategory(slug)}
          />

          {/* If specific category is selected, show that category view */}
          {selectedCategory !== 'all' ? (
            <div className="space-y-4 mb-12">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h2 className="text-xl font-extrabold text-gray-900 capitalize">
                  {selectedCategory.replace(/-/g, ' ')}
                </h2>
                <span className="text-xs font-semibold text-gray-500">
                  {filteredProducts.length} items available
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </div>
          ) : (
            /* Curated Home Sections */
            <div className="space-y-12">
              {/* Daily Offers Section */}
              {dailyOfferProducts.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-200">
                        <Flame className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-lg md:text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                          <span>Daily Special Offers</span>
                          <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                            HOT DEALS
                          </span>
                        </h2>
                        <p className="text-xs text-gray-500 font-medium">
                          Grab exclusive discounts on today's fresh arrival produce
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
                    {dailyOfferProducts.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                </div>
              )}

              {/* Best Selling Products */}
              {bestSellerProducts.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-200">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-lg md:text-xl font-extrabold text-gray-900 tracking-tight">
                          Best-Selling Produce
                        </h2>
                        <p className="text-xs text-gray-500 font-medium">
                          Most frequently ordered by Kothagudem households
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
                    {bestSellerProducts.slice(0, 10).map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                </div>
              )}

              {/* Fresh Vegetables */}
              {freshVegProducts.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg md:text-xl font-extrabold text-gray-900 tracking-tight">
                        Fresh Farm Vegetables (కూరగాయలు)
                      </h2>
                      <p className="text-xs text-gray-500 font-medium">
                        Naturally crispy, graded and weighed with precision
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedCategory('fresh-vegetables')}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
                    >
                      See All →
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
                    {freshVegProducts.slice(0, 5).map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                </div>
              )}

              {/* Fresh Fruits */}
              {freshFruitProducts.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg md:text-xl font-extrabold text-gray-900 tracking-tight">
                        Sweet & Juicy Fruits (తాజా పండ్లు)
                      </h2>
                      <p className="text-xs text-gray-500 font-medium">
                        Apples, bananas, pomegranates, guavas and citrus
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedCategory('fresh-fruits')}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
                    >
                      See All →
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
                    {freshFruitProducts.slice(0, 5).map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                </div>
              )}

              {/* Leafy & Organic */}
              {organicAndLeafy.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg md:text-xl font-extrabold text-gray-900 tracking-tight">
                        Leafy Greens & Organic (ఆకుకూరలు)
                      </h2>
                      <p className="text-xs text-gray-500 font-medium">
                        Rich in vitamins and iron - cleaned and ready to cook
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
                    {organicAndLeafy.slice(0, 5).map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
