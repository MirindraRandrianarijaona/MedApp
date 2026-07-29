import { HashRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { LoginPage } from './pages/Login/LoginPage'
import { AppShell } from './layouts/AppShell'
import { PatientsListPage } from './pages/Patients/PatientsListPage'
import { PatientFormPage } from './pages/Patients/PatientFormPage'
import { PatientDetailPage } from './pages/Patients/PatientDetailPage'
import { ConsultationFormPage } from './pages/Consultations/ConsultationFormPage'
import { ConsultationDetailPage } from './pages/Consultations/ConsultationDetailPage'
import { OrdonnanceFormPage } from './pages/Ordonnances/OrdonnanceFormPage'
import { RendezVousPage } from './pages/RendezVous/RendezVousPage'
import { DocumentCliniqueFormPage } from './pages/Documents/DocumentCliniqueFormPage'
import { FinancePage } from './pages/Finance/FinancePage'

function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<AppShell />}>
            <Route index element={<PatientsListPage />} />
            <Route path="patients/nouveau" element={<PatientFormPage />} />
            <Route path="patients/:id" element={<PatientDetailPage />} />
            <Route path="patients/:id/modifier" element={<PatientFormPage />} />
            <Route path="patients/:id/consultations/nouveau" element={<ConsultationFormPage />} />
            <Route path="patients/:id/consultations/:consultId" element={<ConsultationDetailPage />} />
            <Route path="patients/:id/consultations/:consultId/ordonnance" element={<OrdonnanceFormPage />} />
            <Route path="rendez-vous" element={<RendezVousPage />} />
            <Route path="patients/:id/consultations/:consultId/documents" element={<DocumentCliniqueFormPage />} />
            <Route path="finance" element={<FinancePage />} />
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}

export default App