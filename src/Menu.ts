import { MenuProps } from 'antd'
import {
  UserOutlined,
  LaptopOutlined,
  NotificationOutlined,
} from '@ant-design/icons'
import React from 'react'

const subMenus: MenuProps['items'][] = [
  [
    {
      label: '类型映射',
      key: '-1',
    },
  ],
  [
    { label: '开篇', key: '00' },
    { label: 'Observable介绍', key: '01' },
    {
      label: 'Observable操作符',
      key: '02',
    },
    {
      label: '高阶Observable',
      key: '03',
    },
    {
      label: '取消订阅',
      key: '06',
    },
  ],
  [
    {
      label: '使用Rxjs封装通用请求',
      key: '15',
    },
  ],
]

export const leftMenu: MenuProps['items'] = [
  { icon: UserOutlined, label: 'ts基础篇' },
  { icon: LaptopOutlined, label: 'rxjs基础篇' },
  { icon: NotificationOutlined, label: '实战篇' },
].map(({ icon, label }, index) => {
  const key = String(index + 1)

  return {
    key: `sub${key}`,
    icon: React.createElement(icon),
    label,
    children: subMenus[index],
  }
})
