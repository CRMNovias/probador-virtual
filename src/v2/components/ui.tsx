import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost';

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-white hover:bg-accent-dark disabled:bg-neutral-300 disabled:text-white',
  secondary: 'border border-ink bg-white text-ink hover:bg-neutral-50 disabled:border-neutral-300 disabled:text-neutral-400',
  ghost: 'bg-transparent text-ink underline underline-offset-4 disabled:opacity-40',
};

const base =
  'v2-btn inline-flex h-12 items-center justify-center gap-2 px-6 text-[12px] font-medium uppercase tracking-[0.12em] transition-colors disabled:cursor-not-allowed';

interface ButtonProps extends ComponentProps<'button'> {
  variant?: Variant;
  loading?: boolean;
  block?: boolean;
}

export function Button({ variant = 'primary', loading, block, className = '', children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${block ? 'w-full' : ''} ${className}`}
    >
      {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
}

interface LinkButtonProps extends ComponentProps<typeof Link> {
  variant?: Variant;
  block?: boolean;
}

export function LinkButton({ variant = 'primary', block, className = '', ...rest }: LinkButtonProps) {
  return <Link {...rest} className={`${base} ${variants[variant]} ${block ? 'w-full' : ''} ${className}`} />;
}

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`label-caps text-muted ${className}`}>{children}</p>;
}

/** Título de pantalla: mayúsculas pequeñas, como las secciones de Zara. */
export function PageTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h1 className={`text-[15px] font-medium uppercase tracking-[0.1em] ${className}`}>{children}</h1>;
}

interface FieldProps extends ComponentProps<'input'> {
  label: string;
  error?: string | undefined;
  hint?: string;
}

export function Field({ label, error, hint, id, className = '', ...rest }: FieldProps) {
  const inputId = id ?? rest.name;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;
  return (
    <div className={className}>
      <label htmlFor={inputId} className="label-caps block text-muted">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={`h-11 w-full border-0 border-b bg-transparent px-0 text-base text-ink outline-none transition-colors placeholder:text-neutral-400 focus:border-ink ${error ? 'border-danger' : 'border-neutral-300'}`}
        {...rest}
      />
      {error ? (
        <p id={`${inputId}-error`} className="mt-2 text-[13px] text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-2 text-[13px] text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Notice({ tone = 'neutral', children }: { tone?: 'neutral' | 'danger'; children: ReactNode }) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={`px-4 py-3 text-[13px] leading-relaxed ${tone === 'danger' ? 'border border-danger/40 text-danger' : 'bg-studio text-ink'}`}
    >
      {children}
    </div>
  );
}
