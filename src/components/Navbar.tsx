import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-green-600 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center p-4">
        <h1 className="text-xl font-bold">WEB3</h1>
        <div className="hidden md:flex space-x-6">
          <Link to="/" className="hover:text-gray-200">HOME</Link>
          <Link to="/about" className="hover:text-gray-200">ABOUT</Link>
          <Link to="/resources" className="hover:text-gray-200">RESOURCES</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
