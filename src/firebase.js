import firebase from 'firebase/app'
import "firebase/auth";
import "firebase/database";
import "firebase/storage";


var firebaseConfig = {
    apiKey: "AIzaSyDYph5WExIpQO3Gi5DwDFcI7pQ6Ruqdfi4",
    authDomain: "react-slack-clone-3f2b8.firebaseapp.com",
    databaseURL: "https://react-slack-clone-3f2b8.firebaseio.com",
    projectId: "react-slack-clone-3f2b8",
    storageBucket: "react-slack-clone-3f2b8.appspot.com",
    messagingSenderId: "154193735074",
    appId: "1:154193735074:web:a0bcdce0765c70af8556fb",
    measurementId: "G-910KT338DR"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase;