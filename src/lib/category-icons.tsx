import {
  LayoutGrid,
  Fan,
  Cable,
  Lightbulb,
  ToggleRight,
  Droplets,
  CircuitBoard,
  Home,
  Wrench,
  Factory,
  ShieldCheck,
  List,
  Leaf,
  Plug,
  CircleDot,
  Package,
  UserRound,
  HardHat,
} from 'lucide-react';

/**
 * Category/product name → icon, shared by every card surface (homepage
 * explorers, catalogue, pricelist, DB listings) so the same category always
 * carries the same icon. Pure function, safe in server and client components.
 */
export function categoryIcon(name: string) {
  const n = name.toLowerCase();
  if (n.startsWith('all')) return <LayoutGrid />;
  if (n.includes('consumer')) return <UserRound />;
  if (n.includes('project')) return <HardHat />;
  if (n.includes('fan')) return <Fan />;
  if (n.includes('wire')) return <Cable />;
  if (n.includes('light')) return <Lightbulb />;
  if (n.includes('switchgear')) return <CircuitBoard />;
  if (n.includes('switch')) return <ToggleRight />;
  if (n.includes('water heater')) return <Droplets />;
  if (n.includes('appliance') || n.includes('iron') || n.includes('cooler')) return <Home />;
  if (n.includes('conduit')) return <Wrench />;
  if (n.includes('industr')) return <Factory />;
  if (n.includes('application')) return <Factory />;
  if (n.includes('standard')) return <ShieldCheck />;
  if (n.includes('type')) return <List />;
  if (n.includes('renewable') || n.includes('solar')) return <Leaf />;
  if (n.includes('terminal')) return <Plug />;
  if (n.includes('gland')) return <CircleDot />;
  if (n.includes('crimping')) return <Wrench />;
  if (n.includes('cable')) return <Cable />;
  return <Package />;
}
