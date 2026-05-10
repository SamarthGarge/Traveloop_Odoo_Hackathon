import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { User, Mail, MapPin, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import Select from 'react-select';
import { Country, City } from 'country-state-city';
import { extractError } from '../lib/api';

const customSelectStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    minHeight: '46px',
    borderRadius: '0.75rem',
    borderWidth: '1px',
    borderColor: state.isFocused ? 'transparent' : '#e5e7eb',
    boxShadow: state.isFocused ? '0 0 0 2px #b83a26' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '&:hover': { borderColor: state.isFocused ? 'transparent' : '#d1d5db' },
    backgroundColor: '#ffffff',
    transition: 'all 0.2s',
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#b83a26' : state.isFocused ? '#fef2f2' : 'white',
    color: state.isSelected ? 'white' : '#374151',
    cursor: 'pointer',
  }),
  menu: (provided: any) => ({
    ...provided,
    borderRadius: '0.75rem',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    zIndex: 50,
  }),
  singleValue: (provided: any) => ({ ...provided, color: '#1a1a1a', fontSize: '14px' }),
  placeholder: (provided: any) => ({ ...provided, color: '#9ca3af', fontSize: '14px' }),
  input: (provided: any) => ({ ...provided, fontSize: '14px' }),
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

  const countryOptions = useMemo(
    () => Country.getAllCountries().map((c) => ({ value: c.isoCode, label: c.name })),
    []
  );

  const cityOptions = useMemo(
    () =>
      selectedCountry
        ? City.getCitiesOfCountry(selectedCountry.value)?.map((c) => ({ value: c.name, label: c.name })) || []
        : [],
    [selectedCountry]
  );

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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Valid email is required';
    if (!form.phone || !isValidPhoneNumber(form.phone)) newErrors.phone = 'Valid phone number is required';
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
    if (!validate()) return;
    setLoading(true);
    try {
      await register({
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        password: form.password,
        confirm_password: form.confirmPassword,
        phone: form.phone || undefined,
        city: form.city || undefined,
        country: form.country || undefined,
      });
      navigate('/dashboard');
    } catch (err) {
      setGeneralError(extractError(err));
    } finally {
      setLoading(false);
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
