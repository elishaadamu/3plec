import React, { createContext, useContext, useState } from "react";

const BVNSlipContext = createContext();

export function BVNSlipProvider({ children }) {
  const [slipData, setSlipData] = useState(null);
  const [slipType, setSlipType] = useState(null);

  const viewSlip = (data, type) => {
    setSlipData(data);
    setSlipType(type);
  };

  const clearSlip = () => {
    setSlipData(null);
    setSlipType(null);
  };

  return (
    <BVNSlipContext.Provider
      value={{ slipData, slipType, viewSlip, clearSlip }}
    >
      {children}
    </BVNSlipContext.Provider>
  );
}

export const useBVNSlip = () => useContext(BVNSlipContext);
