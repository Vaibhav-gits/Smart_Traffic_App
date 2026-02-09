import React, { createContext, useState } from 'react';
import { getViolations, createViolation } from '../services/violationService';

export const ViolationContext = createContext();

export const ViolationProvider = ({ children }) => {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all violations (history)
  const fetchViolations = async () => {
    try {
      setLoading(true);
      const data = await getViolations();
      setViolations(data);
    } catch (error) {
      console.log('Fetch violation error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add new violation
  const addViolation = async (violationData) => {
    try {
      setLoading(true);
      const newViolation = await createViolation(violationData);
      setViolations((prev) => [newViolation, ...prev]);
    } catch (error) {
      console.log('Add violation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ViolationContext.Provider
      value={{
        violations,
        loading,
        fetchViolations,
        addViolation,
      }}
    >
      {children}
    </ViolationContext.Provider>
  );
};
