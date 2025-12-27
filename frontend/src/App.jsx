import { useState } from "react";
import "./App.css";

export default function App() {
	const [name, setName] = useState("");
	const [message, setMessage] = useState("Hello, World!");
	const [status, setStatus] = useState("idle");

	const handleSubmit = async (event) => {
		event.preventDefault();
		setStatus("loading");
		setMessage("");

		try {
			const params = new URLSearchParams();
			if (name.trim()) {
				params.set("name", name.trim());
			}

			const response = await fetch(`/hello?${params.toString()}`);

			if (!response.ok) {
				throw new Error(`Request failed with status ${response.status}`);
			}

			const text = await response.text();
			setMessage(text);
			setStatus("idle");
		} catch (error) {
			setMessage("Something went wrong. Please try again.");
			setStatus("error");
		}
	};

	return (
		<div className="app">
			<header className="hero">
				<h1>Test App</h1>
				<p>Call the backend and see your greeting instantly.</p>
			</header>

			<main className="card">
				<form className="form" onSubmit={handleSubmit}>
					<label htmlFor="name">Your name</label>
					<input
						id="name"
						type="text"
						value={name}
						onChange={(event) => setName(event.target.value)}
						placeholder="World"
						autoComplete="off"
					/>
					<button type="submit" disabled={status === "loading"}>
						{status === "loading" ? "Calling..." : "Say hello"}
					</button>
				</form>

				<section className="response" aria-live="polite">
					<p className={status === "error" ? "error" : ""}>
						{message || (status === "loading" ? "Loading..." : "")}
					</p>
				</section>
			</main>

			<footer className="footer">
				<span>Vite + React + Spring Boot</span>
			</footer>
		</div>
	);
}
