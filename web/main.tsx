import {createRoot} from 'react-dom/client';
import MapApp from '../app/map-app';
import '../app/globals.css';

createRoot(document.getElementById('root')!).render(<MapApp
 publicPath="/mapy-osp/"
 apiEndpoint="https://foc-mapy-osp-2026.karhuz.chatgpt.site/api/map"
 coordinatorSignIn="https://foc-mapy-osp-2026.karhuz.chatgpt.site/signin-with-chatgpt?return_to=%2F"
/>);
