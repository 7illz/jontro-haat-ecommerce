import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { StoreContext } from '../context/StoreContextContext';

export default function AdminRoute() {
  const { user } = useContext(StoreContext);

  // If no user is logged in, or if the user is NOT an owner, redirect to Home
  if (!user || user.role !== 'owner') {
    return <Navigate to="/" replace />;
  }

  // If they are an owner, render the child routes (Outlet)
  return <Outlet />;
}
