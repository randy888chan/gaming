import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { useParticleConnect } from '@particle-network/connect-react-ui';
import { useUserStore } from '@/hooks/useUserStore';
import { toast } from 'sonner';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  {
    title: 'Welcome to Quantum Nexus!',
    description: 'Discover a new dimension of gaming. Let\'s get you started with a quick tour.',
  },
  {
    title: 'Your First Free Play',
    description: 'We\'ve credited your account with a free play. Try out any game without risk!',
  },
  {
    title: 'Smart Bets with AI',
    description: 'Our AI-powered Smart Bet feature helps you make informed decisions. Get personalized suggestions based on your risk profile.',
  },
  {
    title: 'Explore and Enjoy!',
    description: 'You\'re all set! Dive into our exciting games and experience the future of gaming.',
  },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { connect, disconnect } = useParticleConnect();
  const { set, user, hasClaimedFirstPlay } = useUserStore();

  const handleNext = () => {
    if (currentStep < filteredSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  // Ensure the modal closes if the user is already logged in and has claimed the first play
  React.useEffect(() => {
    if (user && hasClaimedFirstPlay && isOpen) {
      onClose();
    }
  }, [user, hasClaimedFirstPlay, isOpen, onClose]);

  const handleSkip = () => {
    onClose();
  };

  const handleSocialLogin = async () => {
    setErrorMessage(null); // Clear previous errors
    try {
      const userInfo = await connect({});
      if (userInfo) {
        set((state) => ({ user: userInfo }));
        // Call the first-play-free API
        const response = await fetch('/api/first-play-free', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userToken: userInfo.publicAddress }), // Using publicAddress as userToken
        });
        const data = await response.json();
        if (data.success) {
          set((state) => ({ hasClaimedFirstPlay: true }));
          console.log('First play free credited:', data.creditAmount);
          onClose(); // Close only on successful login and first play claim
        } else {
          const errorMsg = data.error || 'Failed to claim first play free.';
          console.error('Failed to claim first play free:', errorMsg);
          setErrorMessage(errorMsg);
          toast.error(errorMsg); // Display error message using toast
        }
      } else {
        const errorMsg = 'Social login failed: No user info received.';
        setErrorMessage(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error: any) {
      const errorMsg = `Particle Network social login failed: ${error.message || 'Unknown error'}`;
      console.error(errorMsg, error);
      setErrorMessage(errorMsg);
      toast.error(errorMsg); // Display error message using toast
    }
  };

  // Skip "Your First Free Play" step if already claimed
  const filteredSteps = steps.filter((step, index) => {
    if (step.title === 'Your First Free Play' && hasClaimedFirstPlay) {
      return false;
    }
    return true;
  });

  const currentStepContent = filteredSteps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{currentStepContent.title}</DialogTitle>
          <DialogDescription>{currentStepContent.description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-4">
          {currentStep === 0 && (
            <>
              <Button onClick={handleSocialLogin}>Sign in with Social</Button>
              {errorMessage && (
                <p className="text-red-500 text-sm text-center">{errorMessage}</p>
              )}
              <Button variant="outline" onClick={() => window.open('https://t.me/your_telegram_channel', '_blank')}>Join our Telegram</Button>
            </>
          )}
          <div className="flex justify-between">
            {currentStep < steps.length - 1 ? (
              <Button variant="outline" onClick={handleSkip}>Skip Tour</Button>
            ) : (
              <div />
            )}
            <Button onClick={handleNext}>
              {currentStep < steps.length - 1 ? 'Next' : 'Start Playing!'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};