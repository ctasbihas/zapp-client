import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
	apiKey: "AIzaSyB6nVJalSgsqdXmYyVFrDkmhT7OHb9-8aY",
	authDomain: "zapp-5858d.firebaseapp.com",
	projectId: "zapp-5858d",
	storageBucket: "zapp-5858d.appspot.com",
	messagingSenderId: "317424250411",
	appId: "1:317424250411:web:bfeee170e2a6834e1ec46e",
	measurementId: "G-R3DBZK4D64",
};

const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);