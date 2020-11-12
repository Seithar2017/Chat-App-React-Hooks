import firebase from 'firebase/app'
import "firebase/auth";
import "firebase/database";
import "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyBFp0TKxL-nJI1dsZMTQfT2rdr5R5JgroU",
  authDomain: "chat-app---react-hooks.firebaseapp.com",
  databaseURL: "https://chat-app---react-hooks.firebaseio.com",
  projectId: "chat-app---react-hooks",
  storageBucket: "chat-app---react-hooks.appspot.com",
  messagingSenderId: "935651978680",
  appId: "1:935651978680:web:6ecb92bc135ad0fb17334d",
  measurementId: "G-CEFCFVVX5M"
};

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase;