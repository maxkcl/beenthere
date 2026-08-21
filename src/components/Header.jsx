import { Link } from "react-router-dom";

function Header() {
  return (
    <div className="header">
      <h1>BeenThere</h1>

      <nav>
        <Link to="/">Map</Link>
        <Link to="/about">About</Link>
      </nav>
    </div>
  );
}

export default Header;
