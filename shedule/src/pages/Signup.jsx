import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    dob: '',
    sex: '',
    mobile: '',
    address: '',
    pincode: '',
    user_type: ''
  });
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep = () => {
    const stepFields = {
      1: ['username', 'password'],
      2: ['name', 'dob', 'sex', 'mobile'],
      3: ['user_type', 'address', 'pincode']
    };
    return stepFields[step].every(field => formData[field]?.trim() !== '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) {
      setError('Please fill all required fields');
      return;
    }
    try {
      await signup(
        formData.username,
        formData.password,
        formData.name,
        formData.dob,
        formData.sex,
        formData.mobile,
        formData.address,
        formData.pincode,
        formData.user_type
      );
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Signup failed');
    }
  };

  const nextStep = () => {
    if (!validateStep()) {
      setError('Please fill all required fields');
      return;
    }
    setError('');
    setStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <InputField label="Username*" name="username" value={formData.username} onChange={handleChange} required />
            <InputField label="Password*" type="password" name="password" value={formData.password} onChange={handleChange} required />
          </>
        );
      case 2:
        return (
          <>
            <InputField label="Full Name*" name="name" value={formData.name} onChange={handleChange} required />
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Date of Birth*" type="date" name="dob" value={formData.dob} onChange={handleChange} required />
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Gender*</label>
                <select
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <InputField label="Mobile Number*" name="mobile" type="tel" value={formData.mobile} onChange={handleChange} required />
          </>
        );
      case 3:
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">User Type*</label>
              <select
                name="user_type"
                value={formData.user_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select</option>
                <option value="Student">Student</option>
                <option value="Job Person">Job Person</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Address*</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows="3"
                required
              />
            </div>
            <InputField label="Pincode*" name="pincode" value={formData.pincode} onChange={handleChange} required />
          </>
        );
      default:
        return null;
    }
  };

  const ProgressBar = () => (
    <div className="flex justify-between items-center text-sm font-semibold text-gray-200 mt-3 mb-2">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-white text-blue-600' : 'bg-blue-400'}`}>1</div>
      <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-white' : 'bg-blue-300'}`} />
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-white text-blue-600' : 'bg-blue-400'}`}>2</div>
      <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-white' : 'bg-blue-300'}`} />
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 3 ? 'bg-white text-blue-600' : 'bg-blue-400'}`}>3</div>
    </div>
  );
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="flex w-[90%] max-w-6xl rounded-2xl shadow-2xl overflow-hidden bg-white">
        {/* Left Side - Form */}
        <div className="w-1/2 p-10">
          <h2 className="text-3xl font-bold text-blue-600 text-center mb-4">Sign Up</h2>
          <ProgressBar />
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            {renderStep()}
            <div className="flex justify-between mt-6">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-5 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Back
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="ml-auto px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="ml-auto px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Submit
                </button>
              )}
            </div>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side - GIF */}
        <div className="w-1/2 bg-blue-100 flex items-center justify-center p-4">
          <img
            src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYmExbDYyd3h5eHFjcXY5aXk4aHlyZThrd3pnbWFsOGJqaGJsaTYxeCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/L1R1tvI9svkIWwpVYr/giphy.gif"
            alt="signup gif"
            className="max-w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}

function InputField({ label, type = 'text', name, value, onChange, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
      />
    </div>
  );
}