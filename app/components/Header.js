import { ethers } from "ethers"

function Header({ account, setAccount }) {

  return (
    <header>
      <p style={{ padding: "1em" }}>fun.pump</p>
      <button>Hello, world</button>
    </header>
  );
}

export default Header;