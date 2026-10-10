const firebaseConfig = {
    apiKey: "AIzaSyByll4JEy9rOjgkOWT4DCsKdJjmNVUosVI",
    authDomain: "controle-de-estoque-65575.firebaseapp.com",
    projectId: "controle-de-estoque-65575",
    storageBucket: "controle-de-estoque-65575.firebasestorage.app",
    messagingSenderId: ".", 
    appId: "1:.:web:61ec7900ba6c94370ee262", 
    measurementId: "G-ZY0FJG1Q34"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

db.enablePersistence().catch((err) => {
    if (err.code === 'failed-precondition') {
        console.warn("Múltiplas abas abertas. A persistência offline do Firebase só funciona em uma aba por vez.");
    } else if (err.code === 'unimplemented') {
        console.warn("O navegador atual não suporta armazenamento offline para o Firebase.");
    }
});