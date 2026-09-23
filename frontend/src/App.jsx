import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AnalyzePage from './pages/AnalyzePage';
import ResultsPage from './pages/ResultsPage';
import ComparePage from './pages/ComparePage';
import HistoryPage from './pages/HistoryPage';
import ReportPage from './pages/ReportPage';
import MonitorPage from './pages/MonitorPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/analyze" element={<AnalyzePage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/monitor" element={<MonitorPage />} />
      </Route>
    </Routes>
  );
}
