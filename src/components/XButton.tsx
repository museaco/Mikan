import { tv } from 'tailwind-variants';
import { cn } from '../lib/utils.ts';

type XButtonProps = {
  className?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  title?: string;
  color?: 'primary' | 'default';
  size?: 'sm' | 'md' | 'lg'
}


const buttonCls = tv({
  base: 'cursor-pointer flex items-center text-fg-muted gap-1 text-xs border border-border text-fg-secondary transition-colors hover:border-accent',
  variants: {
    color: {
      primary: 'bg-accent text-white hover:bg-accent-hover',
      default: 'bg-bg-tertiary hover:text-accent',
    },
    size: {
      sm: 'rounded-sm',
      md: 'rounded-md px-2.5 py-2',
      lg: 'rounded-lg',
    },
    disabled: {
      true: 'disabled:cursor-not-allowed disabled:opacity-40'
    },
    isOnlyIcon: {
      true: 'p-2'
    }
  },
  compoundVariants: [
    {
      disabled: true,
      color: 'primary',
      class: 'hover:bg-unset',
    },
    {
      disabled: true,
      color: 'default',
      class: 'hover:text-unset hover:border-unset',
    },
  ],
  defaultVariants: {
    size: 'md',
    color: 'default',
  },
});


export default function XButton(props: XButtonProps) {

  const {
    className, onClick, children, disabled, icon, title, color, size,
  } = props;

  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        className,
        buttonCls({
          color, disabled, size, isOnlyIcon: Boolean(icon) && !Boolean(children),
        })
      )}
    >
      {icon}
      {children}
    </button>
  );

}
