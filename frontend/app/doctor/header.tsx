export default function DoctorHeader() {
  return (
    <header className="w-full bg-white shadow h-16 flex items-center px-6 ml-64">
      <h1 className="text-xl font-semibold">Welcome, Doctor</h1>
      <div className="ml-auto">
        {/* Bisa tambah profil/avatar/logout */}
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Logout
        </button>
      </div>
    </header>
  );
}
