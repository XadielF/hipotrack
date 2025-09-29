import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from './AuthProvider';
import { 
  Shield, 
  Lock, 
  Smartphone, 
  Eye, 
  EyeOff, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    mfaCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showMFA, setShowMFA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);

  const passwordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getStrengthColor = (strength: number) => {
    if (strength < 2) return 'bg-red-500';
    if (strength < 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = (strength: number) => {
    if (strength < 2) return 'Weak';
    if (strength < 4) return 'Medium';
    return 'Strong';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Rate limiting check
    if (loginAttempts >= 5) {
      setError('Too many failed attempts. Please wait 15 minutes before trying again.');
      setLoading(false);
      return;
    }

    try {
      // First step: email/password
      if (!showMFA) {
        // Simulate checking credentials
        if (formData.email && formData.password) {
          setShowMFA(true);
          setLoading(false);
          return;
        }
      }

      // Second step: MFA verification
      const success = await login(formData.email, formData.password, formData.mfaCode);
      
      if (success) {
        onSuccess?.();
      } else {
        setLoginAttempts(prev => prev + 1);
        setError('Invalid credentials or MFA code. Please try again.');
        setShowMFA(false);
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      setLoginAttempts(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const strength = passwordStrength(formData.password);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold">HIPOTRACK</h1>
          </div>
          <CardTitle className="text-xl">
            {showMFA ? 'Two-Factor Authentication' : 'Secure Login'}
          </CardTitle>
          <p className="text-sm text-gray-600">
            {showMFA 
              ? 'Enter the 6-digit code from your authenticator app'
              : 'Access your mortgage management dashboard'
            }
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!showMFA ? (
              <>
                {/* Email Field */}
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your.email@example.com"
                    required
                    autoComplete="email"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Enter your password"
                      required
                      autoComplete="current-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${getStrengthColor(strength)}`}
                            style={{ width: `${(strength / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">
                          {getStrengthText(strength)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* MFA Code Field */
              <div>
                <Label htmlFor="mfaCode" className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Authentication Code
                </Label>
                <Input
                  id="mfaCode"
                  type="text"
                  value={formData.mfaCode}
                  onChange={(e) => handleInputChange('mfaCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Check your authenticator app for the 6-digit code
                </p>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Login Attempts Warning */}
            {loginAttempts > 2 && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  {5 - loginAttempts} attempts remaining before temporary lockout
                </AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || loginAttempts >= 5}
            >
              {loading ? (
                'Authenticating...'
              ) : showMFA ? (
                'Verify & Login'
              ) : (
                'Continue to MFA'
              )}
            </Button>

            {/* Back Button for MFA */}
            {showMFA && (
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => setShowMFA(false)}
              >
                Back to Login
              </Button>
            )}
          </form>

          <Separator className="my-6" />

          {/* Security Features */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Security Features</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>256-bit Encryption</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>MFA Required</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Session Timeout</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Audit Logging</span>
              </div>
            </div>
          </div>

          {/* Compliance Badges */}
          <div className="flex justify-center gap-2 mt-4">
            <Badge variant="outline" className="text-xs">SOC 2 Type II</Badge>
            <Badge variant="outline" className="text-xs">GDPR</Badge>
            <Badge variant="outline" className="text-xs">GLBA</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;