import { ComponentType } from 'react'

export interface MenuProps {
  handleLogout: () => void
}
export interface NavbarItem {
  to: string
  icon: ComponentType<{ className: string; width: number; height: number }>;
  roles: string[]
  label: string
}
