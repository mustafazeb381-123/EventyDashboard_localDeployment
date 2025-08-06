import React from "react";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header style={styles.header}>
      <nav style={styles.nav}>
        <Link to="/" style={styles.link}>
          Home
        </Link>
        <Link to="/login" style={styles.link}>
          Login
        </Link>
        <Link to="/signup" style={styles.link}>
          Signup
        </Link>
        <Link to="/about" style={styles.link}>
          About
        </Link>
      </nav>
    </header>
  );
}

export default Header;

const styles = {
  header: {
    backgroundColor: "#282c34",
    padding: "10px 20px",
    color: "white",
  },
  nav: {
    display: "flex",
    justifyContent: "space-around",
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontSize: "18px",
  },
};
