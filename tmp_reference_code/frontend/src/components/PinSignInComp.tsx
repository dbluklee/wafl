import React from 'react';
import ButtonComp from './ButtonComp';
import ButtonSaveCancelComp from './ButtonSaveCancelComp';

interface PinSignInForm {
  storeId: string;
  userPin: string;
  password: string;
}

interface PinSignInCompProps {
  form: PinSignInForm;
  onStoreIdChange: (value: string) => void;
  onUserPinChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onBack?: () => void;
  onSignIn: () => void;
  isLoading: boolean;
  inputStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
  responsiveScale: number;
}

export default function PinSignInComp({
  form,
  onStoreIdChange,
  onUserPinChange,
  onPasswordChange,
  onBack,
  onSignIn,
  isLoading,
  inputStyle,
  labelStyle,
  responsiveScale
}: PinSignInCompProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${Math.max(12, 16 * responsiveScale)}px`, width: '100%' }}>
      {/* Store ID */}
      <div>
        <h3 
          style={{
            ...labelStyle,
            fontSize: `${Math.max(1.0, 1.2 * responsiveScale)}rem`,
            fontWeight: 600,
            marginBottom: `${Math.max(4, 8 * responsiveScale)}px`
          }}
        >
          Store ID
        </h3>
        <input
          type="text"
          value={form.storeId}
          onChange={(e) => onStoreIdChange(e.target.value)}
          style={inputStyle}
          placeholder="Enter store ID"
          required
        />
      </div>

      {/* User PIN */}
      <div>
        <h3 
          style={{
            ...labelStyle,
            fontSize: `${Math.max(1.0, 1.2 * responsiveScale)}rem`,
            fontWeight: 600,
            marginBottom: `${Math.max(4, 8 * responsiveScale)}px`
          }}
        >
          User PIN
        </h3>
        <input
          type="password"
          value={form.userPin}
          onChange={(e) => onUserPinChange(e.target.value)}
          style={inputStyle}
          placeholder="Enter 4-digit PIN"
          maxLength={4}
          required
        />
      </div>

      {/* Password */}
      <div>
        <h3 
          style={{
            ...labelStyle,
            fontSize: `${Math.max(1.0, 1.2 * responsiveScale)}rem`,
            fontWeight: 600,
            marginBottom: `${Math.max(4, 8 * responsiveScale)}px`
          }}
        >
          Password
        </h3>
        <input
          type="password"
          value={form.password}
          onChange={(e) => onPasswordChange(e.target.value)}
          style={inputStyle}
          placeholder="Enter password"
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

export type { PinSignInForm };