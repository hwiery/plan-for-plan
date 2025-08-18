'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function BillingPage() {
  const { data: session, status } = useSession();
  const [usage, setUsage] = useState(0);
  const [planType, setPlanType] = useState('free');
  const [isLoading, setIsLoading] = useState(true);
  const FREE_PLAN_LIMIT = 10000; // Should match the limit in middleware

  useEffect(() => {
    if (session) {
      const fetchUsage = async () => {
        try {
          const res = await fetch('/api/user/usage');
          if (res.ok) {
            const data = await res.json();
            setUsage(data.totalTokens);
            setPlanType(data.planType);
          } else {
            console.error('Failed to fetch usage data');
          }
        } catch (error) {
          console.error('Error fetching usage data:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchUsage();
    }
  }, [session]);

  if (isLoading || status === 'loading') {
    return <div>Loading billing information...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Billing & Usage</h1>
      <div className="bg-white p-8 rounded-lg shadow-md space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Your Plan</h2>
          <p className="text-lg">Current Plan: <span className="font-bold capitalize">{planType}</span></p>
          {planType === 'free' && (
            <p className="text-gray-600">Free plan includes up to {FREE_PLAN_LIMIT} tokens.</p>
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">API Usage</h2>
          <p className="text-lg">Total Tokens Used: <span className="font-bold">{usage}</span></p>
          {planType === 'free' && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div 
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${(usage / FREE_PLAN_LIMIT) * 100}%` }}
              ></div>
            </div>
          )}
          {usage >= FREE_PLAN_LIMIT && planType === 'free' && (
            <p className="text-red-600 mt-2">You have exceeded your free plan limit. Please upgrade to continue using the service.</p>
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Upgrade Your Plan</h2>
          <p className="text-gray-600 mb-4">Unlock more features and higher usage limits by upgrading your plan.</p>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
}
