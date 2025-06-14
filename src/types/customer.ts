
export interface Customer {
  customer_id: string;
  
  // Basic Identifiers
  customer_code: string;
  customer_name: string;
  contact_person: string;
  mobile_phone: string;
  telephone_no?: string;
  whatsapp_number?: string;

  // Address Section
  address_line1: string;
  address_line2?: string;
  town_city: string;
  district: string;
  state: string;
  pincode: string;
  country: string;

  // Identification/Registration
  gstin?: string;
  pan_number?: string;
  aadhar_number?: string;
  uin_number?: string;
  udyog_adhar?: string;
  fssai_number?: string;

  // Licensing & Transport
  drug_license_no?: string;
  dl_upto?: string;
  transport_details?: string;
  transport_gstin?: string;
  other_country: boolean;
  currency: string;

  // Banking & Payment Terms
  payment_terms: string;
  bank_account?: string;
  ifsc_code?: string;
  max_credit_limit: number;
  credit_site_days: number;
  locking_days: number;
  int_percentage: number;
  freight_charge: number;
  no_of_bills: number;
  discount_amount: number;
  discount_within_days: number;
  default_return_days: number;
  
  // Opening Balances & Sundry Debitor Flag
  opening_balance_dr: number;
  opening_balance_cr: number;
  sundry_debitor: boolean;

  // Additional Flags & Options
  tds_applicable: boolean;
  allow_credit: boolean;
  show_due_bills: boolean;
  institute_sub_dealer: boolean;
  allow_discount_on_bill: boolean;
  discontinue_sleep: boolean;
  out_of_state: boolean;
  govt_no_tcs: boolean;
  auto_interest: boolean;
  hard_lock: boolean;
  order_challan: boolean;

  // Area/Line/Camp Grid (Locate Tab)
  line_area_camp?: string;
  dl_no1?: string;
  dl_no2?: string;
  dl_no3?: string;
  tin_number?: string;
  srin_number?: string;
  locate_cr_site_days?: number;
  locate_locking_days?: number;
  locate_credit_limit?: number;
  locate_discount?: number;
  
  // Metadata
  company_id: number;
  is_active: boolean;
  created_by?: number;
  updated_by?: number;
  created_at: string;
  updated_at: string;
}

export interface CustomerFormData {
  // Basic Identifiers
  customer_code: string;
  customer_name: string;
  contact_person: string;
  mobile_phone: string;
  telephone_no: string;
  whatsapp_number: string;

  // Address Section
  address_line1: string;
  address_line2: string;
  town_city: string;
  district: string;
  state: string;
  pincode: string;
  country: string;

  // Identification/Registration
  gstin: string;
  pan_number: string;
  aadhar_number: string;
  uin_number: string;
  udyog_adhar: string;
  fssai_number: string;

  // Licensing & Transport
  drug_license_no: string;
  dl_upto: string;
  transport_details: string;
  transport_gstin: string;
  other_country: boolean;
  currency: string;

  // Banking & Payment Terms
  payment_terms: string;
  bank_account: string;
  ifsc_code: string;
  max_credit_limit: number;
  credit_site_days: number;
  locking_days: number;
  int_percentage: number;
  freight_charge: number;
  no_of_bills: number;
  discount_amount: number;
  discount_within_days: number;
  default_return_days: number;
  
  // Opening Balances & Sundry Debitor Flag
  opening_balance_dr: number;
  opening_balance_cr: number;
  sundry_debitor: boolean;

  // Additional Flags & Options
  tds_applicable: boolean;
  allow_credit: boolean;
  show_due_bills: boolean;
  institute_sub_dealer: boolean;
  allow_discount_on_bill: boolean;
  discontinue_sleep: boolean;
  out_of_state: boolean;
  govt_no_tcs: boolean;
  auto_interest: boolean;
  hard_lock: boolean;
  order_challan: boolean;

  // Area/Line/Camp Grid (Locate Tab)
  line_area_camp: string;
  dl_no1: string;
  dl_no2: string;
  dl_no3: string;
  tin_number: string;
  srin_number: string;
  locate_cr_site_days: number;
  locate_locking_days: number;
  locate_credit_limit: number;
  locate_discount: number;
  
  // Metadata
  is_active: boolean;
}
