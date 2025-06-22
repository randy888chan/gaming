import React from 'react';
import MarketList from '@/components/polymarket/MarketList';
import { NextPage } from 'next';
import { NextSeo } from 'next-seo';

const PolymarketPage: NextPage = () => {
  return (
    <>
      <NextSeo
        title="Polymarket Prediction Markets"
        description="Browse and view active prediction markets from Polymarket."
        // Add other SEO props as needed
      />
      <div className="py-8">
        <MarketList />
      </div>
    </>
  );
};

export default PolymarketPage;
