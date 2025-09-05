"use client";

import React, { useState, useEffect } from "react";
import { useAccount } from "@particle-network/connectkit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Copy, Share2 } from "lucide-react";

const ProfilePage: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [referralLink, setReferralLink] = useState<string>("");
  const [referralStats, setReferralStats] = useState<any>(null);
  const [referredUsers, setReferredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isConnected && address) {
      // Generate referral link
      const link = `${window.location.origin}?ref=${address}`;
      setReferralLink(link);
      
      // Fetch referral stats
      fetchReferralStats();
      
      // Fetch referred users
      fetchReferredUsers();
    }
  }, [isConnected, address]);

  const fetchReferralStats = async () => {
    try {
      const response = await fetch("/api/v1/referrals");
      const data = await response.json();
      
      if (data.success) {
        setReferralStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching referral stats:", error);
    }
  };

  const fetchReferredUsers = async () => {
    try {
      const response = await fetch("/api/v1/referrals/referred-users");
      const data = await response.json();
      
      if (data.success) {
        setReferredUsers(data.referredUsers);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching referred users:", error);
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied to clipboard!");
  };

  const shareReferralLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me on Gamba Play!",
          text: "Use my referral link to get started:",
          url: referralLink,
        });
      } catch (error) {
        console.error("Error sharing:", error);
        copyReferralLink();
      }
    } else {
      copyReferralLink();
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Please connect your wallet</h2>
            <p className="text-gray-600">
              You need to connect your wallet to view your profile and referral information.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      
      {/* Referral Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Referral Program</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              Share your referral link with friends and earn rewards when they join and play!
            </p>
            
            <div className="flex gap-2">
              <Input 
                value={referralLink} 
                readOnly 
                className="flex-1"
              />
              <Button onClick={copyReferralLink} variant="outline">
                <Copy className="h-4 w-4" />
              </Button>
              <Button onClick={shareReferralLink}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
            
            {referralStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">{referralStats.referredCount}</p>
                    <p className="text-sm text-gray-600">Referred Users</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">${referralStats.totalEarned.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Total Earned</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">${referralStats.unpaidBalance.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Unpaid Balance</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Referred Users */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referred Users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading referred users...</p>
          ) : referredUsers.length > 0 ? (
            <div className="space-y-4">
              {referredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{user.username}</p>
                    <p className="text-sm text-gray-600">Joined: {new Date(user.joinDate).toLocaleDateString()}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">You haven't referred any users yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
