import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Społeczna mapa zagrożeń i zasobów — Świątniki Górne · Fundacja Odporności Cywilnej',description:'Społeczna mapa zagrożeń, zasobów i ważnych punktów gminy Świątniki Górne. Tworzona wspólnie przez mieszkańców i strażaków.',robots:{index:false,follow:false},icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pl"><body>{children}</body></html>;}
