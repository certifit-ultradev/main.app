import { Category } from '@mui/icons-material';
import { HomeIcon, PeopleIcon, SupportIcon } from '../svg/certifit-icons'
import { NavbarItem } from './types'

export const navbarListDesktop: Array<NavbarItem> = [
  {
    to: '/admin',
    icon: HomeIcon,
    roles: ['admin'],
    label: 'Inicio',
  },
  {
    to: '/admin/users',
    icon: PeopleIcon,
    roles: ['admin'],
    label: 'Usuarios'
  },
  {
    to: '/admin/categories',
    icon: Category,
    roles: ['admin'],
    label: 'Categorias'
  },
  {
    to: '/dashboard',
    icon: HomeIcon,
    roles: ['user'],
    label: 'Inicio',
  },
  {
    to: '/support',
    icon: SupportIcon,
    roles: ['user'],
    label: 'Soporte'
  },
];

