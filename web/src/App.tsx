import React, { useState } from "react";
import "./App.css";
import Header from './Header';

const App = () => {

	const [counter, setCounter] = useState(0)

	function HandleButtonClick() {
		setCounter(counter + 1);
	}

	return (
		<div>
			<Header title={`Contador: ${counter}`}/>
			<button onClick={HandleButtonClick}>Clique em mim</button>
		</div>
	);
}

export default App;
