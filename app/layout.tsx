import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Mapa zagrożeń i zasobów OSP · Fundacja Odporności Cywilnej',description:'Indywidualne mapy zagrożeń, zasobów i ważnych punktów do warsztatów pięciu jednostek OSP gminy Świątniki Górne.',robots:{index:false,follow:false},icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pl"><body>{children}</body></html>;}
