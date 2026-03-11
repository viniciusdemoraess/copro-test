export type InfoCardCategory = 'beneficio' | 'servico' | 'geral' | 'entrega';

export interface InfoCard {
  id: string;
  title: string;
  description: string;
  category: InfoCardCategory;
  icon_name: string | null;
  image_url: string | null;
  link_url: string | null;
  link_text: string;
  background_color: string;
  icon_color: string;
  order_position: number;
  active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface InfoCardForm {
  title: string;
  description: string;
  category: InfoCardCategory;
  iconName?: string;
  imageFile?: File;
  imageUrl?: string;
  linkUrl?: string;
  linkText: string;
  backgroundColor: string;
  iconColor: string;
  orderPosition: number;
  active: boolean;
}

export interface CategoryTab {
  id: InfoCardCategory;
  label: string;
  description: string;
}

export const categoryTabs: CategoryTab[] = [
  {
    id: 'servico',
    label: 'Serviços',
    description: 'Serviços oferecidos pela cooperativa'
  },
  {
    id: 'entrega',
    label: 'Nossas Entregas',
    description: 'Cards da seção Nossas Entregas'
  }
];

export const COMMON_ICONS = [
  'CheckCircle', 'Gift', 'Briefcase', 'Users',
  'TrendingUp', 'Shield', 'Heart', 'Star',
  'FileText', 'Settings', 'Home', 'Phone',
  'Mail', 'MapPin', 'Clock', 'Calendar',
  'Award', 'Target', 'Zap', 'Truck',
  'DollarSign', 'BarChart', 'PieChart', 'Handshake',
  'Lightbulb', 'Leaf', 'Sprout', 'TreePine',
  'Wheat', 'Tractor', 'Factory', 'Warehouse',
  'Package', 'ShoppingCart', 'CreditCard', 'Banknote',
  'GraduationCap', 'BookOpen', 'Microscope', 'FlaskConical',
  'Wrench', 'Hammer', 'Building', 'Building2'
] as const;

export const COLOR_PRESETS = {
  background: ['#ffffff', '#f9fafb', '#f0fdf4', '#fef9c3', '#fee2e2'],
  icon: ['#0e873d', '#81b62d', '#F5A623', '#3b82f6', '#8b5cf6']
};
