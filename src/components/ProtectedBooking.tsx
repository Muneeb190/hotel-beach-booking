
import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ProtectedBookingProps {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
}

export default function ProtectedBooking({ children, className, size = "default" }: ProtectedBookingProps) {
  const navigate = useNavigate();

  const handleBookingClick = () => {
    navigate('/booking');
  };

  return (
    <>
      <SignedIn>
        <Button 
          onClick={handleBookingClick} 
          className={className} 
          size={size}
        >
          {children}
        </Button>
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal" fallbackRedirectUrl="/booking">
          <Button className={className} size={size}>
            {children}
          </Button>
        </SignInButton>
      </SignedOut>
    </>
  );
}
