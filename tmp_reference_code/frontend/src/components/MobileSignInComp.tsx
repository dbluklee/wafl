import React from 'react';
import ButtonComp from './ButtonComp';
import ButtonSaveCancelComp from './ButtonSaveCancelComp';

interface MobileSignInForm {
  phoneNumber: string;
  authNumber: string;
}

interface MobileSignInCompProps {
  form: MobileSignInForm;
  onPhoneNumberChange: (value: string) => void;
  onAuthNumberChange: (value: string) => void;
  onPhoneAuth: () => void;
  onBack?: () => void;
  onSignIn: () => void;
  isLoading: boolean;
  inputStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
  responsiveScale: number;
}

export default function MobileSignInComp({
  form,
  onPhoneNumberChange,
  onAuthNumberChange,
  onPhoneAuth,
  onBack,
  onSignIn,
  isLoading,
  inputStyle,
  labelStyle,
  responsiveScale
}: MobileSignInCompProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${Math.max(12, 16 * responsiveScale)}px`, width: '100%' }}>
      {/* Mobile Title */}
      <h3 
        style={{
          ...labelStyle,
          fontSize: `${Math.max(1.0, 1.2 * responsiveScale)}rem`,
          fontWeight: 600,
          marginBottom: `${Math.max(8, 12 * responsiveScale)}px`
        }}
      >
        Mobile
      </h3>

      {/* Phone Number */}
      <div>
        <label style={labelStyle}>Phone Number</label>
        <div className="flex gap-2" style={{ width: '100%' }}>
          <input
            type="tel"
            value={form.phoneNumber}
            onChange={(e) => onPhoneNumberChange(e.target.value)}
            style={{ ...inputStyle, flex: '1 1 auto', minWidth: 0 }}
            placeholder="010-1234-5678"
            maxLength={13}
            required
          />
          <ButtonComp 
            label="Auth"
            onClick={onPhoneAuth}
            className="FontStyleTitle"
            style={{ height: 'clamp(36px, 5vh, 48px)', minWidth: 'clamp(60px, 8vw, 80px)', flexShrink: 0 }}
          />
        </div>
      </div>

      {/* Authentication Number */}
      <div>
        <h3 
          style={{
            ...labelStyle,
            fontSize: `${Math.max(1.0, 1.2 * responsiveScale)}rem`,
            fontWeight: 600,
            marginBottom: `${Math.max(4, 8 * responsiveScale)}px`
          }}
        >
          Authentication Number
        </h3>
        <input
          type="text"
          value={form.authNumber}
          onChange={(e) => onAuthNumberChange(e.target.value)}
          style={inputStyle}
          placeholder="Enter authentication number"
          required
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-center">
        <ButtonSaveCancelComp
          cancelLabel="Back"
          saveLabel={isLoading ? 'Signing In...' : 'Sign In'}
          onCancel={onBack}
          onSave={onSignIn}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export type { MobileSignInForm };

