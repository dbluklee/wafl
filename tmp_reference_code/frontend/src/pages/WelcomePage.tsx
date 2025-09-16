import WelcomeBodyComp from '../components/WelcomeBodyComp';

interface WelcomePageProps {
  onSignUp?: () => void;
  onSignIn?: () => void;
}

export default function WelcomePage({ onSignUp, onSignIn }: WelcomePageProps) {
  return (
    <div 
      className="bg-black box-border content-stretch flex gap-[5px] items-start justify-start overflow-clip px-[100px] py-[140.5px] relative size-full min-h-screen" 
      data-name="Welcome" 
      data-node-id="2001:311"
    >
      {/* Background gradient circle - positioned at 35vw, -10vh, 3x size */}
      <div 
        className="absolute blur-[100px] rounded-full opacity-80"
        style={{
          left: '40vw',
          top: '-90vh',
          width: '156.25vw',
          height: '156.25vw',
          background: "radial-gradient(circle, #F7B717 0%, #F77C2C 28%, #E40182 53%, #3B0B93 60%, #000000 100%)"
        }}
      />
      
      <div 
        className="absolute flex items-center justify-start z-10"
        style={{
          left: '10vw',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '40vw'
        }}
        data-name="WelcomeBodyArea"
      >
        <WelcomeBodyComp
          intro="Welcome on"
          title="Burnana POS"
          description="Tired of hearing &quot;Excuse me!?&quot; Let your customers chat with an AI instead! They can order, pay, and even split the bill right from their phones, while you just watch the magic happen on your POS dashboard. Made a mistake? No sweat, there's an Undo button for that! It's the delightful innovation your busy restaurant has been waiting for."
          onSignUp={onSignUp}
          onSignIn={onSignIn}
        />
      </div>
    </div>
  );
}