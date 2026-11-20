import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Heart, Zap } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-emerald-950 text-white mt-16 pt-12 pb-8 border-t border-emerald-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-emerald-900/60">
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white text-xl shadow-lg shadow-emerald-900">
                🥦
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white tracking-wide">
                  PRADEEP FRUITS AND VEGETABLES
                </h3>
                <p className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">
                  Bhadradri Kothagudem, Telangana
                </p>
              </div>
            </div>

            <p className="text-xs text-emerald-200/80 leading-relaxed">
              Your trusted local 30-minute grocery delivery service in Bhadradri Kothagudem. Farm-fresh handpicked vegetables, sweet fruits, organic leafy greens, and daily kitchen essentials.
            </p>

            <div className="flex items-center gap-2 text-xs text-emerald-300 font-semibold bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-800/60">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Target Delivery Time: <strong>30 Minutes</strong></span>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="font-bold text-sm text-emerald-100 uppercase tracking-wider mb-3">
              Categories
            </h4>
            <ul className="space-y-2 text-xs text-emerald-200/80">
              <li><Link to="/?category=fresh-vegetables" className="hover:text-emerald-300 transition-colors">Fresh Vegetables</Link></li>
              <li><Link to="/?category=fresh-fruits" className="hover:text-emerald-300 transition-colors">Fresh Fruits</Link></li>
              <li><Link to="/?category=leafy-vegetables" className="hover:text-emerald-300 transition-colors">Leafy Vegetables</Link></li>
              <li><Link to="/?category=organic-vegetables" className="hover:text-emerald-300 transition-colors">Organic Vegetables</Link></li>
              <li><Link to="/?category=seasonal-fruits" className="hover:text-emerald-300 transition-colors">Seasonal Fruits</Link></li>
              <li><Link to="/?category=dry-fruits" className="hover:text-emerald-300 transition-colors">Dry Fruits & Nuts</Link></li>
              <li><Link to="/?category=daily-grocery-essentials" className="hover:text-emerald-300 transition-colors">Daily Grocery Essentials</Link></li>
            </ul>
          </div>

          {/* Service Areas in Bhadradri Kothagudem */}
          <div>
            <h4 className="font-bold text-sm text-emerald-100 uppercase tracking-wider mb-3">
              Delivery Areas (Kothagudem)
            </h4>
            <ul className="space-y-1.5 text-xs text-emerald-200/80">
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Kothagudem Main Town (507101)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Writer Basti & Babu Camp</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Chunchupalli & Vidyanagar</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Ramavaram & Rudrampur</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Palvancha Service Zone</span>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-bold text-sm text-emerald-100 uppercase tracking-wider mb-3">
              Store & Support
            </h4>
            <ul className="space-y-2.5 text-xs text-emerald-200/80">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Main Market Road, Bhadradri Kothagudem, Telangana, India - 507101</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+91 97045 32104</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>support@pradeepvegetables.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Open: 6:00 AM – 10:00 PM (Everyday)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright and credits */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-400/80 gap-3">
          <p>© 2026 PRADEEP FRUITS AND VEGETABLES. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Delivering fresh daily in</span>
            <span className="font-bold text-white">Bhadradri Kothagudem, Telangana</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
