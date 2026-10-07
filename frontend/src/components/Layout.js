import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import { fetchCurrentUser } from '../store/authSlice';
import Navigation from './Navigation';

export default function Layout() {
  const dispatch = useDispatch();
  const initialized = useSelector((state) => state.auth.initialized);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return (
    <div className="page">
      <Navigation />
      <main className="container">
        {initialized ? <Outlet /> : <p className="muted">Загрузка...</p>}
      </main>
    </div>
  );
}
