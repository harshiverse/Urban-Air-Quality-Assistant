// UI Component Library — Barrel exports
// All reusable UI primitives for the Urban Air Quality Assistant

// Alert Dialog
export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from './alert-dialog';

// Badge
export { Badge, badgeVariants } from './badge';
export type { BadgeProps } from './badge';

// Breadcrumbs
export { Breadcrumbs } from './breadcrumbs';
export type { BreadcrumbItem, BreadcrumbsProps } from './breadcrumbs';

// Button
export { Button, buttonVariants } from './button';
export type { ButtonProps } from './button';

// Card
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from './card';

// Dropdown Menu
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from './dropdown-menu';

// Empty State
export { EmptyState } from './empty-state';
export type { EmptyStateProps } from './empty-state';

// Error State
export { ErrorState } from './error-state';
export type { ErrorStateProps, ErrorVariant } from './error-state';

// Input
export { Input } from './input';
export type { InputProps } from './input';

// Label
export { Label } from './label';

// Page Header
export { PageHeader } from './page-header';
export type { PageHeaderProps } from './page-header';

// Progress
export { Progress } from './progress';
export type { ProgressProps } from './progress';

// Radio Group
export { RadioGroup, RadioGroupItem } from './radio-group';
export type { RadioGroupProps, RadioGroupItemProps } from './radio-group';

// Scroll Area
export { ScrollArea } from './scroll-area';
export type { ScrollAreaProps } from './scroll-area';

// Select
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from './select';

// Separator
export { Separator } from './separator';
export type { SeparatorProps } from './separator';

// Skeleton
export { Skeleton } from './skeleton';

// Switch
export { Switch } from './switch';
export type { SwitchProps } from './switch';

// Tabs
export { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';

// Toast
export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
} from './toast';
export { Toaster } from './toaster';
export { useToast, toast } from './use-toast';

// Tooltip (CSS-based, no @radix-ui/react-tooltip dependency)
export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from './tooltip';
export type { TooltipContentProps, TooltipProps, TooltipProviderProps } from './tooltip';

// CursorGrid (React Bits interactive WebGL canvas grid)
export { CursorGrid } from './cursor-grid';
export type { CursorGridProps } from './cursor-grid';

// GhostType (AI-style ghost completions headline typewriter)
export { GhostType } from './ghost-type';
export type { GhostTypeProps } from './ghost-type';

