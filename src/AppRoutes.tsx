import { Routes, Route } from 'react-router-dom';
import App from './App';
import { SharedSongPage } from './components/SharedSongPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/song/:songId" element={<SharedSongPage />} />
    </Routes>
  );
}