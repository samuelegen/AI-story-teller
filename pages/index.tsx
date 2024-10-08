import Head from "next/head";
import styles from "@/src/styles/Home.module.scss";
import Header from "@/src/components/Molecoles/Header/Header";
import WindowBox from "@/src/components/Organism/WindowBox";
import InputBox from "@/src/components/Molecoles/InputBox/InputBox";
import SelectBox from "@/src/components/Molecoles/SelectBox/SelectBox";
import { useState } from "react";
import { listaGeneri } from "@/src/constants/common";
import Button from "@/src/components/Atoms/Button/Button";
import {
	GenerateContentCandidate,
	GoogleGenerativeAI,
} from "@google/generative-ai";
import SwitchBox from "@/src/components/Molecoles/SwitchBox/SwitchBox";
import Toast from "@/src/components/Atoms/Toast/Toast";

export default function Home() {
	const [protagonista, setProtagonista] = useState("");
	const [antagonista, setAntagonista] = useState("");
	const [genere, setGenere] = useState("");
	const [pegi18, setPegi18] = useState(false);
	const [error, setError] = useState(false);
	const [loading, setLoading] = useState(false);
	const [response, setResponse] = useState("");
	const [isPlaying, setIsPlaying] = useState(false);

	const handleGenerate = async () => {
		setLoading(true);
		setError(false);
		const prompt = `genera un racconto ${genere} per ${
			pegi18 ? "adulti" : "bambini"
		}, con il protagonista chiamato ${protagonista} e l'antagonista chiamato ${antagonista}.`;

		if (process.env.NEXT_PUBLIC_GEMINI_KEY) {
			try {
				const genAI = new GoogleGenerativeAI(
					process.env.NEXT_PUBLIC_GEMINI_KEY
				);
				const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

				const result = await model.generateContent(prompt);

				const output = (
					result.response.candidates as GenerateContentCandidate[]
				)[0].content.parts[0].text;

				if (output) {
					setResponse(output);
				} else {
					setResponse("No story generated. Please try a different prompt.");
				}
			} catch (error) {
				console.error("Error generating story:", error);
				setResponse("An error occurred. Please try again later.");
			}
		}
		setLoading(false);
	};

	const handleVoice = () => {
		const utterance = new SpeechSynthesisUtterance(response);
		utterance.lang = "it-IT";
		utterance.rate = 0.8; //scegliere la velocità di riproduzione
		setIsPlaying(true);
		speechSynthesis.speak(utterance);
		utterance.onend = () => {
			setIsPlaying(false);
		};
	};

	const handleStopVoice = () => {
		speechSynthesis.cancel();
		setIsPlaying(false);
	};

	return (
		<>
			<Head>
				<title>Ai Story Teller</title>
				<meta name="description" content="AI based app to generate stories" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<main className={styles.main}>
				<Header title="AI Story Teller" />
				<div className={styles.content}>
					{error && (
						<Toast
							setAction={setError}
							title="Errore"
							message="Errore nella creazione del racconto"
						/>
					)}
					<WindowBox title="Story Params">
						<div className={styles.container}>
							<InputBox
								label="Nome Protagonista:"
								value={protagonista}
								setValue={setProtagonista}
							/>
							<InputBox
								label="Nome Antagonista:"
								value={antagonista}
								setValue={setAntagonista}
							/>
							<SelectBox
								label="Genere:"
								list={listaGeneri}
								setAction={setGenere}
							/>
							<SwitchBox
								label="Per Adulti:"
								value={pegi18}
								setValue={setPegi18}
							/>
							<Button
								label="Genera"
								onClick={handleGenerate}
								disabled={
									protagonista.trim().length <= 0 ||
									antagonista.trim().length <= 0 ||
									genere.trim().length <= 0 ||
									loading
								}
							/>
						</div>
						{loading && (
							<div className={styles.loading}>
								<p>loading...</p>
							</div>
						)}
						{!loading && response && (
							<div className={styles.result}>
								<div className={styles.btn}>
									{isPlaying ? (
										<Button label="Stop" onClick={handleStopVoice} />
									) : (
										<Button label="Racconta" onClick={handleVoice} />
									)}
								</div>
								{response}
							</div>
						)}
					</WindowBox>
				</div>
			</main>
		</>
	);
}
