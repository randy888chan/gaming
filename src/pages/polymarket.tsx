import React from "react";
import MarketList from "@/components/polymarket/MarketList";
import { NextSeo } from "next-seo";
import dynamic from "next/dynamic";

const PolymarketPageComponent = () => {
  return (
    <>
      <NextSeo
        title="Polymarket Prediction Markets"
        description="Browse and view active prediction markets from Polymarket."
      />
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Prediction Markets</h1>
        <MarketList />
      </div>
    </>
  );
};

export default dynamic(() => Promise.resolve(PolymarketPageComponent), { ssr: false });
