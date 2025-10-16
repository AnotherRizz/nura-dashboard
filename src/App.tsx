import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import BarangIndex from "./pages/Barang/BarangIndex";
import Kategori from "./pages/Barang/Kategori";
import BarangFormPage from "./pages/Barang/BarangFormPage";
import BarangShow from "./pages/Barang/BarangShow";
import SupplierIndex from "./pages/Barang/SupplierIndex";
import SupplierFormPage from "./pages/Barang/SupplierFormPage";
import { Toaster } from "react-hot-toast";
import ImportBarangPage from "./pages/Barang/ImportBarangPage";
import SupplierShow from "./pages/Barang/SupplierShow";
import PaketIndex from "./pages/internet/PaketIndex";
import AreaIndex from "./pages/internet/AreaIndex";
import PaketFormPage from "./pages/internet/PaketFormPage";
import ShowPaket from "./pages/internet/ShowPaket";
import AreaFormPage from "./pages/internet/AreaFormPage";
import "leaflet/dist/leaflet.css";
import UserRegistration from "./pages/users/UserRegistration";
import ShowArea from "./pages/internet/ShowArea";
import KategoriFormPage from "./pages/Barang/KategoriFormPage";
import ProtectedRoute from "./ProtectedRoute";
import UserList from "./pages/users/UserList";
import ShowUserRegistration from "./pages/users/ShowUserRegistration";
import ShowUser from "./pages/users/ShowUser";
import DeviceIndex from "./pages/internet/DeviceIndex";
import DeviceFormPage from "./pages/internet/DeviceFormPage";
import ShowDevice from "./pages/internet/ShowDevice";
import LogDevice from "./pages/internet/LogDevice";
import UserRegistrationFormPage from "./pages/users/UserRegistrationFormPage";
import UpdateProgressPage from "./pages/users/UpdateProgressPage";
import UserProfiles from "./pages/UserProfiles";
import Monitoring from "./pages/internet/Monitoring";
import Summary from "./pages/internet/Summary";
import Blank from "./pages/Blank";

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Toaster position="bottom-right" reverseOrder={false} />

      <Routes>
        {/* Protected Dashboard */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index path="/" element={<Home />} />
          <Route index path="/profile" element={<UserProfiles/>} />

          {/* Barang Page */}
          <Route path="/barang" element={<BarangIndex />} />
          <Route path="/import-barang" element={<ImportBarangPage />} />
          <Route path="/barang/add" element={<BarangFormPage />} />
          <Route path="/barang/:id" element={<BarangShow />} />
          <Route path="/barang/edit/:id" element={<BarangFormPage />} />

          {/* Internet Page */}
          <Route path="/paket" element={<PaketIndex />} />
          <Route path="/paket/add" element={<PaketFormPage />} />
          <Route path="/paket/:id" element={<ShowPaket />} />
          <Route path="/paket/edit/:id" element={<PaketFormPage />} />
          <Route path="/area" element={<AreaIndex />} />
          <Route path="/device" element={<DeviceIndex/>} />
          <Route path="/log-device" element={<LogDevice/>} />
          <Route path="/device/:id" element={<ShowDevice/>} />
          <Route path="/device/add" element={<DeviceFormPage/>} />
          <Route path="/device/edit/:id" element={<DeviceFormPage/>} />
          <Route path="/monitoring" element={<Monitoring/>} />
          <Route path="/summary" element={<Blank/>} />
          <Route path="/area/add" element={<AreaFormPage />} />
          <Route path="/area/:id" element={<ShowArea />} />
          <Route path="/area/edit/:id" element={<AreaFormPage />} />
          <Route path="/registrasi-user" element={<UserRegistration />} />
          <Route path="/registrasi-user/add" element={<UserRegistrationFormPage/>} />
          <Route path="/registrasi-user/:id" element={<ShowUserRegistration/>} />
          <Route path="/registrasi-user/:id/progress" element={<UpdateProgressPage/>} />




          <Route path="/users" element={<UserList/>} />
          <Route path="/users/:id" element={<ShowUser/>} />




          {/* Supplier Page */}
          <Route path="/supplier" element={<SupplierIndex />} />
          <Route path="/supplier/add" element={<SupplierFormPage />} />
          <Route path="/supplier/:id" element={<SupplierShow />} />
          <Route path="/supplier/edit/:id" element={<SupplierFormPage />} />
          <Route path="/kategori" element={<Kategori />} />
          <Route path="/kategori/add" element={<KategoriFormPage />} />
          <Route path="/kategori/edit/:id" element={<KategoriFormPage />} />
        </Route>

        {/* Auth Pages */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}
