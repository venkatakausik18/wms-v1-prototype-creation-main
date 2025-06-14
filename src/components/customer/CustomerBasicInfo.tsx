
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerFormData } from "@/types/customer";

interface CustomerBasicInfoProps {
  formData: CustomerFormData;
  handleInputChange: (field: keyof CustomerFormData, value: string | boolean | number) => void;
  isViewMode: boolean;
}

const CustomerBasicInfo = ({ formData, handleInputChange, isViewMode }: CustomerBasicInfoProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Basic Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="customer_code">Customer Code *</Label>
          <Input
            id="customer_code"
            value={formData.customer_code}
            onChange={(e) => handleInputChange('customer_code', e.target.value)}
            placeholder="Enter customer code"
            disabled={isViewMode}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customer_name">Customer Name *</Label>
          <Input
            id="customer_name"
            value={formData.customer_name}
            onChange={(e) => handleInputChange('customer_name', e.target.value)}
            placeholder="Enter customer name"
            disabled={isViewMode}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_person">Contact Person *</Label>
          <Input
            id="contact_person"
            value={formData.contact_person}
            onChange={(e) => handleInputChange('contact_person', e.target.value)}
            placeholder="Enter contact person"
            disabled={isViewMode}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mobile_phone">Mobile Phone *</Label>
          <Input
            id="mobile_phone"
            value={formData.mobile_phone}
            onChange={(e) => handleInputChange('mobile_phone', e.target.value)}
            placeholder="Enter mobile phone"
            disabled={isViewMode}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telephone_no">Telephone No</Label>
          <Input
            id="telephone_no"
            value={formData.telephone_no}
            onChange={(e) => handleInputChange('telephone_no', e.target.value)}
            placeholder="Enter telephone number"
            disabled={isViewMode}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
          <Input
            id="whatsapp_number"
            value={formData.whatsapp_number}
            onChange={(e) => handleInputChange('whatsapp_number', e.target.value)}
            placeholder="Enter WhatsApp number"
            disabled={isViewMode}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerBasicInfo;
