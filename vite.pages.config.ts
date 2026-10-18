import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
 root:'web',
 base:'/mapy-osp/',
 publicDir:'../public',
 plugins:[react()],
 build:{outDir:'../dist-pages',emptyOutDir:true},
});
