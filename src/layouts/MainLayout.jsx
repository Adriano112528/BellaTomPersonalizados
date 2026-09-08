import Header from "../components/Header/Header";

function MainLayout({ children }) {
  return (
    <>
      <Header />
      <main>
        {children}
      </main>
    </>
  );
}

export default MainLayout;