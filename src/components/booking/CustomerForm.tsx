'use client';

import React from 'react';
import { CustomerType } from '@/types';
import { cn } from '@/lib/utils';

interface CustomerFormData {
  name: string;
  phone: string;
  email: string;
  customerType: CustomerType;
  organizationUnit: string;
  notes: string;
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
            I am an MU: <span className="text-neutral-500 font-sans">*</span>
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
                      ? 'bg-neutral-950 text-white border-neutral-950'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                  )}
                >
                  {type === 'student' ? 'Student' : 'Employee / Staff'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-xs font-mono uppercase tracking-wider text-neutral-700 mb-1.5"
          >
            Full Name <span className="text-neutral-500">*</span>
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

        {/* Mobile Number & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="phone"
              className="block text-xs font-mono uppercase tracking-wider text-neutral-700 mb-1.5"
            >
              Mobile Number <span className="text-neutral-500">*</span>
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

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-mono uppercase tracking-wider text-neutral-700 mb-1.5"
            >
              Email Address <span className="text-neutral-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              value={data.email}
              onChange={(e) => onChange('email', e.target.value)}
              placeholder="e.g. name@college.edu"
              className={cn(
                'w-full h-11 px-3.5 bg-white border text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-950 min-h-[44px]',
                errors.email ? 'border-red-500' : 'border-neutral-300'
              )}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>
        </div>

        {/* College / Department */}
        <div>
          <label
            htmlFor="organizationUnit"
            className="block text-xs font-mono uppercase tracking-wider text-neutral-700 mb-1.5"
          >
            {data.customerType === 'student' ? 'College / Department / Major' : 'Department / Workplace Unit'}{' '}
            <span className="text-neutral-500">*</span>
          </label>
          <input
            id="organizationUnit"
            type="text"
            required
            value={data.organizationUnit}
            onChange={(e) => onChange('organizationUnit', e.target.value)}
            placeholder={
              data.customerType === 'student'
                ? 'e.g. School of Engineering / Computer Science'
                : 'e.g. Finance & Administration / Library'
            }
            className={cn(
              'w-full h-11 px-3.5 bg-white border text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-950 min-h-[44px]',
              errors.organizationUnit ? 'border-red-500' : 'border-neutral-300'
            )}
          />
          {errors.organizationUnit && (
            <p className="mt-1 text-xs text-red-600">{errors.organizationUnit}</p>
          )}
        </div>

        {/* Optional Note */}
        <div>
          <label
            htmlFor="notes"
            className="block text-xs font-mono uppercase tracking-wider text-neutral-700 mb-1.5"
          >
            Note for Practitioner <span className="text-neutral-400 font-sans">(Optional)</span>
          </label>
          <textarea
            id="notes"
            rows={2}
            value={data.notes}
            onChange={(e) => onChange('notes', e.target.value)}
            placeholder="e.g. Prefer firmer pressure on upper shoulder; or running in from Lab 3"
            className="w-full p-3 bg-white border border-neutral-300 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-950"
          />
          <p className="mt-1 text-[11px] text-neutral-500">
            For session logistics or pressure preference only. Not for medical diagnosis or pain management.
          </p>
        </div>
      </div>
    </div>
  );
}
