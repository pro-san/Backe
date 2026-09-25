import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { NavLink } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from '../../stores/toastStore';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid work email address'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export const ForgotPasswordPage: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormData) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      toast.success('Password reset instructions sent to your email.');
    }, 800);
  };

  return (
    <div className="w-full space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Reset Password
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Enter your registered hospital work email and we will send you secure recovery steps.
        </p>
      </div>

      {isSubmitted ? (
        <div className="space-y-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>Reset Link Dispatched</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Please inspect your inbox for verification instructions. If you don't receive it within 5 minutes, please contact Hospital IT Service Desk.
          </p>
          <NavLink to="/login" className="inline-block mt-2">
            <Button size="sm" variant="outline" className="gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </Button>
          </NavLink>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Work Email"
            type="email"
            placeholder="doctor@hospital.org"
            icon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            {...register('email')}
          />

          <Button type="submit" className="w-full h-10 font-semibold" isLoading={isLoading}>
            Send Recovery Link
          </Button>

          <div className="text-center pt-2">
            <NavLink
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to login</span>
            </NavLink>
          </div>
        </form>
      )}
    </div>
  );
};
