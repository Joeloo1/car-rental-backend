import type { HugeiconsIconProps, IconSvgElement } from '@hugeicons/react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  AlertCircleIcon,
  AlertDiamondIcon,
  AlarmClockIcon,
  ArrowLeftBigIcon,
  ArrowMoveDownRightIcon,
  ArrowMoveUpRightIcon,
  ArrowReloadHorizontalIcon,
  ArrowRightBigIcon,
  BanknoteIcon,
  BellIcon,
  BriefcaseBusinessIcon,
  BubbleChatIcon,
  CalendarDaysIcon,
  CallIcon,
  CameraLensIcon,
  CancelCircleIcon,
  CarFrontIcon,
  ChartUpIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleCheckBigIcon,
  CircleCheckIcon,
  CloudUploadIcon,
  CogIcon,
  CompassIcon,
  CreditCardIcon,
  CrossIcon,
  DashboardBrowsingIcon,
  DeleteThrowIcon,
  DollarSignIcon,
  DoorOpenIcon,
  EyeIcon,
  EyeOffIcon,
  FavouriteIcon,
  FlashIcon,
  FuelIcon,
  GitCompareIcon,
  GridIcon,
  InformationCircleIcon,
  LayoutGridIcon,
  ListViewIcon,
  LoaderPinwheelIcon,
  LockIcon,
  LockKeyIcon,
  MailsIcon,
  MapsIcon,
  MenuTwoLineIcon,
  MountainIcon,
  NavigationIcon,
  NoteIcon,
  PencilIcon,
  PlusSignIcon,
  SearchCircleIcon,
  SentIcon,
  ShareKnowledgeIcon,
  ShieldHalfIcon,
  ShieldKeyIcon,
  SparklesIcon,
  StarIcon,
  TruckIcon,
  UserIcon,
  UserMultipleIcon,
} from '@hugeicons/core-free-icons';

function createIcon(data: IconSvgElement) {
  return (props: Omit<HugeiconsIconProps, 'icon'>) => (
    <HugeiconsIcon icon={data} {...props} />
  );
}

export type LucideIcon = ReturnType<typeof createIcon>;

export const AlertCircle = createIcon(AlertCircleIcon);
export const AlertTriangle = createIcon(AlertDiamondIcon);
export const ArrowDownRight = createIcon(ArrowMoveDownRightIcon);
export const ArrowLeft = createIcon(ArrowLeftBigIcon);
export const ArrowRight = createIcon(ArrowRightBigIcon);
export const ArrowUpRight = createIcon(ArrowMoveUpRightIcon);
export const Banknote = createIcon(BanknoteIcon);
export const Bell = createIcon(BellIcon);
export const Briefcase = createIcon(BriefcaseBusinessIcon);
export const Calendar = createIcon(CalendarDaysIcon);
export const Camera = createIcon(CameraLensIcon);
export const Car = createIcon(CarFrontIcon);
export const Check = createIcon(CheckIcon);
export const CheckCircle = createIcon(CircleCheckIcon);
export const CheckCircle2 = createIcon(CircleCheckBigIcon);
export const ChevronDown = createIcon(ChevronDownIcon);
export const ChevronLeft = createIcon(ChevronLeftIcon);
export const ChevronRight = createIcon(ChevronRightIcon);
export const Clock = createIcon(AlarmClockIcon);
export const Compass = createIcon(CompassIcon);
export const CreditCard = createIcon(CreditCardIcon);
export const DollarSign = createIcon(DollarSignIcon);
export const Edit3 = createIcon(PencilIcon);
export const Eye = createIcon(EyeIcon);
export const EyeOff = createIcon(EyeOffIcon);
export const FileText = createIcon(NoteIcon);
export const Fuel = createIcon(FuelIcon);
export const Gauge = createIcon(DashboardBrowsingIcon);
export const GitCompare = createIcon(GitCompareIcon);
export const Heart = createIcon(FavouriteIcon);
export const Info = createIcon(InformationCircleIcon);
export const Key = createIcon(LockKeyIcon);
export const LayoutDashboard = createIcon(LayoutGridIcon);
export const LayoutGrid = createIcon(GridIcon);
export const List = createIcon(ListViewIcon);
export const Loader2 = createIcon(LoaderPinwheelIcon);
export const Lock = createIcon(LockIcon);
export const LogOut = createIcon(DoorOpenIcon);
export const Mail = createIcon(MailsIcon);
export const MapPin = createIcon(MapsIcon);
export const Menu = createIcon(MenuTwoLineIcon);
export const MessageCircle = createIcon(BubbleChatIcon);
export const MessageSquare = createIcon(BubbleChatIcon);
export const Mountain = createIcon(MountainIcon);
export const Navigation = createIcon(NavigationIcon);
export const Phone = createIcon(CallIcon);
export const Plus = createIcon(PlusSignIcon);
export const RefreshCw = createIcon(ArrowReloadHorizontalIcon);
export const Search = createIcon(SearchCircleIcon);
export const Send = createIcon(SentIcon);
export const Settings = createIcon(CogIcon);
export const Share2 = createIcon(ShareKnowledgeIcon);
export const Shield = createIcon(ShieldHalfIcon);
export const ShieldCheck = createIcon(ShieldKeyIcon);
export const Sparkles = createIcon(SparklesIcon);
export const Star = createIcon(StarIcon);
export const Trash2 = createIcon(DeleteThrowIcon);
export const TrendingUp = createIcon(ChartUpIcon);
export const Truck = createIcon(TruckIcon);
export const Upload = createIcon(CloudUploadIcon);
export const User = createIcon(UserIcon);
export const Users = createIcon(UserMultipleIcon);
export const X = createIcon(CrossIcon);
export const XCircle = createIcon(CancelCircleIcon);
export const Zap = createIcon(FlashIcon);
