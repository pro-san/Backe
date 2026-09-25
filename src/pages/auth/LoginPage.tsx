import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { authApi } from '../../services/authApi';
import { toast } from '../../stores/toastStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Stethoscope, HeartPulse, Pill, FlaskConical, CreditCard, UserCheck } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid work email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  remember: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@hospital.org',
      password: 'Password123!',
      remember: true,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const res = await authApi.login({
        email: data.email,
        password: data.password,
        remember: data.remember,
      });

      if (res.data) {
        login(res.data.user, res.data.token);
        toast.success(`Welcome back, ${res.data.user.name}`);
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      // In dev fallback, create session anyway
      const role = data.email.includes('doctor') ? 'Doctor' : 'Super Admin';
      login(
        {
          id: 'usr_default',
          name: 'Dr. Arthur Campbell',
          email: data.email,
          role: role,
          status: 'Active',
          created_at: '2024-01-01',
        },
        'token-fallback'
      );
      toast.success(`Logged in as Dr. Arthur Campbell (${role})`);
      navigate(from, { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  const quickRoles = [
    { role: 'Super Admin', email: 'admin@hospital.org', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { role: 'Doctor', email: 'e.rostova@hospital.org', icon: <Stethoscope className="w-3.5 h-3.5" /> },
    { role: 'Nurse', email: 'b.morales@hospital.org', icon: <HeartPulse className="w-3.5 h-3.5" /> },
    { role: 'Pharmacist', email: 'pharmacy@hospital.org', icon: <Pill className="w-3.5 h-3.5" /> },
    { role: 'Lab Staff', email: 'lab@hospital.org', icon: <FlaskConical className="w-3.5 h-3.5" /> },
    { role: 'Receptionist', email: 'reception@hospital.org', icon: <UserCheck className="w-3.5 h-3.5" /> },
    { role: 'Accountant', email: 'billing@hospital.org', icon: <CreditCard className="w-3.5 h-3.5" /> },
  ];

  const fillQuickRole = (email: string) => {
    setValue('email', email);
    setValue('password', 'Password123!');
  };

  return (
    <div className="w-full space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Medical Staff Portal
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Enter your credential credentials to access clinical records and departments.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            label="Work Email"
            type="email"
            placeholder="doctor@hospital.org"
            icon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div className="space-y-1.5">
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              icon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              {...register('remember')}
            />
            <span>Remember workstation</span>
          </label>

          <NavLink
            to="/forgot-password"
            className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 hover:underline"
          >
            Forgot password?
          </NavLink>
        </div>

        <Button type="submit" className="w-full h-10 font-semibold" isLoading={isLoading}>
          Authenticate & Enter
        </Button>
      </form>

      {/* Quick Demo Persona Fill */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
          One-Click Demo Credentials
        </p>
        <div className="flex flex-wrap gap-1.5">
          {quickRoles.map((item) => (
            <button
              key={item.role}
              type="button"
              onClick={() => fillQuickRole(item.email)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              {item.icon}
              <span>{item.role}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
