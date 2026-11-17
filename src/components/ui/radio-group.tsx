'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface RadioGroupContextValue {
  name?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | undefined>(undefined);

export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
}

/**
 * Accessible Radio Group component matching Radix Primitives design.
 */
export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value: controlledValue, defaultValue, onValueChange, name, disabled, ...props }, ref) => {
    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : uncontrolledValue;

    const handleValueChange = React.useCallback(
      (val: string) => {
        if (!isControlled) {
          setUncontrolledValue(val);
        }
        onValueChange?.(val);
      },
      [isControlled, onValueChange]
    );

    return (
      <RadioGroupContext.Provider value={{ name, value, onValueChange: handleValueChange, disabled }}>
        <div
          role="radiogroup"
          ref={ref}
          className={cn('grid gap-2', className)}
          {...props}
        />
      </RadioGroupContext.Provider>
    );
  }
);
RadioGroup.displayName = 'RadioGroup';

export interface RadioGroupItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

/**
 * Radio Group Item featuring the exact hollow circle and solid inner dot indicator from Radix Primitives.
 */
export const RadioGroupItem = React.forwardRef<HTMLButtonElement, RadioGroupItemProps>(
  ({ className, value, disabled: itemDisabled, children, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext);
    const isChecked = context?.value === value;
    const isDisabled = context?.disabled || itemDisabled;

    const handleClick = () => {
      if (!isDisabled) {
        context?.onValueChange?.(value);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleClick();
      }
    };

    return (
      <button
        type="button"
        role="radio"
        aria-checked={isChecked}
        data-state={isChecked ? 'checked' : 'unchecked'}
        disabled={isDisabled}
        ref={ref}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors text-foreground outline-none',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer hover:bg-accent/60',
          className
        )}
        {...props}
      >
        {/* Outer circle ring */}
        <span
          className={cn(
            'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all duration-150',
            isChecked
              ? 'border-primary bg-primary/10 shadow-sm'
              : 'border-muted-foreground/40 group-hover:border-foreground/60'
          )}
          aria-hidden="true"
        >
          {/* Inner solid dot */}
          {isChecked && (
            <span className="h-2 w-2 rounded-full bg-primary shadow-sm animate-in zoom-in-50 duration-150" />
          )}
        </span>
        {children && <span>{children}</span>}
      </button>
    );
  }
);
RadioGroupItem.displayName = 'RadioGroupItem';
