import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import EmptyLayout from './layouts/EmptyLayout';
import { useAppDispatch } from './store/store';
import { useEffect } from 'react';
import Home from './pages/Sale';
import SignIn from './pages/SignIn';
import { fetchMe } from './redux/authSlice';
import LiveOrders from './pages/LiveOrders';
import ProtectedRoute from './components/common/ProtectedRoute';
import History from './pages/History';
import Register from './pages/Register';
import Tables from './pages/Tables';

function App() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchMe())
  }, [])

  return (
    <Routes>

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path='/' element={<Home />} />
            <Route path='/tables/' element={<Tables />} />
            <Route path='/orders' element={<LiveOrders />} />
            <Route path='/history' element={<History />} />
            <Route path='/register' element={<Register />} />
          </Route>
        </Route>

        <Route element={<EmptyLayout />}>
          <Route path='/sign-in' element={<SignIn />} />
        </Route>

    </Routes>
  )
}

export default App
