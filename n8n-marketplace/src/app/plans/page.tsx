"use client";

import React from 'react';
import Link from 'next/link';
import { Check, X } from 'lucide-react';

export default function PlansPage() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Perfect for getting started with n8n automation.',
      features: [
        'Access to community workflows',
        'Basic support',
        '5 downloads per day',
        'Community access',
      ],
      notIncluded: [
        'Premium workflows',
        'Priority support',
        'Workflow requests',
      ],
      cta: 'Current Plan',
      ctaLink: '#',
      popular: false,
    },
    {
      name: 'Pro',
      price: '$29',
      period: '/month',
      description: 'For power users who need advanced automations.',
      features: [
        'Access to ALL workflows',
        'Premium workflows included',
        'Unlimited downloads',
        'Priority support',
        'Request custom workflows',
      ],
      notIncluded: [],
      cta: 'Upgrade to Pro',
      ctaLink: '/checkout/pro',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For teams and organizations scaling automation.',
      features: [
        'Everything in Pro',
        'Dedicated account manager',
        'Custom workflow development',
        'SLA support',
        'Team management',
      ],
      notIncluded: [],
      cta: 'Contact Sales',
      ctaLink: '/contact',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f11] py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-400">Unlock the full potential of n8n automation with our premium plans.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
              className={`relative bg-[#1c1c21] rounded-2xl p-8 border ${
                plan.popular ? 'border-blue-500 shadow-2xl shadow-blue-900/20' : 'border-gray-800'
              } flex flex-col`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-sm font-bold px-4 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400 ml-1">{plan.period}</span>
                </div>
                <p className="text-gray-400 text-sm">{plan.description}</p>
              </div>

              <div className="flex-grow space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
                {plan.notIncluded.map((feature) => (
                  <div key={feature} className="flex items-start opacity-50">
                    <X className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-500 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Link
                href={plan.ctaLink}
                className={`w-full py-3 px-4 rounded-xl font-medium text-center transition-colors ${
                  plan.popular
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-gray-800 hover:bg-gray-700 text-white'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
