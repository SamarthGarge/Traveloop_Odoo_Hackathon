import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { User, Mail, MapPin, Lock, Eye, EyeOff } from 'lucide-react';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import Select from 'react-select';
import { Country, City } from 'country-state-city';

const customSelectStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    minHeight: '46px',
    borderRadius: '0.75rem',
    borderWidth: '1px',
    borderColor: state.isFocused ? 'transparent' : '#e5e7eb',
    boxShadow: state.isFocused ? '0 0 0 2px #b83a26' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '&:hover': {
      borderColor: state.isFocused ? 'transparent' : '#d1d5db',
    },
    backgroundColor: '#ffffff',
    transition: 'all 0.2s',
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#b83a26' : state.isFocused ? '#fef2f2' : 'white',
    color: state.isSelected ? 'white' : '#374151',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: '#b83a26',
    },
  }),
  menu: (provided: any) => ({
    ...provided,
    borderRadius: '0.75rem',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    zIndex: 50,
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: '#1a1a1a',
    fontSize: '14px',
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: '#9ca3af',
    fontSize: '14px',
  }),
  input: (provided: any) => ({
    ...provided,
    fontSize: '14px',
  }),
};

export default function Register() {
  const navigate = useNavigate();
  const register = useStore((s) => s.register);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    password: '',
    confirmPassword: '',
    photo: '',
    bio: '',
    termsAccepted: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState<{ value: string; label: string } | null>(null);
  const [selectedCity, setSelectedCity] = useState<{ value: string; label: string } | null>(null);

  const countryOptions = useMemo(() => 
    Country.getAllCountries().map((c) => ({
      value: c.isoCode,
      label: c.name,
    })), 
  []);

  const cityOptions = useMemo(() => 
    selectedCountry
      ? City.getCitiesOfCountry(selectedCountry.value)?.map((c) => ({
          value: c.name,
          label: c.name,
        })) || []
      : [],
  [selectedCountry]);

  const validateField = (field: string, value: any) => {
    let error = '';
    switch (field) {
      case 'firstName': if (!value.trim()) error = 'First name is required'; break;
      case 'lastName': if (!value.trim()) error = 'Last name is required'; break;
      case 'email': 
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) error = 'Valid email is required'; 
        break;
      case 'phone': 
        if (!value || !isValidPhoneNumber(value)) error = 'Valid phone number is required'; 
        break;
      case 'city': if (!value.trim()) error = 'City is required'; break;
      case 'country': if (!value.trim()) error = 'Country is required'; break;
      case 'password': 
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(value)) error = 'Must be 8+ chars: 1 uppercase, 1 lowercase, 1 number, 1 special char'; 
        break;
      case 'confirmPassword': 
        if (value !== form.password) error = 'Passwords do not match'; 
        break;
      case 'termsAccepted':
        if (!value) error = 'You must accept the terms and conditions';
        break;
    }
    return error;
  };

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    setErrors((prev) => {
      const newErrs = { ...prev };
      if (error) {
        newErrs[field] = error;
      } else {
        delete newErrs[field];
      }
      return newErrs;
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!form.lastName.trim()) newErrors.lastName = 'Last name is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) newErrors.email = 'Valid email is required';

    if (!form.phone || !isValidPhoneNumber(form.phone)) {
      newErrors.phone = 'Valid phone number is required';
    }

    if (!form.city.trim()) newErrors.city = 'City is required';
    if (!form.country.trim()) newErrors.country = 'Country is required';

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(form.password)) {
      newErrors.password = 'Must be 8+ chars: 1 uppercase, 1 lowercase, 1 number, 1 special char';
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!form.termsAccepted) {
      newErrors.termsAccepted = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    
    if (!validate()) {
      setGeneralError('Please fix the errors below');
      return;
    }
    
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 800));
    
    register({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      city: form.city,
      country: form.country,
      photo: form.photo,
      bio: form.bio,
    });
    
    setIsLoading(false);
    navigate('/dashboard');
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 py-8 relative bg-cover bg-center"
      style={{ backgroundImage: 'url("/images/Login_Background.png")' }}
    >
      <div className="absolute inset-0 bg-white/40" />
      
      <div className="w-full max-w-xl bg-[#f4f6f8] rounded-2xl p-10 relative z-10 shadow-2xl border border-white/50">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#00202a] tracking-tight mb-2">Traveloop</h1>
          <p className="text-gray-500 text-sm">Create your account to start exploring.</p>
        </div>

        {generalError && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 text-red-500 text-sm border border-red-100">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">First Name</label>
              <div className="relative">
                <User className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="John"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border ${errors.firstName ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-[#b83a26] focus:border-transparent outline-none text-sm bg-white text-gray-900 transition-all shadow-sm`}
                />
              </div>
              {errors.firstName && <p className="text-red-500 text-[10px] mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Last Name</label>
              <div className="relative">
                <User className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Doe"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border ${errors.lastName ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-[#b83a26] focus:border-transparent outline-none text-sm bg-white text-gray-900 transition-all shadow-sm`}
                />
              </div>
              {errors.lastName && <p className="text-red-500 text-[10px] mt-1">{errors.lastName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="voyager@traveloop.com"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-[#b83a26] focus:border-transparent outline-none text-sm bg-white text-gray-900 transition-all shadow-sm`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-[10px] mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Phone Number</label>
              <PhoneInput
                international
                defaultCountry="US"
                value={form.phone}
                onChange={(val) => handleChange('phone', val || '')}
                className={errors.phone ? 'PhoneInput--error' : ''}
              />
              {errors.phone && <p className="text-red-500 text-[10px] mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Country</label>
              <Select
                options={countryOptions}
                value={selectedCountry}
                onChange={(option) => {
                  setSelectedCountry(option);
                  setSelectedCity(null);
                  handleChange('country', option?.label || '');
                  handleChange('city', '');
                }}
                styles={customSelectStyles}
                placeholder="Select country"
                className={errors.country ? 'border-red-500 rounded-xl' : ''}
              />
              {errors.country && <p className="text-red-500 text-[10px] mt-1">{errors.country}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">City</label>
              <Select
                options={cityOptions}
                value={selectedCity}
                onChange={(option) => {
                  setSelectedCity(option);
                  handleChange('city', option?.label || '');
                }}
                isDisabled={!selectedCountry}
                styles={customSelectStyles}
                placeholder="Select city"
                className={errors.city ? 'border-red-500 rounded-xl' : ''}
              />
              {errors.city && <p className="text-red-500 text-[10px] mt-1">{errors.city}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Min 8 characters"
                  className={`w-full pl-11 pr-12 py-3 rounded-xl border ${errors.password ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-[#b83a26] focus:border-transparent outline-none text-sm bg-white text-gray-900 transition-all shadow-sm`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#b83a26] transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-[10px] mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="Repeat password"
                  className={`w-full pl-11 pr-12 py-3 rounded-xl border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-[#b83a26] focus:border-transparent outline-none text-sm bg-white text-gray-900 transition-all shadow-sm`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#b83a26] transition-colors focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-[10px] mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Profile Photo (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                   const file = e.target.files?.[0];
                   if (file) handleChange('photo', URL.createObjectURL(file));
                }}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#b83a26] file:text-white hover:file:bg-[#a03220] transition-all cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">Additional Information</label>
              <textarea
                value={form.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Tell us about your travel style..."
                rows={2}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#b83a26] focus:border-transparent outline-none text-sm bg-white text-gray-900 transition-all shadow-sm resize-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={form.termsAccepted}
                onChange={(e) => handleChange('termsAccepted', e.target.checked)}
                className="w-4 h-4 text-[#b83a26] border-gray-300 rounded focus:ring-[#b83a26]"
              />
              <label htmlFor="terms" className="text-xs text-gray-600">
                I agree to the <a href="#" className="text-[#b83a26] hover:underline">Terms & Conditions</a> and Privacy Policy.
              </label>
            </div>
            {errors.termsAccepted && <p className="text-red-500 text-[10px] mt-1">{errors.termsAccepted}</p>}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#b83a26] hover:bg-[#a03220] disabled:opacity-60 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-medium flex items-center justify-center transition-all shadow-md"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                  </svg>
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-[#00202a] hover:text-[#b83a26] font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
