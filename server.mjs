import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'dist');
const port=8848;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.glb':'model/gltf-binary','.svg':'image/svg+xml','.png':'image/png'};
const server=http.createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
    const bytes=await readFile(file);res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Campus-Game':'qingri'});res.end(bytes);
  }catch{res.writeHead(404);res.end('Not found');}
});
server.on('error',e=>{console.error(e.code==='EADDRINUSE'?'Port 8848 is already in use. If the game is running, open http://127.0.0.1:8848/':e.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>{
  console.log('Campus game: http://127.0.0.1:8848/');
  if(process.argv.includes('--open'))spawn('powershell.exe',['-NoProfile','-Command',"Start-Process 'http://127.0.0.1:8848/'"],{windowsHide:true,stdio:'ignore'}).unref();
});
