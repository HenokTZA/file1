// MainLayout.js
import Sidebar from '../sidebarComponent';

const MainLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 md:ml-[265px]">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;