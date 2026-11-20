import React, { useState } from 'react';
import { X, MapPin, Check, Search, AlertCircle } from 'lucide-react';
import { useLocationContext } from '../context/LocationContext.tsx';

export const LocationModal: React.FC = () => {
  const {
    isLocationModalOpen,
    closeLocationModal,
    currentArea,
    serviceAreas,
    selectArea,
    validatePincode
  } = useLocationContext();

  const [pincodeInput, setPincodeInput] = useState('');
  const [validationResult, setValidationResult] = useState<{ deliverable?: boolean; message?: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isLocationModalOpen) return null;

  const handlePincodeCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincodeInput.trim()) return;

    const result = await validatePincode(pincodeInput.trim());
    if (result.deliverable) {
      const matched = serviceAreas.find(a => a.pincode === pincodeInput.trim());
      if (matched) {
        selectArea(matched);
        return;
      }
      setValidationResult({ deliverable: true, message: `Pincode ${pincodeInput} is serviceable! Select your area below.` });
    } else {
      setValidationResult({ deliverable: false, message: result.message });
    }
  };

  const filteredAreas = serviceAreas.filter(
    a =>
      a.areaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.pincode.includes(searchQuery) ||
      a.town.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 animate-scaleUp">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 via-white to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-200">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Choose Delivery Location</h3>
              <p className="text-xs text-gray-500 font-medium">Bhadradri Kothagudem, Telangana</p>
            </div>
          </div>
          <button
            onClick={closeLocationModal}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Pincode verification form */}
          <form onSubmit={handlePincodeCheck} className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Check Pincode Delivery Availability
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit Pincode (e.g. 507101)"
                  value={pincodeInput}
                  onChange={(e) => {
                    setPincodeInput(e.target.value.replace(/\D/g, ''));
                    setValidationResult(null);
                  }}
                  className="w-full pl-3 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
              >
                Check
              </button>
            </div>

            {validationResult && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                validationResult.deliverable ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {validationResult.deliverable ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{validationResult.message}</span>
              </div>
            )}
          </form>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search local area or colony..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Service areas list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Approved Service Areas
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold">
                Target: ~30 Min Delivery
              </span>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {filteredAreas.map((area) => {
                const isSelected = currentArea?.areaName === area.areaName;
                return (
                  <button
                    key={`${area.areaName}-${area.pincode}`}
                    onClick={() => selectArea(area)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70 shadow-sm'
                        : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-sm">{area.areaName}</span>
                        {isSelected && (
                          <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {area.town}, Bhadradri Kothagudem - {area.pincode}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                        ⚡ {area.estimatedMinutes || 30} mins
                      </span>
                    </div>
                  </button>
                );
              })}

              {filteredAreas.length === 0 && (
                <div className="text-center py-6 text-gray-400 text-xs">
                  No matching service areas found. We currently serve Bhadradri Kothagudem town and surrounding authorized zones.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-[11px] text-gray-500 flex items-center justify-between">
          <span>Delivery within Bhadradri Kothagudem</span>
          <span className="font-semibold text-emerald-600">30 Min Express Delivery</span>
        </div>
      </div>
    </div>
  );
};
