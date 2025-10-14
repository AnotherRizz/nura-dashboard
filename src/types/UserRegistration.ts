export interface UserRegistration {
  id: string;
  nama: string;
  no_wa: string;
  status: string;
  alamat: string;
  paket?: { nama_paket: string };
}
