import { DESIGN_TOKENS } from '../types/design-tokens';
import SignInComp from '../components/SignInComp';

interface SignInPageProps {
  onBack?: () => void;
  onSignInComplete?: () => void;
}

export default function SignInPage({ onBack, onSignInComplete }: SignInPageProps) {
  const { colors } = DESIGN_TOKENS;

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-8"
      style={{ backgroundColor: colors.bgBlack }}
    >
      <div 
        className="h-full max-h-screen"
        style={{ 
          width: '50%',
          minWidth: '400px',
          maxWidth: '600px'
        }}
      >
        <SignInComp 
          onBack={onBack}
          onSignInComplete={onSignInComplete}
        />
      </div>
    </div>
  );
}