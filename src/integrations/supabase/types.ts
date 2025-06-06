export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: {
          account_code: string
          account_id: number
          account_name: string
          account_type: Database["public"]["Enums"]["account_type"]
          company_id: number
          created_at: string
          is_active: boolean | null
          opening_balance: number | null
          opening_balance_type:
            | Database["public"]["Enums"]["balance_type"]
            | null
          parent_account_id: number | null
          updated_at: string
        }
        Insert: {
          account_code: string
          account_id?: number
          account_name: string
          account_type: Database["public"]["Enums"]["account_type"]
          company_id: number
          created_at?: string
          is_active?: boolean | null
          opening_balance?: number | null
          opening_balance_type?:
            | Database["public"]["Enums"]["balance_type"]
            | null
          parent_account_id?: number | null
          updated_at?: string
        }
        Update: {
          account_code?: string
          account_id?: number
          account_name?: string
          account_type?: Database["public"]["Enums"]["account_type"]
          company_id?: number
          created_at?: string
          is_active?: boolean | null
          opening_balance?: number | null
          opening_balance_type?:
            | Database["public"]["Enums"]["balance_type"]
            | null
          parent_account_id?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "accounts_parent_account_id_fkey"
            columns: ["parent_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["account_id"]
          },
        ]
      }
      audit_trail: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          audit_id: number
          company_id: number
          created_at: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          record_id: string
          table_name: string
          user_agent: string | null
          user_id: number | null
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          audit_id?: number
          company_id: number
          created_at?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id: string
          table_name: string
          user_agent?: string | null
          user_id?: number | null
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          audit_id?: number
          company_id?: number
          created_at?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string
          table_name?: string
          user_agent?: string | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_trail_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "audit_trail_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      backup_history: {
        Row: {
          backup_date: string
          backup_file_path: string
          backup_id: number
          backup_type: Database["public"]["Enums"]["backup_type"]
          company_id: number
          initiated_by: number
          notes: string | null
          restore_date: string | null
          restore_file_path: string | null
          restore_requested: boolean | null
          restore_status: Database["public"]["Enums"]["restore_status"] | null
        }
        Insert: {
          backup_date: string
          backup_file_path: string
          backup_id?: number
          backup_type?: Database["public"]["Enums"]["backup_type"]
          company_id: number
          initiated_by: number
          notes?: string | null
          restore_date?: string | null
          restore_file_path?: string | null
          restore_requested?: boolean | null
          restore_status?: Database["public"]["Enums"]["restore_status"] | null
        }
        Update: {
          backup_date?: string
          backup_file_path?: string
          backup_id?: number
          backup_type?: Database["public"]["Enums"]["backup_type"]
          company_id?: number
          initiated_by?: number
          notes?: string | null
          restore_date?: string | null
          restore_file_path?: string | null
          restore_requested?: boolean | null
          restore_status?: Database["public"]["Enums"]["restore_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "backup_history_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "backup_history_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      branches: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          branch_code: string
          branch_id: number
          branch_name: string
          city: string | null
          company_id: number
          country: string | null
          created_at: string
          email: string | null
          is_active: boolean | null
          manager_contact: string | null
          manager_name: string | null
          phone: string | null
          pin_code: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          branch_code: string
          branch_id?: number
          branch_name: string
          city?: string | null
          company_id: number
          country?: string | null
          created_at?: string
          email?: string | null
          is_active?: boolean | null
          manager_contact?: string | null
          manager_name?: string | null
          phone?: string | null
          pin_code?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          branch_code?: string
          branch_id?: number
          branch_name?: string
          city?: string | null
          company_id?: number
          country?: string | null
          created_at?: string
          email?: string | null
          is_active?: boolean | null
          manager_contact?: string | null
          manager_name?: string | null
          phone?: string | null
          pin_code?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branches_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_id"]
          },
        ]
      }
      brands: {
        Row: {
          brand_category: string | null
          brand_code: string
          brand_id: number
          brand_logo_path: string | null
          brand_name: string
          company_id: number
          created_at: string
          is_active: boolean | null
          manufacturer_contact: string | null
          manufacturer_name: string | null
          updated_at: string
        }
        Insert: {
          brand_category?: string | null
          brand_code: string
          brand_id?: number
          brand_logo_path?: string | null
          brand_name: string
          company_id: number
          created_at?: string
          is_active?: boolean | null
          manufacturer_contact?: string | null
          manufacturer_name?: string | null
          updated_at?: string
        }
        Update: {
          brand_category?: string | null
          brand_code?: string
          brand_id?: number
          brand_logo_path?: string | null
          brand_name?: string
          company_id?: number
          created_at?: string
          is_active?: boolean | null
          manufacturer_contact?: string | null
          manufacturer_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brands_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_id"]
          },
        ]
      }
      categories: {
        Row: {
          category_code: string
          category_id: number
          category_level: number | null
          category_name: string
          category_path: string | null
          commission_structure: Json | null
          company_id: number
          created_at: string
          default_tax_category: string | null
          is_active: boolean | null
          parent_category_id: number | null
          updated_at: string
        }
        Insert: {
          category_code: string
          category_id?: number
          category_level?: number | null
          category_name: string
          category_path?: string | null
          commission_structure?: Json | null
          company_id: number
          created_at?: string
          default_tax_category?: string | null
          is_active?: boolean | null
          parent_category_id?: number | null
          updated_at?: string
        }
        Update: {
          category_code?: string
          category_id?: number
          category_level?: number | null
          category_name?: string
          category_path?: string | null
          commission_structure?: Json | null
          company_id?: number
          created_at?: string
          default_tax_category?: string | null
          is_active?: boolean | null
          parent_category_id?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["category_id"]
          },
        ]
      }
      companies: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          business_type: Database["public"]["Enums"]["business_type"]
          city: string | null
          company_code: string
          company_id: number
          company_name: string
          country: string | null
          created_at: string
          created_by: number | null
          decimal_places_amount: number | null
          decimal_places_quantity: number | null
          decimal_places_rate: number | null
          default_currency: string | null
          digital_signature_path: string | null
          email: string | null
          financial_year_start: string | null
          gst_number: string | null
          is_active: boolean | null
          logo_path: string | null
          pan_number: string | null
          phone: string | null
          pin_code: string | null
          registration_number: string | null
          state: string | null
          updated_at: string
          updated_by: number | null
          website: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          business_type: Database["public"]["Enums"]["business_type"]
          city?: string | null
          company_code: string
          company_id?: number
          company_name: string
          country?: string | null
          created_at?: string
          created_by?: number | null
          decimal_places_amount?: number | null
          decimal_places_quantity?: number | null
          decimal_places_rate?: number | null
          default_currency?: string | null
          digital_signature_path?: string | null
          email?: string | null
          financial_year_start?: string | null
          gst_number?: string | null
          is_active?: boolean | null
          logo_path?: string | null
          pan_number?: string | null
          phone?: string | null
          pin_code?: string | null
          registration_number?: string | null
          state?: string | null
          updated_at?: string
          updated_by?: number | null
          website?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          business_type?: Database["public"]["Enums"]["business_type"]
          city?: string | null
          company_code?: string
          company_id?: number
          company_name?: string
          country?: string | null
          created_at?: string
          created_by?: number | null
          decimal_places_amount?: number | null
          decimal_places_quantity?: number | null
          decimal_places_rate?: number | null
          default_currency?: string | null
          digital_signature_path?: string | null
          email?: string | null
          financial_year_start?: string | null
          gst_number?: string | null
          is_active?: boolean | null
          logo_path?: string | null
          pan_number?: string | null
          phone?: string | null
          pin_code?: string | null
          registration_number?: string | null
          state?: string | null
          updated_at?: string
          updated_by?: number | null
          website?: string | null
        }
        Relationships: []
      }
      customer_addresses: {
        Row: {
          address_id: number
          address_line1: string
          address_line2: string | null
          address_title: string | null
          address_type: string
          city: string
          country: string | null
          created_at: string
          customer_id: number
          email: string | null
          gps_coordinates: string | null
          is_active: boolean | null
          is_default: boolean | null
          phone: string | null
          pin_code: string
          state: string
        }
        Insert: {
          address_id?: number
          address_line1: string
          address_line2?: string | null
          address_title?: string | null
          address_type: string
          city: string
          country?: string | null
          created_at?: string
          customer_id: number
          email?: string | null
          gps_coordinates?: string | null
          is_active?: boolean | null
          is_default?: boolean | null
          phone?: string | null
          pin_code: string
          state: string
        }
        Update: {
          address_id?: number
          address_line1?: string
          address_line2?: string | null
          address_title?: string | null
          address_type?: string
          city?: string
          country?: string | null
          created_at?: string
          customer_id?: number
          email?: string | null
          gps_coordinates?: string | null
          is_active?: boolean | null
          is_default?: boolean | null
          phone?: string | null
          pin_code?: string
          state?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "customer_addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_customer_revenue"
            referencedColumns: ["customer_id"]
          },
        ]
      }
      customer_receipts: {
        Row: {
          advance_adjustment: number | null
          allocation_details: Json | null
          balance_after_receipt: number | null
          bank_account: string | null
          company_id: number
          created_at: string
          created_by: number
          currency: string | null
          customer_id: number
          discount_allowed: number | null
          exchange_rate: number | null
          payment_mode: string
          receipt_date: string
          receipt_id: number
          receipt_number: string
          receipt_time: string
          reference_number: string | null
          total_amount_received: number
          updated_at: string
          updated_by: number | null
        }
        Insert: {
          advance_adjustment?: number | null
          allocation_details?: Json | null
          balance_after_receipt?: number | null
          bank_account?: string | null
          company_id: number
          created_at?: string
          created_by: number
          currency?: string | null
          customer_id: number
          discount_allowed?: number | null
          exchange_rate?: number | null
          payment_mode: string
          receipt_date: string
          receipt_id?: number
          receipt_number: string
          receipt_time: string
          reference_number?: string | null
          total_amount_received: number
          updated_at?: string
          updated_by?: number | null
        }
        Update: {
          advance_adjustment?: number | null
          allocation_details?: Json | null
          balance_after_receipt?: number | null
          bank_account?: string | null
          company_id?: number
          created_at?: string
          created_by?: number
          currency?: string | null
          customer_id?: number
          discount_allowed?: number | null
          exchange_rate?: number | null
          payment_mode?: string
          receipt_date?: string
          receipt_id?: number
          receipt_number?: string
          receipt_time?: string
          reference_number?: string | null
          total_amount_received?: number
          updated_at?: string
          updated_by?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_receipts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "customer_receipts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "customer_receipts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "customer_receipts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_customer_revenue"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "customer_receipts_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      customers: {
        Row: {
          bank_account_number: string | null
          bank_ifsc: string | null
          bank_name: string | null
          business_type: string | null
          company_id: number
          company_name: string | null
          contact_person: string | null
          created_at: string
          created_by: number | null
          credit_days: number | null
          credit_limit: number | null
          credit_rating: string | null
          customer_code: string
          customer_group: string | null
          customer_id: number
          customer_name: string
          customer_type: Database["public"]["Enums"]["customer_type"]
          date_of_birth: string | null
          date_of_incorporation: string | null
          discount_percent: number | null
          email: string | null
          gst_number: string | null
          interest_rate: number | null
          is_active: boolean | null
          language_preference: string | null
          opening_balance: number | null
          opening_balance_type:
            | Database["public"]["Enums"]["balance_type"]
            | null
          pan_number: string | null
          payment_terms: string | null
          preferred_communication:
            | Database["public"]["Enums"]["communication_method"]
            | null
          price_list: string | null
          primary_phone: string | null
          salesperson_id: number | null
          secondary_phone: string | null
          special_instructions: string | null
          state_code: string | null
          tds_applicable: boolean | null
          tds_category: string | null
          territory: string | null
          updated_at: string
          updated_by: number | null
          website: string | null
        }
        Insert: {
          bank_account_number?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          business_type?: string | null
          company_id: number
          company_name?: string | null
          contact_person?: string | null
          created_at?: string
          created_by?: number | null
          credit_days?: number | null
          credit_limit?: number | null
          credit_rating?: string | null
          customer_code: string
          customer_group?: string | null
          customer_id?: number
          customer_name: string
          customer_type?: Database["public"]["Enums"]["customer_type"]
          date_of_birth?: string | null
          date_of_incorporation?: string | null
          discount_percent?: number | null
          email?: string | null
          gst_number?: string | null
          interest_rate?: number | null
          is_active?: boolean | null
          language_preference?: string | null
          opening_balance?: number | null
          opening_balance_type?:
            | Database["public"]["Enums"]["balance_type"]
            | null
          pan_number?: string | null
          payment_terms?: string | null
          preferred_communication?:
            | Database["public"]["Enums"]["communication_method"]
            | null
          price_list?: string | null
          primary_phone?: string | null
          salesperson_id?: number | null
          secondary_phone?: string | null
          special_instructions?: string | null
          state_code?: string | null
          tds_applicable?: boolean | null
          tds_category?: string | null
          territory?: string | null
          updated_at?: string
          updated_by?: number | null
          website?: string | null
        }
        Update: {
          bank_account_number?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          business_type?: string | null
          company_id?: number
          company_name?: string | null
          contact_person?: string | null
          created_at?: string
          created_by?: number | null
          credit_days?: number | null
          credit_limit?: number | null
          credit_rating?: string | null
          customer_code?: string
          customer_group?: string | null
          customer_id?: number
          customer_name?: string
          customer_type?: Database["public"]["Enums"]["customer_type"]
          date_of_birth?: string | null
          date_of_incorporation?: string | null
          discount_percent?: number | null
          email?: string | null
          gst_number?: string | null
          interest_rate?: number | null
          is_active?: boolean | null
          language_preference?: string | null
          opening_balance?: number | null
          opening_balance_type?:
            | Database["public"]["Enums"]["balance_type"]
            | null
          pan_number?: string | null
          payment_terms?: string | null
          preferred_communication?:
            | Database["public"]["Enums"]["communication_method"]
            | null
          price_list?: string | null
          primary_phone?: string | null
          salesperson_id?: number | null
          secondary_phone?: string | null
          special_instructions?: string | null
          state_code?: string | null
          tds_applicable?: boolean | null
          tds_category?: string | null
          territory?: string | null
          updated_at?: string
          updated_by?: number | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "customers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "customers_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "customers_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      data_encryption_keys: {
        Row: {
          algorithm: string
          company_id: number
          created_at: string
          created_by: number
          dek_id: number
          expires_at: string | null
          is_active: boolean | null
          key_material: string
          key_name: string
        }
        Insert: {
          algorithm: string
          company_id: number
          created_at?: string
          created_by: number
          dek_id?: number
          expires_at?: string | null
          is_active?: boolean | null
          key_material: string
          key_name: string
        }
        Update: {
          algorithm?: string
          company_id?: number
          created_at?: string
          created_by?: number
          dek_id?: number
          expires_at?: string | null
          is_active?: boolean | null
          key_material?: string
          key_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_encryption_keys_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "data_encryption_keys_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body_template: string
          company_id: number
          created_at: string
          created_by: number
          email_template_id: number
          is_active: boolean | null
          subject_template: string
          template_name: string
          updated_at: string
        }
        Insert: {
          body_template: string
          company_id: number
          created_at?: string
          created_by: number
          email_template_id?: number
          is_active?: boolean | null
          subject_template: string
          template_name: string
          updated_at?: string
        }
        Update: {
          body_template?: string
          company_id?: number
          created_at?: string
          created_by?: number
          email_template_id?: number
          is_active?: boolean | null
          subject_template?: string
          template_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "email_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      failed_login_attempts: {
        Row: {
          attempted_at: string
          fail_id: number
          ip_address: string | null
          reason: string | null
          user_agent: string | null
          user_id: number | null
        }
        Insert: {
          attempted_at?: string
          fail_id?: number
          ip_address?: string | null
          reason?: string | null
          user_agent?: string | null
          user_id?: number | null
        }
        Update: {
          attempted_at?: string
          fail_id?: number
          ip_address?: string | null
          reason?: string | null
          user_agent?: string | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "failed_login_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      financial_transactions: {
        Row: {
          company_id: number
          created_at: string
          created_by: number
          ft_id: number
          gl_entry_created: boolean | null
          module: Database["public"]["Enums"]["financial_module"]
          module_reference_id: number
          transaction_date: string
          transaction_time: string
          updated_at: string
        }
        Insert: {
          company_id: number
          created_at?: string
          created_by: number
          ft_id?: number
          gl_entry_created?: boolean | null
          module: Database["public"]["Enums"]["financial_module"]
          module_reference_id: number
          transaction_date: string
          transaction_time: string
          updated_at?: string
        }
        Update: {
          company_id?: number
          created_at?: string
          created_by?: number
          ft_id?: number
          gl_entry_created?: boolean | null
          module?: Database["public"]["Enums"]["financial_module"]
          module_reference_id?: number
          transaction_date?: string
          transaction_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "financial_transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      goods_receipt_notes: {
        Row: {
          company_id: number
          created_at: string
          created_by: number
          defect_photos: Json | null
          delivery_challan_date: string | null
          delivery_challan_number: string | null
          discount_amount: number | null
          freight_charges: number | null
          grn_date: string
          grn_id: number
          grn_number: string
          grn_status: Database["public"]["Enums"]["grn_status"]
          grn_time: string
          inspection_date: string | null
          inspector_id: number | null
          other_charges: number | null
          payment_due_date: string | null
          po_id: number | null
          quality_remarks: string | null
          quality_status: Database["public"]["Enums"]["quality_status"]
          received_by: number
          remarks: string | null
          subtotal: number | null
          tax_amount: number | null
          total_amount: number | null
          updated_at: string
          updated_by: number | null
          vehicle_number: string | null
          vendor_id: number
          warehouse_id: number
        }
        Insert: {
          company_id: number
          created_at?: string
          created_by: number
          defect_photos?: Json | null
          delivery_challan_date?: string | null
          delivery_challan_number?: string | null
          discount_amount?: number | null
          freight_charges?: number | null
          grn_date: string
          grn_id?: number
          grn_number: string
          grn_status?: Database["public"]["Enums"]["grn_status"]
          grn_time: string
          inspection_date?: string | null
          inspector_id?: number | null
          other_charges?: number | null
          payment_due_date?: string | null
          po_id?: number | null
          quality_remarks?: string | null
          quality_status?: Database["public"]["Enums"]["quality_status"]
          received_by: number
          remarks?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string
          updated_by?: number | null
          vehicle_number?: string | null
          vendor_id: number
          warehouse_id: number
        }
        Update: {
          company_id?: number
          created_at?: string
          created_by?: number
          defect_photos?: Json | null
          delivery_challan_date?: string | null
          delivery_challan_number?: string | null
          discount_amount?: number | null
          freight_charges?: number | null
          grn_date?: string
          grn_id?: number
          grn_number?: string
          grn_status?: Database["public"]["Enums"]["grn_status"]
          grn_time?: string
          inspection_date?: string | null
          inspector_id?: number | null
          other_charges?: number | null
          payment_due_date?: string | null
          po_id?: number | null
          quality_remarks?: string | null
          quality_status?: Database["public"]["Enums"]["quality_status"]
          received_by?: number
          remarks?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string
          updated_by?: number | null
          vehicle_number?: string | null
          vendor_id?: number
          warehouse_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "goods_receipt_notes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "goods_receipt_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "goods_receipt_notes_inspector_id_fkey"
            columns: ["inspector_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "goods_receipt_notes_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["po_id"]
          },
          {
            foreignKeyName: "goods_receipt_notes_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "goods_receipt_notes_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "goods_receipt_notes_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["vendor_id"]
          },
          {
            foreignKeyName: "goods_receipt_notes_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "v_stock_ledger"
            referencedColumns: ["warehouse_id"]
          },
          {
            foreignKeyName: "goods_receipt_notes_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "v_stock_position"
            referencedColumns: ["warehouse_id"]
          },
          {
            foreignKeyName: "goods_receipt_notes_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["warehouse_id"]
          },
        ]
      }
      import_export_history: {
        Row: {
          company_id: number
          end_time: string | null
          error_details: string | null
          file_format: Database["public"]["Enums"]["file_format"]
          file_name: string
          ie_id: number
          initiated_by: number
          module_name: string
          operation_type: Database["public"]["Enums"]["operation_type"]
          record_count: number | null
          start_time: string
          status: Database["public"]["Enums"]["ie_status"]
        }
        Insert: {
          company_id: number
          end_time?: string | null
          error_details?: string | null
          file_format: Database["public"]["Enums"]["file_format"]
          file_name: string
          ie_id?: number
          initiated_by: number
          module_name: string
          operation_type: Database["public"]["Enums"]["operation_type"]
          record_count?: number | null
          start_time?: string
          status?: Database["public"]["Enums"]["ie_status"]
        }
        Update: {
          company_id?: number
          end_time?: string | null
          error_details?: string | null
          file_format?: Database["public"]["Enums"]["file_format"]
          file_name?: string
          ie_id?: number
          initiated_by?: number
          module_name?: string
          operation_type?: Database["public"]["Enums"]["operation_type"]
          record_count?: number | null
          start_time?: string
          status?: Database["public"]["Enums"]["ie_status"]
        }
        Relationships: [
          {
            foreignKeyName: "import_export_history_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "import_export_history_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      integrations: {
        Row: {
          api_key: string | null
          company_id: number
          created_at: string
          created_by: number
          events: Json | null
          integration_id: number
          integration_name: string
          integration_type: Database["public"]["Enums"]["integration_type"]
          is_active: boolean | null
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          api_key?: string | null
          company_id: number
          created_at?: string
          created_by: number
          events?: Json | null
          integration_id?: number
          integration_name: string
          integration_type: Database["public"]["Enums"]["integration_type"]
          is_active?: boolean | null
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          api_key?: string | null
          company_id?: number
          created_at?: string
          created_by?: number
          events?: Json | null
          integration_id?: number
          integration_name?: string
          integration_type?: Database["public"]["Enums"]["integration_type"]
          is_active?: boolean | null
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integrations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "integrations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      inventory_transaction_details: {
        Row: {
          bin_id: number | null
          created_at: string
          from_warehouse_id: number | null
          itd_id: number
          new_stock: number | null
          previous_stock: number | null
          product_id: number
          quantity: number
          reason_code: string | null
          to_warehouse_id: number | null
          total_cost: number | null
          txn_id: number
          unit_cost: number | null
          uom_id: number
          updated_at: string
          variant_id: number | null
        }
        Insert: {
          bin_id?: number | null
          created_at?: string
          from_warehouse_id?: number | null
          itd_id?: number
          new_stock?: number | null
          previous_stock?: number | null
          product_id: number
          quantity: number
          reason_code?: string | null
          to_warehouse_id?: number | null
          total_cost?: number | null
          txn_id: number
          unit_cost?: number | null
          uom_id: number
          updated_at?: string
          variant_id?: number | null
        }
        Update: {
          bin_id?: number | null
          created_at?: string
          from_warehouse_id?: number | null
          itd_id?: number
          new_stock?: number | null
          previous_stock?: number | null
          product_id?: number
          quantity?: number
          reason_code?: string | null
          to_warehouse_id?: number | null
          total_cost?: number | null
          txn_id?: number
          unit_cost?: number | null
          uom_id?: number
          updated_at?: string
          variant_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transaction_details_bin_id_fkey"
            columns: ["bin_id"]
            isOneToOne: false
            referencedRelation: "storage_bins"
            referencedColumns: ["bin_id"]
          },
          {
            foreignKeyName: "inventory_transaction_details_from_warehouse_id_fkey"
            columns: ["from_warehouse_id"]
            isOneToOne: false
            referencedRelation: "v_stock_ledger"
            referencedColumns: ["warehouse_id"]
          },
          {
            foreignKeyName: "inventory_transaction_details_from_warehouse_id_fkey"
            columns: ["from_warehouse_id"]
            isOneToOne: false
            referencedRelation: "v_stock_position"
            referencedColumns: ["warehouse_id"]
          },
          {
            foreignKeyName: "inventory_transaction_details_from_warehouse_id_fkey"
            columns: ["from_warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["warehouse_id"]
          },
          {
            foreignKeyName: "inventory_transaction_details_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "inventory_transaction_details_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_stock_position"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "inventory_transaction_details_to_warehouse_id_fkey"
            columns: ["to_warehouse_id"]
            isOneToOne: false
            referencedRelation: "v_stock_ledger"
            referencedColumns: ["warehouse_id"]
          },
          {
            foreignKeyName: "inventory_transaction_details_to_warehouse_id_fkey"
            columns: ["to_warehouse_id"]
            isOneToOne: false
            referencedRelation: "v_stock_position"
            referencedColumns: ["warehouse_id"]
          },
          {
            foreignKeyName: "inventory_transaction_details_to_warehouse_id_fkey"
            columns: ["to_warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["warehouse_id"]
          },
          {
            foreignKeyName: "inventory_transaction_details_txn_id_fkey"
            columns: ["txn_id"]
            isOneToOne: false
            referencedRelation: "inventory_transactions"
            referencedColumns: ["txn_id"]
          },
          {
            foreignKeyName: "inventory_transaction_details_uom_id_fkey"
            columns: ["uom_id"]
            isOneToOne: false
            referencedRelation: "units_of_measure"
            referencedColumns: ["uom_id"]
          },
          {
            foreignKeyName: "inventory_transaction_details_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["variant_id"]
          },
        ]
      }
      inventory_transactions: {
        Row: {
          branch_id: number | null
          company_id: number
          created_at: string
          created_by: number
          reference_document: string | null
          related_id: number | null
          remarks: string | null
          total_items: number | null
          total_quantity: number | null
          total_value: number | null
          txn_date: string
          txn_id: number
          txn_number: string
          txn_time: string
          txn_type: Database["public"]["Enums"]["txn_type"]
          updated_at: string
          updated_by: number | null
          warehouse_id: number
        }
        Insert: {
          branch_id?: number | null
          company_id: number
          created_at?: string
          created_by: number
          reference_document?: string | null
          related_id?: number | null
          remarks?: string | null
          total_items?: number | null
          total_quantity?: number | null
          total_value?: number | null
          txn_date: string
          txn_id?: number
          txn_number: string
          txn_time: string
          txn_type: Database["public"]["Enums"]["txn_type"]
          updated_at?: string
          updated_by?: number | null
          warehouse_id: number
        }
        Update: {
          branch_id?: number | null
          company_id?: number
          created_at?: string
          created_by?: number
          reference_document?: string | null
          related_id?: number | null
          remarks?: string | null
          total_items?: number | null
          total_quantity?: number | null
          total_value?: number | null
          txn_date?: string
          txn_id?: number
          txn_number?: string
          txn_time?: string
          txn_type?: Database["public"]["Enums"]["txn_type"]
          updated_at?: string
          updated_by?: number | null
          warehouse_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "inventory_transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "inventory_transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "inventory_transactions_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "inventory_transactions_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "v_stock_ledger"
            referencedColumns: ["warehouse_id"]
          },
          {
            foreignKeyName: "inventory_transactions_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "v_stock_position"
            referencedColumns: ["warehouse_id"]
          },
          {
            foreignKeyName: "inventory_transactions_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["warehouse_id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          company_id: number
          created_at: string
          created_by: number
          description: string | null
          journal_date: string
          journal_id: number
          journal_number: string
          journal_time: string
          total_credit: number
          total_debit: number
          updated_at: string
        }
        Insert: {
          company_id: number
          created_at?: string
          created_by: number
          description?: string | null
          journal_date: string
          journal_id?: number
          journal_number: string
          journal_time: string
          total_credit: number
          total_debit: number
          updated_at?: string
        }
        Update: {
          company_id?: number
          created_at?: string
          created_by?: number
          description?: string | null
          journal_date?: string
          journal_id?: number
          journal_number?: string
          journal_time?: string
          total_credit?: number
          total_debit?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "journal_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      journal_entry_details: {
        Row: {
          account_id: number
          credit_amount: number | null
          debit_amount: number | null
          jed_id: number
          journal_id: number
          narration: string | null
        }
        Insert: {
          account_id: number
          credit_amount?: number | null
          debit_amount?: number | null
          jed_id?: number
          journal_id: number
          narration?: string | null
        }
        Update: {
          account_id?: number
          credit_amount?: number | null
          debit_amount?: number | null
          jed_id?: number
          journal_id?: number
          narration?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_entry_details_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "journal_entry_details_journal_id_fkey"
            columns: ["journal_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["journal_id"]
          },
        ]
      }
      password_history: {
        Row: {
          changed_at: string
          password_hash: string
          ph_id: number
          user_id: number
        }
        Insert: {
          changed_at?: string
          password_hash: string
          ph_id?: number
          user_id: number
        }
        Update: {
          changed_at?: string
          password_hash?: string
          ph_id?: number
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "password_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      physical_count_details: {
        Row: {
          adjustment_decision: string | null
          adjustment_quantity: number | null
          bin_id: number | null
          count_id: number
          counted_quantity: number
          created_at: string
          pcd_id: number
          product_id: number
          reason_for_variance: string | null
          system_quantity: number
          uom_id: number
          updated_at: string
          variance_quantity: number | null
          variant_id: number | null
        }
        Insert: {
          adjustment_decision?: string | null
          adjustment_quantity?: number | null
          bin_id?: number | null
          count_id: number
          counted_quantity: number
          created_at?: string
          pcd_id?: number
          product_id: number
          reason_for_variance?: string | null
          system_quantity: number
          uom_id: number
          updated_at?: string
          variance_quantity?: number | null
          variant_id?: number | null
        }
        Update: {
          adjustment_decision?: string | null
          adjustment_quantity?: number | null
          bin_id?: number | null
          count_id?: number
          counted_quantity?: number
          created_at?: string
          pcd_id?: number
          product_id?: number
          reason_for_variance?: string | null
          system_quantity?: number
          uom_id?: number
          updated_at?: string
          variance_quantity?: number | null
          variant_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "physical_count_details_bin_id_fkey"
            columns: ["bin_id"]
            isOneToOne: false
            referencedRelation: "storage_bins"
            referencedColumns: ["bin_id"]
          },
          {
            foreignKeyName: "physical_count_details_count_id_fkey"
            columns: ["count_id"]
            isOneToOne: false
            referencedRelation: "physical_counts"
            referencedColumns: ["count_id"]
          },
          {
            foreignKeyName: "physical_count_details_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "physical_count_details_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_stock_position"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "physical_count_details_uom_id_fkey"
            columns: ["uom_id"]
            isOneToOne: false
            referencedRelation: "units_of_measure"
            referencedColumns: ["uom_id"]
          },
          {
            foreignKeyName: "physical_count_details_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["variant_id"]
          },
        ]
      }
      physical_counts: {
        Row: {
          company_id: number
          count_date: string
          count_id: number
          count_number: string
          count_time: string
          count_type: Database["public"]["Enums"]["count_type"]
          counted_by: number | null
          created_at: string
          created_by: number
          method: Database["public"]["Enums"]["count_method"]
          scheduled_by: number | null
          status: Database["public"]["Enums"]["count_status"]
          total_items_counted: number | null
          total_variance: number | null
          updated_at: string
          updated_by: number | null
          warehouse_id: number
        }
        Insert: {
          company_id: number
          count_date: string
          count_id?: number
          count_number: string
          count_time: string
          count_type?: Database["public"]["Enums"]["count_type"]
          counted_by?: number | null
          created_at?: string
          created_by: number
          method?: Database["public"]["Enums"]["count_method"]
          scheduled_by?: number | null
          status?: Database["public"]["Enums"]["count_status"]
          total_items_counted?: number | null
          total_variance?: number | null
          updated_at?: string
          updated_by?: number | null
          warehouse_id: number
        }
        Update: {
          company_id?: number
          count_date?: string
          count_id?: number
          count_number?: string
          count_time?: string
          count_type?: Database["public"]["Enums"]["count_type"]
          counted_by?: number | null
          created_at?: string
          created_by?: number
          method?: Database["public"]["Enums"]["count_method"]
          scheduled_by?: number | null
          status?: Database["public"]["Enums"]["count_status"]
          total_items_counted?: number | null
          total_variance?: number | null
          updated_at?: string
          updated_by?: number | null
          warehouse_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "physical_counts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "physical_counts_counted_by_fkey"
            columns: ["counted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "physical_counts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "physical_counts_scheduled_by_fkey"
            columns: ["scheduled_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "physical_counts_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "physical_counts_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "v_stock_ledger"
            referencedColumns: ["warehouse_id"]
          },
          {
            foreignKeyName: "physical_counts_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "v_stock_position"
            referencedColumns: ["warehouse_id"]
          },
          {
            foreignKeyName: "physical_counts_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["warehouse_id"]
          },
        ]
      }
      product_variants: {
        Row: {
          additional_attributes: Json | null
          barcode: string | null
          color_code: string | null
          color_name: string | null
          created_at: string
          dimensions: string | null
          is_active: boolean | null
          mrp: number | null
          product_id: number
          selling_price: number | null
          size_code: string | null
          size_name: string | null
          sku: string | null
          updated_at: string
          variant_code: string
          variant_id: number
          variant_name: string
          weight: number | null
        }
        Insert: {
          additional_attributes?: Json | null
          barcode?: string | null
          color_code?: string | null
          color_name?: string | null
          created_at?: string
          dimensions?: string | null
          is_active?: boolean | null
          mrp?: number | null
          product_id: number
          selling_price?: number | null
          size_code?: string | null
          size_name?: string | null
          sku?: string | null
          updated_at?: string
          variant_code: string
          variant_id?: number
          variant_name: string
          weight?: number | null
        }
        Update: {
          additional_attributes?: Json | null
          barcode?: string | null
          color_code?: string | null
          color_name?: string | null
          created_at?: string
          dimensions?: string | null
          is_active?: boolean | null
          mrp?: number | null
          product_id?: number
          selling_price?: number | null
          size_code?: string | null
          size_name?: string | null
          sku?: string | null
          updated_at?: string
          variant_code?: string
          variant_id?: number
          variant_name?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_stock_position"
            referencedColumns: ["product_id"]
          },
        ]
      }
      products: {
        Row: {
          age_group: Database["public"]["Enums"]["age_group_type"] | null
          barcode: string | null
          brand_id: number | null
          care_instructions: string | null
          category_id: number
          collection_name: string | null
          company_id: number
          country_of_origin: string | null
          created_at: string
          created_by: number | null
          dealer_rate: number | null
          dimensions: string | null
          discount_limit_percent: number | null
          fabric_composition: string | null
          gender: Database["public"]["Enums"]["gender_type"] | null
          hsn_sac_code: string | null
          is_active: boolean | null
          is_batch_tracked: boolean | null
          is_serialized: boolean | null
          lead_time_days: number | null
          maximum_stock_level: number | null
          minimum_selling_price: number | null
          minimum_stock_level: number | null
          mrp: number | null
          opening_stock: number | null
          primary_uom_id: number
          product_code: string
          product_description: string | null
          product_id: number
          product_images: Json | null
          product_name: string
          product_name_local: string | null
          product_type: Database["public"]["Enums"]["product_type"]
          purchase_account: string | null
          purchase_rate: number | null
          qr_code: string | null
          reorder_level: number | null
          reorder_quantity: number | null
          retail_rate: number | null
          sales_account: string | null
          season: Database["public"]["Enums"]["season_type"] | null
          secondary_uom_id: number | null
          shelf_life_days: number | null
          specifications: Json | null
          storage_conditions: string | null
          style_number: string | null
          tax_category: string | null
          tax_exemption: boolean | null
          updated_at: string
          updated_by: number | null
          weight: number | null
          wholesale_rate: number | null
        }
        Insert: {
          age_group?: Database["public"]["Enums"]["age_group_type"] | null
          barcode?: string | null
          brand_id?: number | null
          care_instructions?: string | null
          category_id: number
          collection_name?: string | null
          company_id: number
          country_of_origin?: string | null
          created_at?: string
          created_by?: number | null
          dealer_rate?: number | null
          dimensions?: string | null
          discount_limit_percent?: number | null
          fabric_composition?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          hsn_sac_code?: string | null
          is_active?: boolean | null
          is_batch_tracked?: boolean | null
          is_serialized?: boolean | null
          lead_time_days?: number | null
          maximum_stock_level?: number | null
          minimum_selling_price?: number | null
          minimum_stock_level?: number | null
          mrp?: number | null
          opening_stock?: number | null
          primary_uom_id: number
          product_code: string
          product_description?: string | null
          product_id?: number
          product_images?: Json | null
          product_name: string
          product_name_local?: string | null
          product_type?: Database["public"]["Enums"]["product_type"]
          purchase_account?: string | null
          purchase_rate?: number | null
          qr_code?: string | null
          reorder_level?: number | null
          reorder_quantity?: number | null
          retail_rate?: number | null
          sales_account?: string | null
          season?: Database["public"]["Enums"]["season_type"] | null
          secondary_uom_id?: number | null
          shelf_life_days?: number | null
          specifications?: Json | null
          storage_conditions?: string | null
          style_number?: string | null
          tax_category?: string | null
          tax_exemption?: boolean | null
          updated_at?: string
          updated_by?: number | null
          weight?: number | null
          wholesale_rate?: number | null
        }
        Update: {
          age_group?: Database["public"]["Enums"]["age_group_type"] | null
          barcode?: string | null
          brand_id?: number | null
          care_instructions?: string | null
          category_id?: number
          collection_name?: string | null
          company_id?: number
          country_of_origin?: string | null
          created_at?: string
          created_by?: number | null
          dealer_rate?: number | null
          dimensions?: string | null
          discount_limit_percent?: number | null
          fabric_composition?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          hsn_sac_code?: string | null
          is_active?: boolean | null
          is_batch_tracked?: boolean | null
          is_serialized?: boolean | null
          lead_time_days?: number | null
          maximum_stock_level?: number | null
          minimum_selling_price?: number | null
          minimum_stock_level?: number | null
          mrp?: number | null
          opening_stock?: number | null
          primary_uom_id?: number
          product_code?: string
          product_description?: string | null
          product_id?: number
          product_images?: Json | null
          product_name?: string
          product_name_local?: string | null
          product_type?: Database["public"]["Enums"]["product_type"]
          purchase_account?: string | null
          purchase_rate?: number | null
          qr_code?: string | null
          reorder_level?: number | null
          reorder_quantity?: number | null
          retail_rate?: number | null
          sales_account?: string | null
          season?: Database["public"]["Enums"]["season_type"] | null
          secondary_uom_id?: number | null
          shelf_life_days?: number | null
          specifications?: Json | null
          storage_conditions?: string | null
          style_number?: string | null
          tax_category?: string | null
          tax_exemption?: boolean | null
          updated_at?: string
          updated_by?: number | null
          weight?: number | null
          wholesale_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "products_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "products_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "products_primary_uom_id_fkey"
            columns: ["primary_uom_id"]
            isOneToOne: false
            referencedRelation: "units_of_measure"
            referencedColumns: ["uom_id"]
          },
          {
            foreignKeyName: "products_secondary_uom_id_fkey"
            columns: ["secondary_uom_id"]
            isOneToOne: false
            referencedRelation: "units_of_measure"
            referencedColumns: ["uom_id"]
          },
          {
            foreignKeyName: "products_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      purchase_order_details: {
        Row: {
          created_at: string
          discount_amount: number | null
          discount_percent: number | null
          expected_delivery_date: string | null
          hsn_code: string | null
          line_status: Database["public"]["Enums"]["po_line_status"]
          pending_quantity: number
          po_detail_id: number
          po_id: number
          product_code: string | null
          product_description: string | null
          product_id: number
          product_name: string | null
          quantity: number
          rate: number
          received_quantity: number | null
          special_instructions: string | null
          tax_amount: number | null
          tax_rate: number | null
          taxable_amount: number
          total_amount: number
          uom_id: number
          updated_at: string
          variant_id: number | null
        }
        Insert: {
          created_at?: string
          discount_amount?: number | null
          discount_percent?: number | null
          expected_delivery_date?: string | null
          hsn_code?: string | null
          line_status?: Database["public"]["Enums"]["po_line_status"]
          pending_quantity: number
          po_detail_id?: number
          po_id: number
          product_code?: string | null
          product_description?: string | null
          product_id: number
          product_name?: string | null
          quantity: number
          rate: number
          received_quantity?: number | null
          special_instructions?: string | null
          tax_amount?: number | null
          tax_rate?: number | null
          taxable_amount: number
          total_amount: number
          uom_id: number
          updated_at?: string
          variant_id?: number | null
        }
        Update: {
          created_at?: string
          discount_amount?: number | null
          discount_percent?: number | null
          expected_delivery_date?: string | null
          hsn_code?: string | null
          line_status?: Database["public"]["Enums"]["po_line_status"]
          pending_quantity?: number
          po_detail_id?: number
          po_id?: number
          product_code?: string | null
          product_description?: string | null
          product_id?: number
          product_name?: string | null
          quantity?: number
          rate?: number
          received_quantity?: number | null
          special_instructions?: string | null
          tax_amount?: number | null
          tax_rate?: number | null
          taxable_amount?: number
          total_amount?: number
          uom_id?: number
          updated_at?: string
          variant_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_details_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["po_id"]
          },
          {
            foreignKeyName: "purchase_order_details_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "purchase_order_details_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_stock_position"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "purchase_order_details_uom_id_fkey"
            columns: ["uom_id"]
            isOneToOne: false
            referencedRelation: "units_of_measure"
            referencedColumns: ["uom_id"]
          },
          {
            foreignKeyName: "purchase_order_details_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["variant_id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          approval_remarks: string | null
          approval_status: Database["public"]["Enums"]["approval_status"]
          approved_at: string | null
          approved_by: number | null
          company_id: number
          created_at: string
          created_by: number
          currency: string | null
          delivery_terms: string | null
          discount_amount: number | null
          exchange_rate: number | null
          expected_delivery_date: string | null
          freight_charges: number | null
          internal_notes: string | null
          other_charges: number | null
          payment_terms: string | null
          po_date: string
          po_id: number
          po_number: string
          po_status: Database["public"]["Enums"]["po_status"]
          quote_number: string | null
          reference_number: string | null
          shipping_address: string | null
          special_instructions: string | null
          subtotal: number | null
          tax_amount: number | null
          terms_conditions: string | null
          total_amount: number | null
          updated_at: string
          updated_by: number | null
          vendor_id: number
          warehouse_id: number
        }
        Insert: {
          approval_remarks?: string | null
          approval_status?: Database["public"]["Enums"]["approval_status"]
          approved_at?: string | null
          approved_by?: number | null
          company_id: number
          created_at?: string
          created_by: number
          currency?: string | null
          delivery_terms?: string | null
          discount_amount?: number | null
          exchange_rate?: number | null
          expected_delivery_date?: string | null
          freight_charges?: number | null
          internal_notes?: string | null
          other_charges?: number | null
          payment_terms?: string | null
          po_date: string
          po_id?: number
          po_number: string
          po_status?: Database["public"]["Enums"]["po_status"]
          quote_number?: string | null
          reference_number?: string | null
          shipping_address?: string | null
          special_instructions?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          terms_conditions?: string | null
          total_amount?: number | null
          updated_at?: string
          updated_by?: number | null
          vendor_id: number
          warehouse_id: number
        }
        Update: {
          approval_remarks?: string | null
          approval_status?: Database["public"]["Enums"]["approval_status"]
          approved_at?: string | null
          approved_by?: number | null
          company_id?: number
          created_at?: string
          created_by?: number
          currency?: string | null
          delivery_terms?: string | null
          discount_amount?: number | null
          exchange_rate?: number | null
          expected_delivery_date?: string | null
          freight_charges?: number | null
          internal_notes?: string | null
          other_charges?: number | null
          payment_terms?: string | null
          po_date?: string
          po_id?: number
          po_number?: string
          po_status?: Database["public"]["Enums"]["po_status"]
          quote_number?: string | null
          reference_number?: string | null
          shipping_address?: string | null
          special_instructions?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          terms_conditions?: string | null
          total_amount?: number | null
          updated_at?: string
          updated_by?: number | null
          vendor_id?: number
          warehouse_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "purchase_orders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "purchase_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "purchase_orders_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "purchase_orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["vendor_id"]
          },
          {
            foreignKeyName: "purchase_orders_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "v_stock_ledger"
            referencedColumns: ["warehouse_id"]
          },
          {
            foreignKeyName: "purchase_orders_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "v_stock_position"
            referencedColumns: ["warehouse_id"]
          },
          {
            foreignKeyName: "purchase_orders_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["warehouse_id"]
          },
        ]
      }
      purchase_return_details: {
        Row: {
          created_at: string
          discount_amount: number | null
          discount_percent: number | null
          hsn_code: string | null
          pr_id: number
          prd_id: number
          product_code: string | null
          product_description: string | null
          product_id: number
          product_name: string | null
          quantity_returned: number
          rate: number
          tax_amount: number | null
          tax_rate: number | null
          taxable_amount: number
          total_amount: number
          uom_id: number
          updated_at: string
          variant_id: number | null
        }
        Insert: {
          created_at?: string
          discount_amount?: number | null
          discount_percent?: number | null
          hsn_code?: string | null
          pr_id: number
          prd_id?: number
          product_code?: string | null
          product_description?: string | null
          product_id: number
          product_name?: string | null
          quantity_returned: number
          rate: number
          tax_amount?: number | null
          tax_rate?: number | null
          taxable_amount: number
          total_amount: number
          uom_id: number
          updated_at?: string
          variant_id?: number | null
        }
        Update: {
          created_at?: string
          discount_amount?: number | null
          discount_percent?: number | null
          hsn_code?: string | null
          pr_id?: number
          prd_id?: number
          product_code?: string | null
          product_description?: string | null
          product_id?: number
          product_name?: string | null
          quantity_returned?: number
          rate?: number
          tax_amount?: number | null
          tax_rate?: number | null
          taxable_amount?: number
          total_amount?: number
          uom_id?: number
          updated_at?: string
          variant_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_return_details_pr_id_fkey"
            columns: ["pr_id"]
            isOneToOne: false
            referencedRelation: "purchase_returns"
            referencedColumns: ["pr_id"]
          },
          {
            foreignKeyName: "purchase_return_details_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "purchase_return_details_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_stock_position"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "purchase_return_details_uom_id_fkey"
            columns: ["uom_id"]
            isOneToOne: false
            referencedRelation: "units_of_measure"
            referencedColumns: ["uom_id"]
          },
          {
            foreignKeyName: "purchase_return_details_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["variant_id"]
          },
        ]
      }
      purchase_returns: {
        Row: {
          company_id: number
          created_at: string
          created_by: number
          original_document_id: number | null
          pr_id: number
          return_date: string
          return_number: string
          return_reason: string | null
          return_time: string
          return_type: string | null
          updated_at: string
          updated_by: number | null
          vendor_id: number
          warehouse_id: number
        }
        Insert: {
          company_id: number
          created_at?: string
          created_by: number
          original_document_id?: number | null
          pr_id?: number
          return_date: string
          return_number: string
          return_reason?: string | null
          return_time: string
          return_type?: string | null
          updated_at?: string
          updated_by?: number | null
          vendor_id: number
          warehouse_id: number
        }
        Update: {
          company_id?: number
          created_at?: string
          created_by?: number
          original_document_id?: number | null
          pr_id?: number
          return_date?: string
          return_number?: string
          return_reason?: string | null
          return_time?: string
          return_type?: string | null
          updated_at?: string
          updated_by?: number | null
          vendor_id?: number
          warehouse_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_returns_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "purchase_returns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "purchase_returns_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "purchase_returns_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["vendor_id"]
          },
          {
            foreignKeyName: "purchase_returns_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "v_stock_ledger"
            referencedColumns: ["warehouse_id"]
          },
          {
            foreignKeyName: "purchase_returns_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "v_stock_position"
            referencedColumns: ["warehouse_id"]
          },
          {
            foreignKeyName: "purchase_returns_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["warehouse_id"]
          },
        ]
      }
      roles: {
        Row: {
          approval_limits: Json | null
          company_id: number
          created_at: string
          data_access_level: Database["public"]["Enums"]["data_access_level"]
          is_active: boolean | null
          permissions: Json | null
          role_description: string | null
          role_id: number
          role_name: string
          updated_at: string
        }
        Insert: {
          approval_limits?: Json | null
          company_id: number
          created_at?: string
          data_access_level?: Database["public"]["Enums"]["data_access_level"]
          is_active?: boolean | null
          permissions?: Json | null
          role_description?: string | null
          role_id?: number
          role_name: string
          updated_at?: string
        }
        Update: {
          approval_limits?: Json | null
          company_id?: number
          created_at?: string
          data_access_level?: Database["public"]["Enums"]["data_access_level"]
          is_active?: boolean | null
          permissions?: Json | null
          role_description?: string | null
          role_id?: number
          role_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_id"]
          },
        ]
      }
      sales_invoice_details: {
        Row: {
          created_at: string
          discount_amount: number | null
          discount_percent: number | null
          hsn_code: string | null
          product_code: string | null
          product_description: string | null
          product_id: number
          product_name: string | null
          quantity: number
          rate: number
          sales_id: number
          sid_id: number
          tax_cgst_amount: number | null
          tax_cgst_percent: number | null
          tax_igst_amount: number | null
          tax_igst_percent: number | null
          tax_sgst_amount: number | null
          tax_sgst_percent: number | null
          taxable_amount: number
          total_amount: number
          uom_id: number
          updated_at: string
          variant_id: number | null
        }
        Insert: {
          created_at?: string
          discount_amount?: number | null
          discount_percent?: number | null
          hsn_code?: string | null
          product_code?: string | null
          product_description?: string | null
          product_id: number
          product_name?: string | null
          quantity: number
          rate: number
          sales_id: number
          sid_id?: number
          tax_cgst_amount?: number | null
          tax_cgst_percent?: number | null
          tax_igst_amount?: number | null
          tax_igst_percent?: number | null
          tax_sgst_amount?: number | null
          tax_sgst_percent?: number | null
          taxable_amount: number
          total_amount: number
          uom_id: number
          updated_at?: string
          variant_id?: number | null
        }
        Update: {
          created_at?: string
          discount_amount?: number | null
          discount_percent?: number | null
          hsn_code?: string | null
          product_code?: string | null
          product_description?: string | null
          product_id?: number
          product_name?: string | null
          quantity?: number
          rate?: number
          sales_id?: number
          sid_id?: number
          tax_cgst_amount?: number | null
          tax_cgst_percent?: number | null
          tax_igst_amount?: number | null
          tax_igst_percent?: number | null
          tax_sgst_amount?: number | null
          tax_sgst_percent?: number | null
          taxable_amount?: number
          total_amount?: number
          uom_id?: number
          updated_at?: string
          variant_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_invoice_details_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "sales_invoice_details_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_stock_position"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "sales_invoice_details_sales_id_fkey"
            columns: ["sales_id"]
            isOneToOne: false
            referencedRelation: "sales_invoices"
            referencedColumns: ["sales_id"]
          },
          {
            foreignKeyName: "sales_invoice_details_uom_id_fkey"
            columns: ["uom_id"]
            isOneToOne: false
            referencedRelation: "units_of_measure"
            referencedColumns: ["uom_id"]
          },
          {
            foreignKeyName: "sales_invoice_details_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["variant_id"]
          },
        ]
      }
      sales_invoices: {
        Row: {
          advance_received: number | null
          amount_in_words: string | null
          balance_amount: number | null
          billing_address: string | null
          cess_amount: number | null
          company_id: number
          created_at: string
          created_by: number
          credit_note_reference: string | null
          customer_gst_number: string | null
          customer_id: number
          discount_amount: number | null
          due_date: string | null
          freight_charges: number | null
          grand_total: number | null
          internal_notes: string | null
          invoice_date: string
          invoice_number: string
          invoice_time: string
          is_credit_note: boolean | null
          packing_charges: number | null
          payment_mode: Database["public"]["Enums"]["sales_payment_mode"]
          payment_status: Database["public"]["Enums"]["payment_status"]
          payment_terms: string | null
          place_of_supply: string | null
          reference_number: string | null
          round_off_amount: number | null
          sales_id: number
          salesperson_id: number | null
          shipping_address: string | null
          subtotal: number | null
          tax_cgst_amount: number | null
          tax_igst_amount: number | null
          tax_sgst_amount: number | null
          taxable_amount: number | null
          terms_conditions: string | null
          updated_at: string
          updated_by: number | null
          vehicle_number: string | null
          warehouse_id: number
        }
        Insert: {
          advance_received?: number | null
          amount_in_words?: string | null
          balance_amount?: number | null
          billing_address?: string | null
          cess_amount?: number | null
          company_id: number
          created_at?: string
          created_by: number
          credit_note_reference?: string | null
          customer_gst_number?: string | null
          customer_id: number
          discount_amount?: number | null
          due_date?: string | null
          freight_charges?: number | null
          grand_total?: number | null
          internal_notes?: string | null
          invoice_date: string
          invoice_number: string
          invoice_time: string
          is_credit_note?: boolean | null
          packing_charges?: number | null
          payment_mode?: Database["public"]["Enums"]["sales_payment_mode"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          payment_terms?: string | null
          place_of_supply?: string | null
          reference_number?: string | null
          round_off_amount?: number | null
          sales_id?: number
          salesperson_id?: number | null
          shipping_address?: string | null
          subtotal?: number | null
          tax_cgst_amount?: number | null
          tax_igst_amount?: number | null
          tax_sgst_amount?: number | null
          taxable_amount?: number | null
          terms_conditions?: string | null
          updated_at?: string
          updated_by?: number | null
          vehicle_number?: string | null
          warehouse_id: number
        }
        Update: {
          advance_received?: number | null
          amount_in_words?: string | null
          balance_amount?: number | null
          billing_address?: string | null
          cess_amount?: number | null
          company_id?: number
          created_at?: string
          created_by?: number
          credit_note_reference?: string | null
          customer_gst_number?: string | null
          customer_id?: number
          discount_amount?: number | null
          due_date?: string | null
          freight_charges?: number | null
          grand_total?: number | null
          internal_notes?: string | null
          invoice_date?: string
          invoice_number?: string
          invoice_time?: string
          is_credit_note?: boolean | null
          packing_charges?: number | null
          payment_mode?: Database["public"]["Enums"]["sales_payment_mode"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          payment_terms?: string | null
          place_of_supply?: string | null
          reference_number?: string | null
          round_off_amount?: number | null
          sales_id?: number
          salesperson_id?: number | null
          shipping_address?: string | null
          subtotal?: number | null
          tax_cgst_amount?: number | null
          tax_igst_amount?: number | null
          tax_sgst_amount?: number | null
          taxable_amount?: number | null
          terms_conditions?: string | null
          updated_at?: string
          updated_by?: number | null
          vehicle_number?: string | null
          warehouse_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "sales_invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "sales_invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "sales_invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_customer_revenue"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "sales_invoices_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "sales_invoices_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "sales_invoices_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "v_stock_ledger"
            referencedColumns: ["warehouse_id"]
          },
          {
            foreignKeyName: "sales_invoices_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "v_stock_position"
            referencedColumns: ["warehouse_id"]
          },
          {
            foreignKeyName: "sales_invoices_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["warehouse_id"]
          },
        ]
      }
      sales_return_details: {
        Row: {
          created_at: string
          discount_amount: number | null
          discount_percent: number | null
          hsn_code: string | null
          product_code: string | null
          product_description: string | null
          product_id: number
          product_name: string | null
          quantity_returned: number
          rate: number
          sales_return_id: number
          srd_id: number
          tax_cgst_amount: number | null
          tax_cgst_percent: number | null
          tax_igst_amount: number | null
          tax_igst_percent: number | null
          tax_sgst_amount: number | null
          tax_sgst_percent: number | null
          taxable_amount: number
          total_amount: number
          uom_id: number
          updated_at: string
          variant_id: number | null
        }
        Insert: {
          created_at?: string
          discount_amount?: number | null
          discount_percent?: number | null
          hsn_code?: string | null
          product_code?: string | null
          product_description?: string | null
          product_id: number
          product_name?: string | null
          quantity_returned: number
          rate: number
          sales_return_id: number
          srd_id?: number
          tax_cgst_amount?: number | null
          tax_cgst_percent?: number | null
          tax_igst_amount?: number | null
          tax_igst_percent?: number | null
          tax_sgst_amount?: number | null
          tax_sgst_percent?: number | null
          taxable_amount: number
          total_amount: number
          uom_id: number
          updated_at?: string
          variant_id?: number | null
        }
        Update: {
          created_at?: string
          discount_amount?: number | null
          discount_percent?: number | null
          hsn_code?: string | null
          product_code?: string | null
          product_description?: string | null
          product_id?: number
          product_name?: string | null
          quantity_returned?: number
          rate?: number
          sales_return_id?: number
          srd_id?: number
          tax_cgst_amount?: number | null
          tax_cgst_percent?: number | null
          tax_igst_amount?: number | null
          tax_igst_percent?: number | null
          tax_sgst_amount?: number | null
          tax_sgst_percent?: number | null
          taxable_amount?: number
          total_amount?: number
          uom_id?: number
          updated_at?: string
          variant_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_return_details_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "sales_return_details_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_stock_position"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "sales_return_details_sales_return_id_fkey"
            columns: ["sales_return_id"]
            isOneToOne: false
            referencedRelation: "sales_returns"
            referencedColumns: ["sales_return_id"]
          },
          {
            foreignKeyName: "sales_return_details_uom_id_fkey"
            columns: ["uom_id"]
            isOneToOne: false
            referencedRelation: "units_of_measure"
            referencedColumns: ["uom_id"]
          },
          {
            foreignKeyName: "sales_return_details_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["variant_id"]
          },
        ]
      }
      sales_returns: {
        Row: {
          cess_amount: number | null
          company_id: number
          created_at: string
          created_by: number
          customer_id: number
          discount_amount: number | null
          original_invoice_id: number
          refund_mode: Database["public"]["Enums"]["refund_mode"]
          return_authorization: string | null
          return_date: string
          return_number: string
          return_reason: string | null
          return_time: string
          sales_return_id: number
          subtotal: number | null
          tax_cgst_amount: number | null
          tax_igst_amount: number | null
          tax_sgst_amount: number | null
          taxable_amount: number | null
          total_amount: number | null
          updated_at: string
          updated_by: number | null
          warehouse_id: number
        }
        Insert: {
          cess_amount?: number | null
          company_id: number
          created_at?: string
          created_by: number
          customer_id: number
          discount_amount?: number | null
          original_invoice_id: number
          refund_mode?: Database["public"]["Enums"]["refund_mode"]
          return_authorization?: string | null
          return_date: string
          return_number: string
          return_reason?: string | null
          return_time: string
          sales_return_id?: number
          subtotal?: number | null
          tax_cgst_amount?: number | null
          tax_igst_amount?: number | null
          tax_sgst_amount?: number | null
          taxable_amount?: number | null
          total_amount?: number | null
          updated_at?: string
          updated_by?: number | null
          warehouse_id: number
        }
        Update: {
          cess_amount?: number | null
          company_id?: number
          created_at?: string
          created_by?: number
          customer_id?: number
          discount_amount?: number | null
          original_invoice_id?: number
          refund_mode?: Database["public"]["Enums"]["refund_mode"]
          return_authorization?: string | null
          return_date?: string
          return_number?: string
          return_reason?: string | null
          return_time?: string
          sales_return_id?: number
          subtotal?: number | null
          tax_cgst_amount?: number | null
          tax_igst_amount?: number | null
          tax_sgst_amount?: number | null
          taxable_amount?: number | null
          total_amount?: number | null
          updated_at?: string
          updated_by?: number | null
          warehouse_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_returns_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "sales_returns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "sales_returns_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "sales_returns_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_customer_revenue"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "sales_returns_original_invoice_id_fkey"
            columns: ["original_invoice_id"]
            isOneToOne: false
            referencedRelation: "sales_invoices"
            referencedColumns: ["sales_id"]
          },
          {
            foreignKeyName: "sales_returns_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "sales_returns_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "v_stock_ledger"
            referencedColumns: ["warehouse_id"]
          },
          {
            foreignKeyName: "sales_returns_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "v_stock_position"
            referencedColumns: ["warehouse_id"]
          },
          {
            foreignKeyName: "sales_returns_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["warehouse_id"]
          },
        ]
      }
      security_questions: {
        Row: {
          answer_hash: string
          created_at: string
          question_id: number
          question_text: string
          user_id: number
        }
        Insert: {
          answer_hash: string
          created_at?: string
          question_id?: number
          question_text: string
          user_id: number
        }
        Update: {
          answer_hash?: string
          created_at?: string
          question_id?: number
          question_text?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "security_questions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      sms_templates: {
        Row: {
          company_id: number
          created_at: string
          created_by: number
          is_active: boolean | null
          message_template: string
          sms_template_id: number
          template_name: string
          updated_at: string
        }
        Insert: {
          company_id: number
          created_at?: string
          created_by: number
          is_active?: boolean | null
          message_template: string
          sms_template_id?: number
          template_name: string
          updated_at?: string
        }
        Update: {
          company_id?: number
          created_at?: string
          created_by?: number
          is_active?: boolean | null
          message_template?: string
          sms_template_id?: number
          template_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sms_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "sms_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      stock_adjustment_details: {
        Row: {
          adjusted_quantity: number
          adjustment_id: number
          bin_id: number | null
          created_at: string
          previous_quantity: number
          product_id: number
          reason_for_adjustment: string | null
          sad_id: number
          uom_id: number
          updated_at: string
          variance_quantity: number | null
          variant_id: number | null
        }
        Insert: {
          adjusted_quantity: number
          adjustment_id: number
          bin_id?: number | null
          created_at?: string
          previous_quantity: number
          product_id: number
          reason_for_adjustment?: string | null
          sad_id?: number
          uom_id: number
          updated_at?: string
          variance_quantity?: number | null
          variant_id?: number | null
        }
        Update: {
          adjusted_quantity?: number
          adjustment_id?: number
          bin_id?: number | null
          created_at?: string
          previous_quantity?: number
          product_id?: number
          reason_for_adjustment?: string | null
          sad_id?: number
          uom_id?: number
          updated_at?: string
          variance_quantity?: number | null
          variant_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_adjustment_details_adjustment_id_fkey"
            columns: ["adjustment_id"]
            isOneToOne: false
            referencedRelation: "stock_adjustments"
            referencedColumns: ["adjustment_id"]
          },
          {
            foreignKeyName: "stock_adjustment_details_bin_id_fkey"
            columns: ["bin_id"]
            isOneToOne: false
            referencedRelation: "storage_bins"
            referencedColumns: ["bin_id"]
          },
          {
            foreignKeyName: "stock_adjustment_details_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "stock_adjustment_details_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_stock_position"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "stock_adjustment_details_uom_id_fkey"
            columns: ["uom_id"]
            isOneToOne: false
            referencedRelation: "units_of_measure"
            referencedColumns: ["uom_id"]
          },
          {
            foreignKeyName: "stock_adjustment_details_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["variant_id"]
          },
        ]
      }
      stock_adjustments: {
        Row: {
          adjustment_date: string
          adjustment_id: number
          adjustment_number: string
          adjustment_time: string
          adjustment_type: Database["public"]["Enums"]["adjustment_type"]
          approved_at: string | null
          approved_by: number | null
          company_id: number
          created_at: string
          created_by: number
          reason_code: string
          remarks: string | null
          status: Database["public"]["Enums"]["adjustment_status"]
          total_items_adjusted: number | null
          total_variance: number | null
          updated_at: string
          updated_by: number | null
          warehouse_id: number
        }
        Insert: {
          adjustment_date: string
          adjustment_id?: number
          adjustment_number: string
          adjustment_time: string
          adjustment_type: Database["public"]["Enums"]["adjustment_type"]
          approved_at?: string | null
          approved_by?: number | null
          company_id: number
          created_at?: string
          created_by: number
          reason_code: string
          remarks?: string | null
          status?: Database["public"]["Enums"]["adjustment_status"]
          total_items_adjusted?: number | null
          total_variance?: number | null
          updated_at?: string
          updated_by?: number | null
          warehouse_id: number
        }
        Update: {
          adjustment_date?: string
          adjustment_id?: number
          adjustment_number?: string
          adjustment_time?: string
          adjustment_type?: Database["public"]["Enums"]["adjustment_type"]
          approved_at?: string | null
          approved_by?: number | null
          company_id?: number
          created_at?: string
          created_by?: number
          reason_code?: string
          remarks?: string | null
          status?: Database["public"]["Enums"]["adjustment_status"]
          total_items_adjusted?: number | null
          total_variance?: number | null
          updated_at?: string
          updated_by?: number | null
          warehouse_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "stock_adjustments_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "stock_adjustments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "stock_adjustments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "stock_adjustments_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "stock_adjustments_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "v_stock_ledger"
            referencedColumns: ["warehouse_id"]
          },
          {
            foreignKeyName: "stock_adjustments_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "v_stock_position"
            referencedColumns: ["warehouse_id"]
          },
          {
            foreignKeyName: "stock_adjustments_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["warehouse_id"]
          },
        ]
      }
      storage_bins: {
        Row: {
          bin_code: string
          bin_id: number
          bin_status: Database["public"]["Enums"]["bin_status"]
          bin_type: Database["public"]["Enums"]["bin_type"]
          capacity_volume: number | null
          capacity_weight: number | null
          created_at: string
          current_volume: number | null
          current_weight: number | null
          is_active: boolean | null
          location_coordinates: string | null
          updated_at: string
          zone_id: number
        }
        Insert: {
          bin_code: string
          bin_id?: number
          bin_status?: Database["public"]["Enums"]["bin_status"]
          bin_type?: Database["public"]["Enums"]["bin_type"]
          capacity_volume?: number | null
          capacity_weight?: number | null
          created_at?: string
          current_volume?: number | null
          current_weight?: number | null
          is_active?: boolean | null
          location_coordinates?: string | null
          updated_at?: string
          zone_id: number
        }
        Update: {
          bin_code?: string
          bin_id?: number
          bin_status?: Database["public"]["Enums"]["bin_status"]
          bin_type?: Database["public"]["Enums"]["bin_type"]
          capacity_volume?: number | null
          capacity_weight?: number | null
          created_at?: string
          current_volume?: number | null
          current_weight?: number | null
          is_active?: boolean | null
          location_coordinates?: string | null
          updated_at?: string
          zone_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "storage_bins_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "warehouse_zones"
            referencedColumns: ["zone_id"]
          },
        ]
      }
      system_settings: {
        Row: {
          company_id: number
          created_at: string
          data_type: Database["public"]["Enums"]["settings_data_type"]
          description: string | null
          is_active: boolean | null
          setting_id: number
          setting_key: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          company_id: number
          created_at?: string
          data_type: Database["public"]["Enums"]["settings_data_type"]
          description?: string | null
          is_active?: boolean | null
          setting_id?: number
          setting_key: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          company_id?: number
          created_at?: string
          data_type?: Database["public"]["Enums"]["settings_data_type"]
          description?: string | null
          is_active?: boolean | null
          setting_id?: number
          setting_key?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_id"]
          },
        ]
      }
      tax_configurations: {
        Row: {
          company_id: number
          created_at: string
          effective_from: string
          effective_to: string | null
          hsn_code_range: string | null
          is_active: boolean | null
          tax_config_id: number
          tax_name: string
          tax_rate: number
          tax_type: string
          updated_at: string
        }
        Insert: {
          company_id: number
          created_at?: string
          effective_from: string
          effective_to?: string | null
          hsn_code_range?: string | null
          is_active?: boolean | null
          tax_config_id?: number
          tax_name: string
          tax_rate: number
          tax_type: string
          updated_at?: string
        }
        Update: {
          company_id?: number
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          hsn_code_range?: string | null
          is_active?: boolean | null
          tax_config_id?: number
          tax_name?: string
          tax_rate?: number
          tax_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tax_configurations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_id"]
          },
        ]
      }
      units_of_measure: {
        Row: {
          base_unit_conversion: number | null
          company_id: number
          created_at: string
          is_active: boolean | null
          is_base_unit: boolean | null
          uom_code: string
          uom_id: number
          uom_name: string
          uom_type: string
        }
        Insert: {
          base_unit_conversion?: number | null
          company_id: number
          created_at?: string
          is_active?: boolean | null
          is_base_unit?: boolean | null
          uom_code: string
          uom_id?: number
          uom_name: string
          uom_type: string
        }
        Update: {
          base_unit_conversion?: number | null
          company_id?: number
          created_at?: string
          is_active?: boolean | null
          is_base_unit?: boolean | null
          uom_code?: string
          uom_id?: number
          uom_name?: string
          uom_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_of_measure_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          expires_at: string
          ip_address: string | null
          is_active: boolean | null
          last_activity: string
          login_at: string
          session_id: string
          user_agent: string | null
          user_id: number
        }
        Insert: {
          expires_at: string
          ip_address?: string | null
          is_active?: boolean | null
          last_activity?: string
          login_at?: string
          session_id: string
          user_agent?: string | null
          user_id: number
        }
        Update: {
          expires_at?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_activity?: string
          login_at?: string
          session_id?: string
          user_agent?: string | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      users: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          branch_id: number | null
          city: string | null
          commission_structure: Json | null
          company_id: number
          created_at: string
          date_of_birth: string | null
          date_of_joining: string | null
          department: string | null
          designation: string | null
          email: string
          email_verified: boolean | null
          employee_code: string | null
          failed_login_attempts: number | null
          full_name: string
          ip_restrictions: string | null
          is_active: boolean | null
          is_locked: boolean | null
          language_preference: string | null
          last_login_at: string | null
          login_time_restrictions: Json | null
          notification_preferences: Json | null
          password_changed_at: string
          password_hash: string
          phone: string | null
          photo_path: string | null
          pin_code: string | null
          reporting_manager_id: number | null
          role_id: number
          state: string | null
          target_assignment: Json | null
          two_factor_enabled: boolean | null
          two_factor_secret: string | null
          updated_at: string
          user_id: number
          username: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          branch_id?: number | null
          city?: string | null
          commission_structure?: Json | null
          company_id: number
          created_at?: string
          date_of_birth?: string | null
          date_of_joining?: string | null
          department?: string | null
          designation?: string | null
          email: string
          email_verified?: boolean | null
          employee_code?: string | null
          failed_login_attempts?: number | null
          full_name: string
          ip_restrictions?: string | null
          is_active?: boolean | null
          is_locked?: boolean | null
          language_preference?: string | null
          last_login_at?: string | null
          login_time_restrictions?: Json | null
          notification_preferences?: Json | null
          password_changed_at?: string
          password_hash: string
          phone?: string | null
          photo_path?: string | null
          pin_code?: string | null
          reporting_manager_id?: number | null
          role_id: number
          state?: string | null
          target_assignment?: Json | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string
          user_id?: number
          username: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          branch_id?: number | null
          city?: string | null
          commission_structure?: Json | null
          company_id?: number
          created_at?: string
          date_of_birth?: string | null
          date_of_joining?: string | null
          department?: string | null
          designation?: string | null
          email?: string
          email_verified?: boolean | null
          employee_code?: string | null
          failed_login_attempts?: number | null
          full_name?: string
          ip_restrictions?: string | null
          is_active?: boolean | null
          is_locked?: boolean | null
          language_preference?: string | null
          last_login_at?: string | null
          login_time_restrictions?: Json | null
          notification_preferences?: Json | null
          password_changed_at?: string
          password_hash?: string
          phone?: string | null
          photo_path?: string | null
          pin_code?: string | null
          reporting_manager_id?: number | null
          role_id?: number
          state?: string | null
          target_assignment?: Json | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string
          user_id?: number
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "users_reporting_manager_id_fkey"
            columns: ["reporting_manager_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "users_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["role_id"]
          },
        ]
      }
      vendor_payments: {
        Row: {
          amount_paid: number
          balance_outstanding: number | null
          bank_account: string | null
          company_id: number
          created_at: string
          created_by: number
          currency: string | null
          discount_taken: number | null
          exchange_rate: number | null
          invoice_allocation: Json | null
          net_amount: number | null
          payment_date: string
          payment_id: number
          payment_mode: string
          payment_number: string
          reference_number: string | null
          tds_deduction: number | null
          updated_at: string
          updated_by: number | null
          vendor_id: number
        }
        Insert: {
          amount_paid: number
          balance_outstanding?: number | null
          bank_account?: string | null
          company_id: number
          created_at?: string
          created_by: number
          currency?: string | null
          discount_taken?: number | null
          exchange_rate?: number | null
          invoice_allocation?: Json | null
          net_amount?: number | null
          payment_date: string
          payment_id?: number
          payment_mode: string
          payment_number: string
          reference_number?: string | null
          tds_deduction?: number | null
          updated_at?: string
          updated_by?: number | null
          vendor_id: number
        }
        Update: {
          amount_paid?: number
          balance_outstanding?: number | null
          bank_account?: string | null
          company_id?: number
          created_at?: string
          created_by?: number
          currency?: string | null
          discount_taken?: number | null
          exchange_rate?: number | null
          invoice_allocation?: Json | null
          net_amount?: number | null
          payment_date?: string
          payment_id?: number
          payment_mode?: string
          payment_number?: string
          reference_number?: string | null
          tds_deduction?: number | null
          updated_at?: string
          updated_by?: number | null
          vendor_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "vendor_payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "vendor_payments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "vendor_payments_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "vendor_payments_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["vendor_id"]
          },
        ]
      }
      vendors: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          advance_payment_required: boolean | null
          bank_account_number: string | null
          bank_address: string | null
          bank_ifsc: string | null
          bank_name: string | null
          business_license_number: string | null
          city: string | null
          company_id: number
          contact_person: string | null
          country: string | null
          created_at: string
          created_by: number | null
          credit_period: number | null
          currency: string | null
          delivery_rating: number | null
          email: string | null
          gst_number: string | null
          import_export_license: string | null
          is_active: boolean | null
          is_blacklisted: boolean | null
          is_preferred: boolean | null
          overall_rating: number | null
          pan_number: string | null
          payment_terms: string | null
          pin_code: string | null
          primary_phone: string | null
          quality_certifications: string | null
          quality_rating: number | null
          registration_date: string | null
          secondary_phone: string | null
          service_rating: number | null
          special_instructions: string | null
          state: string | null
          tcs_applicable: boolean | null
          tds_category: string | null
          updated_at: string
          updated_by: number | null
          vendor_category: string | null
          vendor_code: string
          vendor_id: number
          vendor_name: string
          vendor_type: Database["public"]["Enums"]["vendor_type"] | null
          website: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          advance_payment_required?: boolean | null
          bank_account_number?: string | null
          bank_address?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          business_license_number?: string | null
          city?: string | null
          company_id: number
          contact_person?: string | null
          country?: string | null
          created_at?: string
          created_by?: number | null
          credit_period?: number | null
          currency?: string | null
          delivery_rating?: number | null
          email?: string | null
          gst_number?: string | null
          import_export_license?: string | null
          is_active?: boolean | null
          is_blacklisted?: boolean | null
          is_preferred?: boolean | null
          overall_rating?: number | null
          pan_number?: string | null
          payment_terms?: string | null
          pin_code?: string | null
          primary_phone?: string | null
          quality_certifications?: string | null
          quality_rating?: number | null
          registration_date?: string | null
          secondary_phone?: string | null
          service_rating?: number | null
          special_instructions?: string | null
          state?: string | null
          tcs_applicable?: boolean | null
          tds_category?: string | null
          updated_at?: string
          updated_by?: number | null
          vendor_category?: string | null
          vendor_code: string
          vendor_id?: number
          vendor_name: string
          vendor_type?: Database["public"]["Enums"]["vendor_type"] | null
          website?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          advance_payment_required?: boolean | null
          bank_account_number?: string | null
          bank_address?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          business_license_number?: string | null
          city?: string | null
          company_id?: number
          contact_person?: string | null
          country?: string | null
          created_at?: string
          created_by?: number | null
          credit_period?: number | null
          currency?: string | null
          delivery_rating?: number | null
          email?: string | null
          gst_number?: string | null
          import_export_license?: string | null
          is_active?: boolean | null
          is_blacklisted?: boolean | null
          is_preferred?: boolean | null
          overall_rating?: number | null
          pan_number?: string | null
          payment_terms?: string | null
          pin_code?: string | null
          primary_phone?: string | null
          quality_certifications?: string | null
          quality_rating?: number | null
          registration_date?: string | null
          secondary_phone?: string | null
          service_rating?: number | null
          special_instructions?: string | null
          state?: string | null
          tcs_applicable?: boolean | null
          tds_category?: string | null
          updated_at?: string
          updated_by?: number | null
          vendor_category?: string | null
          vendor_code?: string
          vendor_id?: number
          vendor_name?: string
          vendor_type?: Database["public"]["Enums"]["vendor_type"] | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "vendors_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "vendors_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      warehouse_zones: {
        Row: {
          created_at: string
          is_active: boolean | null
          special_handling_requirements: string | null
          temperature_max: number | null
          temperature_min: number | null
          warehouse_id: number
          zone_code: string
          zone_id: number
          zone_name: string
          zone_type: Database["public"]["Enums"]["zone_type"]
        }
        Insert: {
          created_at?: string
          is_active?: boolean | null
          special_handling_requirements?: string | null
          temperature_max?: number | null
          temperature_min?: number | null
          warehouse_id: number
          zone_code: string
          zone_id?: number
          zone_name: string
          zone_type: Database["public"]["Enums"]["zone_type"]
        }
        Update: {
          created_at?: string
          is_active?: boolean | null
          special_handling_requirements?: string | null
          temperature_max?: number | null
          temperature_min?: number | null
          warehouse_id?: number
          zone_code?: string
          zone_id?: number
          zone_name?: string
          zone_type?: Database["public"]["Enums"]["zone_type"]
        }
        Relationships: [
          {
            foreignKeyName: "warehouse_zones_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "v_stock_ledger"
            referencedColumns: ["warehouse_id"]
          },
          {
            foreignKeyName: "warehouse_zones_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "v_stock_position"
            referencedColumns: ["warehouse_id"]
          },
          {
            foreignKeyName: "warehouse_zones_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["warehouse_id"]
          },
        ]
      }
      warehouses: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          branch_id: number | null
          city: string | null
          company_id: number
          created_at: string
          email: string | null
          is_active: boolean | null
          manager_contact: string | null
          manager_name: string | null
          operating_hours_end: string | null
          operating_hours_start: string | null
          phone: string | null
          pin_code: string | null
          security_features: string | null
          state: string | null
          temperature_controlled: boolean | null
          total_area: number | null
          updated_at: string
          warehouse_code: string
          warehouse_id: number
          warehouse_name: string
          warehouse_type: Database["public"]["Enums"]["warehouse_type"]
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          branch_id?: number | null
          city?: string | null
          company_id: number
          created_at?: string
          email?: string | null
          is_active?: boolean | null
          manager_contact?: string | null
          manager_name?: string | null
          operating_hours_end?: string | null
          operating_hours_start?: string | null
          phone?: string | null
          pin_code?: string | null
          security_features?: string | null
          state?: string | null
          temperature_controlled?: boolean | null
          total_area?: number | null
          updated_at?: string
          warehouse_code: string
          warehouse_id?: number
          warehouse_name: string
          warehouse_type?: Database["public"]["Enums"]["warehouse_type"]
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          branch_id?: number | null
          city?: string | null
          company_id?: number
          created_at?: string
          email?: string | null
          is_active?: boolean | null
          manager_contact?: string | null
          manager_name?: string | null
          operating_hours_end?: string | null
          operating_hours_start?: string | null
          phone?: string | null
          pin_code?: string | null
          security_features?: string | null
          state?: string | null
          temperature_controlled?: boolean | null
          total_area?: number | null
          updated_at?: string
          warehouse_code?: string
          warehouse_id?: number
          warehouse_name?: string
          warehouse_type?: Database["public"]["Enums"]["warehouse_type"]
        }
        Relationships: [
          {
            foreignKeyName: "warehouses_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "warehouses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["company_id"]
          },
        ]
      }
    }
    Views: {
      v_customer_revenue: {
        Row: {
          customer_id: number | null
          customer_name: string | null
          number_of_invoices: number | null
          total_revenue: number | null
        }
        Relationships: []
      }
      v_daily_sales_summary: {
        Row: {
          date: string | null
          total_invoices: number | null
          total_po_count: number | null
          total_purchase_amount: number | null
          total_sales_amount: number | null
        }
        Relationships: []
      }
      v_stock_ledger: {
        Row: {
          new_stock: number | null
          performed_by: number | null
          previous_stock: number | null
          product_code: string | null
          product_id: number | null
          product_name: string | null
          quantity: number | null
          total_cost: number | null
          txn_date: string | null
          txn_number: string | null
          txn_time: string | null
          txn_type: Database["public"]["Enums"]["txn_type"] | null
          uom_code: string | null
          uom_id: number | null
          warehouse_id: number | null
          warehouse_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transaction_details_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "inventory_transaction_details_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_stock_position"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "inventory_transaction_details_uom_id_fkey"
            columns: ["uom_id"]
            isOneToOne: false
            referencedRelation: "units_of_measure"
            referencedColumns: ["uom_id"]
          },
          {
            foreignKeyName: "inventory_transactions_created_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      v_stock_position: {
        Row: {
          current_stock: number | null
          product_code: string | null
          product_id: number | null
          product_name: string | null
          stock_value: number | null
          unit_price: number | null
          warehouse_id: number | null
          warehouse_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      account_type: "asset" | "liability" | "equity" | "income" | "expense"
      adjustment_status: "draft" | "approved" | "completed" | "cancelled"
      adjustment_type: "increase" | "decrease"
      age_group_type: "adult" | "kids" | "infant"
      approval_status: "pending" | "approved" | "rejected"
      audit_action: "INSERT" | "UPDATE" | "DELETE"
      backup_type: "full" | "partial"
      balance_type: "debit" | "credit"
      bin_status: "available" | "occupied" | "damaged" | "maintenance"
      bin_type: "small" | "medium" | "large" | "bulk"
      business_type: "retail" | "wholesale" | "manufacturing" | "distribution"
      communication_method: "email" | "sms" | "whatsapp" | "phone"
      count_method: "full" | "partial" | "abc"
      count_status: "scheduled" | "in_progress" | "completed" | "adjusted"
      count_type: "full" | "partial" | "cycle"
      customer_type: "individual" | "company"
      data_access_level: "own" | "department" | "branch" | "all"
      file_format: "xlsx" | "csv" | "pdf"
      financial_module:
        | "purchase"
        | "sales"
        | "payment"
        | "receipt"
        | "adjustment"
        | "journal"
      gender_type: "men" | "women" | "kids" | "unisex"
      grn_status: "draft" | "completed" | "cancelled"
      ie_status: "pending" | "completed" | "failed"
      integration_type: "api_key" | "webhook"
      operation_type: "import" | "export"
      payment_status: "unpaid" | "partial" | "paid"
      po_line_status:
        | "pending"
        | "partially_received"
        | "fully_received"
        | "closed"
      po_status:
        | "draft"
        | "pending_approval"
        | "approved"
        | "sent_to_vendor"
        | "partially_received"
        | "fully_received"
        | "closed"
        | "cancelled"
      product_type: "finished" | "raw_material" | "service" | "consumable"
      quality_status: "accepted" | "rejected" | "partial"
      refund_mode: "cash" | "bank" | "credit_note"
      restore_status: "pending" | "in_progress" | "completed" | "failed"
      sales_payment_mode: "cash" | "bank" | "cheque" | "online" | "credit"
      season_type: "summer" | "winter" | "monsoon" | "all_season"
      settings_data_type:
        | "string"
        | "integer"
        | "decimal"
        | "boolean"
        | "json"
        | "date"
        | "time"
      txn_type:
        | "purchase_in"
        | "purchase_return_in"
        | "sale_out"
        | "sale_return_in"
        | "transfer_in"
        | "transfer_out"
        | "adjustment_in"
        | "adjustment_out"
        | "physical_count"
      vendor_type: "local" | "import" | "service"
      warehouse_type: "main" | "transit" | "virtual"
      zone_type: "receiving" | "storage" | "picking" | "dispatch" | "quarantine"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_type: ["asset", "liability", "equity", "income", "expense"],
      adjustment_status: ["draft", "approved", "completed", "cancelled"],
      adjustment_type: ["increase", "decrease"],
      age_group_type: ["adult", "kids", "infant"],
      approval_status: ["pending", "approved", "rejected"],
      audit_action: ["INSERT", "UPDATE", "DELETE"],
      backup_type: ["full", "partial"],
      balance_type: ["debit", "credit"],
      bin_status: ["available", "occupied", "damaged", "maintenance"],
      bin_type: ["small", "medium", "large", "bulk"],
      business_type: ["retail", "wholesale", "manufacturing", "distribution"],
      communication_method: ["email", "sms", "whatsapp", "phone"],
      count_method: ["full", "partial", "abc"],
      count_status: ["scheduled", "in_progress", "completed", "adjusted"],
      count_type: ["full", "partial", "cycle"],
      customer_type: ["individual", "company"],
      data_access_level: ["own", "department", "branch", "all"],
      file_format: ["xlsx", "csv", "pdf"],
      financial_module: [
        "purchase",
        "sales",
        "payment",
        "receipt",
        "adjustment",
        "journal",
      ],
      gender_type: ["men", "women", "kids", "unisex"],
      grn_status: ["draft", "completed", "cancelled"],
      ie_status: ["pending", "completed", "failed"],
      integration_type: ["api_key", "webhook"],
      operation_type: ["import", "export"],
      payment_status: ["unpaid", "partial", "paid"],
      po_line_status: [
        "pending",
        "partially_received",
        "fully_received",
        "closed",
      ],
      po_status: [
        "draft",
        "pending_approval",
        "approved",
        "sent_to_vendor",
        "partially_received",
        "fully_received",
        "closed",
        "cancelled",
      ],
      product_type: ["finished", "raw_material", "service", "consumable"],
      quality_status: ["accepted", "rejected", "partial"],
      refund_mode: ["cash", "bank", "credit_note"],
      restore_status: ["pending", "in_progress", "completed", "failed"],
      sales_payment_mode: ["cash", "bank", "cheque", "online", "credit"],
      season_type: ["summer", "winter", "monsoon", "all_season"],
      settings_data_type: [
        "string",
        "integer",
        "decimal",
        "boolean",
        "json",
        "date",
        "time",
      ],
      txn_type: [
        "purchase_in",
        "purchase_return_in",
        "sale_out",
        "sale_return_in",
        "transfer_in",
        "transfer_out",
        "adjustment_in",
        "adjustment_out",
        "physical_count",
      ],
      vendor_type: ["local", "import", "service"],
      warehouse_type: ["main", "transit", "virtual"],
      zone_type: ["receiving", "storage", "picking", "dispatch", "quarantine"],
    },
  },
} as const
