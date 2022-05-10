import { Layout, Menu, Breadcrumb, MenuProps } from 'antd'
import React from 'react'
// 由于 antd 组件的默认文案是英文，所以需要修改为中文
import zhCN from 'antd/lib/locale/zh_CN'
import moment from 'moment'
import 'moment/locale/zh-cn'
import 'antd/dist/antd.css'
import AppRouter from './Router'
import { leftMenu } from './Menu'
import { useNavigate } from 'react-router-dom'

const { Header, Content, Sider } = Layout

const items1: MenuProps['items'] = ['1', '2', '3'].map(key => ({
  key,
  label: `nav ${key}`,
}))

export default () => {
  const navigate = useNavigate()
  return (
    <Layout>
      <Header className="header">
        <div className="logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['2']}
          items={items1}
        />
      </Header>
      <Layout>
        <Sider
          width={220}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
          }}
        >
          <Menu
            mode="inline"
            defaultSelectedKeys={['1']}
            defaultOpenKeys={['sub1']}
            style={{ height: '100%', borderRight: 0 }}
            items={leftMenu}
            onClick={({ key }) => {
              navigate(key)
            }}
          />
        </Sider>
        <Layout
          style={{
            padding: '0 24px 40px',
            backgroundColor: '#fff',
            marginLeft: 220,
          }}
        >
          <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item>Home</Breadcrumb.Item>
            <Breadcrumb.Item>List</Breadcrumb.Item>
            <Breadcrumb.Item>App</Breadcrumb.Item>
          </Breadcrumb>
          <Content
            style={{
              padding: 24,
              margin: 0,
              overflow: 'initial',
            }}
          >
            <AppRouter />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  )
}
