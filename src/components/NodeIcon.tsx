import {
  Router, Shield, ShieldAlert, ShieldOff, GitBranch, Lock, Globe,
  Server, Hexagon, Zap, Box, Cpu,
  Database, Layers, HardDrive, FileText, Search,
  Activity, Mail, List, Bell, Radio, Send,
  Code2, GitMerge, Compass, ArrowRightLeft, Triangle,
  BarChart2, PieChart, Eye, AlertTriangle, Terminal,
  Monitor, Key, Gauge, Settings, Archive,
  CircleDot, ArrowDownToLine, Sliders,
  XCircle, Timer, Scissors, WifiOff, Clock, Minimize2,
  TrendingUp, Users, RefreshCw, PauseCircle, Unlink,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>> = {
  'router':              Router,
  'shield':              Shield,
  'shield-alert':        ShieldAlert,
  'shield-off':          ShieldOff,
  'git-branch':          GitBranch,
  'lock':                Lock,
  'globe':               Globe,
  'server':              Server,
  'hexagon':             Hexagon,
  'zap':                 Zap,
  'box':                 Box,
  'cpu':                 Cpu,
  'database':            Database,
  'layers':              Layers,
  'hard-drive':          HardDrive,
  'file-text':           FileText,
  'search':              Search,
  'activity':            Activity,
  'mail':                Mail,
  'list':                List,
  'bell':                Bell,
  'radio':               Radio,
  'send':                Send,
  'code-2':              Code2,
  'git-merge':           GitMerge,
  'compass':             Compass,
  'arrow-right-left':    ArrowRightLeft,
  'triangle':            Triangle,
  'bar-chart-2':         BarChart2,
  'pie-chart':           PieChart,
  'eye':                 Eye,
  'alert-triangle':      AlertTriangle,
  'terminal':            Terminal,
  'monitor':             Monitor,
  'key':                 Key,
  'gauge':               Gauge,
  'settings':            Settings,
  'archive':             Archive,
  'circle-dot':          CircleDot,
  'arrow-down-to-line':  ArrowDownToLine,
  'sliders':             Sliders,
  // Chaos icons
  'x-circle':            XCircle,
  'timer':               Timer,
  'scissors':            Scissors,
  'wifi-off':            WifiOff,
  'clock':               Clock,
  'minimize-2':          Minimize2,
  'trending-up':         TrendingUp,
  'users':               Users,
  'refresh-cw':          RefreshCw,
  'pause-circle':        PauseCircle,
  'unlink':              Unlink,
};

export interface NodeIconProps {
  icon: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export function NodeIcon({ icon, size = 14, strokeWidth = 1.5, color }: NodeIconProps) {
  const Icon = ICON_MAP[icon] ?? Server;
  return <Icon size={size} strokeWidth={strokeWidth} color={color} />;
}
