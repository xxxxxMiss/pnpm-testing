import { Route, Routes } from 'react-router-dom'
import { Demo as Demo00 } from './articles/00/Demo'
import { Demo as Demo01 } from './articles/01/Demo'
import { Demo as Demo02 } from './articles/02/Demo'
import { Demo as Demo03 } from './articles/03/Demo'
import { Demo as Demo06 } from './articles/06/Demo'
import { Demo as Demo15 } from './articles/15/Demo'

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/00" element={<Demo00 />}></Route>
      <Route path="/01" element={<Demo01 />}></Route>
      <Route path="/02" element={<Demo02 />}></Route>
      <Route path="/03" element={<Demo03 />}></Route>
      <Route path="/06" element={<Demo06 />}></Route>
      <Route path="/15" element={<Demo15 />}></Route>
      <Route path="/" element={<Demo01 />} />
    </Routes>
  )
}

export default AppRouter
