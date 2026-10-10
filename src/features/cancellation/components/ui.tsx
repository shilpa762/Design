import { createContext, useContext, type ButtonHTMLAttributes, type ReactNode } from 'react';

export interface FlowUi {
  busy: boolean;
  error: string | null;
}

export const FlowUiContext = createContext<FlowUi>({ busy: false, error: null });

export const useFlowUi = () => useContext(FlowUiContext);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' };

export function Button({ variant = 'primary', className = '', disabled, ...rest }: ButtonProps) {
  const { busy } = useFlowUi();
  return (
    <button
      type="button"
      className={`cf-btn cf-btn--${variant} ${className}`}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      {...rest}
    />
  );
}

interface StepLayoutProps {
  title: string;
  subtitle?: ReactNode;
  children?: ReactNode;
  footer: ReactNode;
}

/** Scrollable step body + sticky footer, per the reference pop-up. */
export function StepLayout({ title, subtitle, children, footer }: StepLayoutProps) {
  const { error } = useFlowUi();
  return (
    <>
      <div className="cf-body">
        <h2 className="cf-title" id="cf-title" tabIndex={-1}>
          {title}
        </h2>
        {subtitle && <div className="cf-subtitle">{subtitle}</div>}
        {children}
      </div>
      <div className="cf-footer">
        {error && (
          <p className="cf-banner cf-error" role="alert">
            {error}
          </p>
        )}
        <div className="cf-footer__actions">{footer}</div>
      </div>
    </>
  );
}

export function Banner({ children }: { children: ReactNode }) {
  return <p className="cf-banner">{children}</p>;
}

/** Stand-in for the Figma "check" vector (16x12). See docs for the asset note. */
export function CheckIcon({ label }: { label: string }) {
  return (
    <svg className="cf-check" width="16" height="12" viewBox="0 0 16 12" role="img" aria-label={label}>
      <path d="M1.5 6.2 5.8 10.5 14.5 1.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
      <path d="M1 1l8 8M9 1 1 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function BackIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M11 6H1.5M5.5 1.5 1 6l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
