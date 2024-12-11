import { input, inputLabel } from './App.css';

function App() {
	return (
		<>
			<label className={input}>
				<span className={inputLabel}>物語</span>
				<textarea cols={120} rows={20} />
			</label>
		</>
	);
}

export default App;
