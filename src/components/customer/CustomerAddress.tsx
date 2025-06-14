
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerFormData } from "@/types/customer";

interface CustomerAddressProps {
  formData: CustomerFormData;
  handleInputChange: (field: keyof CustomerFormData, value: string | boolean | number) => void;
  isViewMode: boolean;
}

const CustomerAddress = ({ formData, handleInputChange, isViewMode }: CustomerAddressProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Address Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="address_line1">Address Line 1 *</Label>
          <Input
            id="address_line1"
            value={formData.address_line1}
            onChange={(e) => handleInputChange('address_line1', e.target.value)}
            placeholder="Enter address line 1"
            disabled={isViewMode}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address_line2">Address Line 2</Label>
          <Input
            id="address_line2"
            value={formData.address_line2}
            onChange={(e) => handleInputChange('address_line2', e.target.value)}
            placeholder="Enter address line 2"
            disabled={isViewMode}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="town_city">Town/City *</Label>
          <Input
            id="town_city"
            value={formData.town_city}
            onChange={(e) => handleInputChange('town_city', e.target.value)}
            placeholder="Enter town/city"
            disabled={isViewMode}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="district">District *</Label>
          <Input
            id="district"
            value={formData.district}
            onChange={(e) => handleInputChange('district', e.target.value)}
            placeholder="Enter district"
            disabled={isViewMode}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) => handleInputChange('state', e.target.value)}
            placeholder="Enter state"
            disabled={isViewMode}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pincode">Pincode *</Label>
          <Input
            id="pincode"
            value={formData.pincode}
            onChange={(e) => handleInputChange('pincode', e.target.value)}
            placeholder="Enter pincode"
            disabled={isViewMode}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country *</Label>
          <Input
            id="country"
            value={formData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            placeholder="Enter country"
            disabled={isViewMode}
            required
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerAddress;
