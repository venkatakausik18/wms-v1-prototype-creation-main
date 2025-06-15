
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { useWarehouses } from "@/hooks/usePhysicalCountData";
import PhysicalCountSetup from "@/components/physical-count/PhysicalCountSetup";
import PhysicalCountEntry from "@/components/physical-count/PhysicalCountEntry";

interface SetupData {
  count_date: string;
  count_time: string;
  warehouse_id: string;
  count_type: "full" | "partial" | "cycle";
  method: "full" | "partial" | "abc";
  scheduled_by: number;
  counted_by: number;
}

const PhysicalCount = () => {
  const navigate = useNavigate();
  const { warehouses } = useWarehouses();
  const [currentStep, setCurrentStep] = useState<'setup' | 'counting'>('setup');
  const [countId, setCountId] = useState<number | null>(null);
  const [setupData, setSetupData] = useState<SetupData | null>(null);

  const handleCountCreated = (id: number, data: SetupData) => {
    setCountId(id);
    setSetupData(data);
    setCurrentStep('counting');
  };

  const handleBackToSetup = () => {
    setCurrentStep('setup');
    setCountId(null);
    setSetupData(null);
  };

  const handleComplete = () => {
    navigate('/inventory');
  };

  const handleCancel = () => {
    navigate('/inventory');
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            Physical Stock Count - {currentStep === 'setup' ? 'Setup' : 'Entry'}
          </h1>
          <Button 
            variant="outline" 
            onClick={() => navigate('/inventory')}
          >
            Back to Inventory
          </Button>
        </div>

        {currentStep === 'setup' ? (
          <PhysicalCountSetup
            onCountCreated={handleCountCreated}
            onCancel={handleCancel}
          />
        ) : (
          countId && setupData && (
            <PhysicalCountEntry
              countId={countId}
              setupData={setupData}
              warehouses={warehouses || []}
              onBackToSetup={handleBackToSetup}
              onComplete={handleComplete}
            />
          )
        )}
      </div>
    </Layout>
  );
};

export default PhysicalCount;
