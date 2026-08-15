import type { InputHTMLAttributes, ReactNode } from "react";
import { forwardRef, useId } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  trailing?: ReactNode;
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, hint, trailing, className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    return (
      <div className="space-y-2">
        <label
          htmlFor={inputId}
          className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
        >
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={cn(
              "w-full h-12 bg-background border px-4 text-sm text-foreground placeholder:text-muted-foreground/60",
              "transition-colors outline-none focus:border-foreground",
              error ? "border-destructive focus:border-destructive" : "border-border",
              trailing && "pr-12",
              className
            )}
            {...props}
          />
          {trailing && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">{trailing}</div>
          )}
        </div>
        {error ? (
          <p id={`${inputId}-error`} className="flex items-center gap-1.5 text-xs text-destructive">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="text-xs text-muted-foreground">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);
FormField.displayName = "FormField";

export default FormField;
