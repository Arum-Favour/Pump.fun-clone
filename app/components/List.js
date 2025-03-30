import { ethers } from "ethers"

function List({ toggleCreate, fee, provider, factory }) {

  async function listHandler(form) {
    const name = form.get("name");
    const ticker = form.get("ticker");

    const signer = await provider.getSigner()
    const transaction = factory.connect(signer)

    const tx = await transaction.create(name, ticker, { value: fee })
    await tx.wait()

    toggleCreate()

  }

  return (
    <div className="list">
      <h2>List New Token</h2>

      <div className="list_description">
        <p>Fee:{ethers.formatUnits(fee, 18)}ETH</p>
      </div>

      <form action={listHandler}>
        <input type="text" name="name" placeholder="name " />
        <input type="text" name="ticker" placeholder="ticker " />
        <input type="submit" value="[list]" />
      </form>

      <button onClick={toggleCreate} className="btn--fancy">CANCEL</button>
    </div>
  );
}

export default List;