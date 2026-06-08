import {
  Router, Shield, GitBranch, Lock, Globe,
  Server, Hexagon, Zap, Box, Cpu,
  Database, Layers, HardDrive, FileText, Search,
  Activity, Mail, List, Bell, Radio,
  Code2, GitMerge, Compass, ArrowRightLeft, Triangle,
  BarChart2, PieChart, Eye, AlertTriangle, Terminal,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  'router':            Router,
  'shield':            Shield,
  'git-branch':        GitBranch,
  'lock':              Lock,
  'globe':             Globe,
  'server':            Server,
  'hexagon':           Hexagon,
  'zap':               Zap,
  'box':               Box,
  'cpu':               Cpu,
  'database':          Database,
  'layers':            Layers,
  'hard-drive':        HardDrive,
  'file-text':         FileText,
  'search':            Search,
  'activity':          Activity,
  'mail':              Mail,
  'list':              List,
  'bell':              Bell,
  'radio':             Radio,
  'code-2':            Code2,
  'git-merge':         GitMerge,
  'compass':           Compass,
  'arrow-right-left':  ArrowRightLeft,
  'triangle':          Triangle,
  'bar-chart-2':       BarChart2,
  'pie-chart':         PieChart,
  'eye':               Eye,
  'alert-triangle':    AlertTriangle,
  'terminal':          Terminal,
};

interface NodeIconProps {
  icon: string;
  size?: number;
  strokeWidth?: number;
}

export function NodeIcon({ icon, size = 14, strokeWidth = 1.5 }: NodeIconProps) {
  const Icon = ICON_MAP[icon] ?? Server;
  return <Icon size={size} strokeWidth={strokeWidth} />;
}
