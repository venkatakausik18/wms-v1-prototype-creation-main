
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import PhysicalCountSetup from "@/components/physicalCount/PhysicalCountSetup";
import PhysicalCountEntry from "@/components/physicalCount/PhysicalCountEntry";
import { usePhysicalCountData } from "@/hooks/usePhysicalCountData";
import { usePhysicalCountMutations } from "@/hooks/usePhysicalCountMutations";
import { updateCountDetail, createNewCountDetail } from "@/utils/physicalCountUtils";
import type { CountDetail, SetupData } from "@/types/physicalCount";

const PhysicalCount = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'setup' | 'counting'>('setup');
  const [countId, setCountId] = useState<number | null>(null);

  // Form state for count setup
  const [setupData, setSetupData] = useState<SetupData>({
    count_date: new Date().toISOString().split('T')[0],
    count_time: new Date().toTimeString().split(' ')[0].slice(0, 5),
    warehouse_id: "",
    count_type: "full",
    method: "full",
    scheduled_by: 1,
    counted_by: 1
  });

  const [details, setDetails] = useState<CountDetail[]>([]);

  // Use custom hooks
  const { warehouses, products, bins } = usePhysicalCountData(setupData.warehouse_id);
  const { createCountSetup, submitCountDetails } = usePhysicalCountMutations();

  const addDetailRow = () => {
    const newRow = createNewCountDetail();
    setDetails([...details, newRow]);
  };

  const removeDetailRow = (id: string) => {
    setDetails(details.filter(detail => detail.id !== id));
  };

  const updateDetail = (id: string, field: keyof CountDetail, value: any) => {
    setDetails(updateCountDetail(details, id, field, value));
  };

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupData.warehouse_id) {
      toast({
        title: "Error",
        description: "Please select a warehouse.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await createCountSetup.mutateAsync(setupData);
      setCountId(result.count_id);
      setCurrentStep('counting');
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleCountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (details.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to count.",
        variant: "destructive",
      });
      return;
    }
    if (!countId) {
      toast({
        title: "Error",
        description: "Count ID not found.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitCountDetails.mutateAsync({ countId, details, setupData });
      navigate('/inventory/counts');
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentStep === 'setup') {
    return (
      <Layout>
        <PhysicalCountSetup
          setupData={setupData}
          setSetupData={setSetupData}
          warehouses={warehouses}
          onSubmit={handleSetupSubmit}
          onCancel={() => navigate('/inventory')}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <PhysicalCountEntry
        countId={countId}
        setupData={setupData}
        details={details}
        warehouses={warehouses}
        products={products}
        bins={bins}
        onAddDetail={addDetailRow}
        onRemoveDetail={removeDetailRow}
        onUpdateDetail={updateDetail}
        onSubmit={handleCountSubmit}
        onBackToSetup={() => setCurrentStep('setup')}
        isSubmitting={isSubmitting}
      />
    </Layout>
  );
};

export default PhysicalCount;
