import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'
import { BrowserRouter } from 'react-router-dom'
import { MDXProvider } from '@mdx-js/react'
import { createRxjsDevtools } from './rxjsDevtools'
import { PRef } from './MdxRc'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  // <React.StrictMode>
  // @ts-ignore
  <MDXProvider components={{ blockquote: PRef }}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </MDXProvider>
  // <AppRouter />
  // </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()

// createRxjsDevtools()
