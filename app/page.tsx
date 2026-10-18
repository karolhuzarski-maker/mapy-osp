import MapApp from './map-app';
import {chatGPTSignInPath} from './chatgpt-auth';
export default function Home(){return <MapApp coordinatorSignIn={chatGPTSignInPath('/')}/>;}
