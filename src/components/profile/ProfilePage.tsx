import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
// import { useParticleNetwork } from '@/components/ParticleProviderWrapper'; // Particle Network is no longer directly used here

interface UserProfile {
  walletAddress: string;
  recentActivity: {
    tournamentsPlayed: number;
    // Add other activity metrics as needed
  };
}

const ProfilePage: React.FC = () => {
  // const { particle } = useParticleNetwork(); // Particle Network is no longer directly used here
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // In a real Cloudflare Pages/Workers setup, user authentication
        // would likely be handled by a middleware or a separate auth service.
        // For this example, we'll mock the user info.
        const mockUserInfo = {
          token: "mock-auth-token", // Replace with actual token from a real auth flow
          walletAddress: "0x1234567890abcdef1234567890abcdef12345678", // Mock wallet address
        };

        if (!mockUserInfo || !mockUserInfo.token) {
          throw new Error("User not authenticated.");
        }

        const response = await fetch("/api/v1/users/me", {
          headers: {
            Authorization: `Bearer ${mockUserInfo.token}`,
          },
        });

        if (!response.ok) {
          throw new Error(
            `Error fetching user profile: ${response.statusText}`
          );
        }

        const data: UserProfile = await response.json();
        setUserProfile(data);
      } catch (err: any) {
        setError(err.message);
        console.error("Failed to fetch user profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>No user profile found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Wallet Address:</h3>
              <p className="break-all">{userProfile.walletAddress}</p>
            </div>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold">Recent Activity:</h3>
              <p>
                Tournaments Played:{" "}
                {userProfile.recentActivity.tournamentsPlayed}
              </p>
              {/* Add more activity details here */}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
