export const UNITS=[{id:'ochojno',name:'Ochojno'},{id:'olszowice',name:'Olszowice'},{id:'rzeszotary',name:'Rzeszotary'},{id:'swiatniki-gorne',name:'Świątniki Górne'},{id:'wrzasowice',name:'Wrząsowice'}] as const;
export const CATEGORIES=[
 {id:'P',name:'Podtopienia / powódź',short:'Podtopienia',color:'#246bba',bg:'#eaf2fc'},
 {id:'O',name:'Osuwiska / obsuwiska',short:'Osuwiska',color:'#925d36',bg:'#f6eee6'},
 {id:'W',name:'Silny wiatr / połamane drzewa',short:'Wiatr i drzewa',color:'#44714f',bg:'#edf4ee'},
 {id:'A',name:'Awarie infrastruktury',short:'Awarie',color:'#b74448',bg:'#fbecec'},
 {id:'D',name:'Utrudnienia drogowe',short:'Drogi',color:'#ad7109',bg:'#fcf3df'},
 {id:'I',name:'Inne zagrożenie',short:'Inne',color:'#7850a7',bg:'#f2ecf9'},
 {id:'H',name:'Hydrant',short:'Hydrant',color:'#12729b',bg:'#e9f4fa'},
 {id:'U',name:'Ujęcie wody',short:'Ujęcie wody',color:'#17826e',bg:'#e7f5ef'},
 {id:'Z',name:'Inny zasób / własny punkt',short:'Własny punkt',color:'#496c84',bg:'#edf2f7'},
] as const;
export type Unit=typeof UNITS[number]['id'];
export type Category=typeof CATEGORIES[number]['id'];
export type Point={x:number;y:number};
export type Hazard={id:number;unit:Unit;category:Category;kind:'point'|'area'|'line';points:Point[];description:string;priority:'normal'|'high';version:number;createdAt:number;updatedAt:number;canEdit:boolean;readonly participantId?:string};
export const MAP_RECT={x:47,y:149,width:1618,height:1152};
