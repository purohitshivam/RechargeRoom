'use client';

import React from 'react';
import { CustomerType } from '@/types';
import { cn } from '@/lib/utils';

export interface CustomerFormData {
  name: string;
  phone: string;
  email: string;
  customerType: CustomerType;
}

interface CustomerFormProps {
  data: CustomerFormData;
  onChange: (field: keyof CustomerFormData, value: any) => void;
  errors: Record<string, string>;
}

export function CustomerForm({ data, onChange, errors }: CustomerFormProps) {
  return (
    <div className="w-full">
      <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-3">
        3. Your Information
      </label>

      <div className="bg-white border border-neutral-200 p-5 sm:p-7 space-y-5">
        {/* Customer Type Segmented Switcher */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-neutral-700 mb-2">
            I am an MU: <span className="text-neutral-900 font-semibold">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['student', 'employee'] as CustomerType[]).map((type) => {
              const isSelected = data.customerType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => onChange('customerType', type)}
                  className={cn(
                    'h-11 border text-xs sm:text-sm font-medium uppercase tracking-wider transition-all min-h-[44px]',
                    isSelected
                      ? 'bg-neutral-950 text-white border-neutral-950 shadow-sm'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                  )}
                >
                  {type === 'student' ? 'Student' : 'Employee / Staff'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Full Name - Mandatory */}
        <div>
          <label
            htmlFor="name"
            className="block text-xs font-mono uppercase tracking-wider text-neutral-700 mb-1.5"
          >
            Full Name <span className="text-neutral-900 font-bold">*</span>
          </label>
          <input
            id="name"
            type="text"
            required
            value={data.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="e.g. Aarav Sharma"
            className={cn(
              'w-full h-11 px-3.5 bg-white border text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-950 min-h-[44px]',
              errors.name ? 'border-red-500' : 'border-neutral-300'
            )}
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>

        {/* Mobile Number - Mandatory */}
        <div>
          <label
            htmlFor="phone"
            className="block text-xs font-mono uppercase tracking-wider text-neutral-700 mb-1.5"
          >
            Mobile Number <span className="text-neutral-900 font-bold">*</span>
          </label>
          <div className="relative">
            <input
              id="phone"
              type="tel"
              required
              value={data.phone}
              onChange={(e) => onChange('phone', e.target.value)}
              placeholder="10-digit number (e.g. 9876543210)"
              className={cn(
                'w-full h-11 px-3.5 bg-white border text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-950 min-h-[44px]',
                errors.phone ? 'border-red-500' : 'border-neutral-300'
              )}
            />
          </div>
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
        </div>

        {/* Email Address - Optional */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-mono uppercase tracking-wider text-neutral-700 mb-1.5"
          >
            Email Address <span className="text-neutral-400 font-sans text-[11px]">(Optional)</span>
          </label>
          <input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="e.g. name@college.edu (optional for confirmation link)"
            className={cn(
              'w-full h-11 px-3.5 bg-white border text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-950 min-h-[44px]',
              errors.email ? 'border-red-500' : 'border-neutral-300'
            )}
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>
      </div>
    </div>
  );
}
