import React, { useEffect, useRef, useState } from "react";
import "./App.css";


import {
	GoogleAuthProvider,
	signInWithPopup,
	signOut,
} from "@firebase/auth";
import {
	collection,
	getDocs,
	serverTimestamp,
	setDoc,
	doc,
} from "@firebase/firestore";

import { useAuthState } from "react-firebase-hooks/auth";

import { firestore, auth } from "./firebase-config"


function App() {
	const [user] = useAuthState(auth);

	return (
		<div className="App">
			<AppHeader />

			<section>{user ? <ChatRoom /> : <SignIn />}</section>
		</div>
	);
}

function SignIn() {
	const signInWithGoogle = () => {
		const provider = new GoogleAuthProvider();
		signInWithPopup(auth, provider);
	};

	return <button onClick={signInWithGoogle}>Sign in with Google :D</button>;
}

function SignOut() {
	return (
		auth.currentUser && (
			<button onClick={() => signOut(auth)}>Sign out</button>
		)
	);
}

function AppHeader() {
	return <header className="App-header">goodchat</header>;
}

function ChatRoom() {
	const dummy = useRef();

	const messagesRef = collection(firestore, "messages");
	const [messages, setMessages] = useState([]);
	const [formValue, setFormValue] = useState("");

	useEffect(() => {
		const getMessages = async () => {
			const data = await getDocs(messagesRef);
			setMessages(
				data.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
			);
		};

		getMessages();
	});

	const sendMessage = async (e) => {
		e.preventDefault();

		const { uid, photoURL } = auth.currentUser;

		await setDoc(doc(messagesRef), {
			text: formValue,
			createdAt: serverTimestamp(),
			uid,
			photoURL,
		});

		setFormValue("");

		dummy.current.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<>
			<main>
				{messages &&
					messages.map((msg) => (
						<ChatMessage key={msg.id} message={msg} />
					))}

				<div ref={dummy}></div>
			</main>

			<form onSubmit={sendMessage}>
				<input
					value={formValue}
					onChange={(e) => setFormValue(e.target.value)}
				/>

				<button type="submit">send</button>
			</form>
		</>
	);
}

function ChatMessage(props) {
	const { text, uid, photoURL } = props.message;

	const messageClass = uid === auth.currentUser.uid ? "sent" : "recieved";

	return (
		<div className={`message ${messageClass}`}>
			<img src={photoURL} />
			<p>{text}</p>
		</div>
	);
}

export default App;
