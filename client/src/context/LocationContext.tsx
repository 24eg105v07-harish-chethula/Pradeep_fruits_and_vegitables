import React, { createContext, useContext, useState, useEffect } from 'react';
import { ServiceArea } from '../types/index.ts';
import api from '../services/api.ts';

interface LocationContextType {
  currentArea: ServiceArea;
  serviceAreas: ServiceArea[];
  isLoading: boolean;
  isLocationModalOpen: boolean;
  openLocationModal: () => void;
  closeLocationModal: () => void;
  selectArea: (area: ServiceArea) => void;
  validatePincode: (pincode: string) => Promise<{ deliverable: boolean; message?: string; estimatedMinutes?: number }>;
}

const defaultArea: ServiceArea = {
  areaName: 'Kothagudem Main Town',
  town: 'Kothagudem',
  district: 'Bhadradri Kothagudem',
  state: 'Telangana',
  pincode: '507101',
  isActive: true,
  estimatedMinutes: 30,
  minimumOrder: 99,
  deliveryCharge: 20
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentArea, setCurrentArea] = useState<ServiceArea>(() => {
    const saved = localStorage.getItem('pfv_selected_area');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultArea;
      }
    }
    return defaultArea;
  });

  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchActiveAreas();
  }, []);

  const fetchActiveAreas = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/service-areas/active');
      if (res.data.success && res.data.areas?.length) {
        setServiceAreas(res.data.areas);
      }
    } catch (err) {
      // Fallback service areas for Bhadradri Kothagudem
      setServiceAreas([
        defaultArea,
        {
          areaName: 'Writer Basti',
          town: 'Kothagudem',
          district: 'Bhadradri Kothagudem',
          state: 'Telangana',
          pincode: '507101',
          isActive: true,
          estimatedMinutes: 25,
          minimumOrder: 99,
          deliveryCharge: 20
        },
        {
          areaName: 'Chunchupalli',
          town: 'Kothagudem',
          district: 'Bhadradri Kothagudem',
          state: 'Telangana',
          pincode: '507101',
          isActive: true,
          estimatedMinutes: 30,
          minimumOrder: 99,
          deliveryCharge: 25
        },
        {
          areaName: 'Ramavaram',
          town: 'Ramavaram',
          district: 'Bhadradri Kothagudem',
          state: 'Telangana',
          pincode: '507118',
          isActive: true,
          estimatedMinutes: 30,
          minimumOrder: 149,
          deliveryCharge: 30
        },
        {
          areaName: 'Rudrampur',
          town: 'Rudrampur',
          district: 'Bhadradri Kothagudem',
          state: 'Telangana',
          pincode: '507119',
          isActive: true,
          estimatedMinutes: 35,
          minimumOrder: 149,
          deliveryCharge: 30
        },
        {
          areaName: 'Palvancha Town',
          town: 'Palvancha',
          district: 'Bhadradri Kothagudem',
          state: 'Telangana',
          pincode: '507115',
          isActive: true,
          estimatedMinutes: 35,
          minimumOrder: 199,
          deliveryCharge: 35
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const selectArea = (area: ServiceArea) => {
    setCurrentArea(area);
    localStorage.setItem('pfv_selected_area', JSON.stringify(area));
    setIsLocationModalOpen(false);
  };

  const validatePincode = async (pincode: string) => {
    try {
      const res = await api.post('/service-areas/validate-zone', { pincode });
      if (res.data.success && res.data.deliverable) {
        return {
          deliverable: true,
          estimatedMinutes: res.data.estimatedMinutes || 30
        };
      }
      return {
        deliverable: false,
        message: res.data.message || 'Not deliverable to this pincode'
      };
    } catch (err: any) {
      // Local fallback check
      const matched = serviceAreas.find(a => a.pincode === pincode.trim());
      if (matched) {
        return { deliverable: true, estimatedMinutes: matched.estimatedMinutes || 30 };
      }
      return {
        deliverable: false,
        message: `Currently not serving pincode ${pincode}. PRADEEP FRUITS AND VEGETABLES delivers to Bhadradri Kothagudem.`
      };
    }
  };

  return (
    <LocationContext.Provider
      value={{
        currentArea,
        serviceAreas,
        isLoading,
        isLocationModalOpen,
        openLocationModal: () => setIsLocationModalOpen(true),
        closeLocationModal: () => setIsLocationModalOpen(false),
        selectArea,
        validatePincode
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
};
